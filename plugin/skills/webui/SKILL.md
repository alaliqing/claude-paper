---
name: webui
description: Start the Claude Paper web viewer to browse and study papers
disable-model-invocation: false
allowed-tools: Bash
---

# Start Web UI

This skill starts the Nuxt.js development server for the paper viewer.

## Step 1: Check and Install Dependencies (First Run Only)

Check if web dependencies are installed:
```bash
if [ ! -f "${CLAUDE_PLUGIN_ROOT}/src/web/node_modules/.package-lock.json" ]; then
  echo "First run - installing web dependencies..."
  cd "${CLAUDE_PLUGIN_ROOT}/src/web"
  npm install
  echo "Web dependencies installed!"
fi
```

## Step 2: Check if server is already running

```bash
lsof -i :5815 || echo "Port 5815 is available"
```

## Step 3: Start Nuxt.js dev server

If port is available:
```bash
cd ${CLAUDE_PLUGIN_ROOT}/src/web
npm run dev
```

The server will start at http://localhost:5815

## Step 4: Inform user

Tell the user the web viewer is available at http://localhost:5815
