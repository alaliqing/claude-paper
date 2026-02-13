<template>
  <div class="library-container">
    <nav class="top-bar">
      <div class="logo">
        <span class="logo-icon">◈</span>
        <span class="logo-text">Research Library</span>
      </div>
    </nav>

    <div class="library-content">
      <div class="library-header">
        <h1>Your Research Collection</h1>
        <p class="subtitle">All papers stored in: <code>~/claude-papers/papers/</code></p>
      </div>

      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading papers...</p>
      </div>
      <div v-else-if="error" class="error-state">{{ error }}</div>
      <div v-else-if="papers.length === 0" class="empty-state">
        <p>No papers yet. Use <code>/claude-paper:study</code> to add papers.</p>
      </div>
      <div v-else class="papers-grid">
        <PaperCard
          v-for="paper in papers"
          :key="paper.slug"
          :paper="paper"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
const { papers, loading, error, loadPapers } = usePapers()

onMounted(async () => {
  await loadPapers()
})

useHead({
  title: 'Research Library'
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;600;700&family=Inter:wght@400;500;600&display=swap');

.library-container {
  min-height: 100vh;
  background: #faf8f5;
}

/* Top Navigation */
.top-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: rgba(255, 255, 255, 0.95);
  border-bottom: 1px solid #e8e2db;
  display: flex;
  align-items: center;
  padding: 0 2rem;
  z-index: 100;
  backdrop-filter: blur(10px);
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #3d3430;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
}

.logo-icon {
  font-size: 1.25rem;
  color: #8b7355;
}

.logo-text {
  font-size: 0.95rem;
  letter-spacing: 0.01em;
}

/* Library Content */
.library-content {
  padding-top: 64px;
  max-width: 1400px;
  margin: 0 auto;
  padding-left: 2rem;
  padding-right: 2rem;
  padding-bottom: 4rem;
}

.library-header {
  padding: 3rem 0 2rem 0;
}

h1 {
  font-family: 'Crimson Pro', serif;
  font-size: 2.5rem;
  font-weight: 600;
  color: #2d2520;
  margin: 0 0 0.75rem 0;
}

.subtitle {
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  color: #8b7355;
  margin: 0;
}

.subtitle code {
  background: #e8e2db;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.9em;
  color: #6b5d54;
}

.papers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

/* States */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  padding: 6rem 2rem;
  color: #6b5d54;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 3px solid #e8e2db;
  border-top-color: #8b7355;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state,
.error-state {
  padding: 6rem 2rem;
  text-align: center;
  color: #8b7355;
  font-family: 'Inter', sans-serif;
}

.empty-state code {
  background: #e8e2db;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  color: #6b5d54;
}

.error-state {
  color: #c14a4a;
}
</style>
