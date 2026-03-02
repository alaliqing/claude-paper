import fs from 'fs'
import path from 'path'
import { homedir } from 'os'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Slug is required'
    })
  }

  try {
    const papersDir = path.join(homedir(), 'claude-papers/papers')
    const paperDir = path.join(papersDir, slug)
    const indexPath = path.join(homedir(), 'claude-papers/index.json')

    if (!fs.existsSync(paperDir)) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Paper not found'
      })
    }

    // Update index.json first (supports both array and { papers: [] } formats)
    if (fs.existsSync(indexPath)) {
      const index = JSON.parse(fs.readFileSync(indexPath, 'utf-8'))
      const isArray = Array.isArray(index)
      const papers = isArray
        ? index
        : (Array.isArray(index?.papers) ? index.papers : null)

      if (papers) {
        const filtered = papers.filter((p: any) => p.slug !== slug)
        if (isArray) {
          fs.writeFileSync(indexPath, JSON.stringify(filtered, null, 2))
        } else {
          index.papers = filtered
          fs.writeFileSync(indexPath, JSON.stringify(index, null, 2))
        }
      }
    }

    // Then delete the paper directory
    fs.rmSync(paperDir, { recursive: true, force: true })

    return {
      success: true,
      slug
    }
  } catch (e: any) {
    if (e.statusCode) throw e

    throw createError({
      statusCode: 500,
      statusMessage: e.message || 'Failed to delete paper'
    })
  }
})
