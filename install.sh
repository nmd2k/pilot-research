#!/usr/bin/env bash
set -euo pipefail

REPO="${PILOT_REPO:-nmd2k/pilot-research}"
RAW_BASE="https://raw.githubusercontent.com/$REPO/main"

DRY=0
FORCE=0
MINIMAL=0
ALL=0
LIST_ONLY=0
ONLY=()
NO_COLOR=0
UNINSTALL=0

if [ ! -t 1 ]; then NO_COLOR=1; fi

PILOT_CLI_URL_X64="$RAW_BASE/cli/bin/pilot-darwin-x64"
PILOT_CLI_URL_ARM64="$RAW_BASE/cli/bin/pilot-darwin-arm64"
PILOT_CLI_URL_LINUX="$RAW_BASE/cli/bin/pilot-linux-x64"

print_help() {
  cat <<'EOF'
pilot-research installer — detects your AI coding agents and installs pilot-research for each one.

USAGE
  install.sh [flags]

  curl -fsSL https://raw.githubusercontent.com/nmd2k/pilot-research/main/install.sh | bash
  curl -fsSL https://raw.githubusercontent.com/nmd2k/pilot-research/main/install.sh | bash -s -- --all

FLAGS
  --dry-run         Print what would run, do nothing.
  --force           Re-run even if already installed.
  --uninstall       Remove all plugins, skills, and the CLI.
  --only <agent>    Install only for the named agent. Repeatable (skips auto-detection).
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
    --uninstall)    UNINSTALL=1 ;;
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

PILOT_SKILL_NAMES=(
  using-pilot-research
  pilot-brainstorm
  pilot-literature
  pilot-execute
  pilot-write-paper
  pilot-peer-review
)

# Resolved once per run: absolute path to repo `skills/` tree (each child is one skill dir).
SKILLS_SRC=""
REMOTE_SKILLS_TMP=""

config_home() {
  printf '%s' "${XDG_CONFIG_HOME:-$HOME/.config}"
}

prepare_skills_source() {
  SKILLS_SRC=""
  if [ -n "$LOCAL_REPO" ]; then
    SKILLS_SRC="$LOCAL_REPO/skills"
    return 0
  fi
  if [ "$DRY" = 1 ]; then
    note "  dry-run: skipping skills tarball download"
    return 1
  fi
  if ! has curl; then
    warn "curl not found; cannot download skill files"
    return 1
  fi
  REMOTE_SKILLS_TMP="$(mktemp -d)"
  local tarball="$REMOTE_SKILLS_TMP/repo.tgz"
  if ! curl -fsSL "https://codeload.github.com/$REPO/tar.gz/main" -o "$tarball"; then
    warn "failed to download repository tarball for skills"
    rm -rf "$REMOTE_SKILLS_TMP"
    REMOTE_SKILLS_TMP=""
    return 1
  fi
  if ! tar -xzf "$tarball" -C "$REMOTE_SKILLS_TMP" 2>/dev/null; then
    warn "failed to extract repository tarball"
    rm -rf "$REMOTE_SKILLS_TMP"
    REMOTE_SKILLS_TMP=""
    return 1
  fi
  local extracted
  extracted="$(find "$REMOTE_SKILLS_TMP" -maxdepth 1 -mindepth 1 -type d ! -name '.*' | head -1)"
  if [ -z "$extracted" ] || [ ! -d "$extracted/skills" ]; then
    warn "unexpected archive layout (missing skills/)"
    rm -rf "$REMOTE_SKILLS_TMP"
    REMOTE_SKILLS_TMP=""
    return 1
  fi
  SKILLS_SRC="$extracted/skills"
  return 0
}

cleanup_remote_skills_tmp() {
  if [ -n "${REMOTE_SKILLS_TMP:-}" ] && [ -d "${REMOTE_SKILLS_TMP:-}" ]; then
    rm -rf "$REMOTE_SKILLS_TMP"
    REMOTE_SKILLS_TMP=""
  fi
}

sync_pilot_skills_to() {
  local dest_base="$1"
  if [ -z "${SKILLS_SRC:-}" ] || [ ! -d "${SKILLS_SRC:-}" ]; then
    warn "  skill sync skipped (no skills source)"
    return 1
  fi
  run mkdir -p "$dest_base"
  local name
  for name in "${PILOT_SKILL_NAMES[@]}"; do
    if [ ! -d "$SKILLS_SRC/$name" ]; then
      warn "  missing skill in source: $name"
      continue
    fi
    run rm -rf "$dest_base/$name"
    run mkdir -p "$dest_base/$name"
    run cp -R "$SKILLS_SRC/$name/." "$dest_base/$name/"
  done
  return 0
}

