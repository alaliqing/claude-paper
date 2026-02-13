---
description: Start the Claude Paper Suite web viewer to browse and study papers
disable-model-invocation: true
---

# Start Web UI

Check if server is running on port 5815. If not, start VitePress dev server.

## Check Port
```bash
lsof -i :5815 || echo "Port 5815 is available"
```

## Start Server
If port is available:
```bash
cd ${CLAUDE_PLUGIN_ROOT}/src/web
npm run dev
```

The server starts at http://localhost:5815.

## Open Browser
Open http://localhost:5815 in browser.
