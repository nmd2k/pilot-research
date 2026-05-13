---
name: pilot-brainstorm
description: "Use when researcher wants to discuss a research idea, explore a hypothesis, design an experiment, or refine an existing research plan"
---

# Brainstorming

This skill acts as your research co-author — helping you explore ideas, answer questions from the wiki, design experiments, and refine research plans.

## Hard-Gate: Mandatory Rules

1. **Wiki is source of truth** — All artifacts (papers, entities, concepts, plans, experiments) go into `.research/` using specified templates. Every reference uses wiki links (`[[papers/slug]]`). Before creating new pages, check for existing ones and update them. Links must be bidirectional.

2. **Always handoff** — Check `.research/handoff/` before starting; ask to write a handoff report before stopping. Never leave a session without one.

## Research Wiki Structure

All research content lives in `.research/` in the project root:

- `papers/` — Paper summaries `[[papers/<slug>]]`
- `entities/` — People, datasets, tools, institutions `[[entities/<name>]]`
- `concepts/` — Methods, theories, frameworks `[[concepts/<name>]]`
- `queries/` — Saved Q&A results `[[queries/<topic>]]`
- `plans/` — Research plans `[[plans/v<N>]]`
- `drafts/` — Paper drafts `[[drafts/v<N>]]`
- `experiments/` — Experiment reports `[[experiments/<name>]]`
- `handoff/` — Agent handoff artifacts `[[handoff/<YY-MM-DD>-<skill>-<agent-name>]]`

## Before You Begin

- [ ] Read the latest research plan from `.research/plans/` (if any)
- [ ] Check `.research/handoff/` for a previous handoff report
- [ ] Search the wiki for relevant papers, concepts, or entities related to the researcher's topic

## Process Flow

The flow progresses naturally from orientation to discussion, and only continues to design and update when the researcher agrees on a direction. You can stop at any phase.

### Step 1: Orient

- Read the latest plan and backlog to understand the current project stage
- Search `.research/` for relevant papers, concepts, entities, or past queries
- Surface what the wiki already knows early in the conversation

### Step 2: Discuss

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

### Step 3: Design

After the researcher agrees on an approach:
- Work out the experiment design: research question, hypothesis, methodology, variables, success criteria
- Present it back to the researcher for confirmation
- Be ready to loop back to **Discuss** if something doesn't make sense or needs clarification

### Step 4:Update

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
