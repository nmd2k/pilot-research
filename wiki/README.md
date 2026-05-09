---
type: index
title: "Research Wiki"
date: 2025-01-01
tags: [wiki, index]
---

# Research Wiki

Welcome to the research wiki. This is a structured knowledge graph for your research project, stored entirely in markdown with `[[wikilinks]]` for cross-referencing. It works with Obsidian, VSCode wiki extensions, or plain git.

## Folder Structure

| Folder | Purpose | Artifact type |
|--------|---------|---------------|
| `papers/` | Paper summaries and reviews | `[[paper-<slug>]]` |
| `entities/` | People, datasets, tools, institutions | `[[entity-<name>]]` |
| `concepts/` | Methods, theories, frameworks | `[[concept-<name>]]` |
| `queries/` | Saved Q&A results | `[[query-<topic>]]` |
| `plans/` | Research plans | `[[plan-v<N>]]` |
| `experiments/` | Experiment reports | `[[exp-<name>]]` |
| `handoff/` | Agent handoff artifacts | `[[handoff-<YYYY-MM-DD>]]` |

## Naming Conventions

| Type | Filename pattern | Wikilink pattern |
|------|-----------------|------------------|
| Paper | `papers/<arxiv-id-or-slug>.md` | `[[paper-<slug>]]` |
| Entity | `entities/<name>.md` | `[[entity-<name>]]` |
| Concept | `concepts/<name>.md` | `[[concept-<name>]]` |
| Query | `queries/<topic>.md` | `[[query-<topic>]]` |
| Plan | `plans/v<N>.md` | `[[plan-v<N>]]` |
| Experiment | `experiments/<name>.md` | `[[exp-<name>]]` |
| Handoff | `handoff/<YYYY-MM-DD>.md` | `[[handoff-<YYYY-MM-DD>]]` |

## Wikilink Rules

- Use `[[wikilink]]` syntax to connect pages
- Every mention of a paper, entity, or concept MUST link to its wiki page
- When ingesting a new paper, check existing entities and concepts and update them with new information
- Wikilinks are bidirectional — if page A links to page B, page B should list page A in its backlinks section

## YAML Frontmatter Convention

Every wiki page MUST include YAML frontmatter:

```yaml
---
type: paper | entity | concept | query | plan | experiment | handoff
title: "Full Title"
date: YYYY-MM-DD
tags: [tag1, tag2]
---
```

Additional frontmatter fields are defined per template in the corresponding skill directory.

## Navigation

Common entry points:

- **Start here**: Read the latest research plan in `plans/`
- **Resume work**: Read the latest handoff report in `handoff/`
- **Find papers**: Browse `papers/` or search by tag
- **Explore concepts**: Browse `concepts/` for methods and theories
- **Check entities**: Browse `entities/` for people, datasets, and tools