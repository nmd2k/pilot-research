import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { startServer } from '../../server.mjs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = path.resolve(__dirname, '../fixtures/wiki');

let server = null;
let baseUrl = '';

function fetchJSON(urlPath) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlPath, baseUrl);
    const req = http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const body = JSON.parse(data);
          resolve({ status: res.statusCode, body });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error(`Request timeout: ${urlPath}`));
    });
  });
}

function fetchRaw(urlPath) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlPath, baseUrl);
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, data }));
    }).on('error', reject);
  });
}

function putJSON(urlPath, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlPath, baseUrl);
    const payload = JSON.stringify(body);
    const req = http.request(url, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) } }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

beforeAll(async () => {
  server = await new Promise((resolve) => {
    const s = startServer({ wikiDir: FIXTURES_DIR, port: 0 });
    s.on('listening', () => {
      const addr = s.address();
      baseUrl = `http://127.0.0.1:${addr.port}`;
      resolve(s);
    });
  });
});

afterAll(() => {
  if (server) server.close();
});

describe('API — GET /api/pages', () => {
  it('returns all pages with type, slug, title, filePath', async () => {
    const { status, body } = await fetchJSON('/api/pages');
    expect(status).toBe(200);
    expect(body.pages.length).toBeGreaterThan(0);

    const page = body.pages.find(p => p.slug === 'test-paper');
    expect(page).toBeDefined();
    expect(page.type).toBe('paper');
    expect(page.title).toBe('Test Paper: A Study in Unit Testing');
    expect(page.filePath).toBe('papers/test-paper.md');
    expect(page.wikilinks).toBeDefined();
  });

  it('includes tags from frontmatter', async () => {
    const { body } = await fetchJSON('/api/pages');
    const testPaper = body.pages.find(p => p.slug === 'test-paper');
    expect(testPaper.tags).toContain('testing');
  });

  it('includes date from frontmatter', async () => {
    const { body } = await fetchJSON('/api/pages');
    const testPaper = body.pages.find(p => p.slug === 'test-paper');
    expect(testPaper.date).toBeDefined();
  });

  it('includes status from frontmatter when present', async () => {
    const { body } = await fetchJSON('/api/pages');
    const secondPaper = body.pages.find(p => p.slug === 'second-paper');
    expect(secondPaper.status).toBe('complete');
  });
});

describe('API — GET /api/page/:path', () => {
  it('returns full page content by file path', async () => {
    const { status, body } = await fetchJSON('/api/page/papers/test-paper.md');
    expect(status).toBe(200);
    expect(body.page).toBeDefined();
    expect(body.page.slug).toBe('test-paper');
    expect(body.page.type).toBe('paper');
    expect(body.page.frontmatter).toBeDefined();
    expect(body.page.body).toContain('# Test Paper');
  });

  it('returns page by type/slug', async () => {
    const { status, body } = await fetchJSON('/api/page/paper/test-paper');
    expect(status).toBe(200);
    expect(body.page.slug).toBe('test-paper');
  });

  it('returns 404 for non-existent page', async () => {
    const { status } = await fetchJSON('/api/page/papers/nonexistent.md');
    expect(status).toBe(404);
  });
});

describe('API — GET /api/graph', () => {
  it('returns graph with nodes and edges', async () => {
    const { status, body } = await fetchJSON('/api/graph');
    expect(status).toBe(200);
    expect(body.nodes.length).toBeGreaterThan(0);
    expect(body.edges.length).toBeGreaterThan(0);
  });

  it('nodes have id, type, slug, title, filePath', async () => {
    const { body } = await fetchJSON('/api/graph');
    const node = body.nodes[0];
    expect(node.id).toBeDefined();
    expect(node.type).toBeDefined();
    expect(node.slug).toBeDefined();
    expect(node.title).toBeDefined();
    expect(node.filePath).toBeDefined();
  });

  it('edges have source and target', async () => {
    const { body } = await fetchJSON('/api/graph');
    const edge = body.edges[0];
    expect(edge.source).toBeDefined();
    expect(edge.target).toBeDefined();
  });

  it('graph nodes represent different page types', async () => {
    const { body } = await fetchJSON('/api/graph');
    const types = [...new Set(body.nodes.map(n => n.type))];
    expect(types.length).toBeGreaterThan(1);
  });
});

