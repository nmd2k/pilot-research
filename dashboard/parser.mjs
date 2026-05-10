import fs from 'fs';
import path from 'path';

const TYPE_MAP = {
  papers: 'paper',
  entities: 'entity',
  concepts: 'concept',
  queries: 'query',
  plans: 'plan',
  experiments: 'experiment',
  handoff: 'handoff',
};

const WIKILINK_RE = /\[\[([^\]]+)\]\]/g;

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) return { frontmatter: {}, body: content };

  const fm = {};
  for (const line of match[1].split('\n')) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const val = line.slice(idx + 1).trim();
    if (val.startsWith('[') && val.endsWith(']')) {
      fm[key] = val.slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
    } else {
      fm[key] = val.replace(/^["']|["']$/g, '');
    }
  }

  return { frontmatter: fm, body: content.slice(match[0].length) };
}

function extractWikilinks(text) {
  const links = new Set();
  let m;
  while ((m = WIKILINK_RE.exec(text)) !== null) {
    links.add(m[1]);
  }
  return [...links];
}

export function parseWiki(wikiDir) {
  if (!fs.existsSync(wikiDir)) return { pages: [], graph: { nodes: [], edges: [] }, stats: {} };

  const pages = [];
  const subdirs = Object.keys(TYPE_MAP);

  for (const subdir of subdirs) {
    const dirPath = path.join(wikiDir, subdir);
    if (!fs.existsSync(dirPath)) continue;

    const type = TYPE_MAP[subdir];
    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.md'));

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const { frontmatter, body } = parseFrontmatter(content);
      const wikilinks = extractWikilinks(content);
      const slug = file.replace('.md', '');

      pages.push({
        type,
        slug,
        title: frontmatter.title || frontmatter.name || slug,
        filePath: path.relative(wikiDir, filePath).replace(/\\/g, '/'),
        frontmatter,
        body,
        wikilinks,
        tags: frontmatter.tags || [],
        date: frontmatter.date || frontmatter.date_reviewed || '',
        status: frontmatter.status || '',
      });
    }
  }

  const nodes = pages.map(p => ({
    id: `${p.type}-${p.slug}`,
    type: p.type,
    slug: p.slug,
    title: p.title,
    filePath: p.filePath,
    tags: p.tags,
    date: p.date,
    category: (p.tags && p.tags.length > 0) ? p.tags[0] : p.type,
  }));

  const edges = [];
  for (const page of pages) {
    const sourceId = `${page.type}-${page.slug}`;
    for (const link of page.wikilinks) {
      const target = pages.find(p => `${p.type}-${p.slug}` === link || p.slug === link);
      if (target) {
        edges.push({ source: sourceId, target: `${target.type}-${target.slug}` });
      } else {
        edges.push({ source: sourceId, target: link });
      }
    }
  }

  const stats = {};
  for (const subdir of subdirs) {
    stats[subdir] = pages.filter(p => p.type === TYPE_MAP[subdir]).length;
  }

  const handoffDir = path.join(wikiDir, 'handoff');
  if (fs.existsSync(handoffDir)) {
    const handoffFiles = fs.readdirSync(handoffDir).filter(f => f.endsWith('.md')).sort();
    stats.latestHandoff = handoffFiles.length > 0 ? handoffFiles[handoffFiles.length - 1].replace('.md', '') : null;
  }

  const plansDir = path.join(wikiDir, 'plans');
  if (fs.existsSync(plansDir)) {
    stats.backlogFiles = fs.readdirSync(plansDir).filter(f => f.includes('backlog') && f.endsWith('.md'));
  }

  return { pages, graph: { nodes, edges }, stats };
}

export function searchWiki(parsed, query) {
  if (!query) return [];
  const pattern = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  const results = [];

  for (const page of parsed.pages) {
    const fullContent = JSON.stringify(page.frontmatter) + ' ' + page.body;
    if (!pattern.test(fullContent)) continue;

    const matchingLines = page.body.split('\n')
      .filter(l => pattern.test(l))
      .slice(0, 3)
      .map(l => l.trim())
      .filter(Boolean);

    results.push({
      type: page.type,
      slug: page.slug,
      title: page.title,
      filePath: page.filePath,
      tags: page.tags,
      excerpts: matchingLines,
    });
  }

  return results;
}

export function getPageByPath(parsed, filePath) {
  return parsed.pages.find(p => p.filePath === filePath) || null;
}