remove_legacy_nested_opencode_skills() {
  local legacy="$HOME/.opencode/skills/skills"
  if [ -d "$legacy" ]; then
    note "  removing legacy nested OpenCode skills dir: $legacy"
    if [ "$DRY" = 1 ]; then note "  would run: rm -rf \"$legacy\""; return 0; fi
    rm -rf "$legacy"
  fi
}

trap cleanup_remote_skills_tmp EXIT

INSTALLED=()
SKIPPED=()
FAILED=()

remove_pilot_skills_from() {
  local dest_base="$1"
  if [ -d "$dest_base" ]; then
    run rm -rf "$dest_base/pilot-"* "$dest_base/using-pilot-research" 2>/dev/null || true
  fi
}

uninstall_claude() {
  say "→ Uninstalling from Claude Code"
  run rm -rf "$HOME/.claude-plugin/pilot-research"
  remove_pilot_skills_from "$HOME/.claude/skills"
  INSTALLED+=("claude (uninstalled)")
}

uninstall_opencode() {
  say "→ Uninstalling from OpenCode"
  run rm -f "$HOME/.opencode/plugins/pilot-research.js"
  remove_pilot_skills_from "$(config_home)/opencode/skills"
  INSTALLED+=("opencode (uninstalled)")
}

uninstall_cursor() {
  say "→ Uninstalling from Cursor"
  run rm -f "$HOME/.cursor/rules/pilot-research.mdc"
  remove_pilot_skills_from "$HOME/.cursor/skills"
  INSTALLED+=("cursor (uninstalled)")
}

uninstall_windsurf() {
  say "→ Uninstalling from Windsurf"
  run rm -f ".windsurf/rules/pilot-research.md"
  INSTALLED+=("windsurf (uninstalled)")
}

uninstall_cline() {
  say "→ Uninstalling from Cline"
  run rm -f ".clinerules/pilot-research.md"
  INSTALLED+=("cline (uninstalled)")
}

uninstall_copilot() {
  say "→ Uninstalling from GitHub Copilot"
  run rm -f ".github/copilot-instructions.md"
  INSTALLED+=("copilot (uninstalled)")
}

uninstall_codex() {
  say "→ Uninstalling from Codex CLI"
  remove_pilot_skills_from "$HOME/.agents/skills"
  run rm -f "$HOME/.codex/instructions.md"
  INSTALLED+=("codex (uninstalled)")
}

uninstall_cli() {
  say "→ Uninstalling CLI"
  run rm -f "$HOME/.local/bin/pilot" "$HOME/.local/bin/pilot.tmp"
  if has npm; then
    run npm uninstall -g pilot-research 2>/dev/null || true
  fi
  INSTALLED+=("cli (uninstalled)")
}

install_claude() {
  say "→ Claude Code detected"
  local target_dir="$HOME/.claude-plugin/pilot-research"
  run mkdir -p "$target_dir/hooks"

  local gh_home="https://github.com/$REPO"
  if [ "$FORCE" = 1 ] || [ ! -f "$target_dir/plugin.json" ]; then
    local plugin_json
    plugin_json="$(printf '%s\n' '{' \
      '"name": "pilot-research",' \
      '"description": "Research workflow skills for coding agents",' \
      '"version": "0.1.0",' \
      '"author": { "name": "Pilot Research Contributors" },' \
      "\"homepage\": \"$gh_home\"," \
      "\"repository\": \"$gh_home\"," \
      '"license": "MIT",' \
      '"keywords": ["research", "pilot-literature", "pilot-brainstorm", "pilot-peer-review", "skills"]' \
      '}')"
    echo "$plugin_json" | run tee "$target_dir/plugin.json" > /dev/null

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
  else
    note "  Claude plugin.json already exists (use --force to refresh)"
    SKIPPED+=("claude:plugin-present")
  fi

  if [ "$FORCE" = 1 ] || [ ! -f "$target_dir/hooks/session-start" ]; then
    if [ -n "$LOCAL_REPO" ]; then
      run cp "$LOCAL_REPO/hooks/session-start" "$target_dir/hooks/session-start"
      run chmod +x "$target_dir/hooks/session-start"
    elif has curl; then
      run mkdir -p "$target_dir/hooks"
      curl -fsSL "$RAW_BASE/hooks/session-start" -o "$target_dir/hooks/session-start" 2>/dev/null
      chmod +x "$target_dir/hooks/session-start"
    else
      warn "  curl not found; cannot download session-start hook"
      FAILED+=("claude:curl-missing")
      return 1
    fi
  fi

  sync_pilot_skills_to "$target_dir/skills"
  sync_pilot_skills_to "$HOME/.claude/skills"

  ok "  pilot-research installed for Claude Code (~/.claude-plugin + ~/.claude/skills)"
  INSTALLED+=("claude")
}

