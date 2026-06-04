---
name: study
description: Use this skill when the user wants to read, study, analyze, or deeply understand a research paper (PDF).
disable-model-invocation: false
allowed-tools: Bash, Write, Edit, Read
---

# Paper Study Workflow

Invoke this skill with a paper PDF path.

**Language Detection**: Detect the user's language from their input and generate ALL materials in that language.
- Example: User says "我们学习一下这篇论文吧" → Generate materials in Chinese
- Example: User says "Let's study this paper" → Generate materials in English

Also map the detected language to a MinerU hint for parsing (used in Step 1b as
`$LANG_HINT`): Chinese → `ch`, English → `en`, Japanese → `japan`, Korean →
`korean`. When unsure, default to `ch` (MinerU auto-detects within a document).

---

# Core Philosophy

Primary Objective:
Facilitate deep conceptual understanding and research-level thinking.

Secondary Objective:
Create a structured, reusable paper knowledge system.

This workflow is not just for summarizing — it builds a learning environment around the paper.

---

# Step 0: Check Dependencies (First Run Only)

```bash
if [ ! -f "${CLAUDE_PLUGIN_ROOT}/.installed" ]; then
  echo "First run - installing dependencies..."
  cd "${CLAUDE_PLUGIN_ROOT}"
  npm install || exit 1   # installs the MinerU CLI (mineru-open-api)

  touch "${CLAUDE_PLUGIN_ROOT}/.installed"
  echo "Dependencies installed!"
fi
```

Recommended:

* Node >= 18

PDF parsing is handled by **MinerU** (`mineru-open-api`), installed automatically
via `npm install`. MinerU performs VLM-based layout analysis and returns
high-fidelity Markdown with correct reading order, formulas (LaTeX), tables, and
extracted image assets — replacing the old plain-text parser.

**MinerU token (required):** the `extract` mode needs a free API token.

```bash
# Token is resolved as: --token flag > MINERU_TOKEN env > ~/.mineru/config.yaml
if [ -z "$MINERU_TOKEN" ] && [ ! -f "$HOME/.mineru/config.yaml" ]; then
  echo "MinerU token not configured."
  echo "  1. Create one at: https://mineru.net/apiManage/token"
  echo "  2. Run: mineru-open-api auth   (or: export MINERU_TOKEN=\"your-token\")"
fi
```

If no token is configured, stop and ask the user to set one before continuing.

**Regional endpoint (troubleshooting):** if parsing fails with a TLS error like
`certificate is valid for *.mineru.org.cn, not mineru.net` (common in mainland
China, where DNS routes mineru.net to a node whose cert only covers
mineru.org.cn), point the CLI at the matching endpoint:

```bash
export MINERU_BASE_URL="https://mineru.org.cn/api/v4"
```

The parser forwards this to `mineru-open-api --base-url`.

---

# Step 1: Download and Parse PDF

Supports multiple input formats:

* **Local path**: `~/Downloads/paper.pdf`
* **Direct PDF URL**: `https://arxiv.org/pdf/1706.03762.pdf`
* **arXiv URL**: `https://arxiv.org/abs/1706.03762`

## Step 1a: Check input type and download if URL

```bash
USER_INPUT="<user-input>"

# Check if input is a URL (starts with http:// or https://)
if [[ "$USER_INPUT" =~ ^https?:// ]]; then
  # Download PDF from URL
  INPUT_PATH=$(node ${CLAUDE_PLUGIN_ROOT}/skills/study/scripts/download-pdf.cjs "$USER_INPUT")
else
  # Use local path directly
  INPUT_PATH="$USER_INPUT"
fi
```

For URLs, the download script will:
* Download PDFs to `/tmp/claude-paper-downloads/`
* Convert arXiv `/abs/` URLs to PDF URLs automatically
* Validate that URLs point to PDF files
* Return the local file path for processing

For local paths, use the path directly without downloading.

## Step 1b: Parse PDF with MinerU

Extract structured information. Pass a MinerU language hint based on the
detected user language (`ch` for Chinese, `en` for English, etc.):

