---
name: study
description: Use this skill when the user wants to study, analyze, or deeply understand a research paper (PDF).
disable-model-invocation: false
allowed-tools: Bash, Write, Edit, Read
---

# Paper Study Workflow

Invoke this skill with a paper PDF path.

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
  npm install || exit 1
  touch "${CLAUDE_PLUGIN_ROOT}/.installed"
  echo "Dependencies installed!"
fi
```

Recommended:

* Node >= 18

---

# Step 1: Parse PDF

Extract structured information:

```bash
node ${CLAUDE_PLUGIN_ROOT}/skills/study/scripts/parse-pdf.js <pdf-path>
```

Output includes:

* title
* authors
* abstract
* full content
* githubLinks
* codeLinks

Save to:

```
~/claude-papers/papers/{paper-slug}/meta.json
```

Copy original PDF:

```bash
cp <pdf-path> ~/claude-papers/papers/{paper-slug}/paper.pdf
```

Fallback:
If structured parsing fails, extract raw text and continue with degraded structure.

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

# Step 3: Generate Core Study Materials

Create folder:

```
~/claude-papers/papers/{paper-slug}/
```

All materials must use the user’s input language only.

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

# Step 5: Extract Original Code (If Available)

If GitHub link exists:

```bash
if command -v git &> /dev/null && [ -n "$GITHUB_URL" ]; then
  cd ~/claude-papers/papers/{paper-slug}/code
  git clone --depth 1 "$GITHUB_URL" original-code || echo "Clone failed"
fi
```

Preserve original structure.

---

# Step 6: Extract Images

```bash
mkdir -p ~/claude-papers/papers/{paper-slug}/images

python3 ${CLAUDE_PLUGIN_ROOT}/skills/study/scripts/extract-images.py \
  paper.pdf \
  ~/claude-papers/papers/{paper-slug}/images
```

Rename key images descriptively:

* architecture.png
* training_pipeline.png
* results_table.png

---

# Step 7: Update Index

If index.json does not exist, create:

```json
{"papers": []}
```

Add entry:

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
