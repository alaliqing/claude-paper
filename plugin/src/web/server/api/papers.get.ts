import fs from 'fs'
import path from 'path'
import { homedir } from 'os'

export default defineEventHandler(() => {
  try {
    const indexPath = path.join(homedir(), 'claude-papers/index.json')

    if (!fs.existsSync(indexPath)) {
      return []
    }

    const content = fs.readFileSync(indexPath, 'utf-8')
    const data = JSON.parse(content)

    // Handle both flat array and {papers: [...]} structure
    return Array.isArray(data) ? data : (data.papers || [])
  } catch (e: any) {
    throw createError({
      statusCode: 500,
      statusMessage: e.message || 'Failed to load papers'
    })
  }
})
