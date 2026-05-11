---
name: pilot-literature
description: "Use when researcher wants to find papers, read and summarize them, build or update the research wiki, or ask questions about the literature"
---

# Literature Review

This skill guides systematic literature search, reading, deep-dive summarization, and wiki knowledge extraction.

## <HARD-GATE>Mandatory Rules</HARD-GATE>

These rules apply to every skill. Violating any of these blocks progress.

1. **Always use the wiki** — <EXTREMELY-IMPORTANT>All research artifacts (plans, papers, entities, concepts, experiment reports) go into the `.research/` wiki directory using the specified templates and naming conventions. Never store research content outside the wiki.</EXTREMELY-IMPORTANT>

2. **Always check for handoff** — <EXTREMELY-IMPORTANT>Before starting any work, check `.research/handoff/` for the latest handoff report. If one exists, read it and resume from where the previous agent left off. Do not start from scratch.</EXTREMELY-IMPORTANT>

3. **Always handoff before stopping** — <EXTREMELY-IMPORTANT>When the session ends or you complete a skill, write a handoff report to `.research/handoff/YY-MM-DD-<skill>-<agent-name>.md` using the handoff report template. Never leave a session without a handoff.</EXTREMELY-IMPORTANT>

4. **Always refer to wiki links** — <EXTREMELY-IMPORTANT>When mentioning any paper, entity, concept, plan, or experiment, link to its wiki page using your platform's native link format (e.g., `[[papers/slug]]` or `papers/slug`). Every reference must link to the wiki, not use plain text.</EXTREMELY-IMPORTANT>

5. **Always update existing pages** — <EXTREMELY-IMPORTANT>When ingesting new information, check if related entity/concept/paper pages already exist in the wiki. Update them rather than creating duplicates. Search before creating.</EXTREMELY-IMPORTANT>

6. **Always ask before executing** — <EXTREMELY-IMPORTANT>Before running scripts, making significant changes, or taking irreversible actions, confirm with the researcher. Never execute without explicit approval.</EXTREMELY-IMPORTANT>

## Research Wiki Structure

All research content lives in `.research/` in the project root:

- `papers/` — Paper summaries `[[papers/<slug>]]`
- `entities/` — People, datasets, tools, institutions `[[entities/<name>]]`
- `concepts/` — Methods, theories, frameworks `[[concepts/<name>]]`
- `queries/` — Saved Q&A results `[[queries/<topic>]]`
- `plans/` — Research plans `[[plans/v<N>]]`
- `experiments/` — Experiment reports `[[experiments/<name>]]`
- `handoff/` — Agent handoff artifacts `[[handoff/<YY-MM-DD>-<skill>-<agent-name>]]`

## <HARD-GATE>Before You Begin</HARD-GATE>

- [ ] Check `.research/handoff/` for a previous handoff report
- [ ] If handoff exists, read it and resume context
- [ ] Read the latest research plan from `.research/plans/` (if any)
- [ ] Review relevant wiki pages to avoid duplicating existing summaries

## Process Flow

### Operation Modes

Choose one mode before execution:

- **Search + Ingest** — Use Steps 1-7 when the researcher wants discovery plus ingestion.
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

Use your platform's native web search to find papers:

```
site:arxiv.org <keywords>
```

Alternatively, query the ArXiv API directly:

```
GET http://export.arxiv.org/api/query?search_query=all:KEYWORDS&max_results=20&sortBy=relevance
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

### Step 5: Process Each Paper Individually (One-by-One)

<EXTREMELY-IMPORTANT>Process one paper at a time. Read the full paper, write a thorough deep-dive summary, extract entities and concepts, and link everything into the wiki — all before moving to the next paper. This prevents context loss and hallucination from batch processing. Each paper must be fully documented while fresh in memory.</EXTREMELY-IMPORTANT>

For each selected paper, execute the following sub-steps as an atomic unit:

#### Step 5a: Read the Paper Deeply

**Preferred Method (HTML):**
ArXiv now provides HTML versions for most recent papers, which are much cleaner and preserve math/formatting better than PDFs.
1. Extract the ArXiv ID from the search results (e.g., `2310.12345v1`).
2. Construct the HTML URL: `https://arxiv.org/html/2310.12345v1`
3. Use your built-in web fetch tool to read the page.

