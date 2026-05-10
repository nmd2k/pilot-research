import { describe, it, expect, beforeAll } from 'vitest';
import { parseWiki, searchWiki, getPageByPath, getPageByTypeSlug, mapStatusToKanban, parseBacklogTable, getTasks, buildFileTree, getFileContent } from '../../parser.mjs';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = path.resolve(__dirname, '../fixtures/wiki');

describe('parseWiki', () => {
  let parsed;

  beforeAll(() => {
    parsed = parseWiki(FIXTURES_DIR);
  });

  it('parses all pages from all subdirectories', () => {
    expect(parsed.pages.length).toBeGreaterThan(0);
  });

  it('parses paper pages correctly', () => {
    const papers = parsed.pages.filter(p => p.type === 'paper');
    expect(papers.length).toBe(2);

    const testPaper = papers.find(p => p.slug === 'test-paper');
    expect(testPaper).toBeDefined();
    expect(testPaper.title).toBe('Test Paper: A Study in Unit Testing');
    expect(testPaper.frontmatter.authors).toBeDefined();
    expect(testPaper.frontmatter.year).toBe('2025');
    expect(testPaper.frontmatter.tags).toContain('testing');
  });

  it('parses entity pages correctly', () => {
    const entities = parsed.pages.filter(p => p.type === 'entity');
    expect(entities.length).toBe(1);

    const jane = entities.find(p => p.slug === 'jane-doe');
    expect(jane).toBeDefined();
    expect(jane.frontmatter.entity_type).toBe('author');
  });

  it('parses concept pages correctly', () => {
    const concepts = parsed.pages.filter(p => p.type === 'concept');
    expect(concepts.length).toBe(2);

    const tdd = concepts.find(p => p.slug === 'test-driven-dev');
    expect(tdd).toBeDefined();
    expect(tdd.frontmatter.concept_type).toBe('method');
  });

  it('parses experiment pages correctly', () => {
    const experiments = parsed.pages.filter(p => p.type === 'experiment');
    expect(experiments.length).toBe(1);

    const exp = experiments.find(p => p.slug === 'exp-dashboard-eval');
    expect(exp).toBeDefined();
    expect(exp.frontmatter.status).toBe('in-progress');
  });

  it('parses plan pages correctly', () => {
    const plans = parsed.pages.filter(p => p.type === 'plan');
    expect(plans.length).toBe(2);

    const v1 = plans.find(p => p.slug === 'v1');
    expect(v1).toBeDefined();
    expect(v1.frontmatter.version).toBe('1');
  });

  it('parses handoff pages correctly', () => {
    const handoffs = parsed.pages.filter(p => p.type === 'handoff');
    expect(handoffs.length).toBe(1);

    const handoff = handoffs.find(p => p.slug === '2025-01-20');
    expect(handoff).toBeDefined();
    expect(handoff.frontmatter.agent).toBe('test-agent');
  });

  it('extracts wikilinks from page body', () => {
    const testPaper = parsed.pages.find(p => p.slug === 'test-paper');
    expect(testPaper.wikilinks).toBeDefined();
    expect(testPaper.wikilinks).toContain('concept-test-driven-dev');
    expect(testPaper.wikilinks).toContain('entity-jane-doe');
  });

  it('extracts wikilinks from paper with cross-references', () => {
    const secondPaper = parsed.pages.find(p => p.slug === 'second-paper');
    expect(secondPaper.wikilinks).toContain('paper-test-paper');
    expect(secondPaper.wikilinks).toContain('concept-force-directed');
  });

  it('builds graph nodes from pages', () => {
    expect(parsed.graph.nodes.length).toBe(parsed.pages.length);

    const nodeTypes = parsed.graph.nodes.map(n => n.type);
    expect(nodeTypes).toContain('paper');
    expect(nodeTypes).toContain('entity');
    expect(nodeTypes).toContain('concept');
    expect(nodeTypes).toContain('experiment');
    expect(nodeTypes).toContain('plan');
    expect(nodeTypes).toContain('handoff');
  });

  it('builds graph edges from wikilinks', () => {
    const edgesFromTestPaper = parsed.graph.edges.filter(
      e => e.source === 'paper-test-paper'
    );
    expect(edgesFromTestPaper.length).toBeGreaterThan(0);
  });

  it('resolves wikilinks to target pages', () => {
    const edge = parsed.graph.edges.find(
      e => e.source === 'paper-test-paper' && e.target === 'concept-test-driven-dev'
    );
    expect(edge).toBeDefined();
  });

  it('handles dangling wikilinks as unresolved targets', () => {
    const secondPaper = parsed.pages.find(p => p.slug === 'second-paper');
    expect(secondPaper.wikilinks).toContain('paper-test-paper');

    const danglingEdge = parsed.graph.edges.find(
      e => e.source === 'paper-second-paper' && e.target === 'paper-test-paper'
    );
    expect(danglingEdge).toBeDefined();
  });

  it('computes stats for each type', () => {
    expect(parsed.stats.papers).toBe(2);
    expect(parsed.stats.entities).toBe(1);
    expect(parsed.stats.concepts).toBe(2);
    expect(parsed.stats.experiments).toBe(1);
    expect(parsed.stats.plans).toBe(2);
    expect(parsed.stats.handoff).toBe(1);
  });

  it('finds latest handoff date', () => {
    expect(parsed.stats.latestHandoff).toBe('2025-01-20');
  });

  it('finds backlog files in plans', () => {
    expect(parsed.stats.backlogFiles).toBeDefined();
    expect(parsed.stats.backlogFiles.length).toBe(1);
    expect(parsed.stats.backlogFiles[0]).toContain('backlog');
  });

  it('returns empty result for non-existent directory', () => {
    const result = parseWiki('/non/existent/path');
    expect(result.pages).toEqual([]);
    expect(result.graph.nodes).toEqual([]);
    expect(result.graph.edges).toEqual([]);
    expect(result.stats).toEqual({});
  });
});

