---
name: pilot-literature
description: "Use when researcher wants to find papers, read and summarize them, build or update the research wiki, or ask questions about the literature"
---

# Literature Review

This skill guides systematic literature search, reading, summarization, and wiki knowledge extraction.

## <HARD-GATE>Mandatory Rules</HARD-GATE>

These rules apply to every skill. Violating any of these blocks progress.

1. **Always use the wiki** — <EXTREMELY-IMPORTANT>All research artifacts (plans, papers, entities, concepts, experiment reports) go into the `.research/` wiki directory using the specified templates and naming conventions. Never store research content outside the wiki.</EXTREMELY-IMPORTANT>

2. **Always check for handoff** — <EXTREMELY-IMPORTANT>Before starting any work, check `.research/handoff/` for the latest handoff report. If one exists, read it and resume from where the previous agent left off. Do not start from scratch.</EXTREMELY-IMPORTANT>

3. **Always handoff before stopping** — <EXTREMELY-IMPORTANT>When the session ends or you complete a skill, write a handoff report to `.research/handoff/YY-MM-DD-<skill>-<agent-name>.md` using the handoff report template. Never leave a session without a handoff.</EXTREMELY-IMPORTANT>

4. **Always use `[[wikilinks]]`** — <EXTREMELY-IMPORTANT>When mentioning any paper, entity, concept, plan, or experiment, link to its wiki page using the `[[type-slug]]` pattern. Every reference must be a wikilink, not plain text.</EXTREMELY-IMPORTANT>

5. **Always update existing pages** — <EXTREMELY-IMPORTANT>When ingesting new information, check if related entity/concept/paper pages already exist in the wiki. Update them rather than creating duplicates. Search before creating.</EXTREMELY-IMPORTANT>

6. **Always ask before executing** — <EXTREMELY-IMPORTANT>Before running scripts, making significant changes, or taking irreversible actions, confirm with the researcher. Never execute without explicit approval.</EXTREMELY-IMPORTANT>

## Research Wiki Structure

All research content lives in `.research/` in the project root:

- `papers/` — Paper summaries `[[paper-<slug>]]`
- `entities/` — People, datasets, tools, institutions `[[entity-<name>]]`
- `concepts/` — Methods, theories, frameworks `[[concept-<name>]]`
- `queries/` — Saved Q&A results `[[query-<topic>]]`
- `plans/` — Research plans `[[plan-v<N>]]`
- `experiments/` — Experiment reports `[[exp-<name>]]`
- `handoff/` — Agent handoff artifacts `[[handoff-<YY-MM-DD>-<skill>-<agent-name>]]`

## <HARD-GATE>Before You Begin</HARD-GATE>

- [ ] Check `.research/handoff/` for a previous handoff report
- [ ] If handoff exists, read it and resume context
- [ ] Read the latest research plan from `.research/plans/` (if any)
- [ ] Review relevant wiki pages to avoid duplicating existing summaries

## Process Flow

### Operation Modes

Choose one mode before execution:

- **Search + Ingest** — Use Steps 1-10 when the researcher wants discovery plus ingestion.
- **Ingest Only** — If the researcher already provides paper IDs/URLs/PDFs, skip Steps 3-4 and start from Step 5.

### Step 1: Read Research Plan

Read the latest plan from `.research/plans/` to understand:
- [ ] The research question and hypothesis
- [ ] Key concepts and entities already in the wiki
- [ ] What literature is already linked in the plan

<EXTREMELY-IMPORTANT>If no research plan exists, ask the researcher for context before proceeding. Literature review without context produces unfocused results.</EXTREMELY-IMPORTANT>

### Step 2: Clarify Search Scope

Ask the researcher:
- [ ] What specific topics or keywords to search for?
- [ ] Any preferred sources? (ArXiv, specific conferences, provided PDFs/URLs)
- [ ] Time range constraints? (e.g., "only papers from 2020 onwards")
- [ ] How many papers are expected?
- [ ] Are there specific papers or authors they already know about?
- [ ] Is this **Search + Ingest** or **Ingest Only** mode?

### Step 3: Search

Use `arxiv-query.py` to find papers on ArXiv:

```bash
pilot arxiv-query --query "your search terms" --max-results 20
```

For researcher-provided PDFs or URLs, process them directly in Step 5.

<EXTREMELY-IMPORTANT>Do not assume search results are relevant. Search queries should be specific and aligned with the research plan. Refine queries if initial results are off-topic.</EXTREMELY-IMPORTANT>

### Step 4: Select

Present found papers to the researcher for selection before deep reading:
- [ ] List each paper with title, authors, year, and a brief relevance note
- [ ] Ask the researcher which papers to read in full
- [ ] Ask if any papers should be deprioritized or excluded
- [ ] Note any papers already summarized in the wiki

<EXTREMELY-IMPORTANT>Never deep-read papers without researcher approval. Reading is expensive; always confirm selection first.</EXTREMELY-IMPORTANT>

### Step 5: Read

**Preferred Method (HTML):**
ArXiv now provides HTML versions for most recent papers, which are much cleaner and preserve math/formatting better than PDFs.
1. Extract the ArXiv ID from the search results (e.g., `2310.12345v1`).
2. Construct the HTML URL: `https://arxiv.org/html/2310.12345v1`
3. Use your built-in web fetching tool (e.g., `webfetch` or browser) to read the page.

**Fallback Method (PDF):**
If the HTML version is unavailable or you are working with a direct PDF file, use the CLI extractor:

```bash
pilot pdf-extract <path-or-url>
```

