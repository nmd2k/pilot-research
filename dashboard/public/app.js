const TYPE_COLORS = {
  paper: '#6c8aff',
  entity: '#5ec4a0',
  concept: '#e8a855',
  query: '#c084fc',
  plan: '#f472b6',
  experiment: '#fb923c',
  handoff: '#94a3b8',
};

let allPages = [];
let currentPage = null;
let currentView = 'overview';

async function api(endpoint) {
  const res = await fetch(endpoint);
  return res.json();
}

async function loadPages() {
  const data = await api('/api/pages');
  allPages = data.pages;
  return allPages;
}

async function loadStats() {
  return api('/api/stats');
}

function renderOverview() {
  currentView = 'overview';
  const main = document.getElementById('main');
  main.innerHTML = '<div id="overview"></div>';

  loadStats().then(stats => {
    const el = document.getElementById('overview');
    if (!stats || Object.keys(stats).length === 0) {
      el.innerHTML = '<div class="empty-state"><h3>No wiki found</h3><p>Initialize a research wiki with <code>pilot init</code></p></div>';
      return;
    }

    const types = [
      { key: 'papers', label: 'Papers', icon: 'paper' },
      { key: 'entities', label: 'Entities', icon: 'entity' },
      { key: 'concepts', label: 'Concepts', icon: 'concept' },
      { key: 'queries', label: 'Queries', icon: 'query' },
      { key: 'plans', label: 'Plans', icon: 'plan' },
      { key: 'experiments', label: 'Experiments', icon: 'experiment' },
    ];

    let html = '<div class="stats-grid">';
    for (const t of types) {
      html += `<div class="stat-card"><div class="value" style="color:${TYPE_COLORS[t.icon]}">${stats[t.key] || 0}</div><div class="label">${t.label}</div></div>`;
    }
    if (stats.latestHandoff) {
      html += `<div class="stat-card"><div class="value" style="color:var(--handoff);font-size:16px">${stats.latestHandoff}</div><div class="label">Latest Handoff</div></div>`;
    }
    html += '</div>';

    const recent = allPages.slice().sort((a, b) => (b.date || '').localeCompare(a.date || '')).slice(0, 8);
    if (recent.length > 0) {
      html += '<h3 style="font-size:15px;margin-bottom:12px;color:var(--text2);">Recent Pages</h3>';
      html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:10px;">';
      for (const p of recent) {
        html += `<div class="search-result" onclick="navigateTo('page','${p.filePath}')"><div class="title"><span class="type-dot" style="background:${TYPE_COLORS[p.type]}"></span>${esc(p.title)}</div><div style="font-size:11px;color:var(--text2);">${p.date || '—'}</div></div>`;
      }
      html += '</div>';
    }

    el.innerHTML = html;
  });
}

function renderPage(filePath) {
  currentView = 'page';
  const main = document.getElementById('main');
  main.innerHTML = '<div id="page-view" class="page-detail"></div>';

  api(`/api/page/${encodeURIComponent(filePath)}`).then(data => {
    const page = data.page;
    if (!page) {
      document.getElementById('page-view').innerHTML = '<div class="empty-state"><h3>Page not found</h3></div>';
      return;
    }
    currentPage = page;

    let html = `<div class="breadcrumb">${esc(page.type)} / ${esc(page.slug)}</div>`;
    html += `<h2>${esc(page.title)}</h2>`;

    html += '<div class="meta">';
    if (page.date) html += `<span class="tag">${esc(page.date)}</span>`;
    if (page.status) html += `<span class="tag">${esc(page.status)}</span>`;
    (page.tags || []).forEach(t => { html += `<span class="tag">${esc(t)}</span>`; });
    html += '</div>';

    html += '<div class="content">';
    html += renderMarkdown(page.body);
    html += '</div>';

    const backlinks = allPages.filter(p => p.wikilinks && p.wikilinks.some(l => l === `${page.type}-${page.slug}` || l === page.slug));
    if (backlinks.length > 0) {
      html += '<div class="backlinks"><h4>Backlinks</h4><ul>';
      for (const bl of backlinks) {
        html += `<li onclick="navigateTo('page','${bl.filePath}')" style="border-left:3px solid ${TYPE_COLORS[bl.type]}">${esc(bl.title)}</li>`;
      }
      html += '</ul></div>';
    }

    document.getElementById('page-view').innerHTML = html;
  });
}

