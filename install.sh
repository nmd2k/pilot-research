#!/usr/bin/env bash
set -euo pipefail

REPO="OWNER/pilot-research"
RAW_BASE="https://raw.githubusercontent.com/$REPO/main"

DRY=0
FORCE=0
MINIMAL=0
ALL=0
LIST_ONLY=0
ONLY=()
NO_COLOR=0

if [ ! -t 1 ]; then NO_COLOR=1; fi

PILOT_CLI_URL_X64="$RAW_BASE/cli/bin/pilot-darwin-x64"
PILOT_CLI_URL_ARM64="$RAW_BASE/cli/bin/pilot-darwin-arm64"
PILOT_CLI_URL_LINUX="$RAW_BASE/cli/bin/pilot-linux-x64"

print_help() {
  cat <<'EOF'
pilot-research installer — detects your AI coding agents and installs pilot-research for each one.

USAGE
  install.sh [flags]

  curl -fsSL https://raw.githubusercontent.com/OWNER/pilot-research/main/install.sh | bash
  curl -fsSL https://raw.githubusercontent.com/OWNER/pilot-research/main/install.sh | bash -s -- --all

FLAGS
  --dry-run         Print what would run, do nothing.
  --force           Re-run even if already installed.
  --only <agent>    Install only for the named agent. Repeatable.
  --minimal         Just the skill files and plugin manifests. No CLI, no rule files.
  --all             Install everything: plugins + CLI + per-repo rule files.
  --list            Print supported agents and exit.
  --no-color        Disable ANSI color codes.
  -h, --help        Show this help and exit.

AGENTS DETECTED
  Run with --list for the full table.

EXAMPLES
  install.sh                         # default: plugins + CLI
  install.sh --all                   # also drop per-repo rule files + CLI
  install.sh --minimal               # plugins only, no CLI
  install.sh --only claude
  install.sh --list
EOF
}

while [ $# -gt 0 ]; do
  case "$1" in
    --dry-run)      DRY=1 ;;
    --force)        FORCE=1 ;;
    --minimal)      MINIMAL=1 ;;
    --all)          ALL=1 ;;
    --list)         LIST_ONLY=1 ;;
    --no-color)     NO_COLOR=1 ;;
    --only)
      shift
      if [ $# -eq 0 ]; then echo "error: --only requires an argument" >&2; exit 2; fi
      ONLY+=("$1") ;;
    -h|--help)      print_help; exit 0 ;;
    *)
      echo "error: unknown flag: $1" >&2; echo "run 'install.sh --help' for usage" >&2; exit 2 ;;
  esac
  shift
done

if [ "$ALL" = 1 ] && [ "$MINIMAL" = 1 ]; then
  echo "error: --all and --minimal are mutually exclusive" >&2; exit 2
fi

if [ "$NO_COLOR" = 1 ]; then
  c_orange=""; c_dim=""; c_red=""; c_green=""; c_reset=""
else
  c_orange=$'\033[38;5;172m'
  c_dim=$'\033[2m'
  c_red=$'\033[31m'
  c_green=$'\033[32m'
  c_reset=$'\033[0m'
fi

say()  { printf '%s%s%s\n' "$c_orange" "$1" "$c_reset"; }
note() { printf '%s%s%s\n' "$c_dim" "$1" "$c_reset"; }
warn() { printf '%s%s%s\n' "$c_red" "$1" "$c_reset" >&2; }
ok()   { printf '%s%s%s\n' "$c_green" "$1" "$c_reset"; }

has() { command -v "$1" >/dev/null 2>&1; }
run() {
  if [ "$DRY" = 1 ]; then note "  would run: $*"; return 0; fi
  echo "  $ $*"
  "$@"
}

PROVIDER_IDS=("claude" "opencode" "cursor" "windsurf" "cline" "copilot" "codex")
PROVIDER_LABELS=("Claude Code" "OpenCode" "Cursor" "Windsurf" "Cline" "GitHub Copilot" "Codex CLI")
PROVIDER_DETECT=("command:claude" "command:opencode" "command:cursor||dir:$HOME/.cursor" "command:windsurf||dir:$HOME/.codeium/windsurf||dir:$HOME/.windsurf" "vscode-ext:cline" "command:gh" "command:codex")

