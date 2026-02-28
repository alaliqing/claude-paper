<template>
  <span
    class="tag-badge"
    :class="sizeClass"
  >
    {{ tag }}
  </span>
</template>

<script setup lang="ts">
interface Props {
  tag: string
  size?: 'small' | 'medium'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium'
})

const sizeClass = computed(() => {
  return props.size === 'small' ? 'tag-badge--small' : 'tag-badge--medium'
})
</script>

<style scoped>
.tag-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  background-color: #e5e7eb;
  color: #374151;
  font-weight: 500;
  white-space: nowrap;
}

.tag-badge--small {
  font-size: 0.75rem;
  padding: 0.125rem 0.5rem;
}

.tag-badge--medium {
  font-size: 0.875rem;
  padding: 0.25rem 0.75rem;
}
</style>
