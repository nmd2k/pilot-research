---
name: pilot-brainstorm
description: "Use when researcher wants to discuss a research idea, explore a hypothesis, design an experiment, or refine an existing research plan"
---

# Brainstorming

This skill acts as your research co-author — helping you explore ideas, answer questions from the wiki, design experiments, and refine research plans.

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

- `papers/` — Paper summaries `[[papers/<slug>]]`
- `entities/` — People, datasets, tools, institutions `[[entities/<name>]]`
- `concepts/` — Methods, theories, frameworks `[[concepts/<name>]]`
- `queries/` — Saved Q&A results `[[queries/<topic>]]`
- `plans/` — Research plans `[[plans/v<N>]]`
- `experiments/` — Experiment reports `[[experiments/<name>]]`
- `handoff/` — Agent handoff artifacts `[[handoff/<YY-MM-DD>-<skill>-<agent-name>]]`

## Before You Begin

- [ ] Read the latest research plan from `.research/plans/` (if any)
- [ ] Check `.research/handoff/` for a previous handoff report
- [ ] Search the wiki for relevant papers, concepts, or entities related to the researcher's topic

## Process Flow

The flow progresses naturally from orientation to discussion, and only continues to design and update when the researcher agrees on a direction. You can stop at any phase.

### 1. Orient

- Read the latest plan and backlog to understand the current project stage
- Search `.research/` for relevant papers, concepts, entities, or past queries
- Surface what the wiki already knows early in the conversation

### 2. Discuss

**If the researcher is asking a question or exploring a concept:**
- Answer from the wiki first, with reasoning and recommendations
- Ground answers in wiki pages and use `[[wikilinks]]` when citing
- If the wiki lacks evidence, say so and ask before searching the web
- After answering, ask: *"Do you want to add this into our wiki?"*
- **Stop here** unless the researcher wants to go deeper

**If the researcher wants to brainstorm or explore a research direction:**
- Propose 2-3 different approaches with clear trade-offs (pros, cons, assumptions, risks)
- Lead with your recommended approach and explain why
- Help the researcher evaluate options by surfacing trade-offs — don't interrogate their ideas
- Connect to existing literature via `[[wikilinks]]`

### 3. Design

After the researcher agrees on an approach:
- Work out the experiment design: research question, hypothesis, methodology, variables, success criteria
- Present it back to the researcher for confirmation
- Be ready to loop back to **Discuss** if something doesn't make sense or needs clarification

### 4. Update

Once you and the researcher reach agreement:
- Write or update the research plan in `.research/plans/v<N>.md` (never overwrite — increment version)
- Write or update the backlog with agreed tasks (T1, T2...), each with clear dependencies
- Link to relevant wiki pages with `[[wikilinks]]`
- Update existing entity/concept pages if the plan introduces new connections

## Transitioning to Other Skills

After completing brainstorming:
- If the researcher needs supporting papers → invoke `pilot-research:pilot-literature`
- If the researcher is ready to execute tasks → invoke `pilot-research:pilot-execute`
- If the researcher wants feedback on the plan → invoke `pilot-research:pilot-peer-review`

<EXTREMELY-IMPORTANT>Before ending the session or transitioning to another skill, ask the researcher whether they want a handoff report in `.research/handoff/YY-MM-DD-brainstorm-<agent-name>.md`.</EXTREMELY-IMPORTANT>

## Templates

- `research-plan-template.md` — For creating research plans
- `backlog-template.md` — For creating task backlogs
