---
name: pilot-literature
description: "Use when researcher wants to find papers, read and summarize them, build or update the research wiki, or ask questions about the literature"
---

# Literature Review

Systematic literature search, deep reading, summarization, and wiki knowledge management.

## Hard-Gate: Mandatory Rules

1. **Wiki is source of truth** — All artifacts (papers, entities, concepts, plans, experiments) go into `.research/` using specified templates. Every reference uses wiki links (`[[papers/slug]]`). Before creating new pages, check for existing ones and update them. Links must be bidirectional.
2. **Always handoff** — Check `.research/handoff/` before starting; write a handoff report before stopping. Never leave a session without one.
3. **Ask before executing** — Confirm with the researcher before running scripts, making significant changes, or taking irreversible actions.

## Research Wiki Structure

All content lives in `.research/`:
- `papers/` — Paper summaries `[[papers/<slug>]]`
- `entities/` — People, datasets, tools, institutions `[[entities/<name>]]`
- `concepts/` — Methods, theories, frameworks `[[concepts/<name>]]`
- `queries/` — Saved Q&A results `[[queries/<topic>]]`
- `plans/` — Research plans `[[plans/v<N>]]`
- `experiments/` — Experiment reports `[[experiments/<name>]]`
- `handoff/` — Agent handoff artifacts

## Before You Begin

- [ ] Check `.research/handoff/` for previous handoff; resume if found
- [ ] Read the latest research plan from `.research/plans/`
- [ ] Review relevant wiki pages to avoid duplicate work

## Process Flow

### Operation Modes

- **Search + Ingest** — Full pipeline (Steps 1-7). Use when researcher wants discovery + ingestion.
- **Ingest Only** — If researcher provides paper IDs/URLs/PDFs, skip Steps 3-4 and start at Step 5.

### Step 1: Read Research Plan

Read the latest plan from `.research/plans/` to understand the research question, key concepts, and existing literature.

<EXTREMELY-IMPORTANT>If no research plan exists, ask the researcher for context before proceeding. Literature review without focus produces poor results.</EXTREMELY-IMPORTANT>

### Step 2: Clarify Search Scope

Ask the researcher:
- [ ] Topics/keywords to search for
- [ ] Preferred sources (ArXiv, conferences, provided PDFs/URLs)
- [ ] Time range constraints
- [ ] Expected number of papers
- [ ] Known papers or authors
- [ ] Search + Ingest vs. Ingest Only mode

### Step 3: Search

Use web search or the ArXiv API:

```
GET http://export.arxiv.org/api/query?search_query=all:KEYWORDS&max_results=20&sortBy=relevance
```

For web search: `site:arxiv.org <keywords>`

Refine queries if initial results are off-topic. Prefer ArXiv HTML versions for reading (`https://arxiv.org/html/<ID>`).

### Step 4: Select

Present results to the researcher for approval before deep reading:
- [ ] List each paper with title, authors, year, relevance note
- [ ] Note any already in the wiki
- [ ] Ask which to read in full

<EXTREMELY-IMPORTANT>Never deep-read without researcher approval. Confirm selection first.</EXTREMELY-IMPORTANT>

### Step 5: Process Papers in Parallel

**Leader agent** spawns one sub-agent per selected paper. Each sub-agent executes independently and in parallel.

#### Per-Paper Sub-Agent Tasks

For the assigned paper:

**1. Read the Paper Deeply**
- Prefer the ArXiv HTML version (`https://arxiv.org/html/<ID>`) — cleaner, preserves formatting and math
- Read the full paper — not just abstract and conclusion
- Understand: problem motivation, methodology (architecture, algorithms, training setup, hyperparameters), all experiments/ablations/metrics, limitations, and connections to existing wiki content
- Note anything surprising, contradictory, or worth following up on

**2. Write Deep-Dive Summary**
- Use `paper-summary-template.md`
- Cover: Background & Motivation, Key Contribution, Methodology, Results (with specific numbers), What Worked & Didn't, Critical Analysis, Relevance to Our Research, Open Questions
- Write as if for your future self — self-contained, specific, substantive. Every section must contain real content, not placeholders.
- Save to `.research/papers/<arxiv-id-or-slug>.md`

**3. Extract Entities & Concepts**
- Extract authors, datasets, tools, institutions → create/update in `.research/entities/`
- Extract methods, theories, frameworks, metrics → create/update in `.research/concepts/`
- Check for existing pages before creating; update existing pages with new info
- Use `entity-template.md` and `concept-template.md`

<EXTREMELY-IMPORTANT>Check for existing entity/concept pages before creating new ones. Duplicate pages fragment knowledge.</EXTREMELY-IMPORTANT>

#### Leader Agent: Cross-Paper Linking

After all sub-agents complete, do one linking pass across all new content:
- [ ] Add bidirectional wiki links: paper ↔ entities, paper ↔ concepts, entities ↔ concepts
- [ ] Ensure cross-references are consistent across all newly created pages
- [ ] Update existing entity/concept pages with links to new papers

### Step 6: Update Research Plan

- [ ] Add new paper links to the plan's Key Literature section
- [ ] Update plan sections affected by new findings
- [ ] Note new directions or hypotheses suggested by the literature

### Step 7: Report

Summarize for the researcher:
- [ ] New papers summarized
- [ ] New entities and concepts created
- [ ] Existing pages updated
- [ ] Key findings relevant to the research plan
- [ ] Patterns, contradictions, or gaps across papers
- [ ] Suggested next steps

## Red Flags

| Red Flag | Why It Matters |
|---|---|
| Searching without a research plan | Unfocused results |
| Skipping paper selection | Wastes time on irrelevant reading |
| Creating duplicate wiki pages | Fragments knowledge |
| Missing bidirectional wiki links | Breaks the knowledge graph |
| Shallow summaries | Defeats the purpose — summaries must be self-contained |

## Transitioning to Other Skills

- Refine plan based on findings → `pilot-research:pilot-brainstorm`
- Design experiments → `pilot-research:pilot-execute`
- Get feedback on review → `pilot-research:pilot-peer-review`

<EXTREMELY-IMPORTANT>Always write a handoff report to `.research/handoff/YY-MM-DD-literature-<agent-name>.md` before ending or switching skills.</EXTREMELY-IMPORTANT>

## Templates

- `paper-summary-template.md` — Deep-dive paper summaries
- `entity-template.md` — Entity pages
- `concept-template.md` — Concept pages
- `query-result-template.md` — Saved literature Q&A
