#!/usr/bin/env node
/**
 * Validates skill layout produced by install.sh into a fake $HOME (local repo skills source).
 */
import { spawnSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');
const INSTALL_SH = path.join(PROJECT_ROOT, 'install.sh');

const SKILL_IDS = [
  'using-pilot-research',
  'pilot-brainstorm',
  'pilot-literature',
  'pilot-execute',
  'pilot-write-paper',
  'pilot-peer-review',
];

function assert(cond, msg) {
  if (!cond) {
    console.error(`FAIL: ${msg}`);
    process.exit(1);
  }
}

function readSkillsRootFromPlugin() {
  const pluginPath = path.join(PROJECT_ROOT, '.opencode', 'plugins', 'pilot-research.js');
  const src = fs.readFileSync(pluginPath, 'utf8');
  const match = src.match(/path\.join\(configHome,\s*'opencode',\s*'skills'\)/);
  assert(match, 'OpenCode plugin should resolve skills under …/opencode/skills');
}

function main() {
  readSkillsRootFromPlugin();

  const fakeHome = fs.mkdtempSync(path.join(os.tmpdir(), 'pilot-install-'));
  const xdgConfig = path.join(fakeHome, '.config');
  fs.mkdirSync(xdgConfig, { recursive: true });

  const env = {
    ...process.env,
    HOME: fakeHome,
    XDG_CONFIG_HOME: xdgConfig,
    PILOT_REPO: 'nmd2k/pilot-research',
  };

  const agents = ['opencode', 'cursor', 'codex', 'claude', 'gemini'];
  for (const only of agents) {
    const r = spawnSync('bash', [INSTALL_SH, '--only', only, '--force'], {
      cwd: PROJECT_ROOT,
      env,
      encoding: 'utf8',
    });
    assert(r.status === 0, `install.sh --only ${only} exited ${r.status}\n${r.stderr}\n${r.stdout}`);
  }

  const opencodeSkills = path.join(xdgConfig, 'opencode', 'skills');
  const cursorSkills = path.join(fakeHome, '.cursor', 'skills');
  const agentsSkills = path.join(fakeHome, '.agents', 'skills');
  const claudeGlobal = path.join(fakeHome, '.claude', 'skills');
  const claudePluginSkills = path.join(fakeHome, '.claude-plugin', 'pilot-research', 'skills');

  for (const base of [opencodeSkills, cursorSkills, agentsSkills, claudeGlobal, claudePluginSkills]) {
    for (const id of SKILL_IDS) {
      const skillMd = path.join(base, id, 'SKILL.md');
      assert(fs.existsSync(skillMd), `missing ${skillMd}`);
    }
  }

  const templatePath = path.join(opencodeSkills, 'pilot-literature', 'paper-summary-template.md');
  assert(fs.existsSync(templatePath), 'templates must live beside SKILL.md (paper-summary-template.md)');

  assert(
    fs.existsSync(path.join(fakeHome, '.cursor', 'rules', 'pilot-research.mdc')),
    'cursor global rule missing',
  );
  assert(
    fs.existsSync(path.join(fakeHome, '.opencode', 'plugins', 'pilot-research.js')),
    'OpenCode plugin missing',
  );
  assert(
    fs.existsSync(path.join(fakeHome, '.agents', 'instructions.md')),
    'Codex instructions missing',
  );
  assert(
    fs.existsSync(path.join(fakeHome, '.gemini', 'instructions.md')),
    'Gemini instructions missing',
  );

  fs.rmSync(fakeHome, { recursive: true, force: true });
  console.log('install-layout: OK');
}

main();
