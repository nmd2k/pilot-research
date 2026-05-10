import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = path.resolve(__dirname, 'fixtures/wiki');

export function getFixturesDir() {
  return FIXTURES_DIR;
}

export function createTempWiki() {
  const tmpDir = path.join(FIXTURES_DIR, '..', '.tmp-wiki-' + Date.now());
  const subdirs = ['papers', 'entities', 'concepts', 'queries', 'plans', 'experiments', 'handoff'];

  fs.mkdirSync(tmpDir, { recursive: true });
  for (const subdir of subdirs) {
    fs.mkdirSync(path.join(tmpDir, subdir), { recursive: true });
  }

  return tmpDir;
}

export function cleanupTempWiki(dir) {
  if (fs.existsSync(dir) && dir.includes('.tmp-wiki-')) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

export function writeWikiFile(dir, subdir, filename, content) {
  const dirPath = path.join(dir, subdir);
  fs.mkdirSync(dirPath, { recursive: true });
  fs.writeFileSync(path.join(dirPath, filename), content, 'utf8');
}

export { FIXTURES_DIR };