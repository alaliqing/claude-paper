#!/usr/bin/env node

/**
 * Parse a PDF into structured metadata using MinerU (mineru-open-api).
 *
 * Replaces the legacy pdf-parse approach (plain text + regex). MinerU performs
 * VLM-based layout analysis, returning high-fidelity Markdown with correct
 * reading order, formulas (LaTeX), tables, and extracted image assets.
 *
 * Usage:
 *   node parse-pdf.cjs <pdf-path> [output-dir] [language]
 *
 *   - pdf-path   : local PDF file (URLs are downloaded first by download-pdf.cjs)
 *   - output-dir : where MinerU writes its artifacts (default: a temp dir)
 *   - language   : MinerU language hint, e.g. 'ch' or 'en' (default: 'ch')
 *
 * Output: a single JSON object on stdout (consumed by the study skill).
 * Progress / diagnostics go to stderr so stdout stays clean JSON.
 *
 * Requires a MinerU API token (extract mode). Resolution order matches the CLI:
 *   --token flag > MINERU_TOKEN env > ~/.mineru/config.yaml
 * If no token is found, exits with code 2 and a clear setup message.
 */

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const MAX_PAGES_HINT = 600; // MinerU extract per-document limit (informational)

function fail(msg, code = 1) {
  console.error(msg);
  process.exit(code);
}

// ---- args -----------------------------------------------------------------

const pdfPath = process.argv[2];
const outDirArg = process.argv[3];
const language = process.argv[4] || 'ch';

if (!pdfPath) {
  fail('Usage: node parse-pdf.cjs <pdf-path> [output-dir] [language]');
}
if (!fs.existsSync(pdfPath)) {
  fail(`File not found: ${pdfPath}`);
}

// ---- token check ----------------------------------------------------------

function hasToken() {
  if (process.env.MINERU_TOKEN && process.env.MINERU_TOKEN.trim()) return true;
  const cfg = path.join(os.homedir(), '.mineru', 'config.yaml');
  try {
    if (fs.existsSync(cfg)) {
      const txt = fs.readFileSync(cfg, 'utf8');
      if (/token\s*:\s*\S+/i.test(txt)) return true;
    }
  } catch {
    /* ignore */
  }
  return false;
}

if (!hasToken()) {
  fail(
    [
      'MinerU API token not found.',
      '',
      'MinerU extract mode requires a free token:',
      '  1. Create one at: https://mineru.net/apiManage/token',
      '  2. Configure it with either:',
      '       export MINERU_TOKEN="your-token"',
      '     or run the interactive setup:',
      '       mineru-open-api auth',
      '',
      'Then re-run the study skill.',
    ].join('\n'),
    2
  );
}

// ---- locate the mineru-open-api launcher ----------------------------------

function resolveLauncher() {
  const candidates = [];
  if (process.env.CLAUDE_PLUGIN_ROOT) {
    candidates.push(
      path.join(process.env.CLAUDE_PLUGIN_ROOT, 'node_modules', 'mineru-open-api', 'bin', 'mineru-open-api')
    );
  }
  // scripts/ -> study/ -> skills/ -> plugin/
  candidates.push(
    path.join(__dirname, '..', '..', '..', 'node_modules', 'mineru-open-api', 'bin', 'mineru-open-api')
  );
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  fail(
    'mineru-open-api not found. Run `npm install` in the plugin directory first.\n' +
      `Looked in:\n  ${candidates.join('\n  ')}`
  );
}

const launcher = resolveLauncher();

// ---- run MinerU extract ----------------------------------------------------

const mineruOut =
  outDirArg || fs.mkdtempSync(path.join(os.tmpdir(), 'mineru-'));
fs.mkdirSync(mineruOut, { recursive: true });

console.error(`Parsing with MinerU (language=${language})...`);
console.error(`  input : ${pdfPath}`);
console.error(`  output: ${mineruOut}`);

// Allow pointing at a regional/private MinerU endpoint. Notably, in some
// regions DNS resolves mineru.net to a node whose TLS cert only covers
// *.mineru.org.cn, so the default mineru.net host fails verification — set
// MINERU_BASE_URL=https://mineru.org.cn/api/v4 to work around it.
const extractArgs = [
  launcher,
  'extract',
  pdfPath,
  '-o',
  mineruOut,
  '-f',
  'md,json',
  '-l',
  language,
];
if (process.env.MINERU_BASE_URL && process.env.MINERU_BASE_URL.trim()) {
  extractArgs.push('--base-url', process.env.MINERU_BASE_URL.trim());
}

try {
  execFileSync(
    'node',
    extractArgs,
    // child stdout -> our stderr (fd 2) so progress shows without polluting JSON
    { stdio: ['ignore', 2, 2], env: process.env }
  );
} catch (err) {
  fail(
    [
      'MinerU extraction failed.',
      err.message || String(err),
      '',
      'Common causes:',
      '  - Invalid or expired token (re-run: mineru-open-api auth)',
      `  - Document exceeds limits (max 200MB / ${MAX_PAGES_HINT} pages)`,
      '  - Rate limited (HTTP 429) or network error — retry later',
    ].join('\n')
  );
}

// ---- collect MinerU artifacts ---------------------------------------------

function walk(dir, acc = []) {
  let entries = [];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return acc;
  }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, acc);
    else acc.push(full);
  }
  return acc;
}

const allFiles = walk(mineruOut);

const IMAGE_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp']);
const mdFiles = allFiles.filter((f) => f.toLowerCase().endsWith('.md'));
const jsonFiles = allFiles.filter((f) => f.toLowerCase().endsWith('.json'));
const imageFiles = allFiles.filter((f) =>
  IMAGE_EXT.has(path.extname(f).toLowerCase())
);

