<template>
  <div class="paper-view">
    <div v-if="loading">Loading paper...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <div class="paper-header">
        <h1>{{ paper.title }}</h1>
        <p class="authors">{{ paper.authors.join(', ') }}</p>
        <VSCodeButton :path="paperPath" />
      </div>

      <div class="paper-content">
        <section v-if="paper.abstract" class="abstract">
          <h2>Abstract</h2>
          <p>{{ paper.abstract }}</p>
        </section>

        <section class="materials">
          <h2>Study Materials</h2>
          <ul>
            <li v-for="material in materials" :key="material.name">
              <a :href="material.url">{{ material.name }}</a>
            </li>
          </ul>
        </section>

        <section v-if="paper.githubLinks?.length || paper.codeLinks?.length" class="code-links">
          <h2>Code Resources</h2>
          <ul>
            <li v-for="link in paper.githubLinks" :key="link">
              <a :href="link" target="_blank">{{ link }}</a>
            </li>
            <li v-for="link in paper.codeLinks" :key="link">
              <a :href="link" target="_blank">{{ link }}</a>
            </li>
          </ul>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vitepress'
import VSCodeButton from './VSCodeButton.vue'

const route = useRoute()
const paper = ref({})
const loading = ref(true)
const error = ref(null)

const paperSlug = computed(() => route.params.slug)
const paperPath = computed(() => `~/claude-papers/papers/${paperSlug.value}`)

const materials = computed(() => {
  const items = []
  if (paper.value.hasReadme) items.push({ name: 'README', url: `/materials/${paperSlug.value}/README.md` })
  if (paper.value.hasSummary) items.push({ name: 'Summary', url: `/materials/${paperSlug.value}/summary.md` })
  if (paper.value.hasInsights) items.push({ name: 'Insights', url: `/materials/${paperSlug.value}/insights.md` })
  if (paper.value.hasMethod) items.push({ name: 'Method', url: `/materials/${paperSlug.value}/method.md` })
  if (paper.value.hasQA) items.push({ name: 'Q&A', url: `/materials/${paperSlug.value}/qa.md` })
  return items
})

onMounted(async () => {
  try {
    const response = await fetch(`/api/papers/${paperSlug.value}`)
    if (!response.ok) throw new Error('Failed to load paper')
    paper.value = await response.json()
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.paper-view {
  padding: 2rem;
  max-width: 900px;
  margin: 0 auto;
}

.paper-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.paper-header h1 {
  margin: 0 0 0.5rem 0;
  color: #1a202c;
}

.authors {
  color: #718096;
  margin: 0.5rem 0;
}

.abstract {
  background: #f7fafc;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.materials ul, .code-links ul {
  list-style: none;
  padding: 0;
}

.materials li, .code-links li {
  margin: 0.75rem 0;
}

.materials a, .code-links a {
  color: #3182ce;
  text-decoration: none;
  font-weight: 500;
}

.materials a:hover, .code-links a:hover {
  text-decoration: underline;
}

.error {
  color: #e53e3e;
  padding: 2rem;
  text-align: center;
}
</style>
