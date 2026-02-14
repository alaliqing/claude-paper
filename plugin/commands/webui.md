---
allowed-tools: Bash
description: Start the Claude Paper web UI
---

## Your task

Start the Claude Paper web viewer using the production Nuxt.js server.

### Step 1: Check and Install Dependencies (First Run Only)

```bash
if [ ! -f "${CLAUDE_PLUGIN_ROOT}/src/web/node_modules/.package-lock.json" ]; then
  echo "First run - installing web dependencies..."
  cd "${CLAUDE_PLUGIN_ROOT}/src/web"
  npm install
  echo "Web dependencies installed!"
fi
```

### Step 2: Build Production Server

```bash
cd ${CLAUDE_PLUGIN_ROOT}/src/web

if [ ! -f ".output/server/index.mjs" ] || [ ! -f ".output/server/package.json" ]; then
  echo "Building production server..."
  npm run build
  echo "Build complete!"
else
  echo "Production build already exists"
fi
```

### Step 3: Check Port Availability

```bash
if lsof -i :5815 > /dev/null 2>&1; then
  echo "INFO: Port 5815 is already in use"
  PID_FILE="/tmp/claude-paper-webui.pid"
  if [ -f "$PID_FILE" ] && kill -0 $(cat "$PID_FILE") 2>/dev/null; then
    echo "Claude Paper web UI appears to be running"
    echo "Access it at: http://localhost:5815"
    exit 0
  else
    echo "ERROR: Port 5815 is occupied by another process"
    exit 1
  fi
fi
```

### Step 4: Start Production Server

```bash
PORT=5815 node .output/server/index.mjs &
SERVER_PID=$!

# Save PID for later cleanup
echo $SERVER_PID > /tmp/claude-paper-webui.pid
echo "Server PID: $SERVER_PID"
```

### Step 5: Verify Server Health

```bash
timeout=10
while [ $timeout -gt 0 ]; do
  if curl -s http://localhost:5815/api/papers > /dev/null 2>&1; then
    echo "Server is ready!"
    break
  fi
  sleep 1
  timeout=$((timeout - 1))
done

if [ $timeout -eq 0 ]; then
  echo "ERROR: Server failed to start properly"
  kill $SERVER_PID 2>/dev/null
  rm -f /tmp/claude-paper-webui.pid
  exit 1
fi
```

### Step 6: Inform User

```
Claude Paper web UI is now running!

Access it at: http://localhost:5815

To stop the server, run:
  kill $(cat /tmp/claude-paper-webui.pid)
```
