import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseWiki, searchWiki, getPageByPath, getPageByTypeSlug, getTasks, buildFileTree, getFileContent } from './parser.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, 'public');
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.md': 'text/markdown',
  '.txt': 'text/plain',
  '.csv': 'text/csv',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.pdf': 'application/pdf',
};

let wikiCache = null;
let wikiDir = null;
let watcher = null;

function loadWiki() {
  if (!wikiDir) return { pages: [], graph: { nodes: [], edges: [] }, stats: {} };
  wikiCache = parseWiki(wikiDir);
  return wikiCache;
}

function watchWiki(wikiPath) {
  if (watcher) {
    watcher.close();
    watcher = null;
  }

  try {
    watcher = fs.watch(wikiPath, { recursive: true }, () => {
      wikiCache = null;
    });
  } catch {
    // recursive watch may not be supported on all platforms
  }
}

function serveStatic(req, res) {
  let urlPath = req.url === '/' ? '/index.html' : req.url;
  if (urlPath.startsWith('/api/')) return false;

  const filePath = path.join(PUBLIC_DIR, urlPath);
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return true;
  }

  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    return false;
  }

  const ext = path.extname(filePath);
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': contentType });
  res.end(fs.readFileSync(filePath));
  return true;
}

function serveAPI(req, res, parsed) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  if (!pathname.startsWith('/api/')) return false;

  res.setHeader('Content-Type', 'application/json');

  if (pathname === '/api/pages') {
    const typeFilter = url.searchParams.get('type');
    let filteredPages = parsed.pages;
    if (typeFilter) {
      filteredPages = parsed.pages.filter(p => p.type === typeFilter);
    }
    const pages = filteredPages.map(p => ({
      type: p.type,
      slug: p.slug,
      title: p.title,
      filePath: p.filePath,
      tags: p.tags,
      date: p.date,
      status: p.status,
      wikilinks: p.wikilinks,
    }));
    res.writeHead(200);
    res.end(JSON.stringify({ pages }));
    return true;
  }

  const pageMatch = pathname.match(/^\/api\/page\/(.+)$/);
  if (pageMatch) {
    const decoded = decodeURIComponent(pageMatch[1]);

    if (req.method === 'PUT') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const data = JSON.parse(body);
          if (!data.content) {
            res.writeHead(400);
            res.end(JSON.stringify({ error: 'Missing content field' }));
            return;
          }
          const filePath = path.join(wikiDir, decoded);
          const resolved = path.resolve(filePath);
          if (!resolved.startsWith(path.resolve(wikiDir) + path.sep) && resolved !== path.resolve(wikiDir)) {
            res.writeHead(403);
            res.end(JSON.stringify({ error: 'Forbidden' }));
            return;
          }
          fs.mkdirSync(path.dirname(resolved), { recursive: true });
          fs.writeFileSync(resolved, data.content, 'utf8');
          wikiCache = null;
          res.writeHead(200);
          res.end(JSON.stringify({ success: true }));
        } catch (e) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Invalid JSON' }));
        }
      });
      return true;
    }

    const page = getPageByPath(parsed, decoded) || getPageByTypeSlug(parsed, ...decoded.split('/'));
    if (!page) {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Page not found' }));
      return true;
    }
    res.writeHead(200);
    res.end(JSON.stringify({ page }));
    return true;
  }

  if (pathname === '/api/tasks') {
    const tasks = getTasks(parsed);
    res.writeHead(200);
    res.end(JSON.stringify({ tasks }));
    return true;
  }

  if (pathname === '/api/graph') {
    const filter = url.searchParams.get('filter');
    let nodes = parsed.graph.nodes;
    let edges = parsed.graph.edges;

    if (filter) {
      const filteredNodeIds = new Set(nodes.filter(n => n.type === filter).map(n => n.id));
      nodes = nodes.filter(n => n.type === filter);
      edges = edges.filter(e => filteredNodeIds.has(e.source) || filteredNodeIds.has(e.target));
    }

    res.writeHead(200);
    res.end(JSON.stringify({ nodes, edges }));
    return true;
  }

  if (pathname === '/api/file-tree') {
    const tree = buildFileTree(wikiDir);
    res.writeHead(200);
    res.end(JSON.stringify(tree));
    return true;
  }

  const fileMatch = pathname.match(/^\/api\/file\/(.+)$/);
  if (fileMatch) {
    const decoded = decodeURIComponent(fileMatch[1]);
    const isRaw = url.searchParams.get('raw') === 'true';

    if (isRaw) {
      const filePath = path.join(wikiDir, decoded);
      const resolved = path.resolve(filePath);
      if (!resolved.startsWith(path.resolve(wikiDir) + path.sep) && resolved !== path.resolve(wikiDir)) {
        res.writeHead(403);
        res.end(JSON.stringify({ error: 'Forbidden' }));
        return true;
      }
      if (!fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'File not found' }));
        return true;
      }
      const ext = path.extname(resolved);
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      res.setHeader('Content-Type', contentType);
      res.writeHead(200);
      res.end(fs.readFileSync(resolved));
      return true;
    }

    const result = getFileContent(wikiDir, decoded);
    if (!result) {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'File not found' }));
      return true;
    }
    res.writeHead(200);
    res.end(JSON.stringify(result));
    return true;
  }

  if (pathname === '/api/search') {
    const q = url.searchParams.get('q') || '';
    const results = searchWiki(parsed, q);
    res.writeHead(200);
    res.end(JSON.stringify({ query: q, results }));
    return true;
  }

  if (pathname === '/api/stats') {
    res.writeHead(200);
    res.end(JSON.stringify(parsed.stats));
    return true;
  }

  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Not found' }));
  return true;
}

export function startServer(options = {}) {
  wikiDir = options.wikiDir || null;
  const port = options.port ?? 4213;

  if (!wikiDir) {
    const cwd = process.cwd();
    let dir = cwd;
    for (let i = 0; i < 20; i++) {
      const candidate = path.join(dir, '.research');
      if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) {
        wikiDir = candidate;
        break;
      }
      const parent = path.dirname(dir);
      if (parent === dir) break;
      dir = parent;
    }
  }

  if (!wikiDir) {
    console.error('No research wiki found. Run `pilot init` first.');
    process.exit(1);
  }

  console.log(`Loading wiki from: ${wikiDir}`);
  wikiCache = loadWiki();
  console.log(`  ${wikiCache.pages.length} pages found`);
  watchWiki(wikiDir);

  const server = http.createServer((req, res) => {
    if (wikiCache === null) wikiCache = loadWiki();
    const parsed = wikiCache;

    if (serveAPI(req, res, parsed)) return;
    if (serveStatic(req, res)) return;

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  });

  server.listen(port, () => {
    const url = `http://localhost:${port}`;
    console.log(`\n  Pilot Research Dashboard: ${url}\n`);
    if (options.launch) {
      const cmd = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
      import('child_process').then(cp => cp.exec(`${cmd} ${url}`));
    }
  });

  return server;
}

export function getWikiDir() { return wikiDir; }