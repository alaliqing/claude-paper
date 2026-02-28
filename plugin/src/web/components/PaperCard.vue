<template>
  <div class="paper-card-wrapper">
    <NuxtLink :to="`/papers/${paper.slug}`" class="paper-card">
      <h3>{{ paper.title }}</h3>
      <p class="authors">{{ paper.authors.join(', ') }}</p>
      <p class="abstract">{{ paper.abstract }}</p>

      <div v-if="paper.tags && paper.tags.length > 0" class="tags-section">
        <TagBadge
          v-for="tag in paper.tags"
          :key="tag"
          :tag="tag"
          size="small"
        />
      </div>

      <div v-if="paper.githubLinks?.length || paper.codeLinks?.length" class="code-links">
        <h4>Code Resources:</h4>
        <ul>
          <li v-for="link in paper.githubLinks" :key="link">
            <a :href="link" target="_blank" rel="noopener noreferrer" @click.stop>
              {{ getRepoName(link) }}
              <span class="external-icon">↗</span>
            </a>
          </li>
          <li v-for="link in paper.codeLinks" :key="link">
            <a :href="link" target="_blank" rel="noopener noreferrer" @click.stop>
              {{ link }}
              <span class="external-icon">↗</span>
            </a>
          </li>
        </ul>
      </div>
    </NuxtLink>
    <button
      class="edit-tags-button"
      @click="$emit('edit-tags')"
      type="button"
      title="Edit tags"
    >
      Edit Tags
    </button>
  </div>
</template>

<script setup lang="ts">
import type { Paper } from '~/composables/usePapers'

const props = defineProps({
  paper: {
    type: Object as () => Paper,
    required: true
  }
})

defineEmits(['edit-tags'])

const getRepoName = (url) => {
  const match = url.match(/github\.com\/(.+?)(?:\.git)?$/)
  return match ? match[1] : url
}
</script>

<style scoped>
.paper-card-wrapper {
  position: relative;
}

.paper-card {
  display: block;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1.5rem;
  background: white;
  transition: box-shadow 0.2s, transform 0.2s;
  text-decoration: none;
  color: inherit;
  cursor: pointer;
}

.paper-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transform: translateY(-2px);
}

.edit-tags-button {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  padding: 0.375rem 0.75rem;
  background-color: #f3f4f6;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  color: #374151;
  cursor: pointer;
  font-weight: 500;
  opacity: 0;
  transition: opacity 0.2s, background-color 0.2s;
}

.paper-card-wrapper:hover .edit-tags-button {
  opacity: 1;
}

.edit-tags-button:hover {
  background-color: #e5e7eb;
}

.tags-section {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  margin: 0.75rem 0;
}

.paper-card h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  color: #1a202c;
  line-height: 1.4;
}

.authors {
  font-size: 0.9rem;
  color: #718096;
  margin: 0.25rem 0 0.75rem 0;
}

.abstract {
  font-size: 0.9rem;
  color: #4a5568;
  margin: 0.75rem 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.5;
}

.code-links {
  margin: 1rem 0;
  padding: 1rem;
  background: #f7fafc;
  border-radius: 6px;
}

.code-links h4 {
  margin: 0 0 0.5rem 0;
  font-size: 0.85rem;
  color: #4a5568;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
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
  font-size: 0.9rem;
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
</style>