describe('API — GET /api/search', () => {
  it('finds pages matching query', async () => {
    const { status, body } = await fetchJSON('/api/search?q=testing');
    expect(status).toBe(200);
    expect(body.results.length).toBeGreaterThan(0);
  });

  it('returns empty results for non-matching query', async () => {
    const { status, body } = await fetchJSON('/api/search?q=xyznonexistent123');
    expect(status).toBe(200);
    expect(body.results.length).toBe(0);
  });

  it('includes excerpts in search results', async () => {
    const { body } = await fetchJSON('/api/search?q=Unit+Testing');
    const result = body.results.find(r => r.slug === 'test-paper');
    if (result) {
      expect(result.excerpts).toBeDefined();
    }
  });

  it('returns empty for empty query', async () => {
    const { body } = await fetchJSON('/api/search?q=');
    expect(body.results.length).toBe(0);
  });
});

describe('API — GET /api/stats', () => {
  it('returns page counts by type', async () => {
    const { status, body } = await fetchJSON('/api/stats');
    expect(status).toBe(200);
    expect(body.papers).toBe(2);
    expect(body.entities).toBe(1);
    expect(body.concepts).toBe(2);
  });

  it('includes latest handoff date', async () => {
    const { body } = await fetchJSON('/api/stats');
    expect(body.latestHandoff).toBe('2025-01-20');
  });
});

describe('API — static file serving', () => {
  it('serves index.html for root path', async () => {
    const res = await new Promise((resolve, reject) => {
      http.get(`${baseUrl}/`, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => resolve({ status: res.statusCode, data }));
      }).on('error', reject);
    });
    expect(res.status).toBe(200);
    expect(res.data).toContain('Pilot Research');
  });

  it('returns 404 for unknown paths that are not API or static files', async () => {
    const res = await new Promise((resolve, reject) => {
      http.get(`${baseUrl}/nonexistent-page`, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => resolve({ status: res.statusCode }));
      }).on('error', reject);
    });
    expect(res.status).toBe(404);
  });
});

describe('API — GET /api/pages?type=X', () => {
  it('filters pages by type=paper', async () => {
    const { status, body } = await fetchJSON('/api/pages?type=paper');
    expect(status).toBe(200);
    expect(body.pages.length).toBeGreaterThan(0);
    body.pages.forEach(p => expect(p.type).toBe('paper'));
  });

  it('filters pages by type=concept', async () => {
    const { status, body } = await fetchJSON('/api/pages?type=concept');
    expect(status).toBe(200);
    body.pages.forEach(p => expect(p.type).toBe('concept'));
    expect(body.pages.length).toBe(2);
  });

  it('returns all pages when no type filter', async () => {
    const { body: allPages } = await fetchJSON('/api/pages');
    const { body: filteredPages } = await fetchJSON('/api/pages?type=paper');
    expect(filteredPages.pages.length).toBeLessThan(allPages.pages.length);
  });

  it('returns empty array for unknown type', async () => {
    const { status, body } = await fetchJSON('/api/pages?type=nonexistent');
    expect(status).toBe(200);
    expect(body.pages).toEqual([]);
  });
});

