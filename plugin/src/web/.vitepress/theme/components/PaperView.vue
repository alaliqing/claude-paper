<template>
  <div class="paper-view">
    <div v-if="!paper" class="error">Paper not found</div>
    <div v-else>
      <div class="paper-header">
        <h1>{{ paper.title }}</h1>
        <p class="authors">{{ paper.authors?.join(', ') || 'Unknown authors' }}</p>
        <VSCodeButton :path="paperPath" />
      </div>

      <div class="paper-content">
        <section v-if="paper.abstract" class="abstract">
          <h2>Abstract</h2>
          <p>{{ paper.abstract }}</p>
        </section>

        <section class="materials">
          <h2>Study Materials</h2>
          <p class="info">Open in VS Code to access all generated study materials including:</p>
          <ul>
            <li>📄 README.md - Quick navigation guide</li>
            <li>📝 summary.md - Comprehensive summary</li>
            <li>💡 insights.md - Deep dive into core ideas</li>
            <li>🔬 method.md - Methodology details (if complex)</li>
            <li>❓ qa.md - Learning questions</li>
            <li>💻 code/ - Code demonstrations</li>
            <li>🖼️ images/ - Key figures</li>
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
import { computed } from 'vue'
import { useRoute } from 'vitepress'
import { data as papers } from '../data/papers.data.js'
import VSCodeButton from './VSCodeButton.vue'

const route = useRoute()
const paperSlug = computed(() => route.params.slug)
const paper = computed(() => papers.find(p => p.slug === paperSlug.value))
const paperPath = computed(() => `~/claude-papers/papers/${paperSlug.value}`)
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
