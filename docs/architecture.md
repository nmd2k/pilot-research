# Architecture

## Overview

Pilot Research is a skill-based toolset for AI coding agents (opencode, Claude Code, Cursor, Codex) that provides structured research workflows. Researchers install skills into their agent, which then guide the agent through brainstorming, literature review, experiment execution, paper writing, and peer review.

The system has five layers:

| Layer | Responsibility |
|-------|---------------|
| **Skills** | Define agent behavior per command. Self-contained markdown prompts. |
| **Research Wiki** | Markdown-based knowledge graph stored in the project directory. |
| **Platform Adapters** | Announcement injection + plugin manifests per agent platform. |
| **CLI (`pilot`)** | Unified command-line tool for init, status, and dashboard. |
| **Dashboard** | Local web UI for browsing, searching, and visualizing the research wiki. |

---

## Project Structure

```
pilot-research/
├── skills/
│   ├── pilot-brainstorm/
│   │   ├── SKILL.md
│   │   ├── research-plan-template.md
│   │   └── backlog-template.md
│   ├── pilot-literature/
│   │   ├── SKILL.md
│   │   ├── paper-summary-template.md
│   │   ├── entity-template.md
│   │   ├── concept-template.md
│   │   └── query-result-template.md
│   ├── pilot-execute/
│   │   ├── SKILL.md
│   │   ├── leader-prompt.md
│   │   ├── worker-prompt.md
│   │   ├── experiment-design-template.md
│   │   ├── experiment-report-template.md
│   │   └── handoff-report-template.md
│   ├── pilot-write-paper/
│   │   ├── SKILL.md
│   │   └── paper-outline-template.md
│   ├── pilot-peer-review/
│   │   ├── SKILL.md
│   │   └── review-rubric.md
│   └── using-pilot-research/
│       ├── SKILL.md
│       └── references/
│           ├── research-wiki-spec.md
│           └── arxiv-tools.md
│
├── cli/                             # Pilot CLI (Node.js)
│   ├── pilot.mjs                    # Entry point
│   └── ...                          # Commands: init, ingest, query, status, dashboard

├── dashboard/                       # Web dashboard SPA
│   ├── src/                         # Frontend (React/Vue/Svelte)
│   └── dist/                        # Built static assets (embedded in CLI binary)
│
├── install.sh                       # One-line curl|bash installer
├── install.ps1                      # Windows PowerShell installer
│
├── wiki/                            # Default wiki structure (copied by `pilot init`)
│
├── .opencode/
│   └── plugins/
│       └── pilot-research.js
│
├── .claude-plugin/
│   └── plugin.json
│
├── hooks/
│   ├── hooks.json
│   └── session-start
│
├── tests/
│   ├── pilot-brainstorm/
│   ├── pilot-literature/
│   ├── pilot-execute/
│   ├── pilot-write-paper/
│   ├── pilot-peer-review/
│   ├── skill-triggering/
│   └── cli/                         # CLI command tests
│
├── docs/
│   ├── architecture.md
│   ├── backlog.md
│   └── skills-design.md
│
├── AGENTS.md
├── CLAUDE.md
├── README.md
└── package.json
```

---

## Design Decisions

### D1: Self-contained skills

Each skill directory contains its own SKILL.md plus all templates and reference files it needs. No shared `templates/` directory. This makes skills portable — you can add or remove a skill without breaking others.

### D2: Pure markdown wiki

The research wiki is pure markdown with `[[wikilinks]]` and YAML frontmatter. No database, no lock-in. Compatible with Obsidian, VSCode (with wiki extensions), and plain git.

### D3: Announcement pattern

`using-pilot-research/SKILL.md` is injected at session start as a lightweight announcement (~200-300 tokens) that lists available skills and their trigger conditions. It does NOT inject mandatory rules or wiki structure — those are embedded directly into each individual skill's SKILL.md. Agents discover skills through this announcement, then load the relevant skill on demand.

### D4: Platform-agnostic skills, platform-specific adapters

Skills are pure markdown. Each platform gets:
- A config/manifest file (`.claude-plugin/plugin.json`, `.opencode/plugins/pilot-research.js`)
- A session-start hook that injects the announcement
- The same `skills/` directory is shared across all platforms

