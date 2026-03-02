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

  // HTML files - render as HTML
  if (ext === '.html' || ext === '.htm') {
    return 'html'
  }

  // Jupyter notebooks
  if (ext === '.ipynb') {
    return 'notebook'
  }

  // Code file extensions
  const codeExts = [
    '.py', '.js', '.ts', '.jsx', '.tsx', '.java', '.cpp', '.c', '.h', '.hpp',
    '.cs', '.go', '.rs', '.rb', '.php', '.swift', '.kt', '.scala', '.sh',
    '.bash', '.zsh', '.fish', '.ps1', '.r', '.m', '.sql', '.json', '.xml',
    '.yaml', '.yml', '.toml', '.ini', '.cfg', '.conf', '.vue', '.svelte',
    '.css', '.scss', '.sass', '.less'
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

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function getNotebookLanguage(nb: any): string {
  const lang = nb.metadata?.kernelspec?.language || nb.metadata?.language_info?.name || 'python'
  return lang.toLowerCase()
}

function renderNotebookToHtml(raw: string): string {
  const nb = JSON.parse(raw)
  const cells = nb.cells || []
  const lang = getNotebookLanguage(nb)
  const parts: string[] = []

  for (let i = 0; i < cells.length; i++) {
    const cell = cells[i]
    const source = Array.isArray(cell.source) ? cell.source.join('') : (cell.source || '')

    if (cell.cell_type === 'markdown') {
      parts.push(`<div class="nb-cell nb-markdown">${source}</div>`)
    } else if (cell.cell_type === 'code') {
      const execCount = cell.execution_count != null ? `[${cell.execution_count}]` : '[ ]'
      parts.push(`<div class="nb-cell nb-code">`)
      parts.push(`<div class="nb-input"><span class="nb-prompt nb-in">In ${execCount}:</span><pre><code class="language-${lang}">${escapeHtml(source)}</code></pre></div>`)

      // Render outputs
      const outputs = cell.outputs || []
      for (const out of outputs) {
        if (out.output_type === 'stream') {
          const text = Array.isArray(out.text) ? out.text.join('') : (out.text || '')
          const streamClass = out.name === 'stderr' ? 'nb-stderr' : 'nb-stdout'
          parts.push(`<div class="nb-output ${streamClass}"><pre>${escapeHtml(text)}</pre></div>`)
        } else if (out.output_type === 'execute_result' || out.output_type === 'display_data') {
          const data = out.data || {}
          if (data['text/html']) {
            const html = Array.isArray(data['text/html']) ? data['text/html'].join('') : data['text/html']
            parts.push(`<div class="nb-output nb-rich">${html}</div>`)
          } else if (data['image/png']) {
            parts.push(`<div class="nb-output nb-image"><img src="data:image/png;base64,${data['image/png']}" /></div>`)
          } else if (data['image/jpeg']) {
            parts.push(`<div class="nb-output nb-image"><img src="data:image/jpeg;base64,${data['image/jpeg']}" /></div>`)
          } else if (data['image/svg+xml']) {
            const svg = Array.isArray(data['image/svg+xml']) ? data['image/svg+xml'].join('') : data['image/svg+xml']
            parts.push(`<div class="nb-output nb-image">${svg}</div>`)
          } else if (data['text/plain']) {
            const text = Array.isArray(data['text/plain']) ? data['text/plain'].join('') : data['text/plain']
            parts.push(`<div class="nb-output nb-stdout"><pre>${escapeHtml(text)}</pre></div>`)
          }
        } else if (out.output_type === 'error') {
          const tb = (out.traceback || []).join('\n')
          // Strip ANSI escape codes
          const clean = tb.replace(/\x1b\[[0-9;]*m/g, '')
          parts.push(`<div class="nb-output nb-stderr"><pre>${escapeHtml(clean)}</pre></div>`)
        }
      }

      parts.push(`</div>`)
    } else if (cell.cell_type === 'raw') {
      parts.push(`<div class="nb-cell nb-raw"><pre>${escapeHtml(source)}</pre></div>`)
    }
  }

  return parts.join('\n')
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

    // For notebooks, convert to structured HTML
    if (fileType === 'notebook') {
      return {
        path: filePath,
        type: 'notebook',
        content: renderNotebookToHtml(content),
        language: getNotebookLanguage(JSON.parse(content))
      }
    }

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