function largest(files) {
  let best = null;
  let bestSize = -1;
  for (const f of files) {
    try {
      const s = fs.statSync(f).size;
      if (s > bestSize) {
        bestSize = s;
        best = f;
      }
    } catch {
      /* ignore */
    }
  }
  return best;
}

const mdPath = largest(mdFiles);
if (!mdPath) {
  fail(`MinerU produced no Markdown output in ${mineruOut}`);
}
const content = fs.readFileSync(mdPath, 'utf8');

// Prefer a content_list*.json (MinerU's reading-order block list) if present,
// otherwise the largest JSON file.
const contentListJson =
  jsonFiles.find((f) => /content[_-]?list/i.test(path.basename(f))) ||
  largest(jsonFiles);

let structured = null;
if (contentListJson) {
  try {
    structured = JSON.parse(fs.readFileSync(contentListJson, 'utf8'));
  } catch {
    structured = null;
  }
}

// ---- derive title / authors / abstract ------------------------------------

// MinerU content_list is typically an array of blocks. Headings carry a
// `text_level` (1 = top). We use that when available, then fall back to the
// Markdown structure, which is far more reliable than first-line heuristics.
function blocksFromStructured(s) {
  if (Array.isArray(s)) return s;
  if (s && Array.isArray(s.content_list)) return s.content_list;
  if (s && Array.isArray(s.pdf_info)) return s.pdf_info;
  return [];
}

function textOf(block) {
  if (typeof block === 'string') return block;
  if (!block || typeof block !== 'object') return '';
  return block.text || block.content || block.md || '';
}

function titleFromStructured(blocks) {
  for (const b of blocks) {
    if (b && typeof b === 'object' && (b.text_level === 1 || b.level === 1)) {
      const t = textOf(b).trim();
      if (t) return t;
    }
  }
  return '';
}

function titleFromMarkdown(md) {
  const lines = md.split('\n');
  for (const line of lines) {
    const m = line.match(/^#\s+(.+?)\s*$/);
    if (m) return m[1].trim();
  }
  // fallback: first non-empty, non-image line
  for (const line of lines) {
    const t = line.trim();
    if (t && !t.startsWith('![') && !t.startsWith('<')) return t.replace(/^#+\s*/, '');
  }
  return 'Untitled';
}

const blocks = blocksFromStructured(structured);
const title = titleFromStructured(blocks) || titleFromMarkdown(content);

// Abstract: text between an "Abstract"/"摘要" heading and the next heading.
function extractAbstract(md) {
  const re = /(?:^|\n)#{0,6}\s*(?:Abstract|ABSTRACT|摘\s*要)\s*\n+([\s\S]*?)(?=\n#{1,6}\s|\n\s*(?:1\.?\s+)?(?:Introduction|引\s*言|绪\s*论)\b)/;
  const m = md.match(re);
  return m ? m[1].replace(/\n{2,}/g, '\n').trim() : '';
}
const abstract = extractAbstract(content);

// Authors: best-effort. Look at the lines between the title and the abstract.
// This is inherently noisy; the full Markdown content is passed to the model,
// which is the source of truth for deeper analysis.
function extractAuthors(md, titleText) {
  const idx = titleText ? md.indexOf(titleText) : -1;
  const after = idx >= 0 ? md.slice(idx + titleText.length) : md;
  const head = after.split(/\n#{1,6}\s|Abstract|摘\s*要/i)[0] || '';
  const candidate = head
    .split('\n')
    .map((l) => l.trim())
    .find((l) =>
      /^[A-Z][A-Za-z.''-]+(?:\s+[A-Z][A-Za-z.''-]+)+(?:\s*,\s*[A-Z][A-Za-z.''-]+(?:\s+[A-Z][A-Za-z.''-]+)+)*$/.test(
        l
      )
    );
  if (!candidate) return [];
  return candidate
    .split(/\s*,\s*/)
    .map((a) => a.trim())
    .filter(Boolean);
}
const authors = extractAuthors(content, title);

// ---- code / github links (regex over Markdown) ----------------------------

const githubMatch = content.match(/https?:\/\/github\.com\/[^\s)\]]+/g);
const githubLinks = [...new Set(githubMatch || [])];

const codeUrlPatterns = [
  /https?:\/\/(?:www\.)?arxiv\.org\/(?:code|src)\/[^\s)\]]+/gi,
  /https?:\/\/(?:www\.)?codeocean\.com\/[^\s)\]]+/gi,
  /https?:\/\/(?:www\.)?openreview\.net\/code[^\s)\]]+/gi,
  /https?:\/\/(?:www\.)?paperswithcode\.com\/[^\s)\]]+/gi,
  /\[code[^\]]*\]\(https?:\/\/[^)]+\)/gi,
];
const codeLinks = [];
for (const pattern of codeUrlPatterns) {
  const matches = content.match(pattern);
  if (matches) {
    codeLinks.push(...matches.filter((l) => !githubLinks.includes(l)));
  }
}

// ---- page count (best-effort from structured JSON) ------------------------

function pageCountFrom(blocks) {
  let max = 0;
  for (const b of blocks) {
    if (b && typeof b === 'object') {
      const p = b.page_idx ?? b.page ?? b['page number'];
      if (typeof p === 'number' && p + 1 > max) max = p + 1;
    }
  }
  return max || undefined;
}
const pageCount = pageCountFrom(blocks);

// ---- emit ------------------------------------------------------------------

const metadata = {
  title,
  authors,
  abstract,
  content, // full Markdown — no truncation; MinerU output is already structured
  githubLinks,
  codeLinks: [...new Set(codeLinks)],
  images: imageFiles,
  markdownPath: mdPath,
  ...(pageCount ? { pageCount } : {}),
};

console.log(JSON.stringify(metadata, null, 2));
