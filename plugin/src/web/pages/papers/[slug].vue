<template>
  <div class="reader-container">
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading research materials...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">⚠</div>
      <h2>Unable to Load Paper</h2>
      <p>{{ error }}</p>
      <NuxtLink to="/" class="back-home">← Return to Library</NuxtLink>
    </div>

    <!-- Main Reading Interface -->
    <div v-else class="reader">
      <!-- Top Navigation Bar -->
      <nav class="top-bar">
        <NuxtLink to="/" class="back-to-library">
          <span class="back-arrow">←</span>
          <span class="back-text">Library</span>
        </NuxtLink>

        <div class="paper-title-nav">
          <h1>{{ paper?.title }}</h1>
        </div>

        <div class="actions">
          <VSCodeButton :path="paperPath" />
          <a v-if="paper?.url" :href="paper.url" target="_blank" class="external-link" title="View original paper">
            <span>Original Paper</span>
            <span class="arrow">↗</span>
          </a>
        </div>
      </nav>

      <!-- Main Content Area -->
      <div class="main-content">
        <!-- Sidebar File Tree -->
        <aside class="sidebar" :class="{ collapsed: sidebarCollapsed }">
          <div v-if="!sidebarCollapsed" class="sidebar-header">
            <h3>Study Materials</h3>
            <button @click="toggleSidebar" class="collapse-btn" title="Collapse">
              ←
            </button>
          </div>

          <button v-else @click="toggleSidebar" class="expand-btn" title="Expand">
            →
          </button>

          <div v-if="!sidebarCollapsed" class="file-tree">
            <FileTreeNode
              v-for="node in fileTree"
              :key="node.path"
              :node="node"
              :selected-path="selectedFile"
              @select="selectFile"
            />
          </div>
        </aside>

        <!-- Reading Pane -->
        <main class="reading-pane">
          <div class="reading-header">
            <div class="breadcrumb">
              <span class="crumb paper-name">{{ slug }}</span>
              <span class="separator">/</span>
              <span class="crumb file-name">{{ selectedFile || 'README.md' }}</span>
            </div>
          </div>

          <article class="content">
            <div v-if="fileLoading" class="file-loading">
              <div class="shimmer"></div>
            </div>
            <div v-else-if="fileContent" v-html="renderedContent" class="markdown-body"></div>
            <div v-else class="empty-state">
              <p>No content available</p>
            </div>
          </article>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'

const route = useRoute()
const slug = route.params.slug as string

// Main data
const { papers, loadPapers, getPaper } = usePapers()
const loading = ref(true)
const error = ref<string | null>(null)
const paper = ref(null)

// File tree and selection
const fileTree = ref([])
const selectedFile = ref('README.md')
const fileContent = ref('')
const fileLoading = ref(false)

// UI state
const sidebarCollapsed = ref(false)

// Load paper metadata and file tree
onMounted(async () => {
  try {
    if (papers.value.length === 0) {
      await loadPapers()
    }

    paper.value = getPaper(slug)

    if (!paper.value) {
      error.value = 'Paper not found'
      return
    }

    // Load file tree
    const tree = await $fetch(`/api/papers/${slug}/files`)
    fileTree.value = tree

    // Load default file (README.md)
    await loadFile('README.md')

  } catch (e: any) {
    error.value = e.message || 'Failed to load paper'
  } finally {
    loading.value = false
  }
})

// Load a specific file
const loadFile = async (path: string) => {
  fileLoading.value = true
  try {
    const data = await $fetch(`/api/papers/${slug}/file`, {
      params: { path }
    })
    fileContent.value = data.content
    selectedFile.value = path
  } catch (e: any) {
    fileContent.value = `Error loading file: ${e.message}`
  } finally {
    fileLoading.value = false
  }
}

const selectFile = (path: string) => {
  loadFile(path)
}

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

const renderedContent = computed(() => {
  if (!fileContent.value) return ''
  return marked.parse(fileContent.value)
})

const paperPath = computed(() => `~/claude-papers/papers/${slug}`)