describe('parseWiki — frontmatter parsing', () => {
  let parsed;

  beforeAll(() => {
    parsed = parseWiki(FIXTURES_DIR);
  });

  it('parses string frontmatter fields', () => {
    const testPaper = parsed.pages.find(p => p.slug === 'test-paper');
    expect(testPaper.frontmatter.title).toBe('Test Paper: A Study in Unit Testing');
    expect(testPaper.frontmatter.type).toBe('paper');
  });

  it('parses array frontmatter fields (tags)', () => {
    const testPaper = parsed.pages.find(p => p.slug === 'test-paper');
    expect(Array.isArray(testPaper.frontmatter.tags)).toBe(true);
    expect(testPaper.frontmatter.tags).toContain('testing');
  });

  it('uses title from frontmatter over slug', () => {
    const testPaper = parsed.pages.find(p => p.slug === 'test-paper');
    expect(testPaper.title).toBe('Test Paper: A Study in Unit Testing');
  });

  it('falls back to slug when title is missing', () => {
    const tmpDir = path.join(os.tmpdir(), 'pilot-test-no-title-' + Date.now());
    fs.mkdirSync(path.join(tmpDir, 'papers'), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, 'papers', 'no-title.md'), '---\ntype: paper\n---\n\nNo title here.');
    const result = parseWiki(tmpDir);
    const page = result.pages.find(p => p.slug === 'no-title');
    expect(page.title).toBe('no-title');
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('extracts relative file paths', () => {
    const testPaper = parsed.pages.find(p => p.slug === 'test-paper');
    expect(testPaper.filePath).toBe('papers/test-paper.md');
  });

  it('includes full body after frontmatter', () => {
    const testPaper = parsed.pages.find(p => p.slug === 'test-paper');
    expect(testPaper.body).toContain('# Test Paper: A Study in Unit Testing');
    expect(testPaper.body).toContain('Unit Testing');
  });
});

describe('searchWiki', () => {
  let parsed;

  beforeAll(() => {
    parsed = parseWiki(FIXTURES_DIR);
  });

  it('finds pages by keyword in title', () => {
    const results = searchWiki(parsed, 'Unit Testing');
    expect(results.length).toBeGreaterThan(0);
    const found = results.find(r => r.slug === 'test-paper');
    expect(found).toBeDefined();
  });

  it('finds pages by keyword in body', () => {
    const results = searchWiki(parsed, 'force-directed');
    expect(results.length).toBeGreaterThan(0);
  });

  it('returns empty results for non-matching query', () => {
    const results = searchWiki(parsed, 'xyznonexistent123456');
    expect(results.length).toBe(0);
  });

  it('returns empty results for empty query', () => {
    const results = searchWiki(parsed, '');
    expect(results.length).toBe(0);
  });

  it('is case-insensitive', () => {
    const lower = searchWiki(parsed, 'unit testing');
    const upper = searchWiki(parsed, 'UNIT TESTING');
    expect(lower.length).toBe(upper.length);
    expect(lower.length).toBeGreaterThan(0);
  });

  it('includes excerpts from matching lines', () => {
    const results = searchWiki(parsed, 'unit testing');
    const testPaper = results.find(r => r.slug === 'test-paper');
    expect(testPaper).toBeDefined();
    expect(testPaper.excerpts.length).toBeGreaterThan(0);
  });

  it('escapes regex special characters in query', () => {
    const results = searchWiki(parsed, 'test.2025');
    expect(results).toBeDefined();
  });
});

describe('getPageByPath', () => {
  let parsed;

  beforeAll(() => {
    parsed = parseWiki(FIXTURES_DIR);
  });

  it('finds a page by its file path', () => {
    const page = getPageByPath(parsed, 'papers/test-paper.md');
    expect(page).toBeDefined();
    expect(page.slug).toBe('test-paper');
  });

  it('finds pages in nested directories', () => {
    const page = getPageByPath(parsed, 'concepts/test-driven-dev.md');
    expect(page).toBeDefined();
    expect(page.slug).toBe('test-driven-dev');
  });

  it('returns null for non-existent path', () => {
    const page = getPageByPath(parsed, 'papers/nonexistent.md');
    expect(page).toBeNull();
  });
});

describe('getPageByTypeSlug', () => {
  let parsed;

  beforeAll(() => {
    parsed = parseWiki(FIXTURES_DIR);
  });

  it('finds a page by type and slug', () => {
    const page = getPageByTypeSlug(parsed, 'paper', 'test-paper');
    expect(page).toBeDefined();
    expect(page.title).toBe('Test Paper: A Study in Unit Testing');
  });

  it('returns null for wrong type', () => {
    const page = getPageByTypeSlug(parsed, 'entity', 'test-paper');
    expect(page).toBeNull();
  });

  it('returns null for non-existent slug', () => {
    const page = getPageByTypeSlug(parsed, 'paper', 'nonexistent');
    expect(page).toBeNull();
  });
});

describe('mapStatusToKanban', () => {
  it('maps draft to todo', () => {
    expect(mapStatusToKanban('draft')).toBe('todo');
  });

  it('maps empty string to todo', () => {
    expect(mapStatusToKanban('')).toBe('todo');
  });

  it('maps todo to todo', () => {
    expect(mapStatusToKanban('todo')).toBe('todo');
  });

  it('maps in-progress to pending', () => {
    expect(mapStatusToKanban('in-progress')).toBe('pending');
  });

  it('maps running to pending', () => {
    expect(mapStatusToKanban('running')).toBe('pending');
  });

  it('maps pending to pending', () => {
    expect(mapStatusToKanban('pending')).toBe('pending');
  });

  it('maps spaced in progress to pending', () => {
    expect(mapStatusToKanban('In Progress')).toBe('pending');
  });

  it('maps complete to done', () => {
    expect(mapStatusToKanban('complete')).toBe('done');
  });

  it('maps done to done', () => {
    expect(mapStatusToKanban('done')).toBe('done');
  });

  it('maps archive to archive', () => {
    expect(mapStatusToKanban('archive')).toBe('archive');
  });

  it('is case-insensitive', () => {
    expect(mapStatusToKanban('Draft')).toBe('todo');
    expect(mapStatusToKanban('In-Progress')).toBe('pending');
  });

  it('defaults unknown status to todo', () => {
    expect(mapStatusToKanban('unknown')).toBe('todo');
  });
});

describe('parseBacklogTable', () => {
  it('parses markdown table with headers', () => {
    const body = `| ID | Task | Status | Assignee |\n|----|------|--------|----------|\n| T1 | Do thing | done | agent |`;
    const tasks = parseBacklogTable(body);
    expect(tasks.length).toBe(1);
    expect(tasks[0].id).toBe('T1');
    expect(tasks[0].task).toBe('Do thing');
    expect(tasks[0].status).toBe('done');
    expect(tasks[0].assignee).toBe('agent');
  });

  it('parses multiple rows', () => {
    const body = `| ID | Task | Status |\n|----|------|--------|\n| T1 | First | todo |\n| T2 | Second | done |`;
    const tasks = parseBacklogTable(body);
    expect(tasks.length).toBe(2);
    expect(tasks[0].id).toBe('T1');
    expect(tasks[1].id).toBe('T2');
  });

  it('returns empty array for no table', () => {
    expect(parseBacklogTable('No table here')).toEqual([]);
  });

  it('parses backlog from fixture', () => {
    const parsed = parseWiki(FIXTURES_DIR);
    const backlog = parsed.pages.find(p => p.slug === 'v1-backlog');
    const tasks = parseBacklogTable(backlog.body);
    expect(tasks.length).toBe(4);
    expect(tasks[0].id).toBe('T1');
    expect(tasks[0].task).toBe('Write unit tests for parser');
    expect(tasks[0].status).toBe('done');
  });
});

describe('getTasks', () => {
  let parsed;

  beforeAll(() => {
    parsed = parseWiki(FIXTURES_DIR);
  });

  it('returns experiment and plan tasks', () => {
    const tasks = getTasks(parsed);
    const expTask = tasks.find(t => t.id === 'experiment-exp-dashboard-eval');
    expect(expTask).toBeDefined();
    expect(expTask.status).toBe('pending');
    expect(expTask.category).toBe('experiment');
  });

  it('maps plan status to kanban columns', () => {
    const tasks = getTasks(parsed);
    const planTask = tasks.find(t => t.id === 'plan-v1');
    expect(planTask).toBeDefined();
    expect(planTask.status).toBe('todo');
  });

  it('includes backlog table rows as tasks', () => {
    const tasks = getTasks(parsed);
    const backlogTasks = tasks.filter(t => t.category === 'backlog');
    expect(backlogTasks.length).toBeGreaterThan(0);
    expect(backlogTasks[0].category).toBe('backlog');
  });

  it('tasks have required fields', () => {
    const tasks = getTasks(parsed);
    for (const task of tasks) {
      expect(task.id).toBeDefined();
      expect(task.title).toBeDefined();
      expect(task.status).toBeDefined();
      expect(task.category).toBeDefined();
      expect(task.filePath).toBeDefined();
      expect(task.tags).toBeDefined();
    }
  });
});

describe('buildFileTree', () => {
  it('returns nested tree from wiki directory', () => {
    const tree = buildFileTree(FIXTURES_DIR);
    expect(tree.id).toBe('root');
    expect(tree.type).toBe('folder');
    expect(tree.children.length).toBeGreaterThan(0);
  });

  it('includes subdirectories as folder nodes', () => {
    const tree = buildFileTree(FIXTURES_DIR);
    const papers = tree.children.find(c => c.name === 'papers');
    expect(papers).toBeDefined();
    expect(papers.type).toBe('folder');
    expect(papers.children.length).toBeGreaterThan(0);
  });

  it('includes files as file nodes', () => {
    const tree = buildFileTree(FIXTURES_DIR);
    const papers = tree.children.find(c => c.name === 'papers');
    const mdFile = papers.children.find(c => c.name.endsWith('.md'));
    expect(mdFile).toBeDefined();
    expect(mdFile.type).toBe('file');
  });

  it('returns empty tree for non-existent directory', () => {
    const tree = buildFileTree('/non/existent/path');
    expect(tree.id).toBe('root');
    expect(tree.children).toEqual([]);
  });
});

describe('getFileContent', () => {
  it('returns parsed content for markdown files', () => {
    const result = getFileContent(FIXTURES_DIR, 'papers/test-paper.md');
    expect(result).not.toBeNull();
    expect(result.content).toBeDefined();
    expect(result.frontmatter).toBeDefined();
    expect(result.body).toContain('# Test Paper');
    expect(result.wikilinks).toContain('concept-test-driven-dev');
  });

  it('returns raw info for non-markdown files', () => {
    const tmpDir = path.join(os.tmpdir(), 'pilot-test-filecontent-' + Date.now());
    fs.mkdirSync(tmpDir, { recursive: true });
    fs.writeFileSync(path.join(tmpDir, 'data.txt'), 'hello world', 'utf8');
    const result = getFileContent(tmpDir, 'data.txt');
    expect(result).not.toBeNull();
    expect(result.content).toBe('hello world');
    expect(result.type).toBe('txt');
    expect(result.size).toBe(11);
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('returns null for non-existent files', () => {
    const result = getFileContent(FIXTURES_DIR, 'papers/nonexistent.md');
    expect(result).toBeNull();
  });

  it('returns null for path traversal', () => {
    const result = getFileContent(FIXTURES_DIR, '../server.mjs');
    expect(result).toBeNull();
  });
});