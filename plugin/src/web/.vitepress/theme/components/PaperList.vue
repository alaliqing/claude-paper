<template>
  <div class="paper-list">
    <h2>Your Papers</h2>
    <div v-if="papers.length === 0" class="empty">
      No papers yet. Use <code>/claude-paper-suite:study</code> to add papers.
    </div>
    <div v-else class="papers-grid">
      <div v-for="paper in papers" :key="paper.slug" class="paper-card">
        <h3>{{ paper.title }}</h3>
        <p class="authors">{{ paper.authors.join(', ') }}</p>
        <p class="abstract">{{ paper.abstract }}</p>
        <div class="actions">
          <a :href="`/paper/${paper.slug}`">View Details</a>
          <VSCodeButton :path="paperPath(paper.slug)" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { data as papers } from '../data/papers.data.js'
import VSCodeButton from './VSCodeButton.vue'

const paperPath = (slug) => `~/claude-papers/papers/${slug}`
</script>

<style scoped>
.paper-list {
  padding: 2rem;
}

.papers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.paper-card {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1.5rem;
  background: white;
  transition: box-shadow 0.2s;
}

.paper-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.paper-card h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  color: #1a202c;
}

.authors {
  font-size: 0.9rem;
  color: #718096;
  margin: 0.25rem 0;
}

.abstract {
  font-size: 0.9rem;
  color: #4a5568;
  margin: 0.75rem 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.actions a {
  padding: 0.5rem 1rem;
  background: #3182ce;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-size: 0.9rem;
}

.actions a:hover {
  background: #2c5aa0;
}

.empty, .error {
  padding: 2rem;
  text-align: center;
  color: #718096;
}

.error {
  color: #e53e3e;
}
</style>
