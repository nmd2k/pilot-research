/**
 * P12 — Dashboard Redesign: Performance Test Specs
 *
 * These tests define performance benchmarks for the dashboard.
 * They measure API response times and UI rendering performance.
 *
 * HOW TO RUN:
 *   cd dashboard && node tests/performance/benchmark.mjs
 *
 * Performance targets:
 * - API endpoints: < 100ms for typical wikis (< 100 pages)
 * - API endpoints: < 500ms for large wikis (100-500 pages)
 * - Graph rendering: < 3s for 50+ nodes
 * - Search: < 50ms for any query
 * - Page load: < 2s initial render
 */

import http from 'http';

const BASE_URL = process.env.DASHBOARD_URL || 'http://localhost:4213';
const MAX_RESPONSE_TIME_MS = 100;
const MAX_LARGE_WIKI_MS = 500;
const MAX_SEARCH_MS = 50;
const FIXTURES_DIR = new URL('../fixtures/wiki', import.meta.url).pathname;

function fetchJSON(urlPath) {
  return new Promise((resolve, reject) => {
    const start = performance.now();
    const url = new URL(urlPath, BASE_URL);
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        const elapsed = performance.now() - start;
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data), elapsed });
        } catch {
          resolve({ status: res.statusCode, body: data, elapsed });
        }
      });
    }).on('error', reject);
  });
}

