#!/usr/bin/env node
// Transform [[type-slug]] wikilinks to [[folder/slug]] path-based wikilinks
// across all skills, templates, and docs.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const DIRS_TO_SCAN = [
  'skills',
  'docs',
];

// Replacement pairs (order matters: more specific first)
const replacements = [
  // Paper: [[paper-*]] -> [[papers/*]]
  [/(\[\[)paper-/g, '$1papers/'],
  // Entity: [[entity-*]] -> [[entities/*]]
  [/(\[\[)entity-/g, '$1entities/'],
  // Concept: [[concept-*]] -> [[concepts/*]]
  [/(\[\[)concept-/g, '$1concepts/'],
  // Query: [[query-*]] -> [[queries/*]]
  [/(\[\[)query-/g, '$1queries/'],
  // Plan-v: [[plan-v*]] -> [[plans/v*]] (must come before [[plan-]])
  [/(\[\[)plan-v/g, '$1plans/v'],
  // Plan: [[plan-*]] -> [[plans/*]] (catch-all for [[plan-...]] in docs)
  [/(\[\[)plan-/g, '$1plans/'],
  // Experiment: [[exp-*]] -> [[experiments/*]]
  [/(\[\[)exp-/g, '$1experiments/'],
  // Handoff: [[handoff-*]] -> [[handoff/*]]
  [/(\[\[)handoff-/g, '$1handoff/'],
];

function transformFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  for (const [pattern, replacement] of replacements) {
    const newContent = content.replace(pattern, replacement);
    if (newContent !== content) {
      changed = true;
      content = newContent;
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  UPDATED: ${path.relative(ROOT, filePath)}`);
  }
  return changed;
}

function walkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let count = 0;
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      count += walkDir(fullPath);
    } else if (entry.name.endsWith('.md')) {
      if (transformFile(fullPath)) count++;
    }
  }
  return count;
}

console.log('Transforming wikilinks from [[type-slug]] to [[folder/slug]]...\n');

let total = 0;
for (const dir of DIRS_TO_SCAN) {
  const fullPath = path.join(ROOT, dir);
  if (fs.existsSync(fullPath)) {
    console.log(`Scanning: ${dir}/`);
    const count = walkDir(fullPath);
    total += count;
  }
}

console.log(`\nDone. ${total} files updated.`);