export function getPageByTypeSlug(parsed, type, slug) {
  return parsed.pages.find(p => p.type === type && p.slug === slug) || null;
}

export function mapStatusToKanban(status) {
  const s = (status || '').toLowerCase().trim();
  if (s === '' || s === 'draft' || s === 'todo') return 'todo';
  if (s === 'in-progress' || s === 'running') return 'pending';
  if (s === 'complete' || s === 'done') return 'done';
  if (s === 'archive') return 'archive';
  return 'todo';
}

export function parseBacklogTable(body) {
  const tasks = [];
  const lines = body.split('\n');
  let headers = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('|') || !trimmed.endsWith('|')) {
      headers = null;
      continue;
    }

    const cells = trimmed.split('|').slice(1, -1).map(c => c.trim());

    if (cells.every(c => /^[\s\-:]+$/.test(c))) {
      continue;
    }

    if (!headers) {
      headers = cells.map(c => c.toLowerCase());
      continue;
    }

    if (headers) {
      const row = {};
      headers.forEach((h, i) => {
        row[h] = cells[i] || '';
      });
      if (row.id || row.task) {
        tasks.push(row);
      }
    }
  }

  return tasks;
}

export function getTasks(parsed) {
  const tasks = [];
  const pageMap = new Map();
  for (const page of parsed.pages) {
    pageMap.set(page.slug, page);
    pageMap.set(`${page.type}-${page.slug}`, page);
  }

  for (const page of parsed.pages) {
    if (page.body) {
      const tableTasks = parseBacklogTable(page.body);
      for (const row of tableTasks) {
        const linkSlugs = (row.links || '').split(/,\s*/).filter(Boolean).map(l => {
          const m = l.match(/\[\[([^\]]+)\]\]/);
          return m ? m[1] : l.trim();
        });

        let linkedFilePath = page.filePath;
        for (const slug of linkSlugs) {
          const linked = pageMap.get(slug);
          if (linked) {
            linkedFilePath = linked.filePath;
            break;
          }
        }

        const desc = row.description || '';
        const taskTitle = row.task || '';
        const description = desc || (taskTitle.length > 100 ? taskTitle : '');

        tasks.push({
          id: row.id || `backlog-${page.slug}-${tasks.length}`,
          title: taskTitle,
          description,
          category: page.frontmatter.category || 'backlog',
          status: mapStatusToKanban(row.status || ''),
          assignee: row.assignee || '',
          date: page.date,
          dependsOn: row.depends_on || row['depends on'] || '',
          links: linkSlugs,
          filePath: linkedFilePath,
          tags: page.tags,
        });
      }
    }
  }

  return tasks;
}

export function buildFileTree(wikiDir) {
  if (!fs.existsSync(wikiDir)) {
    return { id: 'root', name: path.basename(wikiDir), type: 'folder', children: [] };
  }

  const rootName = path.basename(wikiDir);

  function buildNode(dirPath, relPath) {
    const name = relPath === 'root' ? rootName : path.basename(dirPath);
    const node = {
      id: relPath,
      name,
      type: 'folder',
      children: [],
    };

    const entries = fs.readdirSync(dirPath).sort();
    for (const entry of entries) {
      const entryPath = path.join(dirPath, entry);
      const entryRelPath = relPath === 'root' ? entry : `${relPath}/${entry}`;
      const entryStat = fs.statSync(entryPath);

      if (entryStat.isDirectory()) {
        node.children.push(buildNode(entryPath, entryRelPath));
      } else if (entryStat.isFile()) {
        node.children.push({
          id: entryRelPath,
          name: entry,
          type: 'file',
        });
      }
    }

    return node;
  }

  return buildNode(wikiDir, 'root');
}

export function getFileContent(wikiDir, relPath) {
  const fullPath = path.resolve(wikiDir, relPath);
  const resolvedWiki = path.resolve(wikiDir);

  if (!fullPath.startsWith(resolvedWiki + path.sep) && fullPath !== resolvedWiki) {
    return null;
  }

  if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isFile()) {
    return null;
  }

  if (relPath.endsWith('.md')) {
    const content = fs.readFileSync(fullPath, 'utf8');
    const { frontmatter, body } = parseFrontmatter(content);
    const wikilinks = extractWikilinks(content);
    return { content, frontmatter, body, wikilinks };
  }

  const stat = fs.statSync(fullPath);
  const content = fs.readFileSync(fullPath, 'utf8');
  const ext = path.extname(fullPath).slice(1) || 'binary';
  return { content, type: ext, size: stat.size };
}