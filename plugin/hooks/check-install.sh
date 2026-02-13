#!/bin/bash
set -e

PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT}"
PAPERS_DIR="${HOME}/claude-papers"
INSTALLED_MARKER="$PLUGIN_ROOT/.installed"

# Only run install if marker doesn't exist
if [ ! -f "$INSTALLED_MARKER" ]; then
  echo "Installing Claude Paper..."

  # Install root dependencies
  cd "$PLUGIN_ROOT"
  npm install

  # Install web dependencies
  echo "Installing web dependencies..."
  cd "$PLUGIN_ROOT/src/web"
  npm install

  # Create papers directory
  echo "Creating papers directory..."
  mkdir -p "$PAPERS_DIR/papers"

  # Initialize index if not exists
  if [ ! -f "$PAPERS_DIR/index.json" ]; then
    echo '[]' > "$PAPERS_DIR/index.json"
  fi

  # Create installed marker
  touch "$INSTALLED_MARKER"

  echo "Installation complete!"
  echo "Papers directory: $PAPERS_DIR"
  echo "Web UI: http://localhost:5815"
fi

exit 0