if [ "$LIST_ONLY" = 1 ]; then
  say "pilot-research supported agents"
  printf '\n  %-13s %-20s %s\n' "ID" "AGENT" "DETECTION"
  printf '  %-13s %-20s %s\n' "---" "-----" "---------"
  i=0
  total=${#PROVIDER_IDS[@]}
  while [ $i -lt "$total" ]; do
    printf '  %-13s %-20s %s\n' "${PROVIDER_IDS[$i]}" "${PROVIDER_LABELS[$i]}" "${PROVIDER_DETECT[$i]}"
    i=$((i + 1))
  done
  echo
  exit 0
fi

detect_match() {
  local spec="$1"
  local rest="$spec"
  local clause
  while [ -n "$rest" ]; do
    if [ "${rest#*||}" != "$rest" ]; then
      clause="${rest%%||*}"
      rest="${rest#*||}"
    else
      clause="$rest"
      rest=""
    fi
    [ -z "$clause" ] && continue
    case "$clause" in
      command:*)  has "${clause#command:}" && return 0 ;;
      dir:*)      [ -d "${clause#dir:}" ] && return 0 ;;
      file:*)     [ -f "${clause#file:}" ] && return 0 ;;
      vscode-ext:*) ;;
    esac
  done
  return 1
}

want() {
  if [ ${#ONLY[@]} -eq 0 ]; then return 0; fi
  local a
  for a in "${ONLY[@]}"; do [ "$a" = "$1" ] && return 0; done
  return 1
}

SCRIPT_DIR="$(cd "$(dirname "$0")" 2>/dev/null && pwd)"
LOCAL_REPO=""
if [ -f "$SCRIPT_DIR/install.sh" ] && [ -d "$SCRIPT_DIR/skills" ]; then
  LOCAL_REPO="$SCRIPT_DIR"
fi

copy_skill_files() {
  local dest="$1"
  if [ -n "$LOCAL_REPO" ]; then
    cp -R "$LOCAL_REPO/skills" "$dest/skills"
  else
    if has curl; then
      mkdir -p "$dest/skills"
      local tmp
      tmp="$(mktemp -d)"
      curl -fsSL "$RAW_BASE/skills/using-pilot-research/SKILL.md" -o "$tmp/SKILL.md" 2>/dev/null || true
      if [ -f "$tmp/SKILL.md" ]; then
        mkdir -p "$dest/skills/using-pilot-research"
        cp "$tmp/SKILL.md" "$dest/skills/using-pilot-research/"
      fi
      rm -rf "$tmp"
    fi
  fi
}

INSTALLED=()
SKIPPED=()
FAILED=()

install_claude() {
  say "→ Claude Code detected"
  local target_dir="$HOME/.claude-plugin/pilot-research"
  
  if [ "$FORCE" = 0 ] && [ -d "$target_dir" ]; then
    note "  pilot-research already installed for Claude Code (use --force to reinstall)"
    SKIPPED+=("claude:already-installed")
    return 0
  fi

  run mkdir -p "$target_dir"
  
  local plugin_json
  plugin_json='{
  "name": "pilot-research",
  "description": "Research workflow skills for coding agents",
  "version": "0.1.0",
  "author": { "name": "Pilot Research Contributors" },
  "homepage": "https://github.com/OWNER/pilot-research",
  "repository": "https://github.com/OWNER/pilot-research",
  "license": "MIT",
  "keywords": ["research", "pilot-literature", "pilot-brainstorm", "pilot-peer-review", "skills"]
}'
  
  echo "$plugin_json" | run tee "$target_dir/plugin.json" > /dev/null
  
  run mkdir -p "$target_dir/hooks"
  
  local hooks_json
  hooks_json='{
  "hooks": {
    "SessionStart": [
      {
        "type": "command",
        "command": "bash pilot-research/hooks/session-start"
      }
    ]
  }
}'
  echo "$hooks_json" | run tee "$target_dir/hooks/hooks.json" > /dev/null

  if [ -n "$LOCAL_REPO" ]; then
    run cp "$LOCAL_REPO/hooks/session-start" "$target_dir/hooks/session-start"
    run cp -R "$LOCAL_REPO/skills" "$target_dir/skills"
  else
    if has curl; then
      run mkdir -p "$target_dir/hooks"
      curl -fsSL "$RAW_BASE/hooks/session-start" -o "$target_dir/hooks/session-start" 2>/dev/null
      chmod +x "$target_dir/hooks/session-start"
      copy_skill_files "$target_dir"
    else
      warn "  curl not found; cannot download skill files remotely"
      FAILED+=("claude:curl-missing")
      return 1
    fi
  fi

  ok "  pilot-research installed for Claude Code"
  INSTALLED+=("claude")
}

