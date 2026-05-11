# ArXiv and Literature Search

Pilot Research no longer bundles its own ArXiv query or PDF extraction scripts. Modern agent platforms (OpenCode, Claude Code, Cursor, Codex) have native web search and web fetch capabilities. Use those natively instead.

## Finding Papers

### Web Search (Agent-Native)

Use your agent's built-in web search to find papers:

```
site:arxiv.org <keywords>
```

Example: `site:arxiv.org diffusion models image generation`

Ask the researcher:
- Specific keywords or topics
- Preferred sources (ArXiv, specific conferences, provided URLs)
- Time range constraints (e.g., "only papers from 2024 onwards")
- How many papers are expected

### ArXiv API (Direct)

If your agent supports HTTP requests, query the ArXiv API directly:

```
GET http://export.arxiv.org/api/query?search_query=all:KEYWORDS&max_results=20&sortBy=relevance
```

The API returns Atom XML. Parse `atom:entry` elements to extract:
- `arxiv_id` from `id` tag (last path segment)
- `title`, `summary` (abstract), `published`, `author/name`
- `category` (subject areas)

PDF URL is `http://arxiv.org/pdf/ID.pdf` (replace `/abs/` with `/pdf/` in the entry's link).

## Reading Papers

### Preferred: ArXiv HTML

Most recent ArXiv papers have HTML versions:

```
https://arxiv.org/html/2310.12345v1
```

Use your agent's built-in web fetch tool to read the HTML page. This preserves math, formatting, and is much cleaner than PDF extraction.

## Literature Review Workflow

### 1. Search

Use web search or ArXiv API to find papers matching the research plan's keywords.

### 2. Select

Present found papers to the researcher for selection before deep reading:
- List each paper with title, authors, year, and a brief relevance note
- Ask which papers to read in full
- Note any papers already summarized in the wiki

### 3. Read

For each selected paper, read via ArXiv HTML (preferred) or web fetch.

### 4. Summarize

Create a paper summary in the wiki at `papers/<arxiv-id-or-slug>.md`.

### 5. Extract

From each paper summary, extract and create or update:
- **Entities**: Authors, datasets, tools mentioned → `entities/<name>.md`
- **Concepts**: Methods, theories, frameworks → `concepts/<name>.md`

### 6. Link

Connect everything with wikilinks:
- Paper summary links to entities and concepts
- Entity pages link back to papers (backlinks)
- Concept pages link to related papers and entities

### 7. Save

Ensure all new and updated wiki pages are saved with proper YAML frontmatter and consistent wikilink references.
