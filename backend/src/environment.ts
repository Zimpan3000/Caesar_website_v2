import { existsSync } from 'fs'
import { loadEnvFile } from 'node:process'
import path from 'path'

// Process environment takes precedence. This path works from src and dist.
const file = path.join(__dirname, '..', '.env.local')
if (existsSync(file)) loadEnvFile(file)
