import './environment'
import express from 'express'
import cors from 'cors'
import path from 'path'
import { membersRouter } from './members/routes'

const app = express()
app.use('/api/members', express.json({ limit: '1mb' }), membersRouter)
app.use(express.json())
app.use(cors())

app.get('/api/projects', (_req, res) => {
  res.json([
    {
      id: 'deimos',
      title: 'Deimos',
      summary: 'A student-built cubesat project by Chalmers.',
      url: 'https://caesar.se/projekt/deimos/'
    }
  ])
})

// In production, serve the built frontend
if (process.env.NODE_ENV === 'production') {
  const staticPath = path.join(__dirname, '..', '..', 'frontend', 'dist')
  app.use('/new', express.static(staticPath))
  app.get('/new/*', (_req, res) => res.sendFile(path.join(staticPath, 'index.html')))
  app.use(express.static(staticPath))
  app.get('*', (_req, res) => res.sendFile(path.join(staticPath, 'index.html')))
}

const port = Number(process.env.PORT || 3000)
app.listen(port, () => console.log(`Server running on http://localhost:${port}`))