While reading the paper:
- [ ] Extract key arguments, methodology, results, and conclusions
- [ ] Note connections to other papers and concepts
- [ ] Identify entities (authors, datasets, tools, institutions)

<EXTREMELY-IMPORTANT>For ingest requests, this is the starting step. If the researcher already provided papers, execute from Step 5 without requiring Steps 3-4.</EXTREMELY-IMPORTANT>

### Step 6: Summarize

Delegate summarization to worker subagents. The main literature agent should prepare inputs and quality criteria, then review worker outputs.

Worker task requirements:
- [ ] One-line summary captures the core contribution
- [ ] Key contribution is clearly stated
- [ ] Methodology is described at a high level
- [ ] Results include key metrics
- [ ] Limitations are honestly assessed
- [ ] Relevance to our research is explicit
- [ ] Connections section links to related `[[wikilinks]]`

Save to `.research/papers/<arxiv-id-or-slug>.md`

### Step 7: Extract

Delegate entity/concept extraction to worker subagents. Workers identify and create/update entities and concepts from the paper:

**Entities** (using `entity-template.md`):
- [ ] Authors, datasets, tools, institutions
- [ ] Check if entity page already exists before creating
- [ ] Update existing entity pages with new information from this paper
- [ ] Save to `.research/entities/<name>.md`

**Concepts** (using `concept-template.md`):
- [ ] Methods, theories, frameworks, metrics
- [ ] Check if concept page already exists before creating
- [ ] Update existing concept pages with new information from this paper
- [ ] Save to `.research/concepts/<name>.md`

<EXTREMELY-IMPORTANT>Always check for existing pages before creating new ones. Duplicate pages fragment knowledge. Search the wiki directory for similar names, and update existing pages when new information is available.</EXTREMELY-IMPORTANT>

### Step 8: Link

Delegate wikilink integration to worker subagents. Workers must connect everything with `[[wikilinks]]`:
- [ ] Paper summaries link to entities and concepts mentioned
- [ ] Entity pages link back to papers and related concepts
- [ ] Concept pages link back to papers and related entities
- [ ] Research plan is updated with new `[[paper-<slug>]]` links in the Key Literature section

<EXTREMELY-IMPORTANT>Wikilinks must be bidirectional in spirit. When paper A links to concept B, concept B should list paper A in its Related Papers section.</EXTREMELY-IMPORTANT>

### Step 9: Save

Delegate artifact writes to worker subagents. Workers write artifacts to the appropriate wiki folders:
- [ ] Paper summaries → `.research/papers/`
- [ ] Entity pages → `.research/entities/`
- [ ] Concept pages → `.research/concepts/`
- [ ] Query results → `.research/queries/` (if answering a literature question)

### Step 10: Report

Main literature agent responsibilities:
- [ ] Coordinate worker assignments for Steps 6-9
- [ ] Review and validate worker outputs before final reporting
- [ ] Resolve conflicts or duplicates across worker outputs

Then summarize what was added/updated for the researcher:
- [ ] List all new papers summarized
- [ ] List all new entities and concepts created
- [ ] List all existing pages updated
- [ ] Highlight key findings relevant to the research plan
- [ ] Suggest next steps (e.g., invoke `pilot-research:pilot-brainstorm` to refine the plan based on findings)

## ArXiv Search Instructions

The `arxiv-query.py` script queries ArXiv's API. Key usage:

```bash
# Basic search
pilot arxiv-query --query "transformer attention mechanism" --max-results 10

# Search with date filter
pilot arxiv-query --query "large language models" --max-results 20 --start-year 2022

# Search specific categories
pilot arxiv-query --query "reinforcement learning" --categories cs.AI,cs.LG
```

<EXTREMELY-IMPORTANT>Always check the script's help (`pilot arxiv-query --help`) for the latest available options before running queries.</EXTREMELY-IMPORTANT>

## Red Flags

| Red Flag | Why It Matters |
|----------|---------------|
| Searching without a research plan | Produces unfocused, irrelevant results |
| Skipping the selection step | Wastes time on irrelevant papers |
| Creating duplicate entity/concept pages | Fragments knowledge and creates confusion |
| Missing wikilinks between papers and concepts | Breaks the knowledge graph; connections are lost |
| Not updating existing pages with new info | Stale pages miss connections from newer papers |
| Summarizing without noting limitations | Creates overly optimistic view of the literature |

## Common Rationalizations

| Rationalization | Reality |
|----------------|---------|
| "I'll just read all the papers" | Time-consuming and unfocused. Always filter first. |
| "The search query is good enough" | Refine queries based on results. Iterate. |
| "I'll link things later" | Link as you go. Later never comes. |
| "This concept page is good enough" | Update it with new information from each paper. |

## Transitioning to Other Skills

After completing literature review:
- If findings suggest refining the research plan → invoke `pilot-research:pilot-brainstorm`
- If ready to design experiments based on literature → invoke `pilot-research:pilot-execute`
- If researcher wants feedback on the literature review → invoke `pilot-research:pilot-peer-review`

<EXTREMELY-IMPORTANT>Always write a handoff report to `.research/handoff/YY-MM-DD-literature-<agent-name>.md` before ending the session or transitioning to another skill.</EXTREMELY-IMPORTANT>

## Templates

- `paper-summary-template.md` — For summarizing papers
- `entity-template.md` — For creating entity pages (authors, datasets, tools, institutions)
- `concept-template.md` — For creating concept pages (methods, theories, frameworks, metrics)
- `query-result-template.md` — For saving answered literature questions