describe('API — GET /api/tasks', () => {
  it('returns tasks array', async () => {
    const { status, body } = await fetchJSON('/api/tasks');
    expect(status).toBe(200);
    expect(Array.isArray(body.tasks)).toBe(true);
    expect(body.tasks.length).toBeGreaterThan(0);
  });

  it('includes experiment tasks with mapped status', async () => {
    const { body } = await fetchJSON('/api/tasks');
    const expTask = body.tasks.find(t => t.id === 'experiment-exp-dashboard-eval');
    expect(expTask).toBeDefined();
    expect(expTask.title).toBeDefined();
    expect(expTask.status).toBe('pending');
    expect(expTask.category).toBe('experiment');
    expect(expTask.filePath).toBeDefined();
  });

  it('includes plan tasks with mapped status', async () => {
    const { body } = await fetchJSON('/api/tasks');
    const planTask = body.tasks.find(t => t.id === 'plan-v1');
    expect(planTask).toBeDefined();
    expect(planTask.status).toBe('todo');
  });

  it('maps draft status to todo', async () => {
    const { body } = await fetchJSON('/api/tasks');
    const planTask = body.tasks.find(t => t.id === 'plan-v1');
    expect(planTask.status).toBe('todo');
  });

  it('maps in-progress status to pending', async () => {
    const { body } = await fetchJSON('/api/tasks');
    const expTask = body.tasks.find(t => t.id === 'experiment-exp-dashboard-eval');
    expect(expTask.status).toBe('pending');
  });

  it('maps done status from backlog tables', async () => {
    const { body } = await fetchJSON('/api/tasks');
    const t1 = body.tasks.find(t => t.id === 'T1');
    expect(t1).toBeDefined();
    expect(t1.status).toBe('done');
  });

  it('includes backlog table tasks from plan files', async () => {
    const { body } = await fetchJSON('/api/tasks');
    const backlogTasks = body.tasks.filter(t => t.category === 'backlog');
    expect(backlogTasks.length).toBeGreaterThan(0);

    const t1 = backlogTasks.find(t => t.id === 'T1');
    expect(t1).toBeDefined();
    expect(t1.title).toBe('Write unit tests for parser');
    expect(t1.assignee).toBe('agent');
  });

  it('tasks have required fields', async () => {
    const { body } = await fetchJSON('/api/tasks');
    for (const task of body.tasks) {
      expect(task.id).toBeDefined();
      expect(task.title).toBeDefined();
      expect(task.status).toBeDefined();
      expect(task.category).toBeDefined();
      expect(task.filePath).toBeDefined();
      expect(task.tags).toBeDefined();
    }
  });
});

describe('API — GET /api/graph?filter=paper', () => {
  it('filters nodes by type', async () => {
    const { status, body } = await fetchJSON('/api/graph?filter=paper');
    expect(status).toBe(200);
    body.nodes.forEach(n => expect(n.type).toBe('paper'));
  });

  it('returns only edges connected to filtered nodes', async () => {
    const { status, body } = await fetchJSON('/api/graph?filter=paper');
    expect(status).toBe(200);
    const nodeIds = new Set(body.nodes.map(n => n.id));
    body.edges.forEach(e => {
      const connected = nodeIds.has(e.source) || nodeIds.has(e.target);
      expect(connected).toBe(true);
    });
  });

  it('includes category field on nodes', async () => {
    const { body } = await fetchJSON('/api/graph');
    body.nodes.forEach(n => {
      expect(n.category).toBeDefined();
    });
  });

  it('returns fewer nodes when filter is applied', async () => {
    const { body: all } = await fetchJSON('/api/graph');
    const { body: filtered } = await fetchJSON('/api/graph?filter=paper');
    expect(filtered.nodes.length).toBeLessThan(all.nodes.length);
    expect(filtered.nodes.length).toBeGreaterThan(0);
  });
});

describe('API — GET /api/file-tree', () => {
  it('returns nested directory tree', async () => {
    const { status, body } = await fetchJSON('/api/file-tree');
    expect(status).toBe(200);
    expect(body.id).toBe('root');
    expect(body.type).toBe('folder');
    expect(body.children).toBeDefined();
    expect(body.children.length).toBeGreaterThan(0);
  });

  it('includes folders and files with correct types', async () => {
    const { body } = await fetchJSON('/api/file-tree');
    const folders = body.children.filter(c => c.type === 'folder');
    expect(folders.length).toBeGreaterThan(0);

    const papersFolder = folders.find(f => f.name === 'papers');
    expect(papersFolder).toBeDefined();
    expect(papersFolder.children.length).toBeGreaterThan(0);

    const mdFile = papersFolder.children.find(f => f.name.endsWith('.md'));
    expect(mdFile).toBeDefined();
    expect(mdFile.type).toBe('file');
    expect(mdFile.id).toContain('papers/');
  });

  it('folders have id, name, type, children', async () => {
    const { body } = await fetchJSON('/api/file-tree');
    const papersFolder = body.children.find(c => c.name === 'papers');
    expect(papersFolder.id).toBeDefined();
    expect(papersFolder.name).toBe('papers');
    expect(papersFolder.type).toBe('folder');
    expect(Array.isArray(papersFolder.children)).toBe(true);
  });
});