useHead({
  title: paper.value ? `${paper.value.title} - Research Library` : 'Paper - Research Library'
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;600;700&family=Inter:wght@400;500;600&display=swap');

* {
  box-sizing: border-box;
}

.reader-container {
  min-height: 100vh;
  background: #ffffff;
  font-family: 'Inter', sans-serif;
}

/* Loading State */
.loading-state {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  color: #374151;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 3px solid #e5e7eb;
  border-top-color: #6b7280;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Error State */
.error-state {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
  text-align: center;
}

.error-icon {
  font-size: 4rem;
  opacity: 0.6;
}

.error-state h2 {
  font-family: 'Crimson Pro', serif;
  font-size: 1.75rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.error-state p {
  color: #6b7280;
  margin: 0;
}

.back-home {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: #1f2937;
  color: #ffffff;
  text-decoration: none;
  border-radius: 6px;
  font-size: 0.9rem;
  transition: background 0.2s;
}

.back-home:hover {
  background: #111827;
}

/* Top Navigation */
.top-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  padding: 0 2rem;
  gap: 2rem;
  z-index: 100;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
}

.back-to-library {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: #1f2937;
  font-weight: 500;
  white-space: nowrap;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: all 0.2s;
  font-family: 'Inter', sans-serif;
}

.back-to-library:hover {
  background: #f8f9fa;
  color: #6b7280;
}

.back-arrow {
  font-size: 1.1rem;
  font-weight: 600;
}

.back-text {
  font-size: 0.95rem;
}

.paper-title-nav {
  flex: 1;
  overflow: hidden;
}

.paper-title-nav h1 {
  font-family: 'Crimson Pro', serif;
  font-size: 1.1rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.external-link {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px solid #d1d5db;
  color: #374151;
  text-decoration: none;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.external-link:hover {
  background: #f8f9fa;
  border-color: #6b7280;
}

.arrow {
  font-size: 0.75em;
  opacity: 0.7;
}

/* Main Content */
.main-content {
  display: flex;
  margin-top: 64px;
  min-height: calc(100vh - 64px);
}

/* Sidebar */
.sidebar {
  width: 280px;
  background: #ffffff;
  border-right: 1px solid #e5e7eb;
  overflow-y: auto;
  transition: width 0.3s ease, opacity 0.3s ease;
  position: sticky;
  top: 64px;
  height: calc(100vh - 64px);
  position: relative;
}

.sidebar.collapsed {
  width: 48px;
}

.sidebar.collapsed .file-tree {
  display: none;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 1rem;
  border-bottom: 1px solid #e5e7eb;
  background: #ffffff;
}

.sidebar-header h3 {
  font-family: 'Crimson Pro', serif;
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.collapse-btn {
  background: none;
  border: none;
  color: #6b7280;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.25rem;
  line-height: 1;
  transition: color 0.2s;
}

.collapse-btn:hover {
  color: #1f2937;
}

.expand-btn {
  position: absolute;
  top: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  background: #ffffff;
  border: 1px solid #e5e7eb;
  color: #6b7280;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.5rem;
  line-height: 1;
  border-radius: 4px;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.expand-btn:hover {
  background: #f8f9fa;
  color: #1f2937;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.file-tree {
  padding: 0.75rem 0;
}

/* Reading Pane */
.reading-pane {
  flex: 1;
  background: #ffffff;
  min-width: 0;
}

.reading-header {
  padding: 1.5rem 3rem;
  border-bottom: 1px solid #e5e7eb;
  background: #ffffff;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
  font-family: 'Inter', monospace;
}

.crumb {
  opacity: 0.7;
}

.file-name {
  opacity: 1;
  font-weight: 500;
  color: #1f2937;
}

.separator {
  opacity: 0.4;
}

/* Content Area */
.content {
  max-width: 840px;
  margin: 0 auto;
  padding: 3rem;
  animation: fadeIn 0.4s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.file-loading {
  padding: 2rem;
}

.shimmer {
  height: 400px;
  background: linear-gradient(
    90deg,
    #f8f9fa 25%,
    #e5e7eb 50%,
    #f8f9fa 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 8px;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.empty-state {
  padding: 4rem 2rem;
  text-align: center;
  color: #9ca3af;
}

/* Markdown Styles */
.markdown-body {
  font-family: 'Crimson Pro', serif;
  font-size: 1.125rem;
  line-height: 1.8;
  color: #1f2937;
}

.markdown-body :deep(h1),
.markdown-body :deep(h2),
.markdown-body :deep(h3),
.markdown-body :deep(h4) {
  font-family: 'Crimson Pro', serif;
  font-weight: 600;
  color: #111827;
  margin-top: 2rem;
  margin-bottom: 1rem;
  line-height: 1.3;
}

.markdown-body :deep(h1) {
  font-size: 2.25rem;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 0.5rem;
  margin-top: 0;
}

.markdown-body :deep(h2) {
  font-size: 1.75rem;
  border-bottom: 1px solid #f8f9fa;
  padding-bottom: 0.4rem;
}

.markdown-body :deep(h3) {
  font-size: 1.375rem;
}

.markdown-body :deep(h4) {
  font-size: 1.125rem;
}

.markdown-body :deep(p) {
  margin-bottom: 1.5rem;
}

.markdown-body :deep(a) {
  color: #6b7280;
  text-decoration: underline;
  text-decoration-color: #d1d5db;
  text-underline-offset: 2px;
  transition: all 0.2s;
}

.markdown-body :deep(a:hover) {
  color: #374151;
  text-decoration-color: #6b7280;
}

.markdown-body :deep(code) {
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
  font-size: 0.875em;
  background: #f8f9fa;
  padding: 0.2em 0.4em;
  border-radius: 3px;
  border: 1px solid #e5e7eb;
  color: #374151;
}

.markdown-body :deep(pre) {
  background: #111827;
  color: #e5e7eb;
  padding: 1.5rem;
  border-radius: 8px;
  overflow-x: auto;
  margin: 1.5rem 0;
  border: 1px solid #1f2937;
}

.markdown-body :deep(pre code) {
  background: none;
  border: none;
  color: inherit;
  padding: 0;
}

.markdown-body :deep(blockquote) {
  border-left: 4px solid #6b7280;
  padding-left: 1.5rem;
  margin: 1.5rem 0;
  color: #374151;
  font-style: italic;
  background: #ffffff;
  padding: 1rem 1.5rem;
  border-radius: 0 6px 6px 0;
}

.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  padding-left: 2rem;
  margin-bottom: 1.5rem;
}

.markdown-body :deep(li) {
  margin-bottom: 0.5rem;
}

.markdown-body :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 2rem 0;
  box-shadow: 0 4px 12px rgba(61, 52, 48, 0.08);
}

.markdown-body :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5rem 0;
  font-size: 0.95rem;
}

.markdown-body :deep(table th),
.markdown-body :deep(table td) {
  border: 1px solid #e5e7eb;
  padding: 0.75rem 1rem;
  text-align: left;
}

.markdown-body :deep(table th) {
  background: #ffffff;
  font-weight: 600;
  color: #1f2937;
}

.markdown-body :deep(table td) {
  background: #ffffff;
}

.markdown-body :deep(hr) {
  border: none;
  height: 1px;
  background: #e5e7eb;
  margin: 3rem 0;
}
</style>