install_opencode() {
  say "→ OpenCode detected"
  local target_dir="$HOME/.opencode/plugins"
  
  if [ "$FORCE" = 0 ] && [ -f "$target_dir/pilot-research.js" ]; then
    note "  pilot-research already installed for OpenCode (use --force to reinstall)"
    SKIPPED+=("opencode:already-installed")
    return 0
  fi

  run mkdir -p "$target_dir"
  
  if [ -n "$LOCAL_REPO" ]; then
    run cp "$LOCAL_REPO/.opencode/plugins/pilot-research.js" "$target_dir/pilot-research.js"
  else
    if has curl; then
      curl -fsSL "$RAW_BASE/.opencode/plugins/pilot-research.js" -o "$target_dir/pilot-research.js" 2>/dev/null
    else
      warn "  curl not found"
      FAILED+=("opencode:curl-missing")
      return 1
    fi
  fi

  local skills_dir="$HOME/.opencode/skills"
  run mkdir -p "$skills_dir"
  copy_skill_files "$skills_dir"

  ok "  pilot-research installed for OpenCode"
  INSTALLED+=("opencode")
}

write_rule_file() {
  local file="$1"
  local content="$2"
  
  if [ "$FORCE" = 0 ] && [ -f "$file" ]; then
    note "  $file already exists (use --force to overwrite)"
    SKIPPED+=("$file:already-exists")
    return 0
  fi

  run mkdir -p "$(dirname "$file")"
  echo "$content" | run tee "$file" > /dev/null
  ok "  wrote $file"
  INSTALLED+=("$(basename "$file")")
}

CURSOR_RULE='---
description: Pilot Research — Research workflow skills for AI coding agents
globs:
alwaysApply: true
---

You have pilot-research skills installed. Follow the research workflow skills in your `.research/` wiki directory. Use the skill registry for: pilot-brainstorm, pilot-literature, pilot-execute, pilot-write-paper, pilot-peer-review. All research artifacts go into `.research/` using wikilink conventions.'

WINDSURF_RULE='# Pilot Research\n\nYou have pilot-research skills installed. Follow the research workflow skills in your `.research/` wiki directory. All research artifacts go into `.research/` using wikilink conventions.'

CLINE_RULE='# Pilot Research\n\nYou have pilot-research skills installed. Follow the research workflow skills in your `.research/` wiki directory. All research artifacts go into `.research/` using wikilink conventions.'

COPILOT_RULE='# Pilot Research\n\nYou have pilot-research skills installed. Follow the research workflow skills in your `.research/` wiki directory. All research artifacts go into `.research/` using wikilink conventions. Skills: pilot-brainstorm, pilot-literature, pilot-execute, pilot-write-paper, pilot-peer-review.'

CODEX_RULE='# Pilot Research\n\nYou have pilot-research skills installed. Follow the research workflow skills in your `.research/` wiki directory. All research artifacts go into `.research/` using wikilink conventions.'

install_cursor() {
  say "→ Cursor detected"
  write_rule_file ".cursor/rules/pilot-research.mdc" "$CURSOR_RULE"
  INSTALLED+=("cursor")
}

install_windsurf() {
  say "→ Windsurf detected"
  write_rule_file ".windsurf/rules/pilot-research.md" "$WINDSURF_RULE"
  INSTALLED+=("windsurf")
}

install_cline() {
  say "→ Cline detected"
  write_rule_file ".clinerules/pilot-research.md" "$CLINE_RULE"
  INSTALLED+=("cline")
}

install_copilot() {
  say "→ GitHub Copilot detected"
  write_rule_file ".github/copilot-instructions.md" "$COPILOT_RULE"
  INSTALLED+=("copilot")
}

install_codex() {
  say "→ Codex CLI detected"
  write_rule_file ".codex/instructions.md" "$CODEX_RULE"
  INSTALLED+=("codex")
}

