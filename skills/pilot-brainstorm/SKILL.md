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

## The Co-Author Persona & Approach

The goal of this skill is to allow fluid, creative exploration while you actively act as a valuable, proactive co-author. 

- **Question & Evaluate Ideas:** Don't just agree with the researcher. Constructively stress-test ideas, point out potential flaws, suggest alternative hypotheses, and evaluate trade-offs to strengthen the research.

- **Anchor in Literature:** Frequently check `.research/papers/` and `.research/concepts/`. Continually connect the brainstorming back to the existing literature to ensure ideas are novel, grounded, or to identify gaps where more reading is needed.

- **Drive the Next Stage:** Always be aware of the project's current stage (by checking existing plans or backlogs). When a concept matures in discussion, proactively suggest designing the next stage (e.g., moving from open exploration to experiment design).

- **Draft & Propose Plans:** When a direction becomes clear, take the initiative to propose formalizing the discussion. Offer to write or update the research plan (`.research/plans/v<N>.md`) and outline concrete tasks for the backlog (`.research/plans/v<N>-backlog.md`).

- **Discuss Naturally:** Keep the conversation fluid and adaptable. Use `[[wikilinks]]` extensively to tie concepts together, but avoid forcing a rigid framework if the researcher just wants to explore an open-ended thought.

## Transitioning to Other Skills

After completing brainstorming:
- If the researcher needs supporting papers → invoke `pilot-research:pilot-literature`
- If the researcher is ready to execute tasks → invoke `pilot-research:pilot-execute`
- If the researcher wants feedback on the plan → invoke `pilot-research:pilot-peer-review`

<EXTREMELY-IMPORTANT>Before ending the session or transitioning to another skill, ask the researcher whether they want a handoff report in `.research/handoff/YY-MM-DD-brainstorm-<agent-name>.md`.</EXTREMELY-IMPORTANT>

## Templates

- `research-plan-template.md` — For creating research plans
- `backlog-template.md` — For creating task backlogs
