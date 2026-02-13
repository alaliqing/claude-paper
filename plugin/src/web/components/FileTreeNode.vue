<template>
  <div class="tree-node">
    <div
      class="node-content"
      :class="{ selected: isSelected, directory: isDirectory, file: !isDirectory }"
      @click="handleClick"
    >
      <span v-if="isDirectory" class="icon expand-icon">
        {{ expanded ? '▼' : '▶' }}
      </span>
      <span v-else class="icon file-icon">
        {{ getFileIcon(node.name) }}
      </span>
      <span class="node-label">{{ node.name }}</span>
    </div>

    <div v-if="isDirectory && expanded" class="children">
      <FileTreeNode
        v-for="child in node.children"
        :key="child.path"
        :node="child"
        :selected-path="selectedPath"
        @select="$emit('select', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
interface FileNode {
  name: string
  path: string
  type: 'file' | 'directory'
  children?: FileNode[]
}

const props = defineProps<{
  node: FileNode
  selectedPath: string
}>()

const emit = defineEmits<{
  select: [path: string]
}>()

const expanded = ref(false) // Start collapsed by default

const isDirectory = computed(() => props.node.type === 'directory')
const isSelected = computed(() => props.node.path === props.selectedPath)

const handleClick = () => {
  if (isDirectory.value) {
    expanded.value = !expanded.value
  } else {
    emit('select', props.node.path)
  }
}

const getFileIcon = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase()

  const iconMap: Record<string, string> = {
    'md': '📄',
    'txt': '📝',
    'pdf': '📕',
    'png': '🖼️',
    'jpg': '🖼️',
    'jpeg': '🖼️',
    'gif': '🖼️',
    'py': '🐍',
    'js': '📜',
    'ts': '📘',
    'json': '{}',
    'yaml': '⚙️',
    'yml': '⚙️',
    'sh': '⚡',
    'html': '🌐',
    'css': '🎨',
  }

  return iconMap[ext || ''] || '📄'
}
</script>

<style scoped>
.tree-node {
  user-select: none;
}

.node-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: background 0.15s ease;
  font-size: 0.875rem;
  color: #374151;
}

.node-content:hover {
  background: #f8f9fa;
}

.node-content.selected {
  background: #e5e7eb;
  color: #1f2937;
  font-weight: 500;
}

.node-content.directory {
  font-weight: 500;
}

.icon {
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1rem;
  flex-shrink: 0;
}

.expand-icon {
  color: #6b7280;
  font-size: 0.625rem;
}

.file-icon {
  font-size: 1rem;
}

.node-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.children {
  padding-left: 1rem;
  border-left: 1px solid #f8f9fa;
  margin-left: 1rem;
}
</style>
