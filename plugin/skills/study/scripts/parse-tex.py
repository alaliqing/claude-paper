#!/usr/bin/env python3

import sys
import os
import re
import json

def read_file(filepath):
    """Read file with UTF-8 encoding"""
    encodings = ['utf-8', 'latin-1', 'iso-8859-1']
    for encoding in encodings:
        try:
            with open(filepath, 'r', encoding=encoding) as f:
                return f.read()
        except UnicodeDecodeError:
            continue
    raise Exception(f"Could not decode file: {filepath}")

def resolve_includes(tex_content, base_dir, visited=None):
    """Recursively resolve \input and \include directives"""
    if visited is None:
        visited = set()

    # Find \input{file} and \include{file}
    pattern = r'\\(?:input|include)\{([^}]+)\}'

    def replace_include(match):
        filename = match.group(1)

        # Add .tex extension if not present
        if not filename.endswith('.tex'):
            filename += '.tex'

        filepath = os.path.join(base_dir, filename)

        # Prevent circular includes
        if filepath in visited:
            return ''

        if not os.path.exists(filepath):
            # Try relative to base_dir
            return match.group(0)

        visited.add(filepath)

        try:
            included_content = read_file(filepath)
            # Recursively resolve includes in the included file
            return resolve_includes(included_content, base_dir, visited)
        except Exception as e:
            print(f"Warning: Could not include {filepath}: {e}", file=sys.stderr)
            return match.group(0)

    return re.sub(pattern, replace_include, tex_content)

def extract_title(tex):
    """Extract title from LaTeX"""
    # Match \title{...} handling nested braces
    match = re.search(r'\\title\s*\{([^}]+(?:\{[^}]*\}[^}]*)*)\}', tex, re.DOTALL)
    if match:
        title = match.group(1)
        # Clean up LaTeX commands
        title = re.sub(r'\\[a-zA-Z]+\{([^}]*)\}', r'\1', title)
        title = re.sub(r'\\[a-zA-Z]+', '', title)
        return title.strip()
    return ''

def extract_authors(tex):
    """Extract authors from LaTeX"""
    authors = []

    # Try \author{...} command - find the full block with balanced braces
    author_start = tex.find('\\author')
    if author_start != -1:
        # Find the opening brace
        brace_start = tex.find('{', author_start)
        if brace_start != -1:
            # Find the matching closing brace
            depth = 0
            pos = brace_start
            for i in range(brace_start, len(tex)):
                if tex[i] == '{':
                    depth += 1
                elif tex[i] == '}':
                    depth -= 1
                    if depth == 0:
                        author_text = tex[brace_start+1:i]
                        break

            if author_text:
                # Remove thanks/footnote commands completely (they contain long text)
                # Need to handle nested braces in \thanks{}
                author_text = re.sub(r'\\thanks\s*\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}', '', author_text)
                author_text = re.sub(r'\\footnotemark(?:\[[^\]]*\])?', '', author_text)
                author_text = re.sub(r'\\hspace\{[^}]*\}', '', author_text)

                # Split by \\And or \\AND to get author blocks
                author_blocks = re.split(r'\\AND\s*|\\And\s*', author_text)

                for block in author_blocks:
                    # Take only the first line (before first \\)
                    lines = [l.strip() for l in block.split('\\\\') if l.strip()]
                    if lines:
                        author_name = lines[0]
                        # Remove any remaining LaTeX commands
                        author_name = re.sub(r'\\[a-zA-Z@]+\*?(?:\[[^\]]*\])?(?:\{[^}]*\})?', '', author_name)
                        author_name = re.sub(r'[\{\}]', '', author_name)
                        author_name = re.sub(r'\s+', ' ', author_name).strip()

                        # Filter out email addresses and empty entries
                        if author_name and len(author_name) > 2 and '@' not in author_name:
                            authors.append(author_name)

    # Fallback: try splitting by 'and' or comma if no \\And found
    if not authors:
        author_match = re.search(r'\\author\s*\{([^}]+)\}', tex, re.DOTALL)
        if author_match:
            author_text = author_match.group(1)

            # Remove footnotes and thanks
            author_text = re.sub(r'\\thanks\{[^}]*\}', '', author_text)
            author_text = re.sub(r'\{[^}]*\}', '', author_text)

            # Remove LaTeX formatting commands
            author_text = re.sub(r'\\[a-zA-Z]+\*?(?:\[[^\]]*\])?', ' ', author_text)

            # Split by common delimiters
            author_text = re.sub(r'\\and\b', ',', author_text)
            author_text = re.sub(r'\band\b', ',', author_text)

            # Split and clean
            authors = [a.strip() for a in author_text.split(',')]
            authors = [a for a in authors if a and len(a) > 2 and not re.match(r'^\d+$', a)]

    # Try \begin{authors}...\end{authors}
    if not authors:
        authors_env = re.search(r'\\begin\{authors?\}(.*?)\\end\{authors?\}', tex, re.DOTALL | re.IGNORECASE)
        if authors_env:
            author_text = authors_env.group(1)
            author_text = re.sub(r'\\[a-zA-Z]+\{([^}]*)\}', r'\1', author_text)
            authors = [a.strip() for a in author_text.split(',')]
            authors = [a for a in authors if a and len(a) > 2]

    return authors

