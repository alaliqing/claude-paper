---
name: study
description: This skill should be used when user asks to "study this paper", "analyze this PDF", "generate study materials from paper", or wants comprehensive analysis of a research paper.
disable-model-invocation: false
allowed-tools: Bash, Write, Edit, Read
---

# Paper Study Workflow

Invoke this skill with a paper PDF path.

## Important: Adaptive Material Generation

**Your primary goal is to create materials that facilitate deep learning, not just summarize.**

Think like an excellent teacher explaining the paper to a smart colleague. Let Claude decide adaptively:

1. **Dig into the core** - Go beyond surface-level summary
2. **Organize logically** - Build knowledge progressively
3. **Focus on understanding** - Prioritize conceptual clarity
4. **Adapt to paper complexity** - Claude will decide the appropriate number and type of files based on the paper's complexity and needs

## Step 0: Check Dependencies (First Run Only)

Check if dependencies are installed:
```bash
if [ ! -f "${CLAUDE_PLUGIN_ROOT}/.installed" ]; then
  echo "First run - installing dependencies..."
  cd "${CLAUDE_PLUGIN_ROOT}"
  npm install
  touch "${CLAUDE_PLUGIN_ROOT}/.installed"
  echo "Dependencies installed!"
fi
```

## Step 1: Parse PDF

Run the PDF parser script to extract structured information:
```bash
node ${CLAUDE_PLUGIN_ROOT}/skills/study/scripts/parse-pdf.js <pdf-path>
```

The script outputs JSON with:
- title, authors, abstract, content, githubLinks, codeLinks
- Save this to `meta.json` in the paper directory

## Step 2: Generate Learning Materials

Create a paper directory: `~/claude-papers/papers/{paper-slug}/`

Based on parsed data and your analysis, adaptively create the appropriate files. Claude will decide the number and complexity based on the paper.

### Core Study Materials

**README.md** - Quick navigation guide
- What this paper is about (one paragraph)
- How to navigate the materials
- Key takeaways at a glance

**summary.md** - Comprehensive but focused summary
- Background and context: What problem are they solving?
- Problem statement: What's the specific challenge?
- Main contributions: What's novel?
- Key results: Quantitative metrics

**insights.md** - Deep dive into core ideas (most important)
- The key insight in plain English
- Core methodology distilled
- Technical innovations
- Analysis: Why effective? Trade-offs?
- Limitations and assumptions
- Practical implications

**method.md** (create only if methodology is complex)
- Algorithm step-by-step
- Architecture diagrams
- Implementation details
- Pseudocode
- Parameter explanations

**qa.md** - Self-assessment questions
Generate 15 questions (5 basic, 5 intermediate, 5 advanced)

## Step 3: Generate Code Demonstrations

Claude will adaptively create the appropriate code files based on the paper's needs. Possibilities include:

- `code-demo.py` - Clean, well-commented reference implementation
- `code-demo.ipynb` - Interactive notebook for exploration
- Additional specialized files as needed for complex papers

Key principles for code files:
- **Self-contained** - Each file should be runnable independently
- **Clear structure** - No complex directory hierarchies
- **Educational comments** - Explain why, not just what
- **Different purposes**:
  - `.py` files: Clean reference implementations for studying
  - `.ipynb` files: Interactive exploration and visualization

## Step 4: Extract and Include Original Code

If the paper includes original code (GitHub link, arXiv code, etc.):

1. **Detect code availability** - Check meta.json for githubLinks and codeLinks
2. **Clone/download original code** - Download to `code/original-code/`
3. **Create README.md** in `code/original-code/`:
   - Source URL
   - Installation instructions
   - How to run the original code
   - Key files to look at
4. **Preserve structure** - Keep original code organization
5. **Add notes** - Document any setup requirements

## Step 5: Extract Key Images

Extract only the most important figures (3-4 max):
```bash
pdftoppm -f 1 -l 3 -png paper.pdf images/figure
```

Rename descriptively.

## Step 6: Update Index

Update `~/claude-papers/index.json` with paper metadata.

## Step 7: Launch Web UI

Invoke `/claude-paper:webui` skill.
