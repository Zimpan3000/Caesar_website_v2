import { useState, type FormEvent } from 'react'
import { sitePath } from '../paths'
import { authService, type Member } from './api'
import { Icon } from './components'

export default function LoginPage({ onLogin }: { onLogin: (member: Member) => void }) {
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setBusy(true); setError('')
    try { onLogin((await authService.login(String(form.get('username')).trim(), String(form.get('password')))).member) }
    catch (error) { setError((error as Error).message) }
    finally { setBusy(false) }
  }
  return <div className="m-login"><div className="m-login-story"><a href={sitePath()} className="m-logo"><img src={sitePath('assets/caesar-full.png')} alt="CAESAR home" /></a><div className="m-orbit-art" aria-hidden="true"><div /><div /><div /><span>CAESAR / MISSION CONTROL</span></div><div className="m-login-copy"><p className="m-eyebrow">Built by students. Bound for space.</p><h1>Great missions.<br />Shared purpose.</h1><p>One place for the people, progress and discoveries behind CAESAR.</p></div><span className="m-login-coordinate">CHALMERS AEROSPACE SOCIETY · GOTHENBURG, SE</span></div><main className="m-login-form"><a className="m-back-link" href={sitePath()}>← Back to the website</a><div className="m-login-box"><span className="m-login-lock"><Icon name="lock" size={24} /></span><p className="m-eyebrow">Members workspace</p><h2>Welcome aboard.</h2><p>Sign in to keep the mission moving.</p><form onSubmit={submit}><label>Username<input name="username" autoComplete="username" required maxLength={200} autoFocus /></label><div className="m-password-field"><label htmlFor="member-password">Password</label><div className="m-password"><input id="member-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required maxLength={1024} /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)}>{showPassword ? 'Hide' : 'Show'}</button></div></div>{error && <p className="m-error" role="alert">{error}</p>}<button className="m-button m-primary m-login-submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}<Icon name="arrow" size={18} /></button></form><p className="m-login-help">Access is reserved for CAESAR team members.<br />Contact your team lead if you need access.</p></div><span className="m-login-foot">CAESAR INTERNAL · THE WORK BEHIND THE MISSION</span></main></div>
}
