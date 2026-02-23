<div align="center">

# Claude Paper

**Transform research papers into comprehensive learning environments**

[English](README.md) | [中文](README.zh-CN.md)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)
[![Claude Code Plugin](https://img.shields.io/badge/Claude_Code-Plugin-purple)](https://code.claude.com)

A powerful **Claude Code plugin** that automates research paper study through intelligent material generation, code demonstrations, and an interactive web viewer.

</div>

---

## Features

- **Automatic PDF parsing** - Extract title, authors, abstract, and full content
- **Smart content truncation** - Handles large papers (50k char limit) intelligently
- **Code repository detection** - Automatically finds GitHub, arXiv, CodeOcean links
- **Adaptive learning materials** - Generates README, summary, insights, Q&A based on paper complexity
- **Code demonstrations** - Clean implementations with Jupyter notebooks and original code integration
- **Interactive web viewer** - Nuxt.js interface with math equation support (KaTeX)
- **Intelligent assessment** - Difficulty levels and paper type detection for adaptive content generation

---

## Quick Start

### Installation

Install from the Claude Code marketplace:

```bash
# Add the marketplace
/plugin marketplace add alaliqing/claude-paper

# Install the plugin
/plugin install claude-paper

# Restart Claude Code for the plugin to take effect
```

**That's it!** The plugin will automatically:
- Install all dependencies (pdf-parse for PDF processing)
- Create the papers directory at `~/claude-papers/`
- Initialize the search index
- Install web viewer dependencies

### System Requirements

- **Node.js**: 18.0.0 or higher
- **npm**: Comes with Node.js
- **Claude Code**: Latest version with plugin support
- **poppler-utils**: For PDF image extraction (install via system package manager)
  - **macOS**: `brew install poppler`
  - **Ubuntu/Debian**: `sudo apt-get install poppler-utils`
  - **Arch Linux**: `sudo pacman -S poppler`

---

## Usage

### Study a Research Paper

Simply talk to Claude Code to study a paper:

```
Help me study the paper at ~/Downloads/attention-is-all-you-need.pdf
```

You can also use URLs:

```
# Direct PDF URL
Help me study the paper at https://arxiv.org/pdf/1706.03762.pdf

# arXiv abstract URL (automatically converted to PDF)
Help me study the paper at https://arxiv.org/abs/1706.03762
```

Claude will automatically trigger the study workflow and:
1. Parse the PDF and extract metadata
2. Analyze paper complexity and type
3. Generate adaptive learning materials
4. Create code demonstrations (if applicable)
5. Extract and include original code (if available)
6. Extract key figures and images
7. Update the global search index
8. Launch the web viewer automatically

### Launch Web Viewer

```bash
/claude-paper:webui
```

Opens the interactive web interface at **http://localhost:5815** where you can:
- Browse all studied papers
- View generated materials with math rendering
- Access code demonstrations and notebooks
- Search through your paper library

---

## Paper Storage Structure

Papers are organized in `~/claude-papers/papers/{paper-slug}/`:

```
~/claude-papers/
├── papers/
│   └── {paper-slug}/
│       ├── paper.pdf                     # Original PDF file
│       ├── meta.json                     # Paper metadata (title, authors, etc.)
│       ├── README.md                     # Quick navigation and overview
│       ├── summary.md                    # Detailed summary
│       ├── insights.md                   # Key insights (most important!)
│       ├── method.md                     # Methodology (if complex)
│       ├── mental-model.md              # Paper categorization (if needed)
│       ├── reflection.md                # Future directions (if needed)
│       ├── qa.md                         # Learning questions
│       ├── images/                       # Extracted figures and tables
│       │   ├── fig1.png
│       │   └── fig2.png
│       └── code/                         # Code demonstrations
│           ├── code-demo.py              # Clean reference implementation
│           ├── code-demo.ipynb           # Interactive Jupyter notebook
│           └── original-code/            # Original paper code (if available)
│               ├── README.md
│               └── [repository files]
│
└── index.json                           # Global search index
```

---

## Architecture

### Plugin Structure

```
claude-paper/
├── .claude-plugin/
│   └── marketplace.json              # Marketplace catalog entry
├── plugin/
│   ├── .claude-plugin/
│   │   └── plugin.json              # Plugin manifest
│   ├── skills/
│   │   └── study/
│   │       ├── SKILL.md             # Study workflow definition
│   │       └── scripts/
│   │           ├── parse-pdf.js    # PDF parsing utility
│   │           └── extract-images.py  # Image extraction
│   ├── commands/
│   │   └── webui.md                # /webui command
│   ├── hooks/
│   │   ├── hooks.json              # Session lifecycle hooks
│   │   └── check-install.sh        # Installation verification
│   ├── src/
│   │   └── web/                    # Nuxt.js web viewer
│   │       ├── components/         # Vue components
│   │       ├── composables/        # Vue composables
│   │       ├── server/             # API endpoints
│   │       └── package.json
│   └── package.json
└── README.md
```

### Key Components

1. **Study Skill** - Main workflow agent that orchestrates paper processing
2. **PDF Parser** - Extracts text, metadata, and code links using pdf-parse
3. **Image Extractor** - Python script for PDF figure extraction
4. **Web Viewer** - Nuxt.js application with Nitro API server
5. **Hooks System** - Automatic dependency installation and setup

---

## Development

### Running Tests

```bash
# Test PDF parsing
node plugin/skills/study/scripts/parse-pdf.js /path/to/paper.pdf

# Test web viewer
cd plugin/src/web
npm run dev

# Test full workflow
cd /path/to/claude-paper
claude --plugin-dir ./plugin
/claude-paper:study /path/to/paper.pdf
```

### Building for Production

```bash
# Build web viewer
cd plugin/src/web
npm run build

# The built viewer will be in .output/
```

---

## Configuration

### Environment Variables

No configuration required! The plugin uses sensible defaults:

- **Papers directory**: `~/claude-papers/`
- **Web viewer port**: `5815`
- **Content limit**: `50,000` characters (with intelligent truncation)

### Advanced Customization

You can modify behavior by editing the skill file at:
`plugin/skills/study/SKILL.md`

---

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests if applicable
5. Commit your changes (`git commit -m 'add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

---

## License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- Built with [Claude Code](https://code.claude.com)
- PDF parsing powered by [pdf-parse](https://github.com/ffalt/json2csv-converter)
- Web viewer built with [Nuxt.js](https://nuxt.com)
- Math rendering by [KaTeX](https://katex.org)
