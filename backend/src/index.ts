import express from 'express'
import cors from 'cors'
import path from 'path'

const app = express()
app.use(cors())
app.use(express.json())

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
  app.use(express.static(staticPath))
  app.get('*', (_req, res) => res.sendFile(path.join(staticPath, 'index.html')))
}

const port = Number(process.env.PORT || 3000)
app.listen(port, () => console.log(`Server running on http://localhost:${port}`))