**Fallback Method (PDF):**
If the HTML version is unavailable, use your built-in web fetch to read the PDF directly from `https://arxiv.org/pdf/ID.pdf`. Most agent platforms handle PDF content natively.

While reading the paper:
- [ ] Read the entire paper, not just the abstract and conclusion
- [ ] Understand the problem motivation and what gap it fills
- [ ] Understand the methodology in detail — the architecture, algorithm, training setup, hyperparameters
- [ ] Note all experiments, ablations, baselines, and metrics
- [ ] Note what worked and what didn't — including negative results
- [ ] Note limitations the authors acknowledge and ones they don't
- [ ] Identify entities (authors, datasets, tools, institutions)
- [ ] Identify concepts (methods, theories, frameworks, metrics)
- [ ] Note connections to other papers and concepts in the wiki
- [ ] Critically assess methodology, claims, and evidence
- [ ] Note anything surprising, counterintuitive, or worth following up on

<EXTREMELY-IMPORTANT>Do not skim. Read the full paper. The deep-dive summary must be self-contained — someone should be able to understand the paper without reading the original. Every claim in the summary should be backed by what you actually read.</EXTREMELY-IMPORTANT>

#### Step 5b: Write Deep-Dive Paper Summary

Using the `paper-summary-template.md`, write a thorough summary covering:
- [ ] **Background & Motivation** — What problem, why it matters, what gap
- [ ] **Key Contribution** — What is specifically new, how it differs from prior work
- [ ] **Methodology** — Detailed walkthrough of the approach, algorithm, training setup, hyperparameters, datasets
- [ ] **Results** — Main results with specific numbers, benchmark-by-benchmark breakdown, ablations, qualitative examples
- [ ] **What Worked & What Didn't** — Honest assessment of empirical claims
- [ ] **Critical Analysis** — Strengths, weaknesses, methodological concerns, reproducibility issues
- [ ] **Relevance to Our Research** — How it connects, what we can use, what to be skeptical of
- [ ] **Open Questions** — What's left unanswered, what to follow up on
- [ ] **Notes & Annotations** — Reproduction notes, personal observations

<EXTREMELY-IMPORTANT>Write as if you are documenting the paper for your future self and collaborators. Be specific. Use numbers, not just adjectives. Describe what the experiments actually showed, not just what the authors claim they showed. Every section should contain substantive content, not placeholder text.</EXTREMELY-IMPORTANT>

Save to `.research/papers/<arxiv-id-or-slug>.md`

#### Step 5c: Extract and Update Entities & Concepts

**Entities** (using `entity-template.md`):
- [ ] Extract authors, datasets, tools, institutions
- [ ] Check if entity page already exists — update it with new information, don't create duplicates
- [ ] For each entity, document key contributions/details, influence, and connections
- [ ] Save/update in `.research/entities/<name>.md`

**Concepts** (using `concept-template.md`):
- [ ] Extract methods, theories, frameworks, metrics introduced or used
- [ ] Check if concept page already exists — update it with new information, don't create duplicates
- [ ] For each concept, write detailed explanation including technical details, variants, empirical evidence
- [ ] Save/update in `.research/concepts/<name>.md`

<EXTREMELY-IMPORTANT>Entity and concept pages should be substantive, not stubs. Write them as if they are reference documents. Always check for existing pages before creating new ones. Duplicate pages fragment knowledge. Search the wiki directory for similar names, and update existing pages when new information is available.</EXTREMELY-IMPORTANT>

#### Step 5d: Link Everything with Wiki Links

Connect all artifacts with wiki links:
- [ ] Paper summary links to entities and concepts mentioned
- [ ] Entity pages link back to papers and related concepts
- [ ] Concept pages link back to papers and related entities
- [ ] Update the research plan's Key Literature section with new `[[papers/<slug>]]` links

