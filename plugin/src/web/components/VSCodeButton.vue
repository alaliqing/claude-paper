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

const homedir = ref(null)

// Fetch homedir on mount
onMounted(async () => {
  try {
    const data = await $fetch('/api/system/homedir')
    homedir.value = data.homedir
  } catch (e) {
    console.error('Failed to get homedir:', e)
    // Fallback
    homedir.value = '/Users/' + (navigator.userAgent.includes('Mac') ? Intl.DateTimeFormat().resolvedOptions().timeZone.split('/')[1] || 'user' : 'user')
  }
})

const openInVSCode = () => {
  if (!homedir.value) {
    alert('Unable to determine home directory')
    return
  }

  // Replace ~ with actual home directory
  const expandedPath = props.path.replace('~', homedir.value)
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
