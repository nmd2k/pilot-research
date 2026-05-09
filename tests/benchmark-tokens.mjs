#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

const SKILLS_DIR = path.join(PROJECT_ROOT, 'skills');
const BOOTSTRAP_FILE = path.join(SKILLS_DIR, 'using-pilot-research', 'SKILL.md');
const HOOKS_DIR = path.join(PROJECT_ROOT, 'hooks');
const SESSION_START = path.join(HOOKS_DIR, 'session-start');
const OPENCODE_PLUGIN = path.join(PROJECT_ROOT, '.opencode', 'plugins', 'pilot-research.js');

const SKILL_NAMES = [
  'brainstorming',
  'literature-review',
  'execute-research',
  'write-paper',
  'peer-review',
];

function estimateTokens(text) {
  return Math.round(text.length / 4);
}

function stripFrontmatter(content) {
  const match = content.match(/^---\n[\s\S]*?\n---\n?/);
  if (match) return content.slice(match[0].length);
  return content;
}

function readSkillContent(skillName) {
  const skillPath = path.join(SKILLS_DIR, skillName, 'SKILL.md');
  if (!fs.existsSync(skillPath)) return null;
  return fs.readFileSync(skillPath, 'utf8');
}

function readBootstrapContent() {
  if (!fs.existsSync(BOOTSTRAP_FILE)) return null;
  return fs.readFileSync(BOOTSTRAP_FILE, 'utf8');
}

function simulateOpenCodeInjection() {
  const content = readBootstrapContent();
  if (!content) return null;
  const body = stripFrontmatter(content);
  const toolMapping = `**Tool Mapping for OpenCode:**
When skills reference tools you don't have, substitute OpenCode equivalents:
- \`TodoWrite\` → \`todowrite\`
- \`Task\` tool with subagents → Use OpenCode's subagent system (@mention)
- \`Skill\` tool → OpenCode's native \`skill\` tool
- \`Read\`, \`Write\`, \`Edit\`, \`Bash\` → Your native tools

Use OpenCode's native \`skill\` tool to list and load skills.`;

  return `<EXTREMELY_IMPORTANT>
You have pilot-research.

**IMPORTANT: The using-pilot-research skill content is included below. It is ALREADY LOADED - you are currently following it. Do NOT use the skill tool to load "using-pilot-research" again - that would be redundant.**

${body}

${toolMapping}
</EXTREMELY_IMPORTANT>`;
}

function simulateClaudeCodeInjection() {
  const content = readBootstrapContent();
  if (!content) return null;
  const body = stripFrontmatter(content);

  const tmLines = [
    "",
    "",
    "**Tool Mapping for OpenCode:**",
    "When skills reference tools you don't have, substitute OpenCode equivalents:",
    "- `TodoWrite` → `todowrite`",
    "- `Task` tool with subagents → Use OpenCode's subagent system (@mention)",
    "- `Skill` tool → OpenCode's native `skill` tool",
    "- `Read`, `Write`, `Edit`, `Bash` → Your native tools",
    "",
    "Use OpenCode's native `skill` tool to list and load skills.",
  ];
  const toolMapping = tmLines.join("\n");

  const preamble = "You have pilot-research.\n\n**IMPORTANT: The using-pilot-research skill content is included below. It is ALREADY LOADED - you are currently following it. Do NOT use the skill tool to load \"using-pilot-research\" again - that would be redundant.**\n\n";
  const sessionContext = "<EXTREMELY_IMPORTANT>\n" + preamble + body + toolMapping + "\n</EXTREMELY_IMPORTANT>";

  return sessionContext;
}

const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';
const CYAN = '\x1b[36m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';

console.log(`${BOLD}${CYAN}═`.repeat(40) + RESET);
console.log(`${BOLD}Pilot Research — Token Benchmark${RESET}`);
console.log(`${BOLD}${CYAN}═`.repeat(40) + RESET);
console.log('');

