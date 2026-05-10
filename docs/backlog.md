# Backlog

## Overview

| Phase | Scope | Status |
|-------|-------|--------|
| P1 | Core skills (bootstrap + 5 skills) | Done |
| P2 | Self-contained templates per skill | Done |
| P3 | Wiki structure & init script | Done |
| P4 | ArXiv integration scripts | Done |
| P5 | Platform integration (OpenCode, Claude Code) | Done |
| P6 | Testing with dummy research project | Done |
| P7 | Documentation | Done |
| P8 | CLI tool (`pilot`) + one-line installer | Done |
| P9 | Token benchmark for injected prompts | Done |
| P10 | Dashboard (web UI) | Done |
| P11 | Skill renaming & hook simplification | In Progress |
| P12 | Dashboard redesign (4-screen UI) | Not started |

---

## P1 — Core Skills

### 1.1 `using-pilot-research/SKILL.md` — Bootstrap skill

**Priority:** High  
**Dependencies:** None  
**Description:** The bootstrap skill injected at session start. Declares all 5 skills with trigger conditions. Establishes mandatory rules: always use wiki for artifacts, always handoff before stopping, always check handoff before starting. References the research wiki spec. Same pattern as superpowers' `using-superpowers`.

### 1.2 `pilot-brainstorm/SKILL.md`

**Priority:** High  
**Dependencies:** None  
**Description:** Skill for Socratic research plan discussion. Three trigger cases: (1) new research plan, (2) experiment design, (3) updating an existing plan. Process: read existing plans + wiki artifacts, discuss with researcher, produce/update research plan and backlog. References `research-plan-template.md` and `backlog-template.md`.

### 1.3 `pilot-literature/SKILL.md`

**Priority:** High  
**Dependencies:** None  
**Description:** Skill for finding, reading, and summarizing papers. Process: read research plan, ask researcher to clarify search scope, query ArXiv (or use provided PDFs/URLs), read papers, write paper summaries, extract entities and concepts, update existing wiki pages with new information. References `paper-summary-template.md`, `entity-template.md`, `concept-template.md`, `query-result-template.md`.

### 1.4 `pilot-execute/SKILL.md`

**Priority:** High  
**Dependencies:** None  
**Description:** Skill for leading research execution. Agent acts as leader: reads plan + backlog, spawns sub-agents (workers) for individual tasks, gathers their reports, updates backlog, plans next steps. Must write handoff reports when session ends. References `leader-prompt.md`, `worker-prompt.md`, `experiment-design-template.md`, `experiment-report-template.md`, `handoff-report-template.md`.

### 1.5 `pilot-write-paper/SKILL.md`

**Priority:** High  
**Dependencies:** None  
**Description:** Skill for drafting research papers. Process: read research plan, lit review summaries, experiment reports, then generate outline and section drafts. Uses `[[wikilinks]]` for citations that point to paper summaries in the wiki. References `paper-outline-template.md`.

### 1.6 `pilot-peer-review/SKILL.md`

**Priority:** High  
**Dependencies:** None  
**Description:** Skill for quality control on research artifacts. Reviews plan, lit review, and experiment design for clarity, feasibility, originality, relevance, accuracy, completeness, validity, reliability. Has severity levels (critical blocks progress, major suggests changes, minor is informational). References `review-rubric.md`.

---

## P2 — Self-Contained Templates

Each template lives inside its skill directory. All templates use YAML frontmatter + structured markdown body.

### 2.1 `pilot-brainstorm/research-plan-template.md`

**Priority:** High  
**Description:** Structured research plan with: research question, hypothesis, methodology, key literature (wikilinks), experiment design, expected outcomes, backlog link.

### 2.2 `pilot-brainstorm/backlog-template.md`

**Priority:** High  
**Description:** Task list linked to research plan. Each task has: id, description, status (todo/in-progress/done), assignee (human/agent), dependencies, links to experiments and plans.

### 2.3 `pilot-literature/paper-summary-template.md`

**Priority:** High  
**Description:** Paper review with: title, authors, year, DOI, ArXiv ID, one-line summary, key contribution, methodology, results, relevance to our research, connections section with wikilinks to other papers/entities/concepts.

### 2.4 `pilot-literature/entity-template.md`

**Priority:** Medium  
**Description:** Entity page (author, dataset, tool, institution) with: name, type, description, key contributions, related papers (wikilinks), related concepts (wikilinks).

### 2.5 `pilot-literature/concept-template.md`

**Priority:** Medium  
**Description:** Concept page (method, theory, framework) with: name, definition, how it works, strengths/limitations, applications, related papers (wikilinks), related entities (wikilinks), related concepts (wikilinks).

### 2.6 `pilot-literature/query-result-template.md`

**Priority:** Low  
**Description:** Saved Q&A from wiki queries with: question, answer (synthesized from wiki), sources (wikilinks to papers/entities/concepts), date.

### 2.7 `pilot-execute/experiment-design-template.md`

**Priority:** Medium  
**Description:** Experiment design checklist with: objective, hypothesis, variables (independent/dependent/controlled), procedure, data collection plan, analysis plan, success criteria, risks.

### 2.8 `pilot-execute/experiment-report-template.md`

