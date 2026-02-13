<template>
  <button @click="openInVSCode" class="vscode-button">
    Open in VS Code
  </button>
</template>

<script setup>
const props = defineProps({
  path: {
    type: String,
    required: true
  }
})

const openInVSCode = () => {
  // Use vscode:// URL scheme to open in VS Code
  const expandedPath = props.path.replace('~', '/Users/' + (process.env.USER || 'user'))
  window.location.href = `vscode://file${expandedPath}`
}
</script>

<style scoped>
.vscode-button {
  padding: 0.5rem 1rem;
  background: #007acc;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.2s;
}

.vscode-button:hover {
  background: #005a9e;
}
</style>
