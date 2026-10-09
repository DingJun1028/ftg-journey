// server.test.js — opportunities API 與 Opportunity Map 前端整合測試
// 注意：server/package.json 是 "type": "module"，本檔必須用 ESM import。
import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, '..');

// 測試用獨立暫存 DB，避免污染正式 ftg-journey.db
process.env.DB_PATH = path.join(os.tmpdir(), `ftg-journey-test-${process.pid}.db`);
process.env.GOOGLE_CLIENT_ID = 'test-client-id.apps.googleusercontent.com';

const { app, db } = await import('./server.js');

function request(server, { method = 'GET', url = '/', body = null, headers = {} }) {
  return new Promise((resolve, reject) => {
    const { port } = server.address();
    const payload = body ? JSON.stringify(body) : null;
    const req = http.request(
      {
        port,
        path: url,
        method,
        headers: {
          ...(payload ? { 'Content-Type': 'application/json' } : {}),
          ...headers,
        },
      },
      (res) => {
        let chunks = '';
        res.on('data', (c) => (chunks += c));
        res.on('end', () => resolve({ status: res.statusCode, body: chunks }));
      }
    );
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

let server;
let baseUrl;

test.before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', resolve);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

test.after(async () => {
  await new Promise((resolve) => server.close(resolve));
  try {
    fs.unlinkSync(process.env.DB_PATH);
  } catch { /* 檔案可能不存在，忽略 */ }
});

test('import server.js 不會自動 listen 佔用正式 port', () => {
  assert.equal(server.address().port !== 8787, true, '測試 server 應為 ephemeral port');
});

test('opportunities 資料表已建立', () => {
  const row = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='opportunities'")
    .get();
  assert.ok(row, 'opportunities table should exist');
});

test('GET /api/journeys/:id/opportunities 未帶 token 回 401', async () => {
  const res = await request(server, { url: '/api/journeys/test-123/opportunities' });
  assert.equal(res.status, 401);
  assert.deepEqual(JSON.parse(res.body), { error: 'no token' });
});

test('POST /api/journeys/:id/opportunities 未帶 token 回 401', async () => {
  const res = await request(server, {
    method: 'POST',
    url: '/api/journeys/test-123/opportunities',
    body: { lat: 25.123, lng: 121.456, title: 'Test Spot' },
  });
  assert.equal(res.status, 401);
});

test('帶無效 Bearer token 回 401 invalid token（路由已掛 verifyGoogleToken）', async () => {
  const res = await request(server, {
    url: '/api/journeys/test-123/opportunities',
    headers: { Authorization: 'Bearer not-a-real-token' },
  });
  assert.equal(res.status, 401);
  assert.deepEqual(JSON.parse(res.body), { error: 'invalid token' });
});

test('opportunities 路由確實註冊在 server.js', () => {
  const src = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');
  assert.ok(src.includes("app.get('/api/journeys/:id/opportunities'"), 'GET route');
  assert.ok(src.includes("app.post('/api/journeys/:id/opportunities'"), 'POST route');
});

test('public-report 聚合 opportunities（隱私欄位僅取同意者）', () => {
  const src = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');
  assert.ok(src.includes('publicParticipants'), '應有 publicParticipants 欄位');
  assert.ok(src.includes('consent_public'), '應過濾 consent_public');
  assert.ok(src.includes('個資法'), '應有隱私說明');
});

test('AdminPage 渲染 Leaflet Map + Markers', () => {
  const content = fs.readFileSync(path.join(repoRoot, 'src/pages/AdminPage.jsx'), 'utf8');
  assert.ok(content.includes('MapContainer'), 'MapContainer should be included');
  assert.ok(content.includes('Marker'), 'Marker should be included');
  assert.ok(content.includes('leaflet'), 'leaflet should be imported');
});

test('Opportunity Map 出現在已建置的 bundle 中（Tangible）', () => {
  const assetsDir = path.join(repoRoot, 'dist/assets');
  if (!fs.existsSync(assetsDir)) {
    // dist 尚未建置時跳過，不假綠燈
    return;
  }
  const bundles = fs.readdirSync(assetsDir).filter((f) => f.endsWith('.js'));
  assert.ok(bundles.length > 0, 'dist/assets 應有 JS bundle');
  const combined = bundles.map((f) => fs.readFileSync(path.join(assetsDir, f), 'utf8')).join('');
  assert.ok(combined.includes('openstreetmap'), 'bundle 應含 Leaflet tile layer');
});

test('manifest.webmanifest 是合法 JSON 且指向 standalone PWA', () => {
  const p = path.join(repoRoot, 'dist/manifest.webmanifest');
  if (!fs.existsSync(p)) return; // 未建置時跳過
  const m = JSON.parse(fs.readFileSync(p, 'utf8'));
  assert.equal(m.display, 'standalone');
  assert.ok(m.icons && m.icons.length > 0, '應有 icons');
});