### D5: Agent-native external tools

ArXiv search and paper reading use each agent platform's built-in capabilities (web search, web fetch). Pilot Research no longer bundles Python scripts for ArXiv querying or PDF extraction — these were redundant since modern agents have native web access.

### D6: Default wiki location is `.research/` in working directory

`init-wiki.sh` asks the user for a custom path. Default is `./.research/` (hidden). The script auto-appends the chosen path to `.gitignore` unless the user opts out.

### D7: Agent handoff via markdown artifacts

When an agent finishes, it writes a handoff report into `research/handoff/`. The next agent reads the latest handoff to resume context. No external state, no coordination service — just files.

### D8: CLI-first UX with `pilot`

A single CLI binary (`pilot`) provides all user-facing commands: `pilot init`, `pilot status`, `pilot dashboard`. This replaces scattered shell scripts and gives users a unified entry point. The CLI is distributable via a one-line curl installer and also as an npm package.

### D9: One-line installer inspired by caveman

`curl -fsSL https://raw.githubusercontent.com/OWNER/pilot-research/main/install.sh | bash` detects installed AI coding agents and installs pilot-research for each one using that agent's native mechanism. It also optionally installs the `pilot` CLI binary. Idempotent, safe to re-run, and supports `--dry-run`, `--only <agent>`, and `--minimal` flags.

### D10: Dashboard as local web UI

The dashboard is a static SPA served by `pilot dashboard`. The CLI binary embeds a tiny HTTP server that parses the `.research/` wiki and serves it as JSON. The frontend fetches this JSON and renders paper view, graph view, backlog view, and search. No external database or cloud service.

---

## Research Wiki Conventions

### Folder Structure

```
.research/
├── README.md              # Index, conventions, navigation
├── papers/                # Paper summaries [[papers/<slug>]]
├── entities/              # People, datasets, tools, institutions [[entities/<name>]]
├── concepts/              # Methods, theories, frameworks [[concepts/<name>]]
├── queries/               # Saved Q&A results [[queries/<topic>]]
├── plans/                 # Research plans [[plans/v<N>]]
├── experiments/           # Experiment reports [[experiments/<name>]]
└── handoff/               # Agent handoff artifacts [[handoff/<YYYY-MM-DD>]]
```

### Naming Conventions

| Type | Filename pattern | Wikilink pattern |
|------|----------------|-----------------|
| Paper | `papers/<arxiv-id-or-slug>.md` | `[[papers/<slug>]]` |
| Entity | `entities/<name>.md` | `[[entities/<name>]]` |
| Concept | `concepts/<name>.md` | `[[concepts/<name>]]` |
| Query | `queries/<topic>.md` | `[[queries/<topic>]]` |
| Plan | `plans/v<N>.md` | `[[plans/v<N>]]` |
| Experiment | `experiments/<name>.md` | `[[experiments/<name>]]` |
| Handoff | `handoff/<YYYY-MM-DD>.md` | `[[handoff/<YYYY-MM-DD>]]` |

### Wikilink Rules

- Use `[[wikilink]]` syntax to connect pages
- Every page that mentions a paper, concept, or entity MUST link to it
- When a new paper is ingested, the agent MUST check existing entities/concepts and update them with new information
- Wikilinks are bidirectional in spirit — when page A links to page B, page B should list page A in its backlinks section

### YAML Frontmatter

Every wiki page uses YAML frontmatter:

```yaml
---
type: paper | entity | concept | query | plan | experiment | handoff
title: "Full Title"
date: YYYY-MM-DD
tags: [tag1, tag2]
status: draft | in-progress | complete
---
```

Additional frontmatter fields are defined per template.

---

## Wiki Ingestion & Querying

### Ingestion Rules