const bootstrap = readBootstrapContent();
if (!bootstrap) {
  console.log(`${RED}Bootstrap SKILL.md not found${RESET}`);
  process.exit(1);
}

const bootstrapBody = stripFrontmatter(bootstrap);
const bootstrapChars = bootstrapBody.length;
const bootstrapTokens = estimateTokens(bootstrapBody);

console.log(`${BOLD}Bootstrap Injection (always-on)${RESET}`);
console.log(`${'─'.repeat(50)}`);
console.log(`  Source:           skills/using-pilot-research/SKILL.md`);
console.log(`  Raw chars:       ${bootstrap.length.toLocaleString()}`);
console.log(`  Body chars:      ${bootstrapChars.toLocaleString()} (after frontmatter)`);
console.log(`  Est. tokens:     ~${bootstrapTokens.toLocaleString()} (4 chars/token)`);
console.log('');

const opencodeInjection = simulateOpenCodeInjection();
const claudeInjection = simulateClaudeCodeInjection();

console.log(`${BOLD}Full Session Injection (per-platform)${RESET}`);
console.log(`${'─'.repeat(50)}`);

if (opencodeInjection) {
  console.log(`  OpenCode:`);
  console.log(`    Chars:       ${opencodeInjection.length.toLocaleString()}`);
  console.log(`    Est. tokens: ~${estimateTokens(opencodeInjection).toLocaleString()}`);
}

if (claudeInjection) {
  console.log(`  Claude Code (JSON-escaped):`);
  console.log(`    Chars:       ${claudeInjection.length.toLocaleString()}`);
  console.log(`    Est. tokens:  ~${estimateTokens(claudeInjection).toLocaleString()}`);
}
console.log('');

console.log(`${BOLD}Per-Skill Load (on-demand)${RESET}`);
console.log(`${'─'.repeat(50)}`);

const perSkillData = [];
for (const name of SKILL_NAMES) {
  const content = readSkillContent(name);
  if (!content) {
    console.log(`  ${name}: ${RED}NOT FOUND${RESET}`);
    continue;
  }
  const body = stripFrontmatter(content);
  const chars = body.length;
  const tokens = estimateTokens(body);
  perSkillData.push({ name, chars, tokens });
  console.log(`  ${name.padEnd(22)} ${chars.toLocaleString().padStart(8)} chars   ~${tokens.toLocaleString().padStart(6)} tokens`);
}
console.log('');

const totalOnDemand = perSkillData.reduce((sum, s) => sum + s.tokens, 0);
console.log(`${BOLD}Total if ALL skills loaded at once${RESET}`);
console.log(`${'─'.repeat(50)}`);
console.log(`  Bootstrap:     ~${bootstrapTokens.toLocaleString()} tokens (always)`);
console.log(`  All 5 skills:  ~${totalOnDemand.toLocaleString()} tokens (if all loaded)`);
console.log(`  Combined:      ~${(bootstrapTokens + totalOnDemand).toLocaleString()} tokens`);
console.log('');

console.log(`${BOLD}Budget Targets${RESET}`);
console.log(`${'─'.repeat(50)}`);

function status(actual, target) {
  if (actual <= target) return `${GREEN}OK${RESET} (${actual} <= ${target})`;
  const over = actual - target;
  const pct = Math.round((over / target) * 100);
  return `${RED}OVER${RESET} by ${over} tokens (${pct}% over limit)`;
}

console.log(`  Bootstrap (<=2000):   ${status(bootstrapTokens, 2000)}`);
console.log(`  Per skill (<=1500):`);
for (const s of perSkillData) {
  console.log(`    ${s.name.padEnd(22)} ${status(s.tokens, 1500)}`);
}
const maxSession = bootstrapTokens + Math.max(...perSkillData.map(s => s.tokens), 0);
console.log(`  Session+1 skill (<=3500): ${status(maxSession, 3500)}`);
console.log('');

console.log(`${BOLD}${CYAN}═`.repeat(40) + RESET);