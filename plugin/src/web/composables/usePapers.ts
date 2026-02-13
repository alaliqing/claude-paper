import fs from 'fs'
import path from 'path'
import { homedir } from 'os'

export interface Paper {
  title: string
  slug: string
  authors: string[]
  abstract: string
  githubLinks?: string[]
  codeLinks?: string[]
  url?: string
  date?: string
}

export const usePapers = () => {
  const papers = ref<Paper[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const loadPapers = async () => {
    loading.value = true
    error.value = null

    try {
      const indexPath = path.join(homedir(), 'claude-papers/index.json')

      if (!fs.existsSync(indexPath)) {
        papers.value = []
        return
      }

      const content = fs.readFileSync(indexPath, 'utf-8')
      const data = JSON.parse(content)

      // Handle both flat array and {papers: [...]} structure
      papers.value = Array.isArray(data) ? data : (data.papers || [])
    } catch (e: any) {
      error.value = e.message || 'Failed to load papers'
      papers.value = []
    } finally {
      loading.value = false
    }
  }

  const getPaper = (slug: string): Paper | null => {
    return papers.value.find(p => p.slug === slug) || null
  }

  const getPaperMarkdown = (slug: string): string | null => {
    try {
      const paperDir = path.join(homedir(), 'claude-papers/papers', slug)
      const readmePath = path.join(paperDir, 'README.md')

      if (!fs.existsSync(readmePath)) {
        return null
      }

      return fs.readFileSync(readmePath, 'utf-8')
    } catch (e) {
      return null
    }
  }

  return {
    papers,
    loading,
    error,
    loadPapers,
    getPaper,
    getPaperMarkdown
  }
}
