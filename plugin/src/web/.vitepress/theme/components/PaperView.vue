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
            <li>📄 <strong>README.md</strong> - Quick navigation guide</li>
            <li>📝 <strong>summary.md</strong> - Comprehensive summary</li>
            <li>💡 <strong>insights.md</strong> - Deep dive into core ideas</li>
            <li>🔬 <strong>method.md</strong> - Methodology details (if complex)</li>
            <li>❓ <strong>qa.md</strong> - Learning questions</li>
            <li>💻 <strong>code/</strong> - Code demonstrations</li>
            <li>🖼️ <strong>images/</strong> - Key figures</li>
          </ul>
          <div class="cta">
            <VSCodeButton :path="paperPath" />
            <span class="hint">Click to open the full study materials in VS Code</span>
          </div>
        </section>

        <section v-if="paper.githubLinks?.length || paper.codeLinks?.length" class="code-links">
          <h2>Code Resources</h2>
          <ul>
            <li v-for="link in paper.githubLinks" :key="link">
              <a :href="link" target="_blank" rel="noopener noreferrer">
                {{ link }}
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
  margin: 0.5rem 0 1rem 0;
}

.abstract {
  background: #f7fafc;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.abstract h2 {
  margin-top: 0;
}

.materials {
  margin-bottom: 2rem;
}

.materials .info {
  color: #4a5568;
  margin-bottom: 1rem;
}

.materials ul {
  list-style: none;
  padding: 0;
  margin: 1rem 0;
}

.materials li {
  margin: 0.75rem 0;
  padding-left: 0;
}

.materials strong {
  color: #2d3748;
}

.cta {
  margin-top: 1.5rem;
  padding: 1.5rem;
  background: #edf2f7;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.hint {
  color: #4a5568;
  font-size: 0.9rem;
}

.code-links ul {
  list-style: none;
  padding: 0;
}

.code-links li {
  margin: 0.75rem 0;
}

.code-links a {
  color: #3182ce;
  text-decoration: none;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.code-links a:hover {
  text-decoration: underline;
}

.external-icon {
  font-size: 0.8em;
  opacity: 0.7;
}

.error {
  color: #e53e3e;
  padding: 2rem;
  text-align: center;
}
</style>