<EXTREMELY-IMPORTANT>Wiki links must be bidirectional. When paper A links to concept B, concept B should list paper A in its Related Papers section. When creating a new entity from this paper, link it back to the paper and to any related concepts already in the wiki.</EXTREMELY-IMPORTANT>

#### Step 5e: Move to Next Paper

Once a paper is fully documented (summary written, entities/concepts extracted, wiki links in place), move to the next selected paper and repeat Steps 5a-5d.

<EXTREMELY-IMPORTANT>Do not batch papers. Each paper must be read, summarized, extracted, and linked before reading the next one. If interrupted mid-paper, write a handoff noting which paper you were working on and what remains to be done.</EXTREMELY-IMPORTANT>

### Step 6: Update Research Plan

After all papers are processed:
- [ ] Add all new paper links to the Key Literature section of the research plan
- [ ] Update any plan sections that new findings affect (methodology, expected outcomes, etc.)
- [ ] Note any directions or hypotheses the new literature suggests

### Step 7: Report

Summarize what was added/updated for the researcher:
- [ ] List all new papers summarized
- [ ] List all new entities and concepts created
- [ ] List all existing pages updated
- [ ] Highlight key findings relevant to the research plan
- [ ] Note any patterns, contradictions, or gaps across the papers
- [ ] Suggest next steps (e.g., invoke `pilot-research:pilot-brainstorm` to refine the plan based on findings)

## ArXiv Search Instructions

Pilot Research no longer bundles CLI tools for searching or extracting PDF text. Use your platform's native capabilities:

**Search:** Use web search (`site:arxiv.org <keywords>`) or query the ArXiv API directly:
```
GET http://export.arxiv.org/api/query?search_query=all:KEYWORDS&max_results=20&sortBy=relevance
```

**Read:** Use web fetch to read papers from ArXiv HTML (`https://arxiv.org/html/ID`) or PDF (`https://arxiv.org/pdf/ID.pdf`). Most agent platforms handle both natively.

<EXTREMELY-IMPORTANT>Always try the HTML version first — it preserves formatting, math, and is much cleaner than PDF extraction.</EXTREMELY-IMPORTANT>

## Red Flags

| Red Flag | Why It Matters |
|----------|---------------|
| Searching without a research plan | Produces unfocused, irrelevant results |
| Skipping the selection step | Wastes time on irrelevant papers |
| Creating duplicate entity/concept pages | Fragments knowledge and creates confusion |
| Missing wiki links between papers and concepts | Breaks the knowledge graph; connections are lost |
| Not updating existing pages with new info | Stale pages miss connections from newer papers |
| Writing shallow summaries (one-liners, placeholders) | Defeats the purpose. Summaries must be self-contained references. |
| Batching papers (read all, then summarize all) | Causes context loss and hallucination. Process one paper at a time. |

## Common Rationalizations

| Rationalization | Reality |
|----------------|---------|
| "I'll just read all the papers" | Time-consuming and unfocused. Always filter first. |
| "The search query is good enough" | Refine queries based on results. Iterate. |
| "I'll link things later" | Link as you go. Later never comes. |
| "This concept page is good enough" | Update it with new information from each paper. |
| "One paragraph is enough for this paper" | Every paper deserves a thorough deep-dive. Someone may read this summary instead of the original. |
| "I'll batch all papers and summarize at the end" | Guaranteed to hallucinate and omit details. One paper at a time. |

## Transitioning to Other Skills

After completing literature review:
- If findings suggest refining the research plan → invoke `pilot-research:pilot-brainstorm`
- If ready to design experiments based on literature → invoke `pilot-research:pilot-execute`
- If researcher wants feedback on the literature review → invoke `pilot-research:pilot-peer-review`

<EXTREMELY-IMPORTANT>Always write a handoff report to `.research/handoff/YY-MM-DD-literature-<agent-name>.md` before ending the session or transitioning to another skill.</EXTREMELY-IMPORTANT>

## Templates

- `paper-summary-template.md` — For deep-dive paper summaries
- `entity-template.md` — For creating entity pages (authors, datasets, tools, institutions)
- `concept-template.md` — For creating concept pages (methods, theories, frameworks, metrics)
- `query-result-template.md` — For saving answered literature questions