describe('API — GET /api/file/:path', () => {
  it('returns parsed content for markdown files', async () => {
    const { status, body } = await fetchJSON('/api/file/papers/test-paper.md');
    expect(status).toBe(200);
    expect(body.content).toBeDefined();
    expect(body.frontmatter).toBeDefined();
    expect(body.body).toContain('# Test Paper');
    expect(body.wikilinks).toBeDefined();
    expect(body.wikilinks).toContain('concept-test-driven-dev');
  });

  it('returns 404 for non-existent file', async () => {
    const { status } = await fetchJSON('/api/file/papers/nonexistent.md');
    expect(status).toBe(404);
  });
});

describe('API — GET /api/file/:path?raw=true', () => {
  it('returns raw markdown content', async () => {
    const result = await fetchRaw('/api/file/papers/test-paper.md?raw=true');
    expect(result.status).toBe(200);
    expect(result.data).toContain('Test Paper');
    expect(result.headers['content-type']).toContain('text/markdown');
  });
});

describe('API — PUT /api/page/:path', () => {
  const testFileName = 'put-test-' + Date.now() + '.md';
  const testFilePath = 'papers/' + testFileName;

  afterAll(() => {
    const fullPath = path.join(FIXTURES_DIR, testFilePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  });

  it('creates a new page', async () => {
    const content = '---\ntype: paper\ntitle: "Put Test Paper"\ntags: [test]\n---\n\nTest content.';
    const { status, body } = await putJSON(`/api/page/${testFilePath}`, { content });
    expect(status).toBe(200);
    expect(body.success).toBe(true);

    const written = fs.readFileSync(path.join(FIXTURES_DIR, testFilePath), 'utf8');
    expect(written).toBe(content);
  });

  it('updates an existing page', async () => {
    const newContent = '---\ntype: paper\ntitle: "Updated Put Test Paper"\ntags: [test, updated]\n---\n\nUpdated content.';
    const { status, body } = await putJSON(`/api/page/${testFilePath}`, { content: newContent });
    expect(status).toBe(200);
    expect(body.success).toBe(true);

    const written = fs.readFileSync(path.join(FIXTURES_DIR, testFilePath), 'utf8');
    expect(written).toBe(newContent);
  });

  it('returns 400 for missing content field', async () => {
    const { status, body } = await putJSON('/api/page/papers/test.md', {});
    expect(status).toBe(400);
    expect(body.error).toBeDefined();
  });

  it('returns 400 for invalid JSON', async () => {
    const result = await new Promise((resolve, reject) => {
      const url = new URL('/api/page/papers/test.md', baseUrl);
      const req = http.request(url, { method: 'PUT', headers: { 'Content-Type': 'application/json' } }, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
          catch { resolve({ status: res.statusCode, body: data }); }
        });
      });
      req.on('error', reject);
      req.write('not json');
      req.end();
    });
    expect(result.status).toBe(400);
  });

  it('invalidates wiki cache after update', async () => {
    const cacheContent = '---\ntype: paper\ntitle: "Cache Invalidation Test"\ntags: [cache-test]\n---\n\nCache content.';
    const cacheFilePath = 'papers/cache-test-' + Date.now() + '.md';
    await putJSON(`/api/page/${cacheFilePath}`, { content: cacheContent });

    const { body } = await fetchJSON('/api/pages?type=paper');
    const found = body.pages.find(p => p.slug && p.slug.startsWith('cache-test-'));
    expect(found).toBeDefined();

    const fullPath = path.join(FIXTURES_DIR, cacheFilePath);
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
  });
});