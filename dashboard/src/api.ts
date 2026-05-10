import type { Paper, Task, GraphNode, GraphEdge, FileNode, PageData } from './types';

const BASE = '';

export async function fetchPages(type?: string): Promise<{ pages: Paper[] }> {
  const url = type ? `${BASE}/api/pages?type=${encodeURIComponent(type)}` : `${BASE}/api/pages`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.pages) {
    data.pages = data.pages.map((p: any) => ({
      id: p.filePath || `${p.type}-${p.slug}`,
      title: p.title || p.slug || '',
      authors: p.frontmatter?.authors || (Array.isArray(p.frontmatter?.authors) ? p.frontmatter.authors.join(', ') : '') || '',
      date: p.date || p.frontmatter?.date_reviewed || p.frontmatter?.date || '',
      link: p.frontmatter?.url || p.frontmatter?.arxiv_id ? `https://arxiv.org/abs/${p.frontmatter.arxiv_id}` : '',
      category: (p.tags && p.tags.length > 0 ? p.tags[0].toUpperCase() : (p.type || '').toUpperCase()),
      abstract: '',
      tags: p.tags || [],
      status: p.status || '',
      wikilinks: p.wikilinks || [],
      filePath: p.filePath || '',
      frontmatter: p.frontmatter,
      slug: p.slug,
    }));
  }
  return data;
}

export async function fetchPage(path: string): Promise<{ page: PageData }> {
  const res = await fetch(`${BASE}/api/page/${encodeURIComponent(path)}`);
  return res.json();
}

export async function fetchGraph(): Promise<{ nodes: GraphNode[]; edges: GraphEdge[] }> {
  const res = await fetch(`${BASE}/api/graph`);
  return res.json();
}

export async function fetchTasks(): Promise<{ tasks: Task[] }> {
  const res = await fetch(`${BASE}/api/tasks`);
  return res.json();
}

export async function savePage(path: string, content: string): Promise<{ success: boolean }> {
  const res = await fetch(`${BASE}/api/page/${encodeURIComponent(path)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
  return res.json();
}

export async function fetchStats(): Promise<Record<string, any>> {
  const res = await fetch(`${BASE}/api/stats`);
  return res.json();
}

export async function fetchSearch(query: string): Promise<{ query: string; results: any[] }> {
  const res = await fetch(`${BASE}/api/search?q=${encodeURIComponent(query)}`);
  return res.json();
}

export async function fetchFileTree(): Promise<FileNode> {
  const res = await fetch(`${BASE}/api/file-tree`);
  return res.json();
}

export async function fetchFile(path: string): Promise<{ content: string; frontmatter?: Record<string, any>; body?: string; wikilinks?: string[]; type?: string; size?: number }> {
  const res = await fetch(`${BASE}/api/file/${encodeURIComponent(path)}`);
  return res.json();
}

export async function updatePage(path: string, data: Partial<PageData>): Promise<{ page: PageData }> {
  const res = await fetch(`${BASE}/api/page/${encodeURIComponent(path)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}