async function runBenchmarks() {
  console.log('\n📊 Dashboard Performance Benchmarks');
  console.log('=====================================\n');

  // Try to connect, if it fails try starting a server
  let baseUrl = BASE_URL;
  let ownServer = null;
  try {
    await fetchJSON('/api/stats');
  } catch {
    console.log('No running dashboard found. Starting one with test fixtures...');
    const { startServer } = await import('../../server.mjs');
    const server = await new Promise((resolve) => {
      const s = startServer({ wikiDir: FIXTURES_DIR, port: 0 });
      s.on('listening', () => resolve(s));
    });
    const addr = server.address();
    baseUrl = `http://127.0.0.1:${addr.port}`;
    ownServer = server;
    console.log(`Started test server at ${baseUrl}\n`);
  }

  // Override fetchJSON to use dynamic baseUrl
  const origFetchJSON = fetchJSON;
  const fetchWithBaseUrl = (urlPath) => {
    return new Promise((resolve, reject) => {
      const start = performance.now();
      const url = new URL(urlPath, baseUrl);
      http.get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          const elapsed = performance.now() - start;
          try {
            resolve({ status: res.statusCode, body: JSON.parse(data), elapsed });
          } catch {
            resolve({ status: res.statusCode, body: data, elapsed });
          }
        });
      }).on('error', reject);
    });
  };

  const results = [];

  // Test 1: /api/pages
  console.log('1. GET /api/pages...');
  const pagesResult = await fetchWithBaseUrl('/api/pages');
  const pagesTime = pagesResult.elapsed.toFixed(1);
  const pagesStatus = pagesResult.status === 200 ? '✅' : '❌';
  const pagesPerf = pagesResult.elapsed < MAX_RESPONSE_TIME_MS ? '✅' : '⚠️ SLOW';
  console.log(`   Status: ${pagesStatus} ${pagesResult.status} | Time: ${pagesTime}ms ${pagesPerf}`);
  results.push({ endpoint: '/api/pages', time: pagesTime, target: MAX_RESPONSE_TIME_MS });

  // Test 2: /api/graph
  console.log('2. GET /api/graph...');
  const graphResult = await fetchWithBaseUrl('/api/graph');
  const graphTime = graphResult.elapsed.toFixed(1);
  const graphStatus = graphResult.status === 200 ? '✅' : '❌';
  const graphPerf = graphResult.elapsed < MAX_RESPONSE_TIME_MS ? '✅' : '⚠️ SLOW';
  console.log(`   Status: ${graphStatus} ${graphResult.status} | Time: ${graphTime}ms ${graphPerf}`);
  console.log(`   Nodes: ${graphResult.body.nodes?.length || 0} | Edges: ${graphResult.body.edges?.length || 0}`);
  results.push({ endpoint: '/api/graph', time: graphTime, target: MAX_RESPONSE_TIME_MS });

  // Test 3: /api/stats
  console.log('3. GET /api/stats...');
  const statsResult = await fetchWithBaseUrl('/api/stats');
  const statsTime = statsResult.elapsed.toFixed(1);
  const statsStatus = statsResult.status === 200 ? '✅' : '❌';
  const statsPerf = statsResult.elapsed < MAX_RESPONSE_TIME_MS ? '✅' : '⚠️ SLOW';
  console.log(`   Status: ${statsStatus} ${statsResult.status} | Time: ${statsTime}ms ${statsPerf}`);
  results.push({ endpoint: '/api/stats', time: statsTime, target: MAX_RESPONSE_TIME_MS });

  // Test 4: /api/search (simple query)
  console.log('4. GET /api/search?q=test...');
  const searchResult = await fetchWithBaseUrl('/api/search?q=test');
  const searchTime = searchResult.elapsed.toFixed(1);
  const searchStatus = searchResult.status === 200 ? '✅' : '❌';
  const searchPerf = searchResult.elapsed < MAX_SEARCH_MS ? '✅' : '⚠️ SLOW';
  console.log(`   Status: ${searchStatus} ${searchResult.status} | Time: ${searchTime}ms ${searchPerf}`);
  console.log(`   Results: ${searchResult.body.results?.length || 0}`);
  results.push({ endpoint: '/api/search', time: searchTime, target: MAX_SEARCH_MS });

  // Test 5: /api/page/{path} (first page)
  if (pagesResult.body?.pages?.length > 0) {
    const firstPage = pagesResult.body.pages[0];
    console.log(`5. GET /api/page/${firstPage.filePath}...`);
    const pageResult = await fetchWithBaseUrl(`/api/page/${encodeURIComponent(firstPage.filePath)}`);
    const pageTime = pageResult.elapsed.toFixed(1);
    const pageStatus = pageResult.status === 200 ? '✅' : '❌';
    const pagePerf = pageResult.elapsed < MAX_RESPONSE_TIME_MS ? '✅' : '⚠️ SLOW';
    console.log(`   Status: ${pageStatus} ${pageResult.status} | Time: ${pageTime}ms ${pagePerf}`);
    results.push({ endpoint: `/api/page/${firstPage.filePath}`, time: pageTime, target: MAX_RESPONSE_TIME_MS });
  }

  // Test 6: Repeated requests (benchmark caching)
  console.log('6. Repeated /api/pages (5x, measure avg)...');
  let totalTime = 0;
  for (let i = 0; i < 5; i++) {
    const r = await fetchWithBaseUrl('/api/pages');
    totalTime += r.elapsed;
  }
  const avgTime = (totalTime / 5).toFixed(1);
  const avgPerf = (totalTime / 5) < MAX_RESPONSE_TIME_MS ? '✅' : '⚠️ SLOW';
  console.log(`   Avg time: ${avgTime}ms ${avgPerf}`);
  results.push({ endpoint: '/api/pages (5x avg)', time: avgTime, target: MAX_RESPONSE_TIME_MS });

  // Summary
  console.log('\n📋 Summary');
  console.log('==========');
  let allPass = true;
  for (const r of results) {
    const time = parseFloat(r.time);
    const pass = time < r.target;
    if (!pass) allPass = false;
    const icon = pass ? '✅' : '❌';
    console.log(`  ${icon} ${r.endpoint}: ${r.time}ms (target: <${r.target}ms)`);
  }
  console.log(`\n${allPass ? '✅ All performance targets met!' : '❌ Some targets not met. See above.'}`);
  console.log('');

  if (ownServer) ownServer.close();
  process.exit(allPass ? 0 : 1);
}

runBenchmarks().catch(err => {
  console.error('Benchmark failed:', err);
  process.exit(1);
});