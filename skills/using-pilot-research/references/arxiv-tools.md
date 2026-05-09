# ArXiv Tools Reference

## arxiv-query.py

### Command Syntax

```
python3 scripts/arxiv-query.py <SEARCH_TERMS> [OPTIONS]
```

### Options

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--max-results` | int | 10 | Maximum number of results to return |
| `--sort-by` | relevance, date | relevance | Sort order for results |
| `--start-date` | YYYY-MM-DD | None | Filter papers published after this date |
| `--end-date` | YYYY-MM-DD | None | Filter papers published before this date |
| `--offset` | int | 0 | Offset for pagination |

### Search Terms

Search terms are positional arguments. Combine multiple terms with AND logic:

```bash
python3 scripts/arxiv-query.py "transformer" "attention mechanism"
```

Use ArXiv category prefixes for targeted searches:

```bash
python3 scripts/arxiv-query.py "cat:cs.AI" "reinforcement learning"
```

### Expected Output

The script returns JSON to stdout:

```json
{
  "total_results": 142,
  "papers": [
    {
      "arxiv_id": "2310.12345",
      "title": "Paper Title",
      "authors": ["Author One", "Author Two"],
      "abstract": "Paper abstract text...",
      "published": "2023-10-15",
      "categories": ["cs.AI", "cs.LG"],
      "pdf_url": "http://arxiv.org/pdf/2310.12345v1.pdf"
    }
  ]
}
```

### Example Invocations

Search for papers on transformer attention mechanisms:

```bash
python3 scripts/arxiv-query.py "transformer" "attention mechanism" --max-results 5 --sort-by relevance
```

Search for recent papers in a specific category:

```bash
python3 scripts/arxiv-query.py "cat:cs.CL" "large language models" --sort-by date --max-results 10
```

Paginated search with date range:

```bash
python3 scripts/arxiv-query.py "neural architecture search" --start-date 2023-01-01 --end-date 2023-12-31 --offset 10 --max-results 10
```

### Error Handling

- Network timeout: prints error to stderr, exits with code 1
- No results: prints JSON with empty papers array, prints message to stderr
- Invalid date format: prints error to stderr, exits with code 1

---

## pdf-extract.py

### Command Syntax

```
python3 scripts/pdf-extract.py <SOURCE> [OPTIONS]
```

### Options

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--format` | text, json | text | Output format |
| `--pages-only` | flag | off | Print page separators (useful with text format) |

### Source

The source can be:
- A URL starting with `http://` or `https://` (PDF will be downloaded)
- A local file path to an existing PDF

### Expected Output

Text format (default):

```
Extracted text content page by page...
```

JSON format (`--format json`):

```json
{
  "source": "http://arxiv.org/pdf/2310.12345v1.pdf",
  "total_pages": 12,
  "pages": [
    {"page": 1, "text": "Page 1 content..."},
    {"page": 2, "text": "Page 2 content..."}
  ]
}
```

If PyPDF2 is not installed:

```json
{
  "source": "http://arxiv.org/pdf/2310.12345v1.pdf",
  "error": "PyPDF2 not installed",
  "hint": "pip install PyPDF2",
  "pages": []
}
```

### Example Invocations

Extract text from an ArXiv PDF:

```bash
python3 scripts/pdf-extract.py "http://arxiv.org/pdf/2310.12345v1.pdf"
```

Extract from a local PDF in JSON format:

```bash
python3 scripts/pdf-extract.py ./downloads/paper.pdf --format json
```

Extract with page separators:

```bash
python3 scripts/pdf-extract.py "http://arxiv.org/pdf/2310.12345v1.pdf" --pages-only
```

### Dependencies

- **Python 3.7+**: Required
- **PyPDF2**: Optional, but required for actual PDF text extraction. Install with `pip install PyPDF2`
- No other external dependencies; the scripts use only the Python standard library for network requests and XML parsing.

---

## Literature Review Workflow

The standard workflow for processing research papers:

### 1. Search

```bash
python3 scripts/arxiv-query.py "your search terms" --max-results 10 --sort-by relevance
```

Review the JSON output and identify relevant papers by title and abstract.

### 2. Select

From the query results, identify papers worth reading based on:
- Relevance of the abstract to your research
- Citation count (if available)
- Recency
- Category fit

### 3. Read

For each selected paper, download and extract the text:

```bash
python3 scripts/pdf-extract.py "http://arxiv.org/pdf/PAPER_IDv1.pdf" --format json
```

Or use a local PDF if already downloaded.

### 4. Summarize

Create a paper summary in the wiki at `papers/<arxiv-id-or-slug>.md`:

```yaml
---
type: paper
title: "Paper Title"
date: 2025-01-15
tags: [relevant, tags]
arxiv_id: "XXXX.XXXXX"
authors: [Author One, Author Two]
year: 2025
status: complete
---
```

Include sections: one-line summary, key contribution, methodology, results, relevance to current research, and connections.

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