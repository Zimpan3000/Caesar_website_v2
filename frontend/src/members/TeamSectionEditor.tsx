import { useEffect, useState } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Heading from '@tiptap/extension-heading'
import Bold from '@tiptap/extension-bold'
import Italic from '@tiptap/extension-italic'
import Link from '@tiptap/extension-link'
import HardBreak from '@tiptap/extension-hard-break'
import { BulletList, OrderedList, ListItem } from '@tiptap/extension-list'
import { UndoRedo } from '@tiptap/extensions'
import { safeTeamLink, type RichNode } from '../../../backend/src/members/team-information'

export default function TeamSectionEditor({ value, label, disabled, onChange }: { value: RichNode; label: string; disabled: boolean; onChange: (value: RichNode) => void }) {
  const [linkOpen, setLinkOpen] = useState(false)
  const [href, setHref] = useState('')
  const [linkError, setLinkError] = useState('')
  const editor = useEditor({
    extensions: [Document, Paragraph, Text, Heading.configure({ levels: [2, 3] }), Bold, Italic, BulletList, OrderedList, ListItem, HardBreak, UndoRedo, Link.configure({ openOnClick: false, defaultProtocol: 'https', isAllowedUri: url => safeTeamLink(url) })],
    content: value, editable: !disabled, shouldRerenderOnTransaction: true,
    editorProps: { attributes: { class: 'm-team-prose m-writing-surface', role: 'textbox', 'aria-label': label, 'aria-multiline': 'true' } },
    onUpdate: ({ editor }) => onChange(editor.getJSON() as RichNode),
  })
  useEffect(() => { editor?.setEditable(!disabled) }, [editor, disabled])
  if (!editor) return <p role="status">Opening editor…</p>
  function applyLink() {
    if (!safeTeamLink(href)) { setLinkError('Use a complete https://, http:// or mailto: link.'); return }
    if (!editor) return
    if (editor.state.selection.empty && !editor.isActive('link')) editor.chain().focus().insertContent({ type: 'text', text: href, marks: [{ type: 'link', attrs: { href } }] }).run()
    else editor.chain().focus().extendMarkRange('link').setLink({ href }).run()
    setLinkOpen(false); setLinkError('')
  }
  const button = (name: string, text: string, action: () => void, active?: boolean, unavailable = false) => <button type="button" aria-label={name} title={name} aria-pressed={active} disabled={disabled || unavailable} onMouseDown={event => event.preventDefault()} onClick={action}>{text}</button>
  return <div className="m-section-writing">
    <div className="m-format-bar" role="group" aria-label="Text formatting">
      <select aria-label="Text style" value={editor.isActive('heading', { level: 2 }) ? '2' : editor.isActive('heading', { level: 3 }) ? '3' : 'p'} disabled={disabled} onChange={event => event.target.value === 'p' ? editor.chain().focus().setParagraph().run() : editor.chain().focus().setHeading({ level: Number(event.target.value) as 2 | 3 }).run()}><option value="p">Paragraph</option><option value="2">Heading</option><option value="3">Subheading</option></select>
      {button('Bold', 'B', () => editor.chain().focus().toggleBold().run(), editor.isActive('bold'))}
      {button('Italic', 'I', () => editor.chain().focus().toggleItalic().run(), editor.isActive('italic'))}
      {button('Bullet list', '• List', () => editor.chain().focus().toggleBulletList().run(), editor.isActive('bulletList'))}
      {button('Numbered list', '1. List', () => editor.chain().focus().toggleOrderedList().run(), editor.isActive('orderedList'))}
      {button('Add or edit link', 'Link', () => { setHref(editor.getAttributes('link').href || ''); setLinkError(''); setLinkOpen(value => !value) }, editor.isActive('link'))}
      {button('Undo', '↶', () => editor.chain().focus().undo().run(), undefined, !editor.can().undo())}
      {button('Redo', '↷', () => editor.chain().focus().redo().run(), undefined, !editor.can().redo())}
    </div>
    {linkOpen && <fieldset disabled={disabled} className="m-link-editor"><label>Link address<input aria-label="Link address" type="text" placeholder="https://…" value={href} onChange={event => setHref(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); applyLink() } }} autoFocus /></label><button className="m-button" type="button" onClick={applyLink}>Apply link</button><button className="m-button" type="button" onClick={() => { editor.chain().focus().unsetLink().run(); setLinkOpen(false) }}>Remove link</button><button className="m-button" type="button" onClick={() => { setLinkOpen(false); editor.commands.focus() }}>Cancel link</button>{linkError && <p role="alert" className="m-error">{linkError}</p>}</fieldset>}
    <EditorContent editor={editor} />
    <p className="m-writing-help">Enter for a new paragraph · Shift + Enter for a line break</p>
  </div>
}
