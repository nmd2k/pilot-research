#!/usr/bin/env bash
set -e

echo "WARNING: scripts/init-wiki.sh is deprecated. Use 'pilot init' instead." >&2
echo "  Install the CLI: npm install -g pilot-research" >&2
echo "  Then run: pilot init [path]" >&2
echo "" >&2

if command -v node >/dev/null 2>&1; then
  SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
  PILOT="$SCRIPT_DIR/../cli/pilot.mjs"
  if [ -f "$PILOT" ]; then
    echo "Delegating to pilot init..." >&2
    node "$PILOT" init "$@"
    exit $?
  fi
fi

echo "pilot CLI not found. Falling back to legacy behavior..." >&2
echo "" >&2

WIKI_TEMPLATE_DIR="$(cd "$(dirname "$0")/.." && pwd)/wiki"
DEFAULT_DIR="./.research"

usage() {
    cat <<EOF
Usage: $(basename "$0") [OPTIONS] [TARGET_DIR]

Initialize a research wiki directory structure.

Options:
    --no-gitignore    Skip auto-appending the wiki path to .gitignore
    --help            Show this help message

Arguments:
    TARGET_DIR        Target directory for the wiki (default: ${DEFAULT_DIR})

The script will:
  1. Create the wiki directory structure
  2. Copy the README.md template
  3. Optionally add the wiki path to .gitignore
  4. Validate the created structure
EOF
}

NO_GITIGNORE=false
TARGET_DIR=""

while [[ $# -gt 0 ]]; do
    case "$1" in
        --no-gitignore)
            NO_GITIGNORE=true
            shift
            ;;
        --help)
            usage
            exit 0
            ;;
        -*)
            echo "Error: Unknown option $1" >&2
            usage >&2
            exit 1
            ;;
        *)
            if [[ -n "$TARGET_DIR" ]]; then
                echo "Error: Multiple target directories specified" >&2
                usage >&2
                exit 1
            fi
            TARGET_DIR="$1"
            shift
            ;;
    esac
done

if [[ -z "$TARGET_DIR" ]]; then
    if [[ -t 0 ]]; then
        read -rp "Enter target directory [${DEFAULT_DIR}]: " INPUT
        TARGET_DIR="${INPUT:-$DEFAULT_DIR}"
    else
        TARGET_DIR="$DEFAULT_DIR"
    fi
fi

SUBDIRS=(papers entities concepts queries plans experiments handoff)

echo "Initializing research wiki at: ${TARGET_DIR}"

if [[ -d "$TARGET_DIR" ]]; then
    echo "Warning: Directory ${TARGET_DIR} already exists."
fi

mkdir -p "$TARGET_DIR"

for subdir in "${SUBDIRS[@]}"; do
    mkdir -p "${TARGET_DIR}/${subdir}"
done

if [[ -f "${WIKI_TEMPLATE_DIR}/README.md" ]]; then
    cp "${WIKI_TEMPLATE_DIR}/README.md" "${TARGET_DIR}/README.md"
fi

for subdir in "${SUBDIRS[@]}"; do
    if [[ -f "${WIKI_TEMPLATE_DIR}/${subdir}/.gitkeep" ]]; then
        cp "${WIKI_TEMPLATE_DIR}/${subdir}/.gitkeep" "${TARGET_DIR}/${subdir}/.gitkeep"
    fi
done

if [[ "$NO_GITIGNORE" == false ]]; then
    GITIGNORE_PATH=".gitignore"
    NORMALIZED_DIR="$(echo "$TARGET_DIR" | sed 's:^\./::')/"

    if [[ -f "$GITIGNORE_PATH" ]]; then
        if grep -qxF "$NORMALIZED_DIR" "$GITIGNORE_PATH" 2>/dev/null || grep -qxF "${TARGET_DIR}/" "$GITIGNORE_PATH" 2>/dev/null; then
            echo "Entry already exists in .gitignore, skipping."
        else
            echo "" >> "$GITIGNORE_PATH"
            echo "${NORMALIZED_DIR}" >> "$GITIGNORE_PATH"
            echo "Added ${NORMALIZED_DIR} to .gitignore"
        fi
    else
        echo "${NORMALIZED_DIR}" > "$GITIGNORE_PATH"
        echo "Created .gitignore with ${NORMALIZED_DIR}"
    fi
fi

echo ""
echo "Validating wiki structure..."

MISSING=0
for subdir in "${SUBDIRS[@]}"; do
    if [[ ! -d "${TARGET_DIR}/${subdir}" ]]; then
        echo "Error: Missing directory ${TARGET_DIR}/${subdir}" >&2
        MISSING=1
    fi
done

if [[ ! -f "${TARGET_DIR}/README.md" ]]; then
    echo "Error: Missing ${TARGET_DIR}/README.md" >&2
    MISSING=1
fi

if [[ $MISSING -eq 1 ]]; then
    echo "Validation failed. Some directories or files are missing." >&2
    exit 1
fi

echo "Validation passed."
echo ""
echo "Research wiki initialized successfully at: ${TARGET_DIR}"
echo ""
echo "Structure:"
echo "  ${TARGET_DIR}/"
echo "  ├── README.md"
for subdir in "${SUBDIRS[@]}"; do
    echo "  ├── ${subdir}/"
done
echo ""
echo "Next steps:"
echo "  1. Start a research plan: create a file in ${TARGET_DIR}/plans/"
echo "  2. Review the wiki conventions: cat ${TARGET_DIR}/README.md"