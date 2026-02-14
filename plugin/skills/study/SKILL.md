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
  npm install || exit 1
  touch "${CLAUDE_PLUGIN_ROOT}/.installed"
  echo "Dependencies installed!"
fi
```

**Note**: On macOS, if you need to limit npm install time, use `gtimeout` (from coreutils) or run without timeout as install is typically fast.

## Step 1: Parse PDF

Run the PDF parser script to extract structured information:
```bash
node ${CLAUDE_PLUGIN_ROOT}/skills/study/scripts/parse-pdf.js <pdf-path>
```

The script outputs JSON with:
- title, authors, abstract, content, githubLinks, codeLinks
- Save this to `meta.json` in the paper directory

**Copy the original PDF** to the paper directory for reference:
```bash
cp <pdf-path> ~/claude-papers/papers/{paper-slug}/paper.pdf
```

## Step 2: Generate Learning Materials

Create a paper directory: `~/claude-papers/papers/{paper-slug}/`

**Important: Use the user's input language** for all generated materials, especially when the user specifies a language (e.g., if they ask in Chinese, generate materials in Chinese).

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

**Note:** You can use LaTeX-style math equations in markdown files when needed for clarity (e.g., $L = \sum_{i} \omega_i L_i$ or use inline `$$` or display math).

**method.md** (create only if methodology is complex)
- Natural language descriptions of each component
- Algorithm step-by-step
- Architecture diagrams
- Implementation details
- Pseudocode (balance code with explanatory text)
- Parameter explanations

Use a mix of explanatory paragraphs and code blocks rather than large continuous pseudocode sections. Explain the "why" before showing the "how".

**qa.md** - Self-assessment questions

Generate 15 questions (5 basic, 5 intermediate, 5 advanced) using the **details/summary style** for Q&A:

```markdown
### Question title

<details>
<summary>Answer</summary>

Detailed answer content here with proper indentation.

</details>
```

Each answer should be properly indented within the `<details>` block. Use horizontal rules (`---`) between questions for better readability.

## Step 3: Generate Code Demonstrations (Required)

**At least one code demonstration must be provided for every paper.**

Claude will adaptively create the appropriate code files based on the paper's needs. Possibilities include:

- `code/{descriptive_name}.py` - Clean, well-commented reference implementation (e.g., `vad_architecture.py`, `vectorized_planning.py`)
- `code/{descriptive_name}.ipynb` - Interactive notebook for exploration
- Additional specialized files in `code/` folder for complex papers

**Guidelines for code file naming:**
- Choose names that reflect the paper's contribution (e.g., `{model_name}_demo.py`, `{key_concept}_implementation.py`)
- Keep it concise but descriptive
- Avoid generic names like `code-demo.py`

Key principles for code files:
- **Self-contained** - Each file should be runnable independently
- **Clear structure** - No complex directory hierarchies
- **Educational comments** - Explain why, not just what
- **Different purposes**:
  - `.py` files: Clean reference implementations for studying
  - `.ipynb` files: Interactive exploration and visualization

Even for theoretical papers without explicit code artifacts, create at least one of:
- A conceptual implementation demonstrating key ideas
- A simplified prototype showing the algorithm
- A visualization script to illustrate the paper's contributions

Git clone original code to `code/original-code/` if GitHub link is available.

## Step 4: Extract and Include Original Code

If the paper includes original code (GitHub link, arXiv code, etc.):

1. **Detect code availability** - Check meta.json for githubLinks and codeLinks
2. **Clone/download original code** - Download to `code/original-code/`

**Try git clone with proper checks**:
```bash
# Check if git is available and url is valid
if command -v git &> /dev/null && [ -n "$GITHUB_URL" ]; then
  cd ~/claude-papers/papers/{paper-slug}/code
  git clone "$GITHUB_URL" original-code || echo "Git clone failed, continuing without original code"
fi
```

3. **Preserve structure** - Keep original code organization
4. **Add notes** - Document any setup requirements if needed

## Step 5: Extract Key Images

Extract only the most important figures (3-4 max):
```bash
pdftoppm -f 1 -l 3 -png paper.pdf images/figure
```

**Check if pdftoppm is available first**:
```bash
if command -v pdftoppm &> /dev/null; then
  pdftoppm -f 1 -l 3 -png paper.pdf images/figure
else
  echo "pdftoppm not installed, skipping figure extraction"
fi
```

Rename descriptively. If pdftoppm is not available, continue without figures.

## Step 6: Update Index

Update `~/claude-papers/index.json` with paper metadata.

Add an entry with the following structure:
```json
{
  "id": "paper-slug",
  "title": "Paper Title",
  "slug": "paper-slug",
  "authors": ["Author 1", "Author 2"],
  "abstract": "Paper abstract...",
  "year": 2024,
  "date": "2024-01-01",
  "githubLinks": ["https://github.com/..."],
  "codeLinks": ["https://..."]
}
```

The index.json should have structure: `{"papers": [...]}`

## Step 7: Launch Web UI

Invoke `/claude-paper:webui` skill.