When adding content to the wiki, agents follow these rules (embedded in each skill's SKILL.md):

1. **Search before create** — Always scan the relevant wiki folder for existing pages before creating a new one. Update existing pages rather than creating duplicates.
2. **Use the correct template** — Each page type has a template in its skill directory. Always scaffold from the template.
3. **Update backlinks** — After creating a page, update all pages that reference it to include the new `[[wikilink]]`.
4. **Follow naming conventions** — Papers use `papers/<arxiv-id-or-slug>.md`, entities use `entities/<name>.md`, etc.

### Query Rules

When searching the wiki, agents follow these rules (embedded in each skill's SKILL.md):

1. **Scan by type** — List files in the relevant folder first (e.g., `papers/` for paper searches).
2. **Check frontmatter** — Use YAML frontmatter fields (title, tags, status) for structured queries.
3. **Follow wikilinks** — When reading a page, follow all `[[wikilinks]]` to related pages for full context.
4. **Synthesize from sources** — When answering a question, read all relevant pages and synthesize. Cite sources via wikilinks.

---

## Agent Handoff Protocol

### When to handoff

An agent MUST write a handoff report when:
- The session is ending but work remains
- A skill completes and needs to pass context to another skill
- A sub-agent finishes its assigned task

### Handoff structure

The handoff report follows `pilot-execute/handoff-report-template.md`:

The next agent reads the latest handoff in `.research/handoff/` sorted by date.

1. **What was done** — completed tasks
2. **What was left undone** — pending tasks
3. **Commands run** — table of command, exit code, notes
4. **Issues discovered** — bugs, blockers, concerns
5. **Key decisions** — and why
6. **Artifacts produced** — wikilinks to created pages
7. **Suggested next steps** — for the next agent

### How to resume

The `using-pilot-research` announcement instructs agents to check `.research/handoff/` before starting any new work.

---

## Platform Integration

### OpenCode

- Plugin: `.opencode/plugins/pilot-research.js`
- Injects `using-pilot-research/SKILL.md` announcement at session start
- Registers skill paths so the `skill` tool can discover all skills
- Skills are invoked via OpenCode's native `skill` tool

### Claude Code

- Plugin: `.claude-plugin/plugin.json`
- Hook: `hooks/session-start` injects announcement at session start
- Skills are invoked via Claude Code's `Skill` tool

### Cursor (future)

- Plugin: `.cursor-plugin/plugin.json`
- Will follow same pattern as superpowers' Cursor adapter

### Codex (future)

- Plugin: `.codex-plugin/plugin.json`
- Will follow same pattern as superpowers' Codex adapter

---

## CLI Reference (`pilot`)

The `pilot` CLI provides a unified interface for all pilot-research operations:

| Command | Description |
|---------|-------------|
| `pilot init [path]` | Initialize a research wiki at `[path]` (default: `./.research/`) |
| `pilot ingest <type> <name>` | Create a new wiki page from the appropriate template |
| `pilot query <search-terms>` | Search the wiki for pages matching terms |
| `pilot status` | Print wiki overview (page counts, latest handoff, backlog summary) |
| `pilot dashboard [--launch]` | Start or check status of the research dashboard |
| `pilot --version` | Print version |
| `pilot --help` | Print help |

Configuration: `~/.pilot-research/config.toml` or `.pilot-research.toml` in project root.

---

## Dashboard Architecture

The dashboard is a local web UI for browsing and visualizing the research wiki, built as a React + Vite + Tailwind CSS SPA:

- **Paper List** — Toggle-able card list of paper summaries with metadata (authors, date, category, link). Click to expand/collapse summary. Click "Full Document" for full detail view with backlinks.
- **Kanban Board** — 4-column task board (Open, Pending, Done, Archive) with split-screen markdown editor. Click a task card to split the view and edit task content in a markdown editor on the right.
- **Knowledge Graph** — Interactive node-link graph where nodes are wiki pages (colored by type) and edges are `[[wikilinks]]`. Click a node to split the screen and view/edit its content.
- **Artifact Finder** — IDE-like view with a directory tree sidebar (right), content viewer (center), and multi-tab support. Click files in the tree to open them as tabs in the viewer.

The dashboard is served by `pilot dashboard` which starts a local HTTP server (default: `http://localhost:4213`). The CLI parses wiki markdown files and serves them as JSON via a REST API. The React frontend is built with Vite and the output is served as static assets by the embedded server.