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

  const body = await readBody(event)

  if (!Array.isArray(body.tags)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Tags must be an array'
    })
  }

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
    let meta = {}
    if (fs.existsSync(metaPath)) {
      meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'))
    }
    meta.tags = body.tags
    fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2))

    // Update index.json
    if (fs.existsSync(indexPath)) {
      const index = JSON.parse(fs.readFileSync(indexPath, 'utf-8'))
      const paper = index.find((p: any) => p.slug === slug)
      if (paper) {
        paper.tags = body.tags
        fs.writeFileSync(indexPath, JSON.stringify(index, null, 2))
      }
    }

    return {
      success: true,
      tags: body.tags
    }
  } catch (e: any) {
    if (e.statusCode) throw e

    throw createError({
      statusCode: 500,
      statusMessage: e.message || 'Failed to update tags'
    })
  }
})
