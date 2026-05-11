---
name: pilot-write-paper
description: "Use when researcher wants to draft, outline, or revise a research paper"
---

# Write Paper

This skill guides paper drafting, from outline to complete draft, pulling content from the research wiki.

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
- [ ] Read the latest research plan from `.research/plans/v<N>.md`
- [ ] Read relevant paper summaries from `.research/papers/`
- [ ] Read experiment reports from `.research/experiments/`

<EXTREMELY-IMPORTANT>You cannot write a paper without a research plan and supporting content. If the wiki is empty, invoke `pilot-research:pilot-literature` or `pilot-research:pilot-brainstorm` first.</EXTREMELY-IMPORTANT>

## Process Flow

### Step 1: Read Context

Gather all relevant research artifacts from the wiki:
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

<EXTREMELY-IMPORTANT>Do not start writing sections before the researcher approves the outline. The outline ensures the paper has a coherent structure.</EXTREMELY-IMPORTANT>

### Step 4: Draft

Write the paper section by section, pulling content from wiki artifacts:
- [ ] Each section is grounded in wiki content
- [ ] Citations use `[[papers/<slug>]]` wikilink format during drafting
- [ ] Claims are backed by evidence from experiment reports or literature
- [ ] The narrative flows logically from section to section
- [ ] Figures and tables are sketched or described where needed

<EXTREMELY-IMPORTANT>Write with the wiki open. Every fact, claim, or result should trace back to a `[[wikilink]]`. This ensures accuracy and traceability.</EXTREMELY-IMPORTANT>

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

Write the paper draft to the wiki or project root as specified by the researcher:
- [ ] Save the paper file
- [ ] Convert `[[papers/<slug>]]` wikilinks to proper citation format (APA, IEEE, etc.) as requested
- [ ] Save a reference copy in the wiki for traceability
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