install_cli() {
  if [ "$MINIMAL" = 1 ]; then return 0; fi
  
  say "→ Installing pilot CLI"
  local bin_dir="$HOME/.local/bin"
  run mkdir -p "$bin_dir"
  
  local arch
  arch="$(uname -m)"
  local os
  os="$(uname -s)"
  local binary_url=""
  local binary_name="pilot"
  
  if [ "$os" = "Darwin" ]; then
    if [ "$arch" = "arm64" ]; then
      binary_url="$PILOT_CLI_URL_ARM64"
    else
      binary_url="$PILOT_CLI_URL_X64"
    fi
  elif [ "$os" = "Linux" ]; then
    binary_url="$PILOT_CLI_URL_LINUX"
  else
    note "  CLI binary not available for $os. Install manually via: npm install -g pilot-research"
    SKIPPED+=("cli:unsupported-os")
    return 0
  fi

  if has curl; then
    note "  Downloading pilot CLI..."
    if [ "$DRY" = 1 ]; then
      note "  would download: $binary_url -> $bin_dir/pilot"
    else
      if curl -fsSL "$binary_url" -o "$bin_dir/pilot" 2>/dev/null; then
        chmod +x "$bin_dir/pilot"
        ok "  pilot CLI installed to $bin_dir/pilot"
        INSTALLED+=("cli")
        
        note "  Make sure $bin_dir is in your PATH."
        note "  You may need to add 'export PATH=\"$bin_dir:\$PATH\"' to your shell profile."
      else
        note "  Binary download not available yet. Install via: npm install -g pilot-research"
        note "  Or use: node cli/pilot.mjs directly from the repo."
        SKIPPED+=("cli:binary-not-available")
      fi
    fi
  else
    note "  curl not found. Install CLI manually via: npm install -g pilot-research"
    SKIPPED+=("cli:curl-missing")
  fi
}

echo
say "pilot-research installer"
note "  $REPO"
if [ "$DRY" = 1 ]; then note "  (dry run — nothing will be written)"; fi
echo

i=0
total=${#PROVIDER_IDS[@]}
while [ $i -lt "$total" ]; do
  id="${PROVIDER_IDS[$i]}"
  label="${PROVIDER_LABELS[$i]}"
  detect_spec="${PROVIDER_DETECT[$i]}"
  
  if want "$id" && detect_match "$detect_spec"; then
    case "$id" in
      claude)  install_claude ;;
      opencode) install_opencode ;;
      cursor)  install_cursor ;;
      windsurf) install_windsurf ;;
      cline)   install_cline ;;
      copilot)  install_copilot ;;
      codex)   install_codex ;;
    esac
  fi
  i=$((i + 1))
done

if [ "$ALL" = 1 ]; then
  if want "cursor" && [ ! -f ".cursor/rules/pilot-research.mdc" ]; then
    say "→ Writing per-repo rule files (--all)"
    write_rule_file ".cursor/rules/pilot-research.mdc" "$CURSOR_RULE"
    write_rule_file ".windsurf/rules/pilot-research.md" "$WINDSURF_RULE"
    write_rule_file ".clinerules/pilot-research.md" "$CLINE_RULE"
    write_rule_file ".github/copilot-instructions.md" "$COPILOT_RULE"
  fi
fi

install_cli

echo
say "pilot-research installer done"

if [ ${#INSTALLED[@]} -gt 0 ]; then
  ok "  installed:"
  for a in "${INSTALLED[@]}"; do printf '    • %s\n' "$a"; done
fi

if [ ${#SKIPPED[@]} -gt 0 ]; then
  echo "  skipped:"
  for a in "${SKIPPED[@]}"; do printf '    • %s\n' "$a"; done
fi

if [ ${#FAILED[@]} -gt 0 ]; then
  warn "  failed:"
  for a in "${FAILED[@]}"; do printf '    • %s\n' "$a"; done
fi

if [ ${#INSTALLED[@]} -eq 0 ] && [ ${#SKIPPED[@]} -eq 0 ]; then
  echo "  No agents detected. Run 'install.sh --list' to see supported agents."
  echo "  Or pass --only <agent> to force a specific target."
fi

echo
note "  Start a session and your agent will discover pilot-research skills automatically."
note "  Use 'pilot init' to initialize a research wiki in your project."
note "  Uninstall: remove the plugin directory and rule files manually."

exit 0