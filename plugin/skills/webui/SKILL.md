---
name: webui
description: Start the Claude Paper Suite web viewer to browse and study papers
disable-model-invocation: false
allowed-tools: Bash
---

# Start Web UI

This skill starts the VitePress development server for the paper viewer.

## Step 1: Check if server is already running

```bash
lsof -i :5815 || echo "Port 5815 is available"
```

## Step 2: Start VitePress dev server

If port is available:
```bash
cd ${CLAUDE_PLUGIN_ROOT}/src/web
npm run dev
```

The server will start at http://localhost:5815

## Step 3: Inform user

Tell the user the web viewer is available at http://localhost:5815
