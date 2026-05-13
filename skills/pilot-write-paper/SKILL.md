---
name: pilot-write-paper
description: "Use when researcher wants to draft, outline, or revise a research paper"
---

# Write Paper

This skill guides paper drafting, from outline to complete draft, pulling content from the research wiki.


## Hard-Gate: Mandatory Rules

1. **Wiki is source of truth** — All artifacts (papers, entities, concepts, plans, experiments) go into `.research/` using specified templates. Every reference uses wiki links (`[[papers/slug]]`). Before creating new pages, check for existing ones and update them. Links must be bidirectional.

2. **Always handoff** — Check `.research/handoff/` before starting; write a handoff report before stopping. Never leave a session without one.

3. **Ask before executing** — Confirm with the researcher before running scripts, making significant changes, or taking irreversible actions.

## Research Wiki Structure

All research content lives in `.research/` in the project root:

- `papers/` — Paper summaries `[[papers/<slug>]]`
- `entities/` — People, datasets, tools, institutions `[[entities/<name>]]`
- `concepts/` — Methods, theories, frameworks `[[concepts/<name>]]`
- `queries/` — Saved Q&A results `[[queries/<topic>]]`
- `plans/` — Research plans `[[plans/v<N>]]`
- `experiments/` — Experiment reports `[[experiments/<name>]]`
- `drafts/` — Paper drafts `[[drafts/v<N>]]`
- `handoff/` — Agent handoff artifacts `[[handoff/<YY-MM-DD>-<skill>-<agent-name>]]`

## <HARD-GATE>Before You Begin</HARD-GATE>

- [ ] Check `.research/handoff/` for a previous handoff report
- [ ] If handoff exists, read it and resume context
- [ ] Read the latest research plan from `.research/plans/v<N>.md`
- [ ] Read relevant paper summaries from `.research/papers/`
- [ ] Read experiment reports from `.research/experiments/`

<EXTREMELY-IMPORTANT>You cannot write a paper without a research plan and supporting content. If the wiki is empty, invoke `pilot-research:pilot-literature` or `pilot-research:pilot-brainstorm` first.</EXTREMELY-IMPORTANT>

## Process Flow

### Step 1: Read Context

Gather all relevant research artifacts from the wiki:
- [ ] Previous draft (`.research/drafts/v<N>.md`)
- [ ] Research plan (`.research/plans/v<N>.md`)
- [ ] Paper summaries (`.research/papers/`)
- [ ] Experiment reports (`.research/experiments/`)
- [ ] Concept pages (`.research/concepts/`)
- [ ] Entity pages (`.research/entities/`)
- [ ] Any previous paper drafts

<EXTREMELY-IMPORTANT>The paper must be grounded in the wiki. Every claim must reference `[[papers/<slug>]]`, `[[concepts/<name>]]`, or `[[experiments/<name>]]` wikilinks. Do not make unsupported claims.</EXTREMELY-IMPORTANT>

### Step 2: Clarify

Ask the researcher about:
- [ ] Target venue (conference, journal, workshop)
- [ ] Target audience (specialists, general ML, interdisciplinary)
- [ ] Paper length (short, long, poster)
- [ ] Sections to include (abstract, intro, related work, methodology, experiments, results, discussion, conclusion)
- [ ] Any specific formatting requirements
- [ ] Whether this is a new draft or a revision of an existing one

### Step 3: Outline

Generate the paper outline using `paper-outline-template.md`:
- [ ] Each section has key points listed
- [ ] Each section references wiki pages via `[[wikilinks]]`
- [ ] Citation plan is included
- [ ] The outline covers all required sections for the target venue
- [ ] The logical flow is clear: problem → gap → approach → experiments → results → conclusion

Save the outline and present it to the researcher for approval before drafting.

### Step 4: Draft

Write the paper section by section, pulling content from wiki artifacts:
- [ ] Each section is grounded in wiki content
- [ ] Citations use `[[papers/<slug>]]` wikilink format during drafting
- [ ] Claims are backed by evidence from experiment reports or literature
- [ ] The narrative flows logically from section to section
- [ ] Figures and tables are sketched or described where needed

### Step 5: Review

Present the draft to the researcher for feedback:
- [ ] Ask about overall quality and clarity
- [ ] Ask about missing sections or content
- [ ] Ask about argumentation strength
- [ ] Ask about whether citations are properly represented
- [ ] Note any sections that feel weak or incomplete

### Step 6: Revise

Iterate based on the researcher's feedback:
- [ ] Address all feedback points
- [ ] Re-read relevant wiki pages to fill gaps
- [ ] Strengthen weak arguments with additional evidence
- [ ] Improve clarity and flow
- [ ] Ensure all `[[wikilinks]]` are still accurate after revisions

### Step 7: Save

Write the paper draft project root (`.research/drafts/<name>.md`) or custom path as specified by the researcher:

- [ ] Save the paper file
- [ ] Update the research plan with a link to the paper draft

<EXTREMELY-IMPORTANT>Always write a handoff report to `.research/handoff/YY-MM-DD-write-<agent-name>.md` before ending the session.</EXTREMELY-IMPORTANT>

## Red Flags

| Red Flag | Why It Matters |
|----------|---------------|
| No research plan in wiki | Paper lacks a foundation; invoke `pilot-research:pilot-brainstorm` |
| No experiment reports | Paper has no results; invoke `pilot-research:pilot-execute` |
| No literature in wiki | Paper lacks citations and related work; invoke `pilot-research:pilot-literature` |
| Claims without wikilinks | Unsupported claims damage credibility |
| Skipping the outline step | Leads to a disorganized paper with poor flow |
| Not grounding claims in wiki content | Introduces hallucinations and inaccuracies |

## Common Rationalizations

| Rationalization | Reality |
|-----------------|---------|
| "I'll write it from memory" | Use the wiki. It has verified, organized content. Writing from memory introduces errors. |
| "The outline doesn't matter" | A good outline prevents structural problems that are hard to fix later. |
| "I can skip the related work section" | Every paper needs positioning relative to existing work. |
| "Citations can be added later" | Track citations as you write. Adding them later is error-prone and time-consuming. |

## Transitioning to Other Skills

After completing the paper draft:
- If researcher wants feedback → invoke `pilot-research:pilot-peer-review`
- If more experiments are needed → invoke `pilot-research:pilot-execute`
- If more literature is needed → invoke `pilot-research:pilot-literature`

## Templates

- `paper-outline-template.md` — For structuring the paper outline before drafting