install_opencode() {
  say "→ OpenCode detected"
  local target_dir="$HOME/.opencode/plugins"
  remove_legacy_nested_opencode_skills

  run mkdir -p "$target_dir"

  if [ "$FORCE" = 1 ] || [ ! -f "$target_dir/pilot-research.js" ]; then
    if [ -n "$LOCAL_REPO" ]; then
      run cp "$LOCAL_REPO/.opencode/plugins/pilot-research.js" "$target_dir/pilot-research.js"
    elif has curl; then
      run curl -fsSL "$RAW_BASE/.opencode/plugins/pilot-research.js" -o "$target_dir/pilot-research.js"
    else
      warn "  curl not found"
      FAILED+=("opencode:curl-missing")
      return 1
    fi
  else
    note "  OpenCode pilot-research.js already present (use --force to reinstall)"
    SKIPPED+=("opencode:plugin-present")
  fi

  local skills_root
  skills_root="$(config_home)/opencode/skills"
  sync_pilot_skills_to "$skills_root"

  ok "  pilot-research installed for OpenCode (plugin: ~/.opencode/plugins, skills: $skills_root)"
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

You have pilot-research skills installed under ~/.cursor/skills/. Follow the research workflow skills in your `.research/` wiki directory. Use the skill registry for: pilot-brainstorm, pilot-literature, pilot-execute, pilot-write-paper, pilot-peer-review. All research artifacts go into `.research/` using wikilink conventions.'

WINDSURF_RULE=$'# Pilot Research\n\nYou have pilot-research skills installed. Follow the research workflow skills in your `.research/` wiki directory. All research artifacts go into `.research/` using wikilink conventions.'

CLINE_RULE=$'# Pilot Research\n\nYou have pilot-research skills installed. Follow the research workflow skills in your `.research/` wiki directory. All research artifacts go into `.research/` using wikilink conventions.'

COPILOT_RULE=$'# Pilot Research\n\nYou have pilot-research skills installed. Follow the research workflow skills in your `.research/` wiki directory. All research artifacts go into `.research/` using wikilink conventions. Skills: pilot-brainstorm, pilot-literature, pilot-execute, pilot-write-paper, pilot-peer-review.'

CODEX_RULE=$'# Pilot Research\n\nYou have pilot-research skills installed under ~/.agents/skills/ (pilot-* and using-pilot-research). Follow the research workflow skills in your `.research/` wiki directory. All research artifacts go into `.research/` using wikilink conventions.'

install_cursor() {
  say "→ Cursor detected"
  write_rule_file "$HOME/.cursor/rules/pilot-research.mdc" "$CURSOR_RULE"
  sync_pilot_skills_to "$HOME/.cursor/skills"
  ok "  Cursor: rules → ~/.cursor/rules, skills → ~/.cursor/skills"
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
  sync_pilot_skills_to "$HOME/.agents/skills"
  write_rule_file "$HOME/.codex/instructions.md" "$CODEX_RULE"
  ok "  Codex / Agents skills → ~/.agents/skills"
  INSTALLED+=("codex")
}

install_cli() {
  if [ "$MINIMAL" = 1 ]; then return 0; fi

  say "→ Installing pilot CLI"
  local bin_dir="$HOME/.local/bin"
  run mkdir -p "$bin_dir"

  # 1) Installing from a repo checkout: thin wrapper → node cli/pilot.mjs (no prebuilt binary needed).
  if [ -n "$LOCAL_REPO" ] && [ -f "$LOCAL_REPO/cli/pilot.mjs" ]; then
    local wrapper="$bin_dir/pilot"
    if [ "$DRY" = 1 ]; then
      note "  would write $wrapper → node \"$LOCAL_REPO/cli/pilot.mjs\""
      INSTALLED+=("cli")
      return 0
    fi
    cat <<EOF > "${wrapper}.tmp"
#!/usr/bin/env bash
exec node "${LOCAL_REPO}/cli/pilot.mjs" "\$@"
EOF
    run mv "${wrapper}.tmp" "$wrapper"
    run chmod +x "$wrapper"
    ok "  pilot CLI → $wrapper (uses checkout at $LOCAL_REPO)"
    INSTALLED+=("cli")
    note "  Ensure $bin_dir is on your PATH."
    return 0
  fi

  # 2) Optional future: single-file prebuilt binaries under cli/bin/ on GitHub.
  # (Currently disabled: CLI relies on dynamic ESM imports and physical template files
  # which are best distributed via npm rather than a compiled standalone binary.)
  # local arch os binary_url=""
  # arch="$(uname -m)"
  # os="$(uname -s)"
  # if [ "$os" = "Darwin" ]; then
  #   if [ "$arch" = "arm64" ]; then binary_url="$PILOT_CLI_URL_ARM64"; else binary_url="$PILOT_CLI_URL_X64"; fi
  # elif [ "$os" = "Linux" ]; then
  #   binary_url="$PILOT_CLI_URL_LINUX"
  # fi
  #
  # if [ -n "$binary_url" ] && has curl; then
  #   note "  Trying prebuilt pilot binary…"
  #   if [ "$DRY" = 1 ]; then
  #     note "  would download: $binary_url → $bin_dir/pilot"
  #   elif curl -fsSL "$binary_url" -o "$bin_dir/pilot" 2>/dev/null; then
  #     chmod +x "$bin_dir/pilot"
  #     ok "  pilot CLI installed to $bin_dir/pilot"
  #     INSTALLED+=("cli")
  #     note "  Ensure $bin_dir is on your PATH."
  #     return 0
  #   fi
  # fi

  # 3) npm global (registry, then GitHub) — ships CLI + skills.
  if has npm; then
    note "  Installing pilot CLI via npm (global)…"
    if [ "$DRY" = 1 ]; then
      note "  would run: npm install -g pilot-research || npm install -g github:${REPO}"
      INSTALLED+=("cli")
      return 0
    fi
    if npm install -g pilot-research; then
      ok "  pilot CLI installed via npm (package: pilot-research)"
      INSTALLED+=("cli")
      return 0
    fi
    if npm install -g "github:${REPO}"; then
      ok "  pilot CLI installed via npm (github:${REPO})"
      INSTALLED+=("cli")
      return 0
    fi
    note "  npm global install failed (permissions, offline, or registry). Try: npm install -g github:${REPO}"
  else
    note "  npm not found."
  fi

  # 4) Last resort: launcher that delegates to npx (no global install; slower cold start).
  if has npx && has node; then
    local wrap="$bin_dir/pilot"
    if [ "$DRY" = 1 ]; then
      note "  would write npx launcher → $wrap (github:${REPO})"
      SKIPPED+=("cli:would-use-npx-launcher")
      return 0
    fi
    cat <<EOF > "${wrap}.tmp"
#!/usr/bin/env sh
exec npx --yes --package="github:${REPO}" pilot "\$@"
EOF
    run mv "${wrap}.tmp" "$wrap"
    run chmod +x "$wrap"
    ok "  pilot launcher → $wrap (npx + github:${REPO}; first run may download)"
    INSTALLED+=("cli")
    note "  Ensure $bin_dir is on your PATH."
    return 0
  fi

  warn "  Could not install pilot CLI. Install manually: npm install -g github:${REPO}"
  SKIPPED+=("cli:install-failed")
}

echo
say "pilot-research installer"
note "  $REPO"
if [ "$DRY" = 1 ]; then note "  (dry run — nothing will be written)"; fi
echo

if [ "$UNINSTALL" = 0 ]; then
  prepare_skills_source || note "  Continuing without a downloaded skills tree (local install only may still work)."
fi

i=0
total=${#PROVIDER_IDS[@]}
while [ $i -lt "$total" ]; do
  id="${PROVIDER_IDS[$i]}"
  label="${PROVIDER_LABELS[$i]}"
  detect_spec="${PROVIDER_DETECT[$i]}"
  
  run_install=0
  if want "$id"; then
    if [ ${#ONLY[@]} -gt 0 ]; then
      run_install=1
    elif detect_match "$detect_spec"; then
      run_install=1
    fi
  fi
  if [ "$run_install" = 1 ]; then
    if [ "$UNINSTALL" = 1 ]; then
      case "$id" in
        claude)  uninstall_claude ;;
        opencode) uninstall_opencode ;;
        cursor)  uninstall_cursor ;;
        windsurf) uninstall_windsurf ;;
        cline)   uninstall_cline ;;
        copilot)  uninstall_copilot ;;
        codex)   uninstall_codex ;;
      esac
    else
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
  fi
  i=$((i + 1))
done

if [ "$UNINSTALL" = 1 ]; then
  uninstall_cli
elif [ "$ALL" = 1 ]; then
  say "→ Writing per-repo rule files (--all)"
  write_rule_file ".cursor/rules/pilot-research.mdc" "$CURSOR_RULE"
  write_rule_file ".windsurf/rules/pilot-research.md" "$WINDSURF_RULE"
  write_rule_file ".clinerules/pilot-research.md" "$CLINE_RULE"
  write_rule_file ".github/copilot-instructions.md" "$COPILOT_RULE"
fi

if [ "$UNINSTALL" = 0 ]; then
  install_cli
fi

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
if [ "$UNINSTALL" = 0 ]; then
  note "  Start a session and your agent will discover pilot-research skills automatically."
  note "  Use 'pilot init' to initialize a research wiki in your project."
  note "  Uninstall: run 'install.sh --uninstall'"
fi

exit 0