**Priority:** Medium  
**Description:** Experiment results with: experiment id, objective, methodology summary, results (quantitative + qualitative), analysis, lessons learned, issues discovered, artifacts produced (wikilinks).

### 2.9 `pilot-execute/handoff-report-template.md`

**Priority:** High  
**Description:** Agent handoff report with: agent name, skill used, what was done, what was left undone, commands run (table), issues discovered, key decisions made, artifacts produced (wikilinks), suggested next steps.

### 2.10 `pilot-write-paper/paper-outline-template.md`

**Priority:** Medium  
**Description:** Paper outline with: title, abstract, section structure (each section with key points and source wikilinks), citation plan, target venue.

---

## P3 — Wiki Structure & Init

### 3.1 Default wiki structure with README

**Priority:** High  
**Description:** Create the default `.research/` directory structure with all subfolders (papers/, entities/, concepts/, queries/, plans/, experiments/, handoff/) and a `README.md` that documents conventions, naming rules, and wikilink syntax.

### 3.2 `scripts/init-wiki.sh`

**Priority:** Medium  
**Description:** Shell script that scaffolds the wiki directory. Asks user for custom path (default: `./.research/`). Copies default structure. Auto-appends the chosen path to `.gitignore` unless user opts out. Verifies the wiki structure is valid.

### 3.3 `using-pilot-research/references/research-wiki-spec.md`

**Priority:** High  
**Description:** Reference doc included by the bootstrap skill. Documents wiki folder structure, naming conventions, wikilink rules, YAML frontmatter schema, and backlink conventions. Agents read this to understand how to write to the wiki.

---

## P4 — ArXiv Integration

### 4.1 `scripts/arxiv-query.py`

**Priority:** High  
**Description:** Python script that queries the ArXiv API. Accepts search terms, date range, max results. Returns structured JSON with: arxiv_id, title, authors, abstract, published date, categories, pdf_url. Supports pagination. Agent calls this script, then decides which papers to read.

### 4.2 `scripts/pdf-extract.py`

**Priority:** Medium  
**Description:** Python script that downloads a PDF from a URL and extracts text. Accepts a URL or local path. Returns plain text. Used by agents to read paper content after finding them via ArXiv.

### 4.3 `using-pilot-research/references/arxiv-tools.md`

**Priority:** High  
**Description:** Reference doc included by the bootstrap skill. Documents how to use `arxiv-query.py` and `pdf-extract.py`: command syntax, expected input/output, example invocations. The pilot-literature skill references this doc to instruct agents on paper search workflow.

---

## P5 — Platform Integration

### 5.1 OpenCode plugin

**Priority:** High  
**Description:** `.opencode/plugins/pilot-research.js` — JavaScript plugin that reads `using-pilot-research/SKILL.md` at startup, strips YAML frontmatter, injects into first user message, registers skill paths in config. Same pattern as superpowers' OpenCode adapter.

### 5.2 Claude Code plugin

**Priority:** High  
**Description:** `.claude-plugin/plugin.json` — Plugin manifest with name, version, description, skills path. `hooks/hooks.json` defines session-start hook. `hooks/session-start` script reads bootstrap and outputs platform-specific JSON.

### 5.3 `CLAUDE.md` and `AGENTS.md`

