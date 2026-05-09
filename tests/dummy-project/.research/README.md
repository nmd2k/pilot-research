---
type: index
title: "Test Wiki: LLM Reasoning on Math Tasks"
date: 2025-01-15
tags: [wiki, index, test]
---

# Research Wiki: Testing LLM Reasoning on Math Tasks

This is a test wiki for the research project **"Testing LLM Reasoning on Math Tasks"**. It verifies that the pilot-research skills work end-to-end by providing realistic, interconnected content across all wiki artifact types.

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

## Navigation

Common entry points:

- **Start here**: Read the latest research plan in `plans/`
- **Resume work**: Read the latest handoff report in `handoff/`
- **Find papers**: Browse `papers/` or search by tag
- **Explore concepts**: Browse `concepts/` for methods and theories
- **Check entities**: Browse `entities/` for people, datasets, and tools