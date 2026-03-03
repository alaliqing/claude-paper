<template>
  <div class="paper-card-wrapper" :class="{ 'paper-card-wrapper--list': viewMode === 'list' }">
    <NuxtLink :to="`/papers/${paper.slug}`" class="paper-card" :class="{ 'paper-card--list': viewMode === 'list' }">
      <template v-if="viewMode === 'list'">
        <div class="paper-card__list-main">
          <h3>{{ paper.title }}</h3>
          <p class="abstract">{{ paper.abstract }}</p>

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
        </div>

        <div class="paper-card__list-meta">
          <p class="authors">{{ paper.authors.join(', ') }}</p>
          <div v-if="paper.tags && paper.tags.length > 0" class="tags-section">
            <TagBadge
              v-for="tag in paper.tags"
              :key="tag"
              :tag="tag"
              size="small"
            />
          </div>
        </div>
      </template>

      <template v-else>
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
      </template>
    </NuxtLink>
    <div class="kebab-menu" v-click-outside="closeMenu">
      <button
        class="kebab-button"
        @click="toggleMenu"
        type="button"
        title="Actions"
      >
        ···
      </button>
      <div v-if="menuOpen" class="kebab-dropdown">
        <button class="kebab-item" @click="handleEditTags" type="button">Edit Tags</button>
        <button class="kebab-item kebab-item--danger" @click="handleRemove" type="button">Delete</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Paper } from '~/composables/usePapers'

const props = defineProps({
  paper: {
    type: Object as () => Paper,
    required: true
  },
  viewMode: {
    type: String as () => 'grid' | 'list',
    default: 'grid'
  }
})

const emit = defineEmits(['edit-tags', 'remove'])

const menuOpen = ref(false)

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

const closeMenu = () => {
  menuOpen.value = false
}

const handleEditTags = () => {
  menuOpen.value = false
  emit('edit-tags')
}

const handleRemove = () => {
  menuOpen.value = false
  emit('remove', props.paper.slug)
}

const vClickOutside = {
  mounted(el: HTMLElement, binding: any) {
    el._clickOutside = (event: MouseEvent) => {
      if (!el.contains(event.target as Node)) {
        binding.value()
      }
    }
    document.addEventListener('click', el._clickOutside)
  },
  unmounted(el: HTMLElement) {
    document.removeEventListener('click', el._clickOutside)
  }
}

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

.paper-card--list {
  padding: 1.125rem 1.25rem;
}

.paper-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transform: translateY(-2px);
}

.kebab-menu {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  z-index: 10;
}

.kebab-button {
  padding: 0.25rem 0.5rem;
  background-color: #f3f4f6;
  border: none;
  border-radius: 0.375rem;
  font-size: 1rem;
  color: #374151;
  cursor: pointer;
  font-weight: 700;
  letter-spacing: 0.1em;
  opacity: 0;
  transition: opacity 0.2s, background-color 0.2s;
  line-height: 1;
}

.paper-card-wrapper:hover .kebab-button {
  opacity: 1;
}

.kebab-button:hover {
  background-color: #e5e7eb;
}

.kebab-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.25rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  min-width: auto;
  overflow: hidden;
}

.kebab-item {
  display: block;
  width: 100%;
  padding: 0.5rem 0.75rem;
  background: none;
  border: none;
  text-align: left;
  font-size: 0.825rem;
  color: #374151;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  white-space: nowrap;
}

.kebab-item:hover {
  background-color: #f3f4f6;
}

.kebab-item--danger {
  color: #dc2626;
}

.kebab-item--danger:hover {
  background-color: #fef2f2;
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

@media (min-width: 960px) {
  .paper-card--list {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(220px, 340px);
    column-gap: 1.25rem;
    align-items: start;
  }

  .paper-card__list-main {
    min-width: 0;
  }

  .paper-card__list-meta {
    min-width: 0;
  }

  .paper-card--list .authors {
    margin: 0 0 0.5rem 0;
  }

  .paper-card--list .tags-section {
    margin: 0;
  }

  .paper-card--list .abstract {
    margin: 0.375rem 0 0 0;
    -webkit-line-clamp: 2;
  }

  .paper-card--list .code-links {
    margin: 0.5rem 0 0 0;
    padding: 0.625rem 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .paper-card--list .code-links h4 {
    margin: 0;
    white-space: nowrap;
  }

  .paper-card--list .code-links ul {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 0.75rem;
  }

  .paper-card--list .code-links li {
    margin: 0;
  }
}
</style>
