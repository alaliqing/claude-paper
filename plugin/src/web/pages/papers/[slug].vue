<template>
  <div class="paper-detail">
    <div v-if="loading" class="loading">Loading paper...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="!paper" class="error">Paper not found</div>
    <div v-else>
      <!-- Paper Header -->
      <div class="paper-header">
        <NuxtLink to="/" class="back-link">← Back to Papers</NuxtLink>

        <h1>{{ paper.title }}</h1>
        <p class="authors">{{ paper.authors.join(', ') }}</p>

        <div class="meta">
          <span v-if="paper.date" class="date">{{ paper.date }}</span>
          <a v-if="paper.url" :href="paper.url" target="_blank" rel="noopener noreferrer" class="paper-link">
            View Original Paper ↗
          </a>
        </div>

        <div v-if="paper.abstract" class="abstract">
          <h3>Abstract</h3>
          <p>{{ paper.abstract }}</p>
        </div>

        <div v-if="paper.githubLinks?.length || paper.codeLinks?.length" class="code-links">
          <h3>Code Resources</h3>
          <ul>
            <li v-for="link in paper.githubLinks" :key="link">
              <a :href="link" target="_blank" rel="noopener noreferrer">
                {{ getRepoName(link) }}
                <span class="external-icon">↗</span>
              </a>
            </li>
            <li v-for="link in paper.codeLinks" :key="link">
              <a :href="link" target="_blank" rel="noopener noreferrer">
                {{ link }}
                <span class="external-icon">↗</span>
              </a>
            </li>
          </ul>
        </div>

        <div class="actions">
          <VSCodeButton :path="paperPath" />
          <span class="hint">Open study materials in VS Code</span>
        </div>
      </div>

      <!-- Paper Content -->
      <div class="paper-body">
        <PaperContent :markdown="markdown" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const slug = route.params.slug as string

const { papers, loadPapers, getPaper, getPaperMarkdown } = usePapers()

const loading = ref(true)
const error = ref<string | null>(null)
const paper = ref(null)
const markdown = ref('')

onMounted(async () => {
  try {
    // Load papers if not already loaded
    if (papers.value.length === 0) {
      await loadPapers()
    }

    // Get specific paper
    paper.value = getPaper(slug)

    if (!paper.value) {
      error.value = 'Paper not found'
      return
    }

    // Load markdown content
    const md = getPaperMarkdown(slug)
    markdown.value = md || ''

  } catch (e: any) {
    error.value = e.message || 'Failed to load paper'
  } finally {
    loading.value = false
  }
})

const paperPath = computed(() => `~/claude-papers/papers/${slug}`)

const getRepoName = (url: string) => {
  const match = url.match(/github\.com\/(.+?)(?:\.git)?$/)
  return match ? match[1] : url
}

useHead({
  title: paper.value ? `${paper.value.title} - Claude Paper Library` : 'Paper - Claude Paper Library'
})
</script>

<style scoped>
.paper-detail {
  min-height: 100vh;
  background: #f7fafc;
}

.loading,
.error {
  padding: 2rem;
  text-align: center;
  color: #718096;
}

.error {
  color: #e53e3e;
}

.paper-header {
  background: white;
  border-bottom: 1px solid #e2e8f0;
  padding: 2rem;
  max-width: 900px;
  margin: 0 auto;
}

.back-link {
  display: inline-block;
  color: #3182ce;
  text-decoration: none;
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
}

.back-link:hover {
  text-decoration: underline;
}

.paper-header h1 {
  font-size: 2rem;
  color: #1a202c;
  margin: 0 0 0.75rem 0;
  line-height: 1.3;
}

.authors {
  font-size: 1rem;
  color: #718096;
  margin: 0 0 1rem 0;
}

.meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
}

.date {
  color: #718096;
}

.paper-link {
  color: #3182ce;
  text-decoration: none;
}

.paper-link:hover {
  text-decoration: underline;
}

.abstract {
  margin: 1.5rem 0;
  padding: 1.5rem;
  background: #f7fafc;
  border-radius: 8px;
  border-left: 4px solid #3182ce;
}

.abstract h3 {
  margin: 0 0 0.75rem 0;
  font-size: 0.9rem;
  color: #4a5568;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.abstract p {
  margin: 0;
  color: #4a5568;
  line-height: 1.6;
}

.code-links {
  margin: 1.5rem 0;
}

.code-links h3 {
  margin: 0 0 0.75rem 0;
  font-size: 0.9rem;
  color: #4a5568;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.code-links ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.code-links li {
  margin: 0.5rem 0;
}

.code-links a {
  color: #3182ce;
  text-decoration: none;
  font-size: 0.95rem;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.code-links a:hover {
  text-decoration: underline;
}

.external-icon {
  font-size: 0.75em;
  opacity: 0.7;
}

.actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e2e8f0;
}

.hint {
  font-size: 0.85rem;
  color: #718096;
}

.paper-body {
  background: white;
  margin-top: 2rem;
}
</style>
