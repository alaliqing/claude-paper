import fs from 'fs'
import path from 'path'
import { homedir } from 'os'

interface FileNode {
  name: string
  path: string
  type: 'file' | 'directory'
  children?: FileNode[]
}

function buildFileTree(dirPath: string, relativePath: string = ''): FileNode[] {
  const items = fs.readdirSync(dirPath, { withFileTypes: true })
  const nodes: FileNode[] = []

  for (const item of items) {
    // Skip hidden files and node_modules
    if (item.name.startsWith('.') || item.name === 'node_modules') {
      continue
    }

    const itemPath = path.join(dirPath, item.name)
    const itemRelativePath = relativePath ? `${relativePath}/${item.name}` : item.name

    if (item.isDirectory()) {
      nodes.push({
        name: item.name,
        path: itemRelativePath,
        type: 'directory',
        children: buildFileTree(itemPath, itemRelativePath)
      })
    } else {
      nodes.push({
        name: item.name,
        path: itemRelativePath,
        type: 'file'
      })
    }
  }

  // Sort: directories first, then files, alphabetically
  return nodes.sort((a, b) => {
    if (a.type === b.type) {
      return a.name.localeCompare(b.name)
    }
    return a.type === 'directory' ? -1 : 1
  })
}

export default defineEventHandler((event) => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Slug is required'
    })
  }

  try {
    const paperDir = path.join(homedir(), 'claude-papers/papers', slug)

    if (!fs.existsSync(paperDir)) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Paper directory not found'
      })
    }

    const fileTree = buildFileTree(paperDir)

    return fileTree
  } catch (e: any) {
    if (e.statusCode) throw e

    throw createError({
      statusCode: 500,
      statusMessage: e.message || 'Failed to load file tree'
    })
  }
})
