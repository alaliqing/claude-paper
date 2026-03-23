---
name: summary
description: Use this for a quick summary of a research paper's core ideas and key points. Use when you want to quickly understand a paper without deep study materials. Triggers on PDF paths, arXiv URLs, or paper URLs.
disable-model-invocation: false
allowed-tools: Bash, Write, Read
---

# Quick Paper Summary Workflow

This skill generates a **concise summary** of a research paper's core ideas and key points.

**When to use:**
- You want to quickly understand what a paper is about
- You need the main contributions without deep technical details
- You're screening papers to decide which to study in depth

**When NOT to use:**
- You want comprehensive study materials (use `/claude-paper:study` instead)
- You need code demonstrations
- You want interactive visualizations

---

**Language Detection**: Detect the user's language from their input and generate ALL materials in that language.
- Example: User says "我们学习一下这篇论文" → Generate materials in Chinese
- Example: User says "Let's study this paper" → Generate materials in English

---

# Step 0: Check Dependencies (First Run Only)

```bash
if [ ! -f "${CLAUDE_PLUGIN_ROOT}/.installed" ]; then
  echo "First run - installing dependencies..."
  cd "${CLAUDE_PLUGIN_ROOT}"
  npm install || exit 1

  # Install Python dependencies for image extraction
  python3 -m pip install pymupdf --user 2>/dev/null || pip3 install pymupdf --user 2>/dev/null || echo "Warning: Failed to install pymupdf"

  touch "${CLAUDE_PLUGIN_ROOT}/.installed"
  echo "Dependencies installed!"
fi
```

---

# Step 1: Download and Parse PDF

Supports multiple input formats:
- **Local path**: `~/Downloads/paper.pdf`
- **Direct PDF URL**: `https://arxiv.org/pdf/1706.03762.pdf`
- **arXiv URL**: `https://arxiv.org/abs/1706.03762`

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
- Download PDFs to `/tmp/claude-paper-downloads/`
- Convert arXiv `/abs/` URLs to PDF URLs automatically
- Validate that URLs point to PDF files
- Return the local file path for processing

## Step 1b: Parse PDF

Extract structured information:

```bash
node ${CLAUDE_PLUGIN_ROOT}/skills/study/scripts/parse-pdf.js "$INPUT_PATH"
```

Output includes:
- title
- authors
- abstract
- full content
- githubLinks
- codeLinks

Save to:
```
~/claude-papers/papers/{paper-slug}/meta.json
```

Copy original PDF:

```bash
cp <pdf-path> ~/claude-papers/papers/{paper-slug}/paper.pdf
```

---

# Step 2: Generate Quick Summary

Create the paper folder:

```bash
mkdir -p ~/claude-papers/papers/{paper-slug}
```

Generate **quick-summary.md** with the following structure:

```markdown
# Quick Summary: [Paper Title]

## One Sentence
[One sentence that captures what the paper is about]

## Problem
[What problem does this paper solve? Why is it important?]

## Core Idea
[The key innovation explained in 2-3 sentences. What makes this paper novel?]

## Key Contributions
- [Contribution 1]
- [Contribution 2]
- [Contribution 3]
- [Contribution 4 if applicable]

## Main Results
| Metric | Value | Dataset/Benchmark |
|--------|-------|-------------------|
| [metric1] | [value] | [dataset] |
| [metric2] | [value] | [dataset] |

## Why It Matters
[Practical implications. How does this advance the field? What can we now do that we couldn't before?]

## Limitations
- [Limitation 1]
- [Limitation 2]
```

**Guidelines for each section:**

| Section | Length | Focus |
|---------|--------|-------|
| One Sentence | 1 sentence | High-level summary |
| Problem | 2-3 sentences | Context and motivation |
| Core Idea | 2-3 sentences | The main innovation |
| Key Contributions | 3-5 bullets | What's new/novel |
| Main Results | 1 table | Quantitative metrics from the paper |
| Why It Matters | 2-3 sentences | Practical value |
| Limitations | 2-3 bullets | What the paper doesn't solve |

**Total length:** ~300-500 words (excluding results table)

---

# Step 3: Update Index

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
  "tags": ["quick-summary"],
  "githubLinks": ["https://github.com/..."],
  "codeLinks": ["https://..."]
}
```

**IMPORTANT**: The index.json file must be located at:
```
~/claude-papers/index.json
```

---

# Step 4: Relaunch Web UI

Invoke:

```
/claude-paper:webui
```

---

# Step 5: Present Summary to User

After generating the summary:

1. **Show the user the quick-summary.md content** - Display the full summary

2. **Offer next steps:**
   - "Would you like to study this paper in more depth? Use `/claude-paper:study` for comprehensive materials."
   - "Do you have questions about specific parts of the paper?"
   - "Would you like me to explain any section in more detail?"

3. **File location reminder:**
   - Summary saved to: `~/claude-papers/papers/{paper-slug}/quick-summary.md`
   - Web UI available at: `http://localhost:5815`

---

# Example Output

```markdown
# Quick Summary: Attention Is All You Need

## One Sentence
This paper introduces the Transformer, a neural network architecture based entirely on attention mechanisms, achieving state-of-the-art results in machine translation.

## Problem
Sequence transduction models at the time (RNNs, LSTMs, GRUs) process data sequentially, limiting parallelization and struggling with long-range dependencies.

## Core Idea
Replace recurrent layers with self-attention mechanisms, enabling full parallelization during training and direct modeling of dependencies regardless of distance. The Transformer uses multi-head attention to jointly attend to information from different representation subspaces.

## Key Contributions
- First transduction model relying entirely on self-attention, no recurrence
- Multi-head attention mechanism for joint attention across subspaces
- Positional encodings to inject sequence order information
- Achieved 28.4 BLEU on WMT 2014 English-to-German (2+ BLEU improvement)
- Training was significantly faster than previous state-of-the-art

## Main Results
| Metric | Value | Dataset/Benchmark |
|--------|-------|-------------------|
| BLEU (EN-DE) | 28.4 | WMT 2014 |
| BLEU (EN-FR) | 41.8 | WMT 2014 |
| Training cost | 3.3 × 10^18 FLOPs | WMT 2014 EN-DE |
| Training time | 12 hours on 8 P100 | WMT 2014 EN-DE |

## Why It Matters
The Transformer eliminated recurrence, enabling massive parallelization and scaling. This architecture became the foundation for BERT, GPT, and virtually all modern large language models, fundamentally changing NLP and beyond.

## Limitations
- Self-attention has O(n²) complexity, limiting sequence length
- No explicit modeling of position beyond learned encodings
- Requires large amounts of training data
```

---

# Notes

- This skill is intentionally **minimal** - it generates only the summary, no code demos, no interactive HTML, no deep-dive materials
- For users who want more, they can use `/claude-paper:study` to generate comprehensive materials
- The summary should be **self-contained** and readable in under 5 minutes
- Focus on **conceptual clarity** over technical details