```bash
# Choose output dir under the paper folder so images land alongside it
PARSE_OUT=$(mktemp -d)

node ${CLAUDE_PLUGIN_ROOT}/skills/study/scripts/parse-pdf.cjs "$INPUT_PATH" "$PARSE_OUT" "$LANG_HINT"
```

The script:

* Runs `mineru-open-api extract` (formula + table recognition on by default)
* Reads MinerU's Markdown + JSON output and assembles structured metadata
* Emits a single JSON object on stdout

Output includes:

* title
* authors
* abstract
* content (full Markdown — formulas, tables, reading order preserved; **not truncated**)
* githubLinks
* codeLinks
* images (paths to MinerU-extracted image assets — used in Step 6)
* tags (generated in Step 2.5)

Save to:

```
~/claude-papers/papers/{paper-slug}/meta.json
```

Copy original PDF:

```bash
cp <pdf-path> ~/claude-papers/papers/{paper-slug}/paper.pdf
```

If parsing fails:
The script exits non-zero with a clear message. Exit code 2 means the MinerU
token is missing — guide the user to configure it (see Step 0) and retry.
Other failures usually mean an invalid token, a document over MinerU's limits
(200MB / 600 pages), rate limiting (HTTP 429), or a network error. Surface the
error to the user rather than silently degrading.

---

# Step 2: Assess Paper Before Generating Materials

Before generating any files, evaluate:

1. Difficulty Level

   * Beginner
   * Intermediate
   * Advanced
   * Highly Theoretical

2. Paper Nature

   * Theoretical
   * Architecture-based
   * Empirical-heavy
   * System design
   * Survey

3. Methodological Complexity

   * Simple pipeline
   * Multi-stage training
   * Novel architecture
   * Heavy mathematical derivation

This assessment determines:

* Whether to create method.md
* Whether to create .ipynb
* Explanation depth
* Code demo complexity

---

# Step 2.5: Generate Exactly 2 Semantic Tags (Mandatory)

Before generating files, infer exactly 2 tags from semantic understanding of the paper.

Rules:

* Generate exactly 2 tags, no more and no less
* Tags must be distinct
* Each tag should be short (1-3 words)
* Avoid generic tags: `paper`, `research`, `ai`, `ml`
* Prefer one tag for problem/domain and one for method/core idea

Examples:

* `machine translation`, `self-attention`
* `3d detection`, `bev transformer`
* `protein folding`, `structure prediction`

Persist these 2 tags in both locations:

* `~/claude-papers/papers/{paper-slug}/meta.json` as `tags`
* `~/claude-papers/index.json` entry as `tags`

---

# Step 3: Generate Core Study Materials

Create folder:

```
~/claude-papers/papers/{paper-slug}/
```

---

## Required Files

### README.md

* What the paper is about (one paragraph)
* Difficulty level
* How to navigate materials
* Key takeaways
* Estimated study time
* Folder structure overview

---

### summary.md

* Background context
* Problem statement
* Main contributions
* Key results
* Quantitative metrics

---

### insights.md (Most Important)

* Core idea explained plainly
* Why this works
* What conceptual shift it introduces
* Trade-offs
* Limitations
* Comparison to prior work
* Practical implications

---

### qa.md

15 questions:

* 5 basic
* 5 intermediate
* 5 advanced

Use this format:

```markdown
### Question

<details>
<summary>Answer</summary>

Detailed explanation.

</details>

---
```

---

## Conditional Files

### method.md (Recommended for most papers)

Include:

* Component breakdown
* Algorithm flow
* Architecture diagram (ASCII if needed)
* Step-by-step explanation
* Pseudocode (balanced with explanation)
* Implementation pitfalls
* Hyperparameter sensitivity
* Reproduction risks

---

### mental-model.md (Recommended for most papers)

* What type of problem is this?
* What prior knowledge is assumed?
* How it fits into the broader research map
* How to mentally categorize this work

---

### reflection.md (Optional auto-generated)

* If I were to extend this paper
* What open problems remain
* What assumptions are fragile
* Where it might fail in practice