function renderSearch(query) {
  currentView = 'search';
  const main = document.getElementById('main');
  main.innerHTML = '<div id="search-view"></div>';

  api(`/api/search?q=${encodeURIComponent(query)}`).then(data => {
    const el = document.getElementById('search-view');
    el.innerHTML = `<h3 style="margin-bottom:16px;">Search: "${esc(query)}" (${data.results.length} results)</h3><div class="search-results">`;

    if (data.results.length === 0) {
      el.innerHTML += '<div class="empty-state"><p>No results found</p></div>';
    } else {
      for (const r of data.results) {
        el.innerHTML += `<div class="search-result" onclick="navigateTo('page','${r.filePath}')"><div class="title"><span class="type-dot" style="background:${TYPE_COLORS[r.type]}"></span>${esc(r.title)}<span class="type-badge" style="background:${TYPE_COLORS[r.type]}">${r.type}</span></div><div class="excerpt">${esc((r.excerpts || []).join(' … '))}</div></div>`;
      }
    }
    el.innerHTML += '</div>';
  });
}

function renderGraph() {
  currentView = 'graph';
  const main = document.getElementById('main');
  main.innerHTML = '<div id="graph-container"></div>';

  api('/api/graph').then(graph => {
    const container = document.getElementById('graph-container');
    const W = container.clientWidth;
    const H = container.clientHeight;

    const nodes = graph.nodes || [];
    const edges = graph.edges || [];

    const nodeMap = {};
    nodes.forEach((n, i) => {
      nodeMap[n.id] = {
        ...n,
        x: W / 2 + (Math.cos(2 * Math.PI * i / nodes.length) * Math.min(W, H) * 0.35),
        y: H / 2 + (Math.sin(2 * Math.PI * i / nodes.length) * Math.min(W, H) * 0.35),
        vx: 0, vy: 0,
      };
    });

    for (let iter = 0; iter < 120; iter++) {
      for (const e of edges) {
        const s = nodeMap[e.source];
        const t = nodeMap[e.target];
        if (!s || !t) continue;
        let dx = t.x - s.x;
        let dy = t.y - s.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = (dist - 120) * 0.005;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        s.vx += fx; s.vy += fy;
        t.vx -= fx; t.vy -= fy;
      }
      for (const n of Object.values(nodeMap)) {
        n.vx *= 0.9;
        n.vy *= 0.9;
        n.x += n.vx;
        n.y += n.vy;
        n.x = Math.max(30, Math.min(W - 30, n.x));
        n.y = Math.max(30, Math.min(H - 30, n.y));
      }
    }

    let svg = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">`;
    for (const e of edges) {
      const s = nodeMap[e.source];
      const t = nodeMap[e.target];
      if (!s || !t) continue;
      svg += `<line x1="${s.x}" y1="${s.y}" x2="${t.x}" y2="${t.y}" stroke="#2e3345" stroke-width="1"/>`;
    }
    for (const n of Object.values(nodeMap)) {
      const color = TYPE_COLORS[n.type] || '#94a3b8';
      svg += `<circle cx="${n.x}" cy="${n.y}" r="6" fill="${color}" class="graph-node" data-path="${n.filePath}" style="cursor:pointer"/>`;
    }
    for (const n of Object.values(nodeMap)) {
      svg += `<text x="${n.x + 10}" y="${n.y + 4}" fill="#9499ad" font-size="10" style="pointer-events:none">${esc(n.title.substring(0, 25))}</text>`;
    }
    svg += '</svg>';

    container.innerHTML = svg;
    container.querySelectorAll('.graph-node').forEach(el => {
      el.addEventListener('click', () => navigateTo('page', el.dataset.path));
    });
  });
}

