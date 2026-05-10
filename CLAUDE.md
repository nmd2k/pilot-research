# CLAUDE.md

Pilot Research provides skill-based research workflows for coding agents (OpenCode, Claude Code, Cursor, Codex).

This repo contains skills, templates, scripts, and tests. See `docs/` for architecture, backlog, and skills design.

## Skills

- `pilot-brainstorm` — Socratic research plan discussion
- `pilot-literature` — ArXiv search, paper summarization, wiki building
- `pilot-execute` — Lead research execution with sub-agent workers
- `pilot-write-paper` — Draft papers from plans, reviews, and experiment results
- `pilot-peer-review` — Quality control for research artifacts
- `using-pilot-research` — Bootstrap skill for new users

Skills live in `skills/`. Each skill is self-contained with its own SKILL.md and templates.

Templates are inside each skill directory.

The wiki structure template is in `wiki/`. Initialize with `scripts/init-wiki.sh`.