**Priority:** Medium  
**Description:** `CLAUDE.md` — Project-level instructions for Claude Code sessions working on pilot-research itself. `AGENTS.md` — Contributor guidelines for AI agents submitting PRs (based on superpowers' AGENTS.md pattern: high bar for quality, no speculative changes, require human approval).

### 5.4 `package.json`

**Priority:** Medium  
**Description:** Minimal package.json with name, version, type, main (pointing to OpenCode plugin entry).

---

## P6 — Testing

### 6.1 Dummy research project

**Priority:** High  
**Description:** Create a test research project directory with an initialized wiki. Include a sample research plan, a couple of paper summaries, and a backlog. Used to verify skills work end-to-end without a real research project.

### 6.2 Skill-triggering tests

**Priority:** Medium  
**Description:** Verify each skill auto-triggers in the correct context. Test that pilot-brainstorm triggers on "I want to explore a research idea", pilot-literature triggers on "find papers about X", etc. Follow superpowers' testing pattern.

### 6.3 Brainstorm skill test

**Priority:** Medium  
**Description:** Verify brainstorm produces a research plan and backlog. Test all 3 cases: new plan, experiment design, update existing plan.

### 6.4 Literature review test

**Priority:** High  
**Description:** Verify paper ingestion pipeline: ArXiv query, paper summary creation, entity/concept extraction, wikilink creation, existing page updates.

### 6.5 Execute-research test

**Priority:** Medium  
**Description:** Verify leader spawns workers, workers report results, backlog gets updated, handoff report is written.

---

## P7 — Documentation

### 7.1 Update `README.md`

**Priority:** High  
**Description:** Full project overview: what pilot-research is, features list, installation instructions per platform, quickstart guide, skill descriptions.

### 7.2 Per-skill documentation

**Priority:** High  
**Description:** Each SKILL.md is self-documenting (that's the design). But we need a top-level index mapping commands to skills for human readers.

### 7.3 Platform installation guides

**Priority:** Medium  
**Description:** Step-by-step installation instructions for OpenCode and Claude Code. Include screenshots if helpful.

---

## P8 — CLI Tool (`pilot`) + One-Line Installer

**Goal:** Replace manual `init-wiki.sh` + platform-specific plugin setup with a unified CLI and a `curl | bash` installer inspired by [caveman](https://github.com/JuliusBrussee/caveman).

### 8.1 CLI binary: `pilot`

**Priority:** High  
**Dependencies:** None  
**Description:** A single CLI binary (`pilot`) that provides all user-facing commands. The binary must:

- Be distributable as a static binary (Go or Rust) or a Node.js script (`pilot.mjs`) runnable via `npx` — choose the simplest path that supports macOS, Linux, WSL
- Have zero required runtime dependencies beyond the stdlib (Python scripts like `arxiv-query.py` stay as-is; the CLI just calls them)
- Support these commands at minimum:
  - `pilot init [path]` — Initialize a research wiki at `[path]` (default: `./.research/`). Creates directory structure, copies README template, optionally appends to `.gitignore`. Replaces `scripts/init-wiki.sh`.
  - `pilot dashboard [--launch]` — Launch the research dashboard web UI (see P10). Without `--launch`, prints dashboard status/URL. With `--launch`, starts the server.
  - `pilot ingest <type> <name>` — Create a new wiki page from the appropriate template. Types: `paper`, `entity`, `concept`, `query`, `plan`, `experiment`. Opens the file in the user's `$EDITOR` after creation. Validates naming conventions.
  - `pilot query <search-terms>` — Search the wiki for pages matching terms. Reads YAML frontmatter + body. Prints matching pages with excerpts.
  - `pilot status` — Print wiki overview: number of papers, entities, concepts, plans, experiments; latest handoff date; backlog summary.
  - `pilot --help`, `pilot --version`
- Configuration via `~/.pilot-research/config.toml` or `.pilot-research.toml` in project root (wiki path override, default editor, etc.)

### 8.2 One-line installer: `install.sh`

**Priority:** High  
**Dependencies:** 8.1  
**Description:** Bash installer script (macOS / Linux / WSL) modeled after caveman's `install.sh`. Must:

- Be installable via: `curl -fsSL https://raw.githubusercontent.com/OWNER/pilot-research/main/install.sh | bash`
- Detect which AI coding agents are installed on the machine (at minimum: Claude Code, OpenCode, Cursor, Codex, Windsurf, Cline, Copilot)
- For each detected agent, install the pilot-research skill/plugin using that agent's native mechanism:
  - Claude Code: register plugin manifest + hooks
  - OpenCode: copy plugin JS to `.opencode/plugins/`
  - Cursor/Windsurf/Cline/Copilot: write rule files to appropriate config dirs
  - Codex: register skills
- Support flags: `--dry-run`, `--force`, `--only <agent>`, `--minimal` (plugins only, no hooks), `--all` (also write per-repo rule files), `--list` (print supported agents and exit)
- Be idempotent and safe to re-run (skip already-installed components)
- Optionally download the `pilot` CLI binary to `~/.local/bin/` (or `$PILOT_BIN_DIR`)
- After install, print a summary of what was installed/failed/skipped

### 8.3 Windows installer: `install.ps1`

**Priority:** Medium  
**Dependencies:** 8.2  
**Description:** PowerShell equivalent of `install.sh` for native Windows (non-WSL). Same detection and install logic. Installable via: `irm https://raw.githubusercontent.com/OWNER/pilot-research/main/install.ps1 | iex`

### 8.4 `pilot init` replaces `init-wiki.sh`

**Priority:** High  
**Dependencies:** 8.1  
**Description:** Refactor `scripts/init-wiki.sh` logic into the `pilot init` CLI command. The shell script stays for backward compatibility but now delegates to `pilot init` if the binary is available. Otherwise falls back to its current behavior.

### 8.5 Agent detection matrix documentation

**Priority:** Medium  
**Dependencies:** 8.2  
**Description:** Document which agents are detected and how. Include detection probes (command on PATH, config dir existence, VS Code extension). Follow caveman's pattern of `PROVIDER_DETECT` specs. Keep this in a reference table within `install.sh` comments and in the README.

### 8.6 Update `README.md` with install instructions

**Priority:** High  
**Dependencies:** 8.2  
**Description:** Add one-line install command to README. Add per-agent manual install instructions as fallback. Add `pilot` CLI usage section.

---

## P9 — Token Benchmark for Injected Prompts

**Goal:** Measure the token cost of injecting the bootstrap prompt (`using-pilot-research/SKILL.md`) into each session. This matters because every new session pays this cost, and we need to know if the injection is within acceptable limits across different agent platforms and modes.

### 9.1 Create benchmark script

**Priority:** High  
**Dependencies:** None  
**Description:** Create `tests/benchmark-tokens.sh` (or `.py`) that:

1. Reads `skills/using-pilot-research/SKILL.md` (the full injected content)
2. Measures **character count** and **approximate token count** using:
   - Simple heuristic: ~4 chars per token for English text (rough but universal)
   - Precise count using `tiktoken` (if available) for OpenAI-compatible tokenization
3. Also measures each individual skill's `SKILL.md` token count (when loaded on demand)
4. Reports per-skill and total bootstrap injection cost in a table:

| Context | Chars | Est. Tokens (4c/t) |
|---------|-------|--------------------|
| Bootstrap (always injected) | ... | ... |
| pilot-brainstorm (on demand) | ... | ... |
| pilot-literature (on demand) | ... | ... |
| pilot-execute (on demand) | ... | ... |
| pilot-write-paper (on demand) | ... | ... |
| pilot-peer-review (on demand) | ... | ... |

5. Also measures the **full injection** that each platform produces (i.e., the `session-start` hook output vs the OpenCode plugin output), including the wrapping `<EXTREMELY_IMPORTANT>` tags and tool-mapping preamble

### 9.2 Token budget targets

**Priority:** Medium  
**Dependencies:** 9.1  
**Description:** Define acceptable token budgets for injection. Document in the benchmark output:

- **Bootstrap injection** (always-on cost): should aim for < 2000 tokens. If it exceeds this, consider splitting into a minimal bootstrap + on-demand skill loading
- **Per-skill load** (on demand): should aim for < 1500 tokens each
- **Full session with one skill active**: bootstrap + one skill < 3500 tokens

These targets should be documented in the benchmark script output and in the README.

### 9.3 CI integration

**Priority:** Low  
**Dependencies:** 9.1  
**Description:** Add the token benchmark to CI so that any PR that increases the bootstrap injection size beyond the budget triggers a warning. Simple: run the benchmark script and check if bootstrap tokens exceed the target.

### 9.4 Benchmark findings (original, P9)

Original P9 results (before P11 refactoring):

| Context | Chars | Est. Tokens | Budget | Status |
|---------|-------|-------------|--------|--------|
| Bootstrap (always-on) | 5,036 | ~1,259 | ≤2,000 | OK |
| OpenCode full injection | 5,699 | ~1,425 | — | — |
| Claude Code full injection | 5,699 | ~1,425 | — | — |
|pilot-brainstorm (on demand) | 5,795 | ~1,449 | ≤1,500 | OK |
| pilot-literature (on demand) | 7,522 | ~1,881 | ≤1,500 | **OVER by 25%** |
| pilot-execute (on demand) | 6,841 | ~1,710 | ≤1,500 | **OVER by 14%** |
| pilot-write-paper (on demand) | 5,549 | ~1,387 | ≤1,500 | OK |
| pilot-peer-review (on demand) | 7,472 | ~1,868 | ≤1,500 | **OVER by 25%** |
| Session + 1 skill (worst case) | — | ~3,140 | ≤3,500 | OK |

### 9.5 Benchmark findings (after P11 refactoring)

After P11: bootstrap is now announcement-only (~219 tokens), mandatory rules moved into each skill.

| Context | Chars | Est. Tokens | Budget | Status |
|---------|-------|-------------|--------|--------|
| Bootstrap (always-on) | 875 | ~219 | ≤500 | OK |
| OpenCode full injection | 1,450 | ~363 | — | — |
| Claude Code full injection | 1,450 | ~363 | — | — |
| pilot-brainstorm (on demand) | 7,983 | ~1,996 | ≤2,500 | OK |
| pilot-literature (on demand) | 9,717 | ~2,429 | ≤2,500 | OK |
| pilot-execute (on demand) | 9,050 | ~2,263 | ≤2,500 | OK |
| pilot-write-paper (on demand) | 7,738 | ~1,935 | ≤2,500 | OK |
| pilot-peer-review (on demand) | 9,663 | ~2,416 | ≤2,500 | OK |
| Session + 1 skill (worst case) | — | ~2,648 | ≤3,500 | OK |

**Key improvements from P11:**
- Bootstrap injection: 1,259 → 219 tokens (83% reduction)
- All skills now include mandatory rules (each skill is self-contained)
- Per-skill budget raised from 1,500 to 2,500 to account for embedded mandatory rules
- All skills and session budgets are within targets

---

## P10 — Dashboard (Web UI)

**Goal:** A local web dashboard for browsing, searching, and visualizing the research wiki. Think Obsidian-like graph view + paper view, but purpose-built for the pilot-research wiki structure.

### 10.1 Dashboard architecture decision

**Priority:** High  
**Dependencies:** None  
**Description:** Decide on the dashboard tech stack. Options:
- **Option A: Static SPA** — Generate a static React/Vue/Svelte app that reads `.research/` markdown files. Served by `pilot dashboard`. No backend needed; the CLI parses markdown and serves JSON via a tiny embedded HTTP server.
- **Option B: Next.js / SvelteKit full app** — More features but heavier. Requires Node runtime.
- **Option C: TUI dashboard** — Terminal UI using Go's bubbletea or Rust's ratatui. Matches the CLI aesthetic but limited for graph visualization.
- **Recommendation:** Start with Option A. Use a tiny Go/Python HTTP server embedded in the `pilot` binary. Serve a static SPA that fetches parsed wiki data as JSON. Keep it simple and lightweight.

### 10.2 Wiki parser & API server

**Priority:** High  
**Dependencies:** 10.1  
**Description:** Build a wiki parser that:
- Recursively scans `.research/` for all `.md` files
- Parses YAML frontmatter into structured data
- Extracts `[[wikilinks]]` and builds a directed graph (adjacency list)
- Serves data via a local HTTP API:
  - `GET /api/pages` — List all pages with type, title, tags
  - `GET /api/pages/:path` — Full page content + parsed frontmatter + extracted wikilinks
  - `GET /api/graph` — Full wikilink graph as nodes + edges (for visualization)
  - `GET /api/search?q=...` — Full-text search across all pages
  - `GET /api/stats` — Counts by type, latest handoff date, backlog summary
- Watch for file changes (fsnotify / inotify) and push updates via WebSocket

### 10.3 Paper view

**Priority:** High  
**Dependencies:** 10.2  
**Description:** A detail view for paper summaries that shows:
- Full paper summary content (rendered markdown)
- Backlinks (all pages that link to this paper)
- Related entities and concepts (clickable wikilinks)
- Quick actions: open in editor, mark status, add tags

### 10.4 Graph view

**Priority:** High  
**Dependencies:** 10.2  
**Description:** An interactive knowledge graph visualization:
- Nodes represent wiki pages (colored by type: paper=blue, entity=green, concept=orange, etc.)
- Edges represent `[[wikilinks]]`
- Click a node to navigate to that page
- Drag to rearrange, zoom to explore
- Filter by type, tags, date range
- Use D3.js, Vis.js, or Cytoscape.js for rendering

### 10.5 Backlog view

**Priority:** Medium  
**Dependencies:** 10.2  
**Description:** A Kanban-style view of the research backlog:
- Columns: todo, in-progress, done
- Task cards pulled from backlog markdown tables
- Drag to update status (writes back to the backlog `.md` file)
- Link to experiment pages and plans

### 10.6 Search view

**Priority:** Medium  
**Dependencies:** 10.2  
**Description:** Full-text search across all wiki pages:
- Search bar with type-ahead
- Filter by page type (papers, entities, concepts, etc.)
- Filter by tags
- Results show title, type, and matching excerpt with highlighted keywords

### 10.7 `pilot dashboard` command

**Priority:** High  
**Dependencies:** 10.2, 10.3, 10.4  
**Description:** The CLI command that starts the dashboard server:
- `pilot dashboard` — Print dashboard status and URL (default: `http://localhost:4213`)
- `pilot dashboard --launch` — Start the server and open the browser
- `pilot dashboard --port <port>` — Custom port
- `pilot dashboard --no-open` — Start server without opening browser
- The dashboard SPA is bundled into the `pilot` binary (embedded filesystem) or served from a local `dist/` directory during development

### 10.8 Handoff timeline

**Priority:** Low  
**Dependencies:** 10.2  
**Description:** A timeline view showing all handoff reports in chronological order:
- Each handoff is a card with: date, agent, skill used, summary of what was done
- Click to expand and see full handoff report
- Shows the thread of research sessions over time

---

## P11 — Skill Renaming & Hook Simplification

**Goal:** Two urgent changes: (1) rename all skills with `pilot-` prefix for discoverability, (2) simplify the session-start hook to just announce availability instead of injecting full bootstrap.

### 11.1 Rename all skills with `pilot-` prefix

**Priority:** Urgent  
**Dependencies:** None  
**Description:** Rename all 5 skills with the `pilot-` prefix to improve discoverability when users have many skills/tools installed. The new names are:

| Old name | New name |
|----------|----------|
| `brainstorming` | `pilot-brainstorm` |
| `execute-research` | `pilot-execute` |
| `literature-review` | `pilot-literature` |
| `peer-review` | `pilot-peer-review` |
| `write-paper` | `pilot-write-paper` |

This requires:
- Rename skill directories: `skills/brainstorming/` → `skills/pilot-brainstorm/`, etc.
- Update YAML frontmatter `name:` fields in each SKILL.md
- Update the skill registry in `using-pilot-research/SKILL.md`
- Update all cross-references in other skills (e.g., transition suggestions like "invoke pilot-research:literature-review" → "invoke pilot-research:pilot-literature")
- Update the OpenCode plugin (`.opencode/plugins/pilot-research.js`) skill path resolution
- Update the Claude Code hook (`hooks/session-start`) if it references skill names
- Update `AGENTS.md`, `CLAUDE.md`, `docs/architecture.md`, `docs/skills-design.md`, `docs/backlog.md`
- Update the install scripts (`install.sh`, `install.ps1`) if they reference skill names
- Update test fixtures in `tests/`
- Update the P9 token benchmark (`tests/benchmark-tokens.mjs`)

### 11.2 Simplify session-start hook to announcement-only

**Priority:** Urgent  
**Dependencies:** 11.1 (must use new skill names)  
**Description:** Currently the session-start hook injects the full `using-pilot-research/SKILL.md` content (~1,259 tokens) on every session, including mandatory rules, wiki structure, session checklists, and tool mapping. This is wasteful when the user isn't doing research.

The new behavior should:
- Inject a **short announcement** (~200-300 tokens) that:
  - States "Pilot Research is installed in this project"
  - Lists the 5 available skills with one-line descriptions
  - Says "Use the skill tool to invoke a skill when you need it"
- **Do NOT inject** mandatory rules, wiki structure, session checklists, or tool mappings at session start
- Mandatory rules and wiki structure should be included **inside each skill's SKILL.md** so they're only loaded when a skill is invoked
- The `using-pilot-research/SKILL.md` should be repurposed or replaced — its content moves into the individual skills

Files to update:
- `hooks/session-start` — Output the short announcement instead of full bootstrap
- `.opencode/plugins/pilot-research.js` — Same: inject announcement, not full bootstrap
- Each skill's `SKILL.md` — Add a "Mandatory Rules" section with the wiki, handoff, and wikilink rules
- `skills/using-pilot-research/SKILL.md` — Transform into a lightweight announcement-only template (or remove and inline the announcement in the hook/plugin)
- The "always check for handoff" rule becomes a per-skill checklist item, not an always-on injection

### 11.3 Update skill registry in bootstrap/announcement

**Priority:** Urgent  
**Dependencies:** 11.1, 11.2  
**Description:** Update the skill registry (now in the short announcement) to list all 5 skills:

| Skill | Trigger Condition | Invocation |
|-------|-------------------|------------|
| `pilot-brainstorm` | Discuss, explore, or refine a research idea/plan/experiment | `pilot-research:pilot-brainstorm` |
| `pilot-literature` | Find, read, or summarize papers; build/update the wiki | `pilot-research:pilot-literature` |
| `pilot-execute` | Execute backlog tasks, run experiments, manage sub-agents | `pilot-research:pilot-execute` |
| `pilot-write-paper` | Draft, outline, or revise a research paper | `pilot-research:pilot-write-paper` |
| `pilot-peer-review` | Get feedback on plan, lit review, experiment, or draft | `pilot-research:pilot-peer-review` |

### 11.4 Refactor mandatory rules into individual skills

**Priority:** High  
**Dependencies:** 11.2  
**Description:** Since the hook no longer injects mandatory rules at session start, each skill must include its own mandatory rules section. Create a shared "mandatory rules" snippet that each SKILL.md includes inline (not via file reference, since skills must be self-contained per design decision D1).

The mandatory rules to include in each skill:
1. Always use the wiki — research artifacts go into `.research/`
2. Always check for handoff before starting
3. Always handoff before stopping
4. Always use `[[wikilinks]]`
5. Always update existing pages (search before create)
6. Always ask before executing scripts

This means each SKILL.md gets slightly longer, but:
- Rules are only loaded when a skill is actually invoked
- No wasted tokens on non-research sessions
- Each skill is truly self-contained

### 11.5 Update token benchmarks (P9) for new skill sizes

**Priority:** Medium  
**Dependencies:** 11.1, 11.4  
**Description:** Re-run `tests/benchmark-tokens.mjs` after renaming and rule-refactoring to update the token cost table. The new numbers will reflect:
- Bootstrap/announcement injection: ~200-300 tokens (down from ~1,259)
- Each individual skill: larger than before (includes mandatory rules inline)
- Full session cost: announcement + one skill

Update the P9 section in `docs/backlog.md` with new results and budget status.

### 11.6 Update architecture and skills-design docs

**Priority:** Medium  
**Dependencies:** 11.1, 11.2  
**Description:** Update `docs/architecture.md` and `docs/skills-design.md` to reflect:
- New skill names with `pilot-` prefix
- Renamed skill directories in project structure
- Simplified hook behavior (announcement-only)
- Updated skill registry (5 skills with new names)
- Updated skill composition / workflow chain diagram
- Design decision update: D3 (Bootstrap pattern → Announcement pattern)

---

## P12 — Dashboard Redesign (4-Screen UI)

**Goal:** Redesign the dashboard from the current basic vanilla HTML/JS SPA to a polished React + Tailwind CSS application with 4 core screens. The visual design and component structure in `docs/dashboard-draft/` serves as the reference implementation. The new dashboard replaces `dashboard/public/` entirely.

### 12.1 Dashboard tech stack migration

**Priority:** High  
**Dependencies:** 10.2 (existing wiki parser & API)  
**Description:** Migrate from the current vanilla HTML/JS/CSS dashboard to a React + Vite + Tailwind CSS SPA. This involves:

- Replace `dashboard/public/app.js`, `app.css`, `index.html` with a React app built from `docs/dashboard-draft/`
- The built SPA output goes to `dashboard/public/` (served by `server.mjs`)
- Configure Vite to output static assets to `dashboard/public/`
- Integrate existing Tailwind CSS + Motion (framer-motion) for animations
- Keep `dashboard/server.mjs` and `dashboard/parser.mjs` as the backend API — no changes needed to these files
- The React app consumes the existing `/api/pages`, `/api/page/:path`, `/api/graph`, `/api/search`, `/api/stats` endpoints
- Ensure `npm run build` in the dashboard directory produces the static assets that `server.mjs` serves

### 12.2 Screen 1: Paper List

**Priority:** High  
**Dependencies:** 12.1  
**Description:** Replace the current overview/paper view with a toggle-able paper list. Based on `docs/dashboard-draft/src/components/PapersView.tsx`:

- Paper cards displayed in a vertical list, each showing: category badge, title, authors, date, link
- Each card is toggle-able — collapsed by default, click to expand and see the paper summary (abstract)
- Expanded view shows full abstract text and action buttons ("Full Document", "Quick Export")
- Sort/filter controls at the top (Newest, Cited, Alpha)
- Floating action button (FAB) for adding new papers
- Papers are fetched from `/api/pages?type=paper` (new filter param) or filtered client-side from `/api/pages`
- Clicking into a paper navigates to a detail view showing the full markdown content, backlinks, and related entities/concepts
- Must gracefully handle empty state (no papers yet)

### 12.3 Screen 2: Kanban Board

**Priority:** High  
**Dependencies:** 12.1, 12.9  
**Description:** Replace the current backlog view with a proper 4-column Kanban board. Based on `docs/dashboard-draft/src/components/TasksView.tsx`:

- 4 columns: **Open**, **Pending**, **Done**, **Archive** (matching Task status: todo, pending, done, archive)
- Each task is a card showing: category badge, title, description preview, assignee, date, attachment count
- Cards are color-coded by status (pending cards have accent border + "Active" indicator, done cards are dimmed/struck-through)
- Clicking a task splits the screen horizontally:
  - Left side: Kanban board (narrowed)
  - Right side: Markdown editor panel showing the task's full markdown content
  - Editor has a toolbar (Bold, Italic, List, Link, Image, Code) and Save/Close buttons
  - Title is editable inline at the top of the editor
  - Metadata shown below title (author, word count)
- Archive column shows a placeholder card when empty (no archived tasks)
- Tasks sourced from `/api/pages` filtered by `type: experiment` or `type: plan`, with status mapped to Kanban columns
- Drag-and-drop between columns is a future enhancement (noted but out of scope for this phase)

### 12.4 Screen 3: Knowledge Graph

**Priority:** High  
**Dependencies:** 12.1, 12.10  
**Description:** Replace the current basic SVG graph with an interactive knowledge graph. Based on `docs/dashboard-draft/src/components/GraphView.tsx`:

- Nodes represent wiki pages (markdown files), colored by type: paper=blue, entity=green, concept=orange, etc.
- Edges represent `[[wikilinks]]` between pages
- Use a proper graph rendering library (D3.js force simulation, react-flow, or cytoscape.js)
- Interactive features:
  - Click a node to split the screen (same pattern as Screen 2) — left side shows graph, right side shows a node editor with:
    - Node title, tags, type badges
    - Rendered markdown content
    - Related artifacts section
    - Edit/close controls
  - Pan, zoom, drag to rearrange nodes
  - Toolbar buttons: Zoom, Recenter, Auto-Layout
- Node count display (e.g., "Visualizing 248 conceptual nodes")
- Clicking a node fires `navigateTo('page', node.filePath)` to load the full page content
- Graph data comes from `/api/graph` endpoint (already exists)
- Must handle graphs with many nodes (50+) without performance issues
- Consider a minimap or cluster-by-type view for large graphs

### 12.5 Screen 4: Artifact Finder

**Priority:** High  
**Dependencies:** 12.1, 12.11  
**Description:** New screen — a file explorer + content viewer. Based on `docs/dashboard-draft/src/components/ArtifactsView.tsx`:

- **Left/center: Content viewer** — renders the selected file's markdown content in a document-style layout:
  - Shows file type badge, title, date, author metadata
  - Renders markdown content with proper styling (headings, bold, lists, code blocks)
  - Wikilinks `[[...]]` are rendered as clickable links that navigate within the dashboard
  - Multiple open files shown as tabs at the top (tab bar)
  - Each tab shows file icon + filename; active tab has underline indicator
  - Close button (X) on each tab
  - "+" button to open additional files
- **Right side: Explorer panel** (280px width):
  - Directory tree of the wiki folder (`.research/`), fetched from a new `/api/file-tree` endpoint
  - Folders are expandable/collapsible with chevron icons
  - Files show appropriate icons (file, image, data, etc.)
  - Clicking a file opens it in the viewer (adds a tab)
  - Currently selected file is highlighted
  - "Recent Artifacts" section at the bottom showing recently modified files
  - Refresh button to reload the file tree
- Supports both wiki markdown files and arbitrary files (CSV, images, etc.) — for non-markdown files, show a preview or "Open externally" option

### 12.6 Sidebar navigation redesign

**Priority:** Medium  
**Dependencies:** 12.1  
**Description:** Replace the current sidebar with the draft design. Based on `docs/dashboard-draft/src/components/Sidebar.tsx`:

- Fixed left sidebar (240px on desktop, hidden on mobile with hamburger menu)
- 4 navigation items matching the 4 screens: Papers, Tasks, Graph, Artifacts
- Each item has an icon (FileText, Kanban, Share2, Box from lucide-react)
- Active item has white background + right-edge indicator bar
- Smooth transition animation on active state change (motion/react layoutId)
- Bottom section: researcher profile card (can be placeholder for now)
- App title "RESEARCH" at the top

### 12.7 Top bar redesign

**Priority:** Medium  
**Dependencies:** 12.1  
**Description:** Replace the current top bar. Based on `docs/dashboard-draft/src/components/TopBar.tsx`:

- Search input with icon (already partially exists)
- Dynamic title based on current view: "Dashboard", "Tasks", "Knowledge Graph", "Artifact Finder"
- Notification bell icon (placeholder for now)
- User avatar/profile (placeholder)
- Mobile hamburger menu toggle (for sidebar)

### 12.8 Shared split-screen editor component

**Priority:** High  
**Dependencies:** 12.1  
**Description:** Create a reusable split-screen editor component used by both Screen 2 (Kanban) and Screen 3 (Graph):

- When a task or node is clicked, the screen splits: left side shows the list/graph (narrowed), right side shows the editor
- Editor panel features:
  - Toolbar: Bold, Italic, List, Link, Image, Code formatting buttons
  - Editable title field
  - Metadata display (author, word count, date, status)
  - Full markdown textarea with monospace editing
  - Save button (calls `PUT /api/page/:path` to write changes back)
  - Close button (X) to dismiss the editor and restore full-width view
- Smooth animation for the split transition
- On smaller screens, the editor slides over the content instead of splitting

### 12.9 Backend: Kanban/task API endpoints

**Priority:** High  
**Dependencies:** 10.2 (existing parser & server)  
**Description:** Add API endpoints to support the Kanban board:

- `GET /api/tasks` — Returns all tasks (experiments + plans) with status mapped to kanban columns:
  - Each task includes: id, title, description (from frontmatter or body excerpt), category, status, assignee, date, filePath
  - Status mapping: `status: draft/empty` → `todo`, `status: in-progress` → `pending`, `status: complete/done` → `done`, add support for `status: archive` → `archive`
  - Parse backlog markdown tables if they exist (from plan files) as additional task sources
- `PUT /api/task/:path` — Update a task's status (writes back to the markdown file's frontmatter)
- `PUT /api/page/:path` — Write/save edited markdown content back to the wiki file (for the editor component)

### 12.10 Backend: Enhanced graph data endpoint

**Priority:** Medium  
**Dependencies:** 10.2 (existing parser & server)  
**Description:** Enhance the `/api/graph` endpoint to support richer graph visualization:

- Return node type information with colors (already partially there)
- Add `category` field to nodes for grouping/filtering
- Add endpoint `GET /api/graph?filter=type` to filter graph by page type (paper, concept, entity, etc.)
- Return edge labels/descriptions if available (e.g., "cited by", "related to")
- Consider adding node clustering metadata (group papers by topic, concepts by domain)
- Performance: for wikis with 100+ pages, return a simplified graph (only nodes with 2+ connections) or paginate

### 12.11 Backend: File tree & file content endpoints

**Priority:** High  
**Dependencies:** 10.2 (existing parser & server)  
**Description:** Add API endpoints to support the Artifact Finder screen:

- `GET /api/file-tree` — Returns the full directory tree of `.research/` as a nested JSON structure:
  ```json
  { "id": "root", "name": ".research", "type": "folder", "children": [
    { "id": "papers", "name": "papers", "type": "folder", "children": [
      { "id": "papers/transformer-attention", "name": "transformer-attention.md", "type": "file" }
    ]},
    ...
  ]}
  ```
- `GET /api/file/:path` — Returns raw file content for any file in the wiki (not just parsed markdown). Supports:
  - Markdown files: returns `{ content, frontmatter, body, wikilinks }` (reuse existing parser)
  - Non-markdown files: returns `{ content, type: mime-type, size }` with raw content
  - Used by the Artifact Finder viewer
- `GET /api/file/:path?raw=true` — Returns the raw file content as-is (for download or non-markdown preview)

### 12.12 Mobile responsiveness

**Priority:** Low  
**Dependencies:** 12.2, 12.3, 12.4, 12.5  
**Description:** Ensure all 4 screens work on mobile/tablet viewports:

- Sidebar collapses to hamburger menu on mobile
- Paper list cards stack vertically (already natural flow)
- Kanban columns scroll horizontally on narrow screens
- Graph view uses touch gestures (pinch to zoom, drag to pan)
- Artifact Finder: explorer panel becomes a bottom sheet or overlay on mobile
- Split-screen editor overlays on mobile instead of side-by-side
- Minimum supported width: 320px (mobile), optimal: 1024px+ (desktop)

### 13.0 Design decisions update

**Priority:** Medium  
**Dependencies:** 12.1  
**Description:** Update `docs/architecture.md` to reflect the new dashboard architecture:

- D10 update: Dashboard is now a React + Vite + Tailwind SPA (not vanilla JS)
- Add D11: Split-screen editor pattern — clicking a task/node splits the main content area into a list/graph view (left) and markdown editor (right)
- Add D12: File tree navigation pattern — the Artifact Finder uses a directory tree sidebar + content viewer pattern
- Add D13: Kanban task model — wiki pages (experiments, plans) are mapped to Kanban columns by their `status` frontmatter field
- Update the Dashboard Architecture section to describe the 4-screen layout
- Update project structure to reflect React components in `dashboard/src/`