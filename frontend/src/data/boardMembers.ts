type BoardMember = {
  name: string
  role: string
  image: string | null
}

// To add a portrait, place it in public/assets/board/ and set image to
// 'assets/board/filename.jpg'. Paths are resolved against the site's base URL.
export const boardMembers: BoardMember[] = [
  { name: 'Simon Karlsson', role: 'Chairman', image: 'assets/board/simon.png' },
  { name: 'Darian Belenos', role: 'Treasurer', image: null },
  { name: 'Arvid Aronsson', role: 'Board Member', image: 'assets/board/arvid.png' },
  { name: 'Selma Listo', role: 'Board Member', image: null },
  { name: 'David Neinhardt', role: 'Board Member', image: 'assets/board/david.png' },
  { name: 'Daniel Blania', role: 'Board Member', image: 'assets/board/daniel.png' },
]
