<template>
  <div class="search-filter-bar">
    <div class="search-filter-bar__search">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search papers by title, author, or abstract..."
        class="search-filter-bar__input"
        @input="onSearchInput"
      />
      <button
        v-if="searchQuery"
        class="search-filter-bar__clear"
        @click="clearSearch"
        type="button"
      >
        ×
      </button>
    </div>

    <div class="search-filter-bar__row">
      <div v-if="availableTags.length > 0" class="search-filter-bar__tags">
        <span class="search-filter-bar__label">Filter by tags:</span>
        <button
          v-for="tag in availableTags"
          :key="tag"
          class="search-filter-bar__tag"
          :class="{ 'search-filter-bar__tag--active': selectedTags.includes(tag) }"
          @click="toggleTag(tag)"
          type="button"
        >
          {{ tag }}
        </button>
      </div>

      <div class="search-filter-bar__controls">
        <div class="search-filter-bar__view-toggle" role="group" aria-label="View mode">
          <button
            class="search-filter-bar__view-btn"
            :class="{ 'search-filter-bar__view-btn--active': viewMode === 'grid' }"
            @click="setViewMode('grid')"
            type="button"
          >
            Grid
          </button>
          <button
            class="search-filter-bar__view-btn"
            :class="{ 'search-filter-bar__view-btn--active': viewMode === 'list' }"
            @click="setViewMode('list')"
            type="button"
          >
            List
          </button>
        </div>

        <div class="search-filter-bar__sort">
          <label for="sort-select" class="search-filter-bar__label">Sort:</label>
          <select
            id="sort-select"
            v-model="sortBy"
            class="search-filter-bar__select"
            @change="onSortChange"
          >
            <option value="default">Default</option>
            <option value="a-z">A-Z</option>
            <option value="z-a">Z-A</option>
          </select>
        </div>

        <button
          v-if="hasActiveFilters"
          class="search-filter-bar__clear-all"
          @click="clearAll"
          type="button"
        >
          Clear All
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  availableTags: string[]
  viewMode: 'grid' | 'list'
}

interface Emits {
  (e: 'search', query: string): void
  (e: 'filter', tags: string[]): void
  (e: 'sort', sortBy: string): void
  (e: 'view', viewMode: 'grid' | 'list'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const searchQuery = ref('')
const selectedTags = ref<string[]>([])
const sortBy = ref('default')

let searchTimeout: NodeJS.Timeout | null = null

const hasActiveFilters = computed(() => {
  return searchQuery.value !== '' || selectedTags.value.length > 0 || sortBy.value !== 'default'
})

const onSearchInput = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }

  searchTimeout = setTimeout(() => {
    emit('search', searchQuery.value)
  }, 300)
}

const clearSearch = () => {
  searchQuery.value = ''
  emit('search', '')
}

const toggleTag = (tag: string) => {
  const index = selectedTags.value.indexOf(tag)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
  } else {
    selectedTags.value.push(tag)
  }
  emit('filter', selectedTags.value)
}

const onSortChange = () => {
  emit('sort', sortBy.value)
}

const clearAll = () => {
  searchQuery.value = ''
  selectedTags.value = []
  sortBy.value = 'default'
  emit('search', '')
  emit('filter', [])
  emit('sort', 'default')
}

const setViewMode = (mode: 'grid' | 'list') => {
  emit('view', mode)
}
</script>

<style scoped>
.search-filter-bar {
  background: white;
  border-radius: 0.5rem;
  padding: 1rem 1.25rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
}

.search-filter-bar__search {
  position: relative;
  margin: 0 auto 0.75rem auto;
}

.search-filter-bar__input {
  width: 100%;
  box-sizing: border-box;
  padding: 0.75rem 2.5rem 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.search-filter-bar__input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-filter-bar__clear {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #6b7280;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
}

.search-filter-bar__clear:hover {
  color: #374151;
}

.search-filter-bar__row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: flex-start;
  gap: 0.75rem 1.25rem;
}

.search-filter-bar__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
  min-width: 0;
}

.search-filter-bar__label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.search-filter-bar__tag {
  padding: 0.25rem 0.75rem;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 1rem;
  font-size: 0.875rem;
  color: #374151;
  cursor: pointer;
  transition: all 0.15s;
}

.search-filter-bar__tag:hover {
  background-color: #f3f4f6;
}

.search-filter-bar__tag--active {
  background-color: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.search-filter-bar__controls {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 1rem;
  white-space: nowrap;
}

.search-filter-bar__view-toggle {
  display: inline-flex;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  overflow: hidden;
}

.search-filter-bar__view-btn {
  padding: 0.375rem 0.625rem;
  border: none;
  background: #ffffff;
  color: #4b5563;
  font-size: 0.8rem;
  cursor: pointer;
}

.search-filter-bar__view-btn + .search-filter-bar__view-btn {
  border-left: 1px solid #d1d5db;
}

.search-filter-bar__view-btn--active {
  background: #4b5563;
  color: #ffffff;
}

.search-filter-bar__sort {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.search-filter-bar__select {
  padding: 0.375rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background: white;
  cursor: pointer;
}

.search-filter-bar__select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-filter-bar__clear-all {
  padding: 0.375rem 0.75rem;
  background-color: #f3f4f6;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  color: #374151;
  cursor: pointer;
  font-weight: 500;
}

.search-filter-bar__clear-all:hover {
  background-color: #e5e7eb;
}

@media (max-width: 768px) {
  .search-filter-bar__row {
    grid-template-columns: 1fr;
  }

  .search-filter-bar__controls {
    justify-content: flex-start;
    flex-wrap: wrap;
    white-space: normal;
  }
}
</style>
