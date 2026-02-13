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
      const data = await $fetch<Paper[]>('/api/papers')
      papers.value = data
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

  const getPaperMarkdown = async (slug: string): Promise<string | null> => {
    try {
      const data = await $fetch<{ slug: string; markdown: string }>(`/api/papers/${slug}`)
      return data.markdown
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