function renderBacklog() {
  currentView = 'backlog';
  const main = document.getElementById('main');
  main.innerHTML = '<div id="backlog-view"></div>';

  const plans = allPages.filter(p => p.type === 'plan');
  const backlogs = allPages.filter(p => p.type === 'plan' && p.slug.includes('backlog'));
  const experiments = allPages.filter(p => p.type === 'experiment');

  const el = document.getElementById('backlog-view');

  const todo = [];
  const inProgress = [];
  const done = [];

  for (const exp of experiments) {
    const status = (exp.frontmatter.status || '').toLowerCase();
    if (status.includes('complete') || status.includes('done')) done.push(exp);
    else if (status.includes('progress') || status.includes('running')) inProgress.push(exp);
    else todo.push(exp);
  }

  let html = '<div class="nav-tabs">';
  html += '<div class="nav-tab active">Kanban</div>';
  html += '</div>';

  html += '<div class="kanban">';
  html += '<div class="kanban-col"><h4>Todo (' + todo.length + ')</h4>';
  for (const t of todo) {
    html += `<div class="kanban-card" onclick="navigateTo('page','${t.filePath}')"><div class="task-id">${esc(t.slug)}</div>${esc(t.title)}</div>`;
  }
  html += '</div>';

  html += '<div class="kanban-col"><h4>In Progress (' + inProgress.length + ')</h4>';
  for (const t of inProgress) {
    html += `<div class="kanban-card" onclick="navigateTo('page','${t.filePath}')"><div class="task-id">${esc(t.slug)}</div>${esc(t.title)}</div>`;
  }
  html += '</div>';

  html += '<div class="kanban-col"><h4>Done (' + done.length + ')</h4>';
  for (const t of done) {
    html += `<div class="kanban-card" onclick="navigateTo('page','${t.filePath}')"><div class="task-id">${esc(t.slug)}</div>${esc(t.title)}</div>`;
  }
  html += '</div></div>';

  el.innerHTML = html;
}

function renderTimeline() {
  currentView = 'timeline';
  const main = document.getElementById('main');
  main.innerHTML = '<div id="timeline-view"></div>';

  const handoffs = allPages.filter(p => p.type === 'handoff').sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  const el = document.getElementById('timeline-view');

  if (handoffs.length === 0) {
    el.innerHTML = '<div class="empty-state"><h3>No handoff reports</h3><p>Handoff reports will appear here when agents complete sessions.</p></div>';
    return;
  }

  let html = '<h3 style="margin-bottom:16px;">Handoff Timeline</h3><div class="timeline">';
  for (const h of handoffs) {
    html += `<div class="timeline-card" onclick="navigateTo('page','${h.filePath}')"><div class="date">${esc(h.date || '—')}</div><h4>${esc(h.title)}</h4><div class="summary">${esc((h.body || '').substring(0, 200))}…</div></div>`;
  }
  html += '</div>';

  el.innerHTML = html;
}

function renderSidebar() {
  const sidebar = document.getElementById('sidebar');
  const types = [
    { key: 'paper', label: 'Papers', dir: 'papers' },
    { key: 'entity', label: 'Entities', dir: 'entities' },
    { key: 'concept', label: 'Concepts', dir: 'concepts' },
    { key: 'query', label: 'Queries', dir: 'queries' },
    { key: 'plan', label: 'Plans', dir: 'plans' },
    { key: 'experiment', label: 'Experiments', dir: 'experiments' },
    { key: 'handoff', label: 'Handoffs', dir: 'handoff' },
  ];

  let html = '';
  for (const t of types) {
    const pages = allPages.filter(p => p.type === t.key);
    html += `<div class="section"><h3><span class="type-dot" style="background:${TYPE_COLORS[t.key]}"></span>${t.label}</h3><ul>`;
    for (const p of pages) {
      html += `<li onclick="navigateTo('page','${p.filePath}')">${esc(p.title)}</li>`;
    }
    if (pages.length === 0) html += '<li style="color:var(--text2);font-style:italic">—</li>';
    html += '</ul></div>';
  }

  sidebar.innerHTML = html;
}

function navigateTo(view, param) {
  if (view === 'page') renderPage(param);
  else if (view === 'search') renderSearch(param);
  else if (view === 'graph') renderGraph();
  else if (view === 'backlog') renderBacklog();
  else if (view === 'timeline') renderTimeline();
  else renderOverview();
  window.location.hash = `${view}/${param || ''}`;
}

function esc(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function renderMarkdown(text) {
  if (!text) return '';
  let html = esc(text);
  html = html.replace(/\[\[([^\]]+)\]\]/g, (_, link) => {
    const target = allPages.find(p => `${p.type}-${p.slug}` === link || p.slug === link);
    if (target) return `<a class="wikilink" onclick="navigateTo('page','${target.filePath}')">${esc(link)}</a>`;
    return `<span class="wikilink">${esc(link)}</span>`;
  });
  html = html.replace(/^### (.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^## (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^# (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\n/g, '<br>');
  return html;
}

async function init() {
  await loadPages();
  renderSidebar();

  const hash = window.location.hash.slice(1);
  if (hash.startsWith('page/')) renderPage(hash.slice(5));
  else if (hash.startsWith('search/')) renderSearch(hash.slice(8));
  else if (hash === 'graph') renderGraph();
  else if (hash === 'backlog') renderBacklog();
  else if (hash === 'timeline') renderTimeline();
  else renderOverview();
}

document.addEventListener('DOMContentLoaded', init);