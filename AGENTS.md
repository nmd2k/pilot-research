# AGENTS.md

Contributions are welcome. Quality standards are high.

## Requirements

- Skill changes must work across all supported platforms (OpenCode, Claude Code, Cursor, Codex)
- Template changes must maintain wikilink consistency — every `[[link]]` must resolve
- New skills must include a SKILL.md and at least one template
- Test with the dummy project (`tests/dummy-project/`) before submitting

## What will not be accepted

- Skill descriptions that describe workflow instead of triggers and constraints
- Platform-specific hacks that don't work generically across all supported agents
- Domain-specific skills that aren't general-purpose for research
- Speculative or untested changes
- Breaking changes to the wiki structure without a migration path

## Process

1. Open an issue describing the change and rationale
2. Keep PRs small and focused
3. Ensure all existing wiki templates and links still resolve after your change
4. Verify your change works with the dummy project before requesting review