---

# Step 4: Code Demonstrations (Mandatory)

At least one runnable demo must be created.

**All code demos must be placed in:**
```
~/claude-papers/papers/{paper-slug}/code/
```

Create the code directory first:

```bash
mkdir -p ~/claude-papers/papers/{paper-slug}/code
```

Guidelines:

* Self-contained
* Runnable independently
* Educational comments (explain why)
* Focus on core contribution
* Prefer clarity over completeness

Possible types:

* Simplified conceptual implementation
* Visualization script
* Minimal architecture demo
* Interactive notebook (.ipynb)

Name descriptively:

* model_demo.py
* vectorized_planning_demo.py
* contrastive_loss_visualization.ipynb

Avoid generic names.

---

# Step 5: Generate Interactive HTML Explorer

Create a single self-contained HTML file for interactively exploring the paper's core concepts.

**Output path:**
```
~/claude-papers/papers/{paper-slug}/index.html
```

## Requirements

* Single HTML file, all CSS/JS inline, zero external dependencies
* Uses **real data from the paper** (actual metrics, hyperparameters, comparisons) — never invent numbers
* Must work in a sandboxed iframe (no external fetches, no localStorage)

## Guidelines

Choose the interaction pattern that best fits the paper — architecture diagrams, parameter explorers, result dashboards, formula breakdowns, comparison matrices, etc. Let the paper's content dictate the format rather than forcing a fixed layout, focusing on the core ideas of the paper.

Every interactive control (slider, toggle, dropdown) should visibly change the visualization. Include brief explanatory text alongside interactive elements to teach concepts.

---

# Step 6: Collect Images

MinerU already extracted the paper's figures during Step 1b. Their paths are in
the `images` array of the parsed metadata (under `$PARSE_OUT`). Copy them into
the paper folder:

```bash
mkdir -p ~/claude-papers/papers/{paper-slug}/images

# Copy every image MinerU extracted (paths come from meta.json "images")
cp "$PARSE_OUT"/**/*.{png,jpg,jpeg,webp} ~/claude-papers/papers/{paper-slug}/images/ 2>/dev/null || true
```

Then inspect the figures and rename the key ones descriptively:

* architecture.png
* training_pipeline.png
* results_table.png

If MinerU extracted no images (rare — e.g. a text-only paper), skip this step.

---

# Step 7: Update Index

**CRITICAL**: Read existing index.json first, then append the new paper. Never overwrite the entire file.

If index.json does not exist, create:

```json
{"papers": []}
```

Append new entry to the papers array:

```json
{
  "id": "paper-slug",
  "title": "Paper Title",
  "slug": "paper-slug",
  "authors": ["Author 1", "Author 2"],
  "abstract": "Paper abstract...",
  "year": 2024,
  "date": "2024-01-01",
  "tags": ["tag-1", "tag-2"],
  "githubLinks": ["https://github.com/..."],
  "codeLinks": ["https://..."]
}
```
**IMPORTANT**: The index.json file must be located at:
```
~/claude-papers/index.json
```

---


# Step 8: Relaunch Web UI

Invoke:

```
/claude-paper:webui
```


# Step 9: Interactive Deep Learning Loop

After all files are generated:

## Present to User:

1. Ask:

   * What part is still unclear?
   * Do you want deeper mathematical breakdown?
   * Do you want implementation-level analysis?
   * Do you want comparison with another paper?

2. Allow user to:

   * Ask deeper questions
   * Summarize their understanding
   * Propose new ideas

---

## If user asks deeper questions:

Generate a new file inside the same folder:

Examples:

* deep-dive-contrastive-loss.md
* math-derivation-breakdown.md
* comparison-with-transformers.md
* extension-ideas.md

---

## If user provides their own summary:

1. Refine it.
2. Improve structure.
3. Save as:

* user-summary-v1.md

If iterated:

* user-summary-v2.md

---

## If user wants structured consolidation:

Create:

* consolidated-notes.md
* study-session-1.md
* exam-review.md

---

This makes the paper folder a growing knowledge node.

---
