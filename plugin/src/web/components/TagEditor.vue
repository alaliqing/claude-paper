<template>
  <div class="tag-editor">
    <div class="tag-editor__header">
      <h3 class="tag-editor__title">Edit Tags</h3>
      <button
        v-if="localTags.length > 0"
        class="tag-editor__clear-all"
        @click="clearAllTags"
        type="button"
      >
        Clear all
      </button>
    </div>

    <div v-if="localTags.length > 0" class="tag-editor__tags">
      <div
        v-for="(tag, index) in localTags"
        :key="index"
        class="tag-editor__tag"
      >
        <span>{{ tag }}</span>
        <button
          class="tag-editor__remove"
          @click="removeTag(index)"
          type="button"
        >
          ×
        </button>
      </div>
    </div>

    <div class="tag-editor__input-wrapper">
      <input
        v-model="newTag"
        type="text"
        placeholder="Add tag (press Enter)"
        class="tag-editor__input"
        @keydown.enter.prevent="addTag"
      />
    </div>

    <div class="tag-editor__actions">
      <button
        class="tag-editor__button tag-editor__button--cancel"
        @click="$emit('cancel')"
        type="button"
      >
        Cancel
      </button>
      <button
        class="tag-editor__button tag-editor__button--save"
        @click="save"
        type="button"
      >
        Save
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  initialTags?: string[]
}

interface Emits {
  (e: 'update', tags: string[]): void
  (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  initialTags: () => []
})

const emit = defineEmits<Emits>()

const localTags = ref<string[]>([...props.initialTags])
const newTag = ref('')

const addTag = () => {
  const tag = newTag.value.trim()
  if (tag && !localTags.value.includes(tag)) {
    localTags.value.push(tag)
    newTag.value = ''
  }
}

const removeTag = (index: number) => {
  localTags.value.splice(index, 1)
}

const clearAllTags = () => {
  localTags.value = []
}

const save = () => {
  emit('update', localTags.value)
}
</script>

<style scoped>
.tag-editor {
  background: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  max-width: 500px;
  width: 100%;
  box-sizing: border-box;
}

.tag-editor__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.tag-editor__title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: #111827;
}

.tag-editor__clear-all {
  padding: 0.25rem 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background: #f9fafb;
  color: #4b5563;
  font-size: 0.75rem;
  line-height: 1.2;
  cursor: pointer;
}

.tag-editor__clear-all:hover {
  background: #f3f4f6;
}

.tag-editor__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tag-editor__tag {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  background-color: #e5e7eb;
  border-radius: 1rem;
  font-size: 0.875rem;
  color: #374151;
}

.tag-editor__remove {
  background: none;
  border: none;
  color: #6b7280;
  font-size: 1.25rem;
  line-height: 1;
  cursor: pointer;
  padding: 0;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
}

.tag-editor__remove:hover {
  color: #374151;
}

.tag-editor__input-wrapper {
  width: 100%;
  margin: 0 auto 1.5rem auto;
  box-sizing: border-box;
}

.tag-editor__input {
  width: 100%;
  box-sizing: border-box;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.tag-editor__input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.tag-editor__actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.tag-editor__button {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
}

.tag-editor__button--cancel {
  background-color: #f3f4f6;
  color: #374151;
}

.tag-editor__button--cancel:hover {
  background-color: #e5e7eb;
}

.tag-editor__button--save {
  background-color: #3b82f6;
  color: white;
}

.tag-editor__button--save:hover {
  background-color: #2563eb;
}
</style>
