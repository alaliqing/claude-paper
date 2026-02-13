# Claude Paper Suite

A Claude Code plugin for studying research papers with automated material generation and code demonstrations.

## Features

- **PDF Parsing**: Extract key information from research papers (title, authors, abstract, content, code links)
- **Material Generation**: Generate focused MD files with the most important learning content (adaptive based on paper complexity)
- **Code Demonstrations**: Generate clean, well-commented code demos and interactive Jupyter notebooks
- **Original Code Integration**: Automatically detect and include original paper code when available
- **Web Viewer**: Simple VitePress-based application to browse and view papers

## Installation

Install the plugin using Claude Code:

```bash
claude plugin install claude-paper-suite
```

Or for development, use the plugin directory:

```bash
claude --plugin-dir /path/to/claude-paper-suite/plugin
```

The plugin will automatically:
- Install dependencies (pdf-parse for PDF parsing)
- Set up the papers directory at `~/claude-papers/`
- Initialize the search index
- Install web viewer dependencies

## Usage

### Study a Paper

```bash
/claude-paper-suite:study /path/to/paper.pdf
```

This will:
1. Parse the PDF and extract metadata
2. Generate adaptive learning materials based on paper complexity
3. Create code demonstrations (if applicable)
4. Extract and include original code (if available)
5. Extract key figures
6. Update the global index
7. Launch the web viewer

### Launch Web Viewer

```bash
/claude-paper-suite:webui
```

Opens the web interface at http://localhost:5815 to browse all papers.

## Paper Storage Structure

Papers are stored in `~/claude-papers/papers/{paper-slug}/`:

```
~/claude-papers/
├── papers/
│   └── {paper-slug}/
│       ├── paper.pdf                     # Original PDF
│       ├── meta.json                     # Metadata
│       ├── README.md                     # Quick navigation
│       ├── summary.md                    # Detailed summary
│       ├── insights.md                   # Key insights (most important)
│       ├── method.md                     # Core methodology (if complex)
│       ├── qa.md                         # Learning questions
│       ├── images/                       # Key figures
│       └── code/                         # Code demonstrations
│           ├── code-demo.py              # Clean reference implementation
│           ├── code-demo.ipynb           # Interactive notebook
│           └── original-code/            # Original paper code
│               ├── README.md
│               └── [extracted files]
│
└── index.json                           # Global search index
```

## Adaptive Material Generation

The plugin intelligently decides the number and type of materials based on paper complexity:

- **Core materials** (always included): README, summary, insights, Q&A
- **Optional materials** (generated when needed): method.md for complex methodologies
- **Code files** (adaptive): Adjustable number of demos based on paper needs
- **Original code** (when available): Automatically included with documentation

## Development

### Project Structure

```
claude-paper-suite/
├── .claude-plugin/
│   └── marketplace.json        # Marketplace catalog
├── plugin/                      # Plugin directory
│   ├── .claude-plugin/
│   │   └── plugin.json         # Plugin manifest
│   ├── skills/                 # Agent skills
│   │   └── study/
│   │       ├── SKILL.md        # Study workflow
│   │       └── scripts/
│   │           └── parse-pdf.js
│   ├── commands/               # Slash commands
│   │   └── webui.md
│   ├── hooks/                  # Hook configurations
│   │   ├── hooks.json
│   │   └── check-install.sh
│   ├── src/
│   │   └── web/               # VitePress app
│   └── package.json
└── README.md
```

### Testing

1. Test PDF parsing:
```bash
node plugin/skills/study/scripts/parse-pdf.js /path/to/paper.pdf
```

2. Test web viewer:
```bash
cd plugin/src/web
npm run dev
```

3. Test full workflow:
```bash
claude --plugin-dir /path/to/claude-paper-suite/plugin
/claude-paper-suite:study /path/to/paper.pdf
```

## Requirements

- Node.js 18+
- npm
- Claude Code CLI
- `pdftoppm` (for image extraction, usually included with poppler-utils)

## License

MIT
