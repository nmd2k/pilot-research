---
name: using-pilot-research
description: "Use when starting a new research session or when no other skill is clearly applicable and the context involves research planning, literature, experiments, or writing"
---

# Using Pilot Research

You are now operating with the **pilot-research** skill system. This skill is injected at session start and provides the mandatory rules, skill registry, and wiki conventions for all research workflows.

## <HARD-GATE>Mandatory Rules</HARD-GATE>

These rules apply to every session, every skill, and every action. Violating any of these blocks progress.

1. **Always use the wiki** — <EXTREMELY-IMPORTANT>All research artifacts (plans, papers, entities, concepts, experiment reports) go into the `.research/` wiki directory using the specified templates and naming conventions. Never store research content outside the wiki.</EXTREMELY-IMPORTANT>

2. **Always check for handoff** — <EXTREMELY-IMPORTANT>Before starting any work, check `.research/handoff/` for the latest handoff report. If one exists, read it and resume from where the previous agent left off. Do not start from scratch.</EXTREMELY-IMPORTANT>

3. **Always handoff before stopping** — <EXTREMELY-IMPORTANT>When the session ends or you complete a skill, write a handoff report to `.research/handoff/YYYY-MM-DD.md` using the handoff report template. Never leave a session without a handoff.</EXTREMELY-IMPORTANT>

4. **Always use `[[wikilinks]]`** — <EXTREMELY-IMPORTANT>When mentioning any paper, entity, concept, plan, or experiment, link to its wiki page using the `[[type-slug]]` pattern. Every reference must be a wikilink, not plain text.</EXTREMELY-IMPORTANT>

5. **Always update existing pages** — <EXTREMELY-IMPORTANT>When ingesting new information, check if related entity/concept/paper pages already exist in the wiki. Update them rather than creating duplicates. Search before creating.</EXTREMELY-IMPORTANT>

6. **Always ask before executing** — <EXTREMELY-IMPORTANT>Before running scripts, making significant changes, or taking irreversible actions, confirm with the researcher. Never execute without explicit approval.</EXTREMELY-IMPORTANT>

## Skill Registry

When a researcher's request matches a trigger condition, invoke the corresponding skill:

| Skill | Trigger Condition | Invocation |
|-------|-------------------|------------|
| `brainstorming` | Researcher wants to discuss, explore, or refine a research idea, plan, or experiment design | `pilot-research:brainstorming` |
| `literature-review` | Researcher wants to find, read, or summarize papers, or build/update the research wiki | `pilot-research:literature-review` |
| `execute-research` | Researcher wants to execute tasks from the backlog, run experiments, or manage the research process | `pilot-research:execute-research` |
| `write-paper` | Researcher wants to draft, outline, or revise a research paper | `pilot-research:write-paper` |
| `peer-review` | Researcher wants feedback on research plan, literature review, experiment design, or paper draft | `pilot-research:peer-review` |

## Research Wiki Structure

All research content lives in `.research/` in the project root:

```
.research/
├── README.md              # Index, conventions, navigation
├── papers/                # Paper summaries [[paper-<slug>]]
├── entities/              # People, datasets, tools, institutions [[entity-<name>]]
├── concepts/              # Methods, theories, frameworks [[concept-<name>]]
├── queries/               # Saved Q&A results [[query-<topic>]]
├── plans/                 # Research plans [[plan-v<N>]]
├── experiments/           # Experiment reports [[exp-<name>]]
└── handoff/               # Agent handoff artifacts [[handoff-<YYYY-MM-DD>]]
```

### Wikilink Patterns

| Type | Filename pattern | Wikilink |
|------|-----------------|----------|
| Paper | `papers/<arxiv-id-or-slug>.md` | `[[paper-<slug>]]` |
| Entity | `entities/<name>.md` | `[[entity-<name>]]` |
| Concept | `concepts/<name>.md` | `[[concept-<name>]]` |
| Query | `queries/<topic>.md` | `[[query-<topic>]]` |
| Plan | `plans/v<N>.md` | `[[plan-v<N>]]` |
| Experiment | `experiments/<name>.md` | `[[exp-<name>]]` |
| Handoff | `handoff/<YYYY-MM-DD>.md` | `[[handoff-<YYYY-MM-DD>]]` |

## Session Start Checklist

Before doing any research work, complete this checklist:

- [ ] Check `.research/handoff/` for the latest handoff report
- [ ] If handoff exists, read it and understand the current state
- [ ] Read `.research/plans/` for the latest research plan
- [ ] Determine which skill the researcher needs based on the skill registry above
- [ ] Invoke the appropriate skill

## References

- `references/research-wiki-spec.md` — Wiki structure, naming conventions, wikilink rules
- `references/arxiv-tools.md` — How to use ArXiv query and PDF extraction scripts

## Skill Directories

Each skill is self-contained in its own directory with SKILL.md and all required templates:

- `skills/brainstorming/` — Research ideation and planning
- `skills/literature-review/` — Paper search and knowledge extraction
- `skills/execute-research/` — Experiment execution and task management
- `skills/write-paper/` — Paper drafting and revision
- `skills/peer-review/` — Quality review and feedback