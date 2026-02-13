import fs from 'fs'
import path from 'path'
import { homedir } from 'os'

export default defineEventHandler((event) => {
  const slug = getRouterParam(event, 'slug')
  const query = getQuery(event)
  const filePath = query.path as string

  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Slug is required'
    })
  }

  if (!filePath) {
    throw createError({
      statusCode: 400,
      statusMessage: 'File path is required'
    })
  }

  try {
    const paperDir = path.join(homedir(), 'claude-papers/papers', slug)
    const fullPath = path.join(paperDir, filePath)

    // Security: ensure the path is within the paper directory
    if (!fullPath.startsWith(paperDir)) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Access denied'
      })
    }

    if (!fs.existsSync(fullPath)) {
      throw createError({
        statusCode: 404,
        statusMessage: 'File not found'
      })
    }

    const content = fs.readFileSync(fullPath, 'utf-8')

    return {
      path: filePath,
      content
    }
  } catch (e: any) {
    if (e.statusCode) throw e

    throw createError({
      statusCode: 500,
      statusMessage: e.message || 'Failed to load file'
    })
  }
})
