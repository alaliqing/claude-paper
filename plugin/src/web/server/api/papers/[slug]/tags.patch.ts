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

  const body = await readBody<{ tags?: unknown }>(event)

  if (!Array.isArray(body?.tags)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Tags must be an array'
    })
  }

  const tags = body.tags
    .filter((tag): tag is string => typeof tag === 'string')
    .map(tag => tag.trim())
    .filter(Boolean)

  try {
    const papersDir = path.join(homedir(), 'claude-papers/papers')
    const paperDir = path.join(papersDir, slug)
    const metaPath = path.join(paperDir, 'meta.json')
    const indexPath = path.join(homedir(), 'claude-papers/index.json')

    if (!fs.existsSync(paperDir)) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Paper not found'
      })
    }

    // Update meta.json
    let meta: Record<string, any> = {}
    if (fs.existsSync(metaPath)) {
      meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'))
    }
    meta.tags = tags
    fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2))

    // Update index.json (supports both array and { papers: [] } formats)
    if (fs.existsSync(indexPath)) {
      const index = JSON.parse(fs.readFileSync(indexPath, 'utf-8'))
      const papers = Array.isArray(index)
        ? index
        : (Array.isArray(index?.papers) ? index.papers : null)

      const paper = papers?.find((p: any) => p.slug === slug)
      if (paper) {
        paper.tags = tags
        fs.writeFileSync(indexPath, JSON.stringify(index, null, 2))
      }
    }

    return {
      success: true,
      tags
    }
  } catch (e: any) {
    if (e.statusCode) throw e

    throw createError({
      statusCode: 500,
      statusMessage: e.message || 'Failed to update tags'
    })
  }
})
