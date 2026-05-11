#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

const SUBDIRS = ['papers', 'entities', 'concepts', 'queries', 'plans', 'experiments', 'handoff'];

const RESET = '\x1b[0m';
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const BOLD = '\x1b[1m';

function log(level, msg) {
  if (level === 'error') console.error(`${RED}Error:${RESET} ${msg}`);
  else if (level === 'warn') console.log(`${YELLOW}Warning:${RESET} ${msg}`);
  else if (level === 'success') console.log(`${GREEN}${msg}${RESET}`);
  else if (level === 'info') console.log(`${CYAN}${msg}${RESET}`);
  else console.log(msg);
}

function findWikiDir(startDir) {
  let dir = startDir;
  for (let i = 0; i < 20; i++) {
    const candidate = path.join(dir, '.research');
    if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) {
      return candidate;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

function readConfig(projectDir) {
  const cfgPath = path.join(projectDir, '.pilot-research.toml');
  if (fs.existsSync(cfgPath)) {
    const content = fs.readFileSync(cfgPath, 'utf8');
    const match = content.match(/wiki_path\s*=\s*["']?([^"'\n]+)["']?/);
    if (match) return { wiki_path: match[1].trim() };
  }
  return {};
}

function countFiles(dir) {
  if (!fs.existsSync(dir)) return 0;
  return fs.readdirSync(dir).filter(f => f.endsWith('.md')).length;
}

function latestFile(dir) {
  if (!fs.existsSync(dir)) return null;
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md')).sort();
  return files.length > 0 ? files[files.length - 1] : null;
}

function cmdInit(args) {
  let targetDir = null;
  let noGitignore = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--no-gitignore') { noGitignore = true; }
    else if (args[i] === '--help') { printInitHelp(); return; }
    else if (!args[i].startsWith('-')) { targetDir = args[i]; }
  }

  if (!targetDir) targetDir = './.research';
  targetDir = path.resolve(targetDir);

  const wikiTemplateDir = path.join(PROJECT_ROOT, 'wiki');

  if (fs.existsSync(targetDir)) {
    log('warn', `Directory ${targetDir} already exists.`);
  }

  fs.mkdirSync(targetDir, { recursive: true });

  for (const subdir of SUBDIRS) {
    fs.mkdirSync(path.join(targetDir, subdir), { recursive: true });
  }

  if (fs.existsSync(path.join(wikiTemplateDir, 'README.md'))) {
    fs.copyFileSync(path.join(wikiTemplateDir, 'README.md'), path.join(targetDir, 'README.md'));
  }

  for (const subdir of SUBDIRS) {
    const gitkeep = path.join(wikiTemplateDir, subdir, '.gitkeep');
    if (fs.existsSync(gitkeep)) {
      fs.copyFileSync(gitkeep, path.join(targetDir, subdir, '.gitkeep'));
    }
  }

  if (!noGitignore) {
    const normalized = targetDir.replace(path.resolve('.') + path.sep, '') + '/';
    const gitignorePath = path.resolve('.gitignore');
    let addEntry = true;
    if (fs.existsSync(gitignorePath)) {
      const content = fs.readFileSync(gitignorePath, 'utf8');
      if (content.includes(normalized) || content.includes(targetDir + '/')) {
        addEntry = false;
      }
    }
    if (addEntry) {
      const entry = '\n' + normalized + '\n';
      fs.appendFileSync(gitignorePath, entry);
      log('info', `Added ${normalized} to .gitignore`);
    } else {
      log('info', 'Entry already exists in .gitignore, skipping.');
    }
  }

  let missing = 0;
  for (const subdir of SUBDIRS) {
    if (!fs.existsSync(path.join(targetDir, subdir))) { missing++; }
  }
  if (!fs.existsSync(path.join(targetDir, 'README.md'))) { missing++; }

  if (missing > 0) {
    log('error', 'Validation failed. Some directories or files are missing.');
    process.exit(1);
  }

  log('success', `Research wiki initialized at: ${targetDir}`);
  console.log('');
  console.log('Structure:');
  console.log(`  ${targetDir}/`);
  console.log('  ├── README.md');
  for (const subdir of SUBDIRS) {
    console.log(`  ├── ${subdir}/`);
  }
  console.log('');
  console.log('Next steps:');
  console.log(`  1. Review wiki conventions: cat ${targetDir}/README.md`);
  console.log(`  2. Start researching by asking your agent to use pilot-brainstorm`);
}

function cmdQuery(args) {
  if (args.length === 0 || args[0] === '--help') { printQueryHelp(); return; }

  const terms = args.filter(a => !a.startsWith('--')).join(' ');
  if (!terms) {
    log('error', 'Missing search terms.');
    process.exit(1);
  }

  const config = readConfig(process.cwd());
  const wikiDir = config.wiki_path
    ? path.resolve(config.wiki_path)
    : findWikiDir(process.cwd());

  if (!wikiDir) {
    log('error', 'No research wiki found. Run `pilot init` first.');
    process.exit(1);
  }

  const pattern = new RegExp(terms.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  let found = 0;

  for (const dir of SUBDIRS) {
    const dirPath = path.join(wikiDir, dir);
    if (!fs.existsSync(dirPath)) continue;
    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.md'));

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const content = fs.readFileSync(filePath, 'utf8');

      if (!pattern.test(content)) continue;

      found++;
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
      let title = file.replace('.md', '');
      let pageType = dir;
      if (frontmatterMatch) {
        const titleMatch = frontmatterMatch[1].match(/title:\s*["']?(.+?)["']?\s*$/m);
        if (titleMatch) title = titleMatch[1];
        const typeMatch = frontmatterMatch[1].match(/^type:\s*(.+?)$/m);
        if (typeMatch) pageType = typeMatch[1];
      }

      const lines = content.split('\n');
      const matchingLines = lines.filter(l => pattern.test(l)).slice(0, 3);

      console.log(`\n${BOLD}${title}${RESET} ${CYAN}[${pageType}]${RESET}`);
      console.log(`  ${filePath}`);
      for (const line of matchingLines) {
        const trimmed = line.trim();
        if (trimmed) console.log(`  ${trimmed.substring(0, 120)}`);
      }
    }
  }

  if (found === 0) {
    log('info', `No pages matching "${terms}" found.`);
  } else {
    console.log(`\n${found} page(s) found.`);
  }
}

function cmdStatus(args) {
  const config = readConfig(process.cwd());
  const wikiDir = config.wiki_path
    ? path.resolve(config.wiki_path)
    : findWikiDir(process.cwd());

  if (!wikiDir) {
    log('error', 'No research wiki found. Run `pilot init` first.');
    process.exit(1);
  }

  console.log(`${BOLD}Research Wiki Status${RESET}`);
  console.log(`  Location: ${wikiDir}\n`);

  for (const dir of SUBDIRS) {
    const dirPath = path.join(wikiDir, dir);
    const count = countFiles(dirPath);
    console.log(`  ${dir.padEnd(14)} ${count} page(s)`);
  }

  const latestHandoff = latestFile(path.join(wikiDir, 'handoff'));
  if (latestHandoff) {
    console.log(`\n  Latest handoff: ${latestHandoff.replace('.md', '')}`);
  }

  const backlogFiles = fs.readdirSync(path.join(wikiDir, 'plans')).filter(f => f.includes('backlog') && f.endsWith('.md'));
  if (backlogFiles.length > 0) {
    console.log(`  Backlog files:  ${backlogFiles.join(', ')}`);
  }
}

function printHelp() {
  console.log(`${BOLD}pilot${RESET} — Research workflow CLI for pilot-research

${BOLD}Usage:${RESET}
  pilot <command> [options]

${BOLD}Commands:${RESET}
  init [path]         Initialize a research wiki (default: ./.research/)
  query <terms>       Search the wiki for matching pages
  status              Print wiki overview (page counts, latest handoff)

${BOLD}Options:${RESET}
  --help              Show help for a specific command
  --version           Show version

${BOLD}Configuration:${RESET}
  .pilot-research.toml  Project-level config (wiki_path override)
  PILOT_RESEARCH_WIKI   Environment variable for wiki path
`);
}

function printInitHelp() {
  console.log(`${BOLD}pilot init${RESET} — Initialize a research wiki

${BOLD}Usage:${RESET}
  pilot init [path] [options]

${BOLD}Options:${RESET}
  --no-gitignore      Skip adding the wiki path to .gitignore

${BOLD}Description:${RESET}
  Creates the wiki directory structure with subdirectories:
  papers/, entities/, concepts/, queries/, plans/, experiments/, handoff/
  Copies the README template and optionally updates .gitignore.
`);
}

function printQueryHelp() {
  console.log(`${BOLD}pilot query${RESET} — Search the research wiki

${BOLD}Usage:${RESET}
  pilot query <search terms>

${BOLD}Description:${RESET}
  Searches all wiki pages for matching terms. Searches both YAML
  frontmatter and body content. Shows title, type, and matching excerpts.
`);
}

const args = process.argv.slice(2);
const command = args[0];

if (!command || command === '--help' || command === '-h') { printHelp(); process.exit(0); }
if (command === '--version' || command === '-v') {
  const pkg = JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, 'package.json'), 'utf8'));
  console.log(`pilot-research v${pkg.version}`);
  process.exit(0);
}

const subArgs = args.slice(1);

switch (command) {
  case 'init': cmdInit(subArgs); break;
  case 'query': cmdQuery(subArgs); break;
  case 'status': cmdStatus(subArgs); break;
  default:
    log('error', `Unknown command: ${command}`);
    console.log('Run `pilot --help` for available commands.');
    process.exit(1);
}