# Pilot Research

Skill-based research workflows for AI coding agents. Structured processes for brainstorming, literature review, experiment execution, paper writing, and peer review — all stored as pure markdown with `[[wikilinks]]`.

## Skills

| Skill | Description |
|-------|-------------|
| `brainstorming` | Socratic research plan discussion |
| `literature-review` | ArXiv search, paper summarization, wiki building |
| `execute-research` | Lead research execution with sub-agent workers |
| `write-paper` | Draft papers from plans, reviews, and experiment results |
| `peer-review` | Quality control for research artifacts |
| `using-pilot-research` | Bootstrap skill for new users |

## Research Wiki

All artifacts live in a pure markdown wiki (default: `.research/` in your project directory). Compatible with Obsidian, VSCode, and git.

```
.research/
├── papers/          # Paper summaries [[paper-<slug>]]
├── entities/        # People, datasets, tools [[entity-<name>]]
├── concepts/        # Methods, theories, frameworks [[concept-<name>]]
├── queries/         # Saved Q&A results [[query-<topic>]]
├── plans/           # Research plans [[plan-v<N>]]
├── experiments/     # Experiment reports [[exp-<name>]]
└── handoff/         # Agent handoff artifacts [[handoff-<YYYY-MM-DD>]]
```

## Installation

### One-line install
**MacOS/Linux/WSL:**
```bash
curl -fsSL https://raw.githubusercontent.com/OWNER/pilot-research/main/install.sh | bash
```

Window
```powershell
irm https://raw.githubusercontent.com/OWNER/pilot-research/main/install.ps1 | iex
```

### Install flags

| Flag | Description |
|------|-------------|
| `--dry-run` | Print what would run, do nothing |
| `--force` | Re-install even if already present |
| `--only <agent>` | Install only for a specific agent |
| `--minimal` | Plugins only, no hooks or rule files |
| `--all` | Also write per-repo IDE rule files |
| `--list` | Print supported agents and exit |

### Per-agent manual install

#### Claude Code

```bash
claude plugin add pilot-research
```

#### OpenCode

Copy `.opencode/plugins/pilot-research.js` and `skills/` into your project's `.opencode/` directory.

#### Cursor

Copy the content of `.cursor/rules/pilot-research.mdc` into your project's `.cursor/rules/`.

#### Windsurf

Copy the content of `.windsurf/rules/pilot-research.md` into your project's `.windsurf/rules/`.

#### Cline

Copy the content of `.clinerules/pilot-research.md` into your project's `.clinerules/`.

#### GitHub Copilot

Copy the content of `.github/copilot-instructions.md` into your project's `.github/`.

## CLI: `pilot`

The `pilot` CLI manages your research wiki from the terminal.

```bash
npm install -g pilot-research
# or run directly:
node cli/pilot.mjs --help
```

### Commands

| Command | Description |
|---------|-------------|
| `pilot init [path]` | Initialize a research wiki (default: `./.research/`) |
| `pilot ingest <type> <name>` | Create a new wiki page from a template |
| `pilot query <terms...>` | Search the wiki for pages matching terms |
| `pilot status` | Print wiki overview and statistics |
| `pilot dashboard [--launch] [--port <port>]` | Start the research dashboard web UI |

### Ingest types

| Type | Directory | Naming |
|------|-----------|--------|
| `paper` | `papers/` | `paper-<slug>` |
| `entity` | `entities/` | `entity-<name>` |
| `concept` | `concepts/` | `concept-<name>` |
| `query` | `queries/` | `query-<topic>` |
| `plan` | `plans/` | `plan-v<N>` |
| `experiment` | `experiments/` | `exp-<name>` |

### Configuration

Create `.pilot-research.toml` in your project root:

```toml
wiki_path = ".research"
```

The CLI also detects the wiki by walking up parent directories looking for `.research/`.

### Examples

```bash
pilot init                         # Initialize wiki at ./.research/
pilot init ./my-research            # Initialize wiki at custom path
pilot ingest paper attention-is-all-you-need
pilot ingest plan v1
pilot ingest concept transformer-architecture
pilot query attention mechanism     # Search wiki for matching pages
pilot status                        # Show wiki statistics
```

> **Note:** `scripts/init-wiki.sh` is deprecated. Use `pilot init` instead.

## Dashboard

Launch a local web dashboard to browse, search, and visualize your research wiki.

```bash
pilot dashboard                # Start server at http://localhost:4213
pilot dashboard --launch       # Start server and open browser
pilot dashboard --port 8080    # Use a custom port
```

### Features

- **Overview** — Page counts by type, latest handoff date, recent pages
- **Page Detail** — Full markdown rendering with `[[wikilink]]` navigation and backlinks
- **Graph View** — Force-directed knowledge graph. Nodes colored by type (paper=blue, entity=green, concept=orange, etc.). Click to navigate
- **Search** — Full-text search across all wiki pages with type filtering
- **Backlog** — Kanban-style view (todo / in-progress / done) pulling from experiment statuses
- **Timeline** — Chronological handoff reports showing agent session history

### API Endpoints

The dashboard server exposes a REST API at `http://localhost:4213/api/`:

| Endpoint | Description |
|----------|-------------|
| `GET /api/pages` | List all pages with type, title, tags, wikilinks |
| `GET /api/page/:path` | Full page content + parsed frontmatter |
| `GET /api/graph` | Wikilink graph as nodes + edges |
| `GET /api/search?q=...` | Full-text search |
| `GET /api/stats` | Page counts, latest handoff, backlog summary |

## Documentation

- [Architecture](docs/architecture.md) — Project structure, design decisions, wiki conventions
- [Backlog](docs/backlog.md) — Phased implementation plan
- [Skills Design](docs/skills-design.md) — Per-skill breakdown, templates, process flows

## Contributing

See [AGENTS.md](AGENTS.md) for contribution guidelines.

## License

MIT
