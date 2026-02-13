<template>
  <div class="paper-list">
    <h1>Claude Paper Library</h1>
    <p class="subtitle">All papers stored in: <code>~/claude-papers/papers/</code></p>

    <div v-if="loading" class="loading">Loading papers...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="papers.length === 0" class="empty">
      No papers yet. Use <code>/claude-paper:study</code> to add papers.
    </div>
    <div v-else class="papers-grid">
      <PaperCard
        v-for="paper in papers"
        :key="paper.slug"
        :paper="paper"
      />
    </div>
  </div>
</template>

<script setup>
const { papers, loading, error, loadPapers } = usePapers()

// Load papers on mount
onMounted(async () => {
  await loadPapers()
})

useHead({
  title: 'Claude Paper Library'
})
</script>

<style scoped>
.paper-list {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

h1 {
  font-size: 2.5rem;
  color: #1a202c;
  margin-bottom: 0.5rem;
}

.subtitle {
  font-size: 1rem;
  color: #718096;
  margin-bottom: 2rem;
}

.subtitle code {
  background: #f7fafc;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.9em;
}

.papers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.loading,
.empty,
.error {
  padding: 2rem;
  text-align: center;
  color: #718096;
}

.error {
  color: #e53e3e;
}
</style>
