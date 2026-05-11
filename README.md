# Pilot Research

Skill-based research workflows for AI coding agents. Structured processes for brainstorm, literature review, auto research, write paper and peer review. 

## Skills


| Skill                  | Description                                              |
| ---------------------- | -------------------------------------------------------- |
| `pilot-brainstorm`     | Socratic research plan discussion                        |
| `pilot-literature`     | ArXiv search, paper summarization, wiki building         |
| `pilot-execute`        | Lead research execution with sub-agent workers           |
| `pilot-write-paper`    | Draft papers from plans, reviews, and experiment results |
| `pilot-peer-review`    | Quality control for research artifacts                   |
| `using-pilot-research` | Bootstrap skill for new users                            |


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
└── handoff/         # Agent handoff artifacts [[handoff-<YY-MM-DD>-<skill>-<agent-name>]]
```

## Installation

### One-line install

**MacOS/Linux/WSL:**

```bash
curl -fsSL https://raw.githubusercontent.com/nmd2k/pilot-research/main/install.sh | bash
```

**Windows:**

```powershell
irm https://raw.githubusercontent.com/nmd2k/pilot-research/main/install.ps1 | iex
```

### Install flags


| Flag             | Description                          |
| ---------------- | ------------------------------------ |
| `--dry-run`      | Print what would run, do nothing     |
| `--force`        | Re-install even if already present   |
| `--only <agent>` | Install only for a specific agent    |
| `--minimal`      | Plugins only, no hooks or rule files |
| `--all`          | Also write per-repo IDE rule files   |
| `--list`         | Print supported agents and exit      |


Run `./install.sh --help` for Unix/WSL flags; see `install.ps1` parameters for Windows (`-List`, `-Force`, `-Only`, …).

## CLI: `pilot`



### Commands


| Command                                      | Description                                          |
| -------------------------------------------- | ---------------------------------------------------- |
| `pilot init [path]`                          | Initialize a research wiki (default: `./.research/`) |
| `pilot status`                               | Print wiki overview and statistics                   |
| `pilot dashboard [--launch] [--port <port>]` | Start the research dashboard web UI                  |


### Configuration

Optional `.pilot-research.toml` in the project root:

```toml
wiki_path = ".research"
```

Without it, the CLI walks up from the current directory looking for `.research/`.

### Examples

```bash
pilot init
pilot init ./my-research
pilot status
pilot dashboard --launch
```

> **Note:** `scripts/init-wiki.sh` is deprecated. Use `pilot init` instead.

## Dashboard

Launch a local web dashboard to browse, search, and visualize your research wiki.

```bash
pilot dashboard                # Start server at http://localhost:4213
pilot dashboard --launch       # Start server and open browser
pilot dashboard --port 8080    # Use a custom port
```

### API Endpoints

The dashboard server exposes a REST API at `http://localhost:4213/api/`:


| Endpoint                | Description                                      |
| ----------------------- | ------------------------------------------------ |
| `GET /api/pages`        | List all pages with type, title, tags, wikilinks |
| `GET /api/page/:path`   | Full page content + parsed frontmatter           |
| `GET /api/graph`        | Wikilink graph as nodes + edges                  |
| `GET /api/search?q=...` | Full-text search                                 |
| `GET /api/stats`        | Page counts, latest handoff, backlog summary     |


## Uninstallation

To completely remove the CLI, plugins, global rules, and all pilot skills from your configured AI agents, run:

```bash
curl -fsSL https://raw.githubusercontent.com/nmd2k/pilot-research/main/install.sh | bash -s -- --uninstall
```

## Contributing

See [AGENTS.md](AGENTS.md) for contribution guidelines.

## License

MIT