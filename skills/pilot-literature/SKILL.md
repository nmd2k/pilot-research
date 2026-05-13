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
- `drafts/` — Paper drafts `[[drafts/v<N>]]`
- `handoff/` — Agent handoff artifacts `[[handoff/<YY-MM-DD>-<skill>-<agent-name>]]`

## Before You Begin
- Context gathering: 
  - [ ] Read the latest research plan from `.research/plans/`
  - [ ] Check `.research/handoff/` for previous handoff; resume if found
  - [ ] Review relevant wiki pages to avoid duplicate work

## Literature Workflows

Execute the appropriate workflow based on the researcher's request. You may enter at any stage depending on the prompt (e.g., jump directly to Deep Reading if given a specific paper).

### 1. Search & Triage
Search & Triage
When asked to find papers, use web search or ArXiv APIs.
**Do not arbitrarily choose papers to deep-read.** Instead, read the abstracts and present a categorized shortlist to the researcher, for example:
- **Highly Related:** Direct hits to the core problem.
- **Good to Know:** Valuable context, alternative approaches, or related domains.
- **Methodology/Reference:** Useful for technical implementation details.
- etc.
Include a brief summarization for each paper. Wait for the researcher's explicit approval on which papers to ingest.

### 2. Deep Reading & Wiki Ingestion
For each approved paper, you must perform a rigorous deep dive. If processing multiple papers, you act as a leader scientist, spawn sub-agents to perform the reading and summerizing in parallel. What worker should aware of:
- **Deep Read:** Fetch the full text (preferring `https://arxiv.org/html/<ID>`). Do not just skim the abstract. You must analyze the methodology, architecture, ablation studies, and limitations.
- **Summarize:** Create a detailed, self-contained summary in `.research/papers/<slug>.md` using `paper-summary-template.md`. Write substantive content with actual metrics and findings, not placeholders.
- **Extract Knowledge:** Identify datasets, frameworks, authors, and metrics. Create or update files in `.research/entities/` and `.research/concepts/`. **You must check for existing pages first** to avoid fragmenting the wiki with duplicates.

For you as the leader scientist: Once papers are processed, you must integrate the new knowledge into the wiki.
- **Lint the Wiki:** Ensure all newly created files use proper bidirectional `[[wikilinks]]` (e.g., `[[papers/slug]]`, `[[concepts/name]]`).
- **Connect:** Update existing entity, concept, and plan pages to reference the newly ingested papers. Do not leave new papers isolated from the rest of the wiki graph.

### 3. Reporting & Handoff
Before finishing, generate a structured report for the researcher and save it to `.research/handoff/YY-MM-DD-literature-<agent-name>.md`.
Your report must explicitly list:
1. **Ingested Papers:** Which papers were successfully summarized.
2. **Knowledge Graph Updates:** Which entities and concepts were created or modified.
3. **Key Findings:** Cross-paper patterns, contradictions, or new hypotheses relevant to the research plan.

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
