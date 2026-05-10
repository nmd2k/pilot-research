# Research Wiki Specification

## Overview

The research wiki is a markdown-based knowledge graph using `[[wikilinks]]` and YAML frontmatter. It is stored in the project directory and is compatible with Obsidian, VSCode wiki extensions, and plain git.

## Folder Structure and Purpose

| Folder | Purpose | Artifact type | Wikilink pattern |
|--------|---------|---------------|------------------|
| `papers/` | Paper summaries and reviews | Paper | `[[paper-<slug>]]` |
| `entities/` | People, datasets, tools, institutions | Entity | `[[entity-<name>]]` |
| `concepts/` | Methods, theories, frameworks | Concept | `[[concept-<name>]]` |
| `queries/` | Saved Q&A results | Query | `[[query-<topic>]]` |
| `plans/` | Research plans | Plan | `[[plan-v<N>]]` |
| `experiments/` | Experiment reports | Experiment | `[[exp-<name>]]` |
| `handoff/` | Agent handoff artifacts | Handoff | `[[handoff-<YY-MM-DD>-<skill>-<agent-name>]]` |

## Naming Conventions

### Paper filenames

Use the ArXiv ID if available, otherwise a slug derived from the title:

- `papers/2310.12345.md` → `[[paper-2310-12345]]`
- `papers/attention-is-all-you-need.md` → `[[paper-attention-is-all-you-need]]`

### Entity filenames

Use a lowercase hyphenated name:

- `entities/vaswani-ashish.md` → `[[entity-vaswani-ashish]]`
- `entities/wmt14-dataset.md` → `[[entity-wmt14-dataset]]`

### Concept filenames

Use a lowercase hyphenated name:

- `concepts/self-attention.md` → `[[concept-self-attention]]`
- `concepts/beam-search.md` → `[[concept-beam-search]]`

### Query filenames

Use a lowercase hyphenated topic:

- `queries/transformer-variants.md` → `[[query-transformer-variants]]`

### Plan filenames

Use version numbers:

- `plans/v1.md` → `[[plan-v1]]`

### Experiment filenames

Use a lowercase hyphenated name:

- `experiments/lr-sweep-baseline.md` → `[[exp-lr-sweep-baseline]]`

### Handoff filenames

Use short date + skill + agent name:

- `handoff/26-05-10-execute-gsm8kexp.md` → `[[handoff-26-05-10-execute-gsm8kexp]]`

## Wikilink Syntax and Rules

### Syntax

Enclose a page reference in double brackets: `[[paper-attention-is-all-you-need]]`

### Rules

1. **Every mention must link**: When you mention a paper, entity, or concept in any wiki page, you MUST create a wikilink to it.
2. **New paper ingestion must update existing pages**: When a new paper is added, check all existing entity and concept pages for relevance and update them with new information from the paper.
3. **Bidirectional linking**: If page A links to page B, page B should list page A in its backlinks section.
4. **Consistent naming**: Always use the exact wikilink pattern defined in the naming conventions table.

## YAML Frontmatter Required Fields

Every wiki page MUST include YAML frontmatter. Required fields vary by type:

### Paper

```yaml
---
type: paper
title: "Full Paper Title"
date: YYYY-MM-DD
tags: [tag1, tag2]
arxiv_id: "XXXX.XXXXX"
authors: [Author One, Author Two]
year: YYYY
status: draft | complete
---
```

### Entity

```yaml
---
type: entity
title: "Entity Name"
date: YYYY-MM-DD
tags: [tag1, tag2]
entity_type: person | dataset | tool | institution
status: draft | complete
---
```

### Concept

```yaml
---
type: concept
title: "Concept Name"
date: YYYY-MM-DD
tags: [tag1, tag2]
concept_type: method | theory | framework
status: draft | complete
---
```

### Query

```yaml
---
type: query
title: "Query Topic"
date: YYYY-MM-DD
tags: [tag1, tag2]
status: complete
---
```

### Plan

```yaml
---
type: plan
title: "Research Plan v1"
date: YYYY-MM-DD
tags: [tag1, tag2]
version: N
status: draft | in-progress | complete
---
```

### Experiment

```yaml
---
type: experiment
title: "Experiment Name"
date: YYYY-MM-DD
tags: [tag1, tag2]
status: draft | in-progress | complete
---
```

### Handoff

```yaml
---
type: handoff
title: "Handoff YYYY-MM-DD"
date: YYYY-MM-DD
tags: [handoff]
agent: agent-name
skill: skill-name
status: complete
---
```

## How to Create a New Paper Summary

1. Run `arxiv-query.py` or obtain the paper details
2. Create `papers/<arxiv-id-or-slug>.md` with the paper type frontmatter
3. Fill in: title, authors, year, one-line summary, key contribution, methodology, results, relevance to current research
4. Add a connections section with wikilinks to related papers, entities, and concepts
5. Check existing entities and concepts — update any that are related to this paper
6. Create new entity pages for notable authors or datasets mentioned
7. Create new concept pages for novel methods or theories introduced

## How to Create or Update an Entity

### Creating a new entity

1. Create `entities/<name>.md` with the entity type frontmatter
2. Fill in: name, type (person/dataset/tool/institution), description, key contributions
3. Add related papers as wikilinks: `[[paper-<slug>]]`
4. Add related concepts as wikilinks: `[[concept-<name>]]`

### Updating an existing entity

When a new paper mentions an existing entity:

1. Open the entity page
2. Add the new paper to the related papers list
3. Update the description if the entity has evolved or new context is available
4. Ensure the new paper page also links back to this entity

## How to Create or Update a Concept

### Creating a new concept

1. Create `concepts/<name>.md` with the concept type frontmatter
2. Fill in: name, definition, how it works, strengths/limitations, applications
3. Add related papers as wikilinks
4. Add related entities as wikilinks
5. Add related concepts as wikilinks

### Updating an existing concept

When a new paper introduces information about an existing concept:

1. Open the concept page
2. Add the new paper to related papers
3. Update definition, strengths, limitations, or applications if warranted
4. Ensure the new paper page also links back to this concept

## How to Write a Handoff Report

When a session is ending and work remains:

1. Create `handoff/<YY-MM-DD>-<skill>-<agent-name>.md` with handoff type frontmatter
2. Document what was done (completed tasks with wikilinks to artifacts)
3. Document what was left undone (pending tasks)
4. List commands run with exit codes
5. Note issues discovered (bugs, blockers, concerns)
6. Record key decisions and reasoning
7. List artifacts produced (wikilinks)
8. Suggest next steps for the resuming agent

## How to Read a Handoff Report When Resuming

1. List all files in `handoff/` sorted by date
2. Read the most recent handoff report
3. Note what was left undone and suggested next steps
4. Check the status of artifacts mentioned (follow wikilinks)
5. Resume work from where the previous agent left off
6. Write a new handoff report when your session ends

## Backlink Convention

When page A links to page B using `[[pagename]]`, page B should include a backlinks section at the bottom:

```markdown
## Backlinks

- [[page-a]]
- [[page-c]]
```

This ensures the knowledge graph is navigable in both directions. Always check for existing backlink sections and append to them rather than replacing.