def extract_abstract(tex):
    """Extract abstract from LaTeX"""
    match = re.search(
        r'\\begin\{abstract\}(.*?)\\end\{abstract\}',
        tex, re.DOTALL | re.IGNORECASE
    )
    if match:
        abstract = match.group(1)
        # Clean up LaTeX commands while preserving text
        abstract = latex_to_text(abstract)
        return abstract.strip()
    return ''

def extract_content(tex):
    """Extract document body content"""
    # Find \begin{document}...\end{document}
    doc_match = re.search(
        r'\\begin\{document\}(.*?)\\end\{document\}',
        tex, re.DOTALL
    )

    if doc_match:
        content = doc_match.group(1)
    else:
        # If no document environment, use everything after \maketitle or \begin{abstract}
        content = tex

    # Remove bibliography, acknowledgments, appendix
    content = re.sub(r'\\begin\{thebibliography\}.*?\\end\{thebibliography\}', '', content, flags=re.DOTALL)
    content = re.sub(r'\\bibliography\{[^}]+\}', '', content)
    content = re.sub(r'\\begin\{acknowledgments?\}.*?\\end\{acknowledgments?\}', '', content, flags=re.DOTALL | re.IGNORECASE)

    # Convert to plain text
    plain_text = latex_to_text(content)

    # Truncate to 50000 chars (match PDF parser)
    MAX_CONTENT_LENGTH = 50000
    if len(plain_text) > MAX_CONTENT_LENGTH:
        plain_text = plain_text[:MAX_CONTENT_LENGTH] + '... [content truncated]'

    return plain_text

def latex_to_text(latex_content):
    """Convert LaTeX to plain text"""
    try:
        from pylatexenc.latex2text import LatexNodes2Text
        converter = LatexNodes2Text()
        return converter.latex_to_text(latex_content)
    except ImportError:
        # Fallback: simple regex cleanup
        text = latex_content

        # Remove comments
        text = re.sub(r'%.*$', '', text, flags=re.MULTILINE)

        # Remove common commands but keep their content
        text = re.sub(r'\\(?:textbf|textit|emph|cite|ref|label)\{([^}]*)\}', r'\1', text)

        # Remove commands without content
        text = re.sub(r'\\[a-zA-Z]+\*?', '', text)

        # Remove braces
        text = re.sub(r'[{}]', '', text)

        # Clean up whitespace
        text = re.sub(r'\n\s*\n', '\n\n', text)

        return text.strip()

def extract_links(tex):
    """Extract GitHub and code repository URLs"""
    github_links = re.findall(r'https?://github\.com/[^\s\)}\]]+', tex)

    # Other code hosting patterns
    code_patterns = [
        r'https?://(?:www\.)?arxiv\.org/(?:code|src)/[^\s\)}\]]+',
        r'https?://(?:www\.)?codeocean\.com/[^\s\)}\]]+',
        r'https?://(?:www\.)?openreview\.net/code[^\s\)}\]]+',
        r'https?://(?:www\.)?paperswithcode\.com/[^\s\)}\]]+',
    ]

    code_links = []
    for pattern in code_patterns:
        matches = re.findall(pattern, tex)
        code_links.extend(matches)

    # Remove duplicates and GitHub links from code_links
    code_links = list(set(code_links) - set(github_links))

    return list(set(github_links)), code_links

def main():
    if len(sys.argv) < 3:
        print('Usage: python3 parse-tex.py <main-tex-path> <extract-dir>', file=sys.stderr)
        sys.exit(1)

    main_tex_path = sys.argv[1]
    extract_dir = sys.argv[2]

    try:
        # Read main .tex file
        tex_content = read_file(main_tex_path)

        # Resolve includes
        base_dir = os.path.dirname(main_tex_path)
        tex_content = resolve_includes(tex_content, base_dir)

        # Extract metadata
        title = extract_title(tex_content)
        authors = extract_authors(tex_content)
        abstract = extract_abstract(tex_content)
        content = extract_content(tex_content)
        github_links, code_links = extract_links(tex_content)

        # Output JSON (matching parse-pdf.js format)
        metadata = {
            'title': title,
            'authors': authors,
            'abstract': abstract,
            'content': content,
            'githubLinks': github_links,
            'codeLinks': code_links,
            'sourceType': 'tex'
        }

        print(json.dumps(metadata, indent=2))

    except Exception as e:
        print(f'Error parsing LaTeX: {e}', file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()
