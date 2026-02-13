import fs from 'fs'
import path from 'path'
import { homedir } from 'os'

function getFileType(filename: string): string {
  const ext = path.extname(filename).toLowerCase()

  // Image extensions
  const imageExts = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.bmp']
  if (imageExts.includes(ext)) {
    return 'image'
  }

  // PDF
  if (ext === '.pdf') {
    return 'pdf'
  }

  // Code file extensions
  const codeExts = [
    '.py', '.js', '.ts', '.jsx', '.tsx', '.java', '.cpp', '.c', '.h', '.hpp',
    '.cs', '.go', '.rs', '.rb', '.php', '.swift', '.kt', '.scala', '.sh',
    '.bash', '.zsh', '.fish', '.ps1', '.r', '.m', '.sql', '.json', '.xml',
    '.yaml', '.yml', '.toml', '.ini', '.cfg', '.conf', '.vue', '.svelte',
    '.css', '.scss', '.sass', '.less', '.html', '.htm'
  ]
  if (codeExts.includes(ext)) {
    return 'code'
  }

  // Markdown
  if (ext === '.md' || ext === '.markdown') {
    return 'markdown'
  }

  // Text files
  if (ext === '.txt' || ext === '.log') {
    return 'text'
  }

  return 'unknown'
}

function getLanguageFromExtension(filename: string): string {
  const ext = path.extname(filename).toLowerCase()
  const langMap: Record<string, string> = {
    '.py': 'python',
    '.js': 'javascript',
    '.ts': 'typescript',
    '.jsx': 'javascript',
    '.tsx': 'typescript',
    '.java': 'java',
    '.cpp': 'cpp',
    '.c': 'c',
    '.h': 'c',
    '.hpp': 'cpp',
    '.cs': 'csharp',
    '.go': 'go',
    '.rs': 'rust',
    '.rb': 'ruby',
    '.php': 'php',
    '.swift': 'swift',
    '.kt': 'kotlin',
    '.scala': 'scala',
    '.sh': 'bash',
    '.bash': 'bash',
    '.zsh': 'bash',
    '.sql': 'sql',
    '.json': 'json',
    '.xml': 'xml',
    '.yaml': 'yaml',
    '.yml': 'yaml',
    '.html': 'html',
    '.htm': 'html',
    '.css': 'css',
    '.scss': 'scss',
    '.vue': 'vue',
  }
  return langMap[ext] || 'plaintext'
}

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

    const fileType = getFileType(filePath)

    // For binary files (images, PDFs), return file type without content
    if (fileType === 'image' || fileType === 'pdf') {
      return {
        path: filePath,
        type: fileType,
        content: null,
        url: `/api/papers/${slug}/raw?path=${encodeURIComponent(filePath)}`
      }
    }

    // For text-based files, read and return content
    const content = fs.readFileSync(fullPath, 'utf-8')

    return {
      path: filePath,
      type: fileType,
      content,
      language: fileType === 'code' ? getLanguageFromExtension(filePath) : undefined
    }
  } catch (e: any) {
    if (e.statusCode) throw e

    throw createError({
      statusCode: 500,
      statusMessage: e.message || 'Failed to load file'
    })
  }
})
