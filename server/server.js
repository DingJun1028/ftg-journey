import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { DatabaseSync } from 'node:sqlite';
import { OAuth2Client } from 'google-auth-library';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 8787;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'ftg-journey.db');

// ===== 角色對應（與前端 auth.jsx 一致）=====
function resolveRole(email) {
  if (!email) return 'member';
  const adminList = (process.env.ADMIN_EMAILS || 'dingjunhong1028@gmail.com').split(',').map(s => s.trim());
  const staffDomains = (process.env.STAFF_DOMAINS || '@esggo.co,@ftg.com.tw').split(',').map(s => s.trim());
  if (adminList.includes(email)) return 'admin';
  if (staffDomains.some(d => email.endsWith(d))) return 'staff';
  return 'member';
}

// ===== DB 初始化（node:sqlite 同步 API）=====
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
const db = new DatabaseSync(DB_PATH);
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    email TEXT PRIMARY KEY, name TEXT, picture TEXT, role TEXT, created_at INTEGER
  );
  CREATE TABLE IF NOT EXISTS journeys (
    id TEXT PRIMARY KEY, owner_email TEXT, title TEXT, service_type TEXT,
    destination TEXT, start_date TEXT, end_date TEXT, purpose TEXT, stage TEXT DEFAULT 'planning', created_at INTEGER
  );
  CREATE TABLE IF NOT EXISTS journeys_members (
    journey_id TEXT, email TEXT, role TEXT, consent_public INTEGER DEFAULT 0,
    PRIMARY KEY (journey_id, email)
  );
  CREATE TABLE IF NOT EXISTS prep_items (
    id TEXT PRIMARY KEY, journey_id TEXT, category TEXT, text TEXT, done INTEGER DEFAULT 0, created_at INTEGER
  );
  CREATE TABLE IF NOT EXISTS schedule (
    id TEXT PRIMARY KEY, journey_id TEXT, title TEXT, date TEXT, time TEXT, location TEXT, alarm INTEGER DEFAULT 0, note TEXT
  );
  CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY, journey_id TEXT, date TEXT, mood TEXT, text TEXT, photo TEXT, created_at INTEGER
  );
  CREATE TABLE IF NOT EXISTS impact (
    id TEXT PRIMARY KEY, journey_id TEXT, metric_id TEXT, value REAL, note TEXT
  );
`);

// helper
const get = (sql, ...p) => db.prepare(sql).get(...p);
const all = (sql, ...p) => db.prepare(sql).all(...p);
const run = (sql, ...p) => db.prepare(sql).run(...p);

// ===== Google 驗證中介層 =====
const client = new OAuth2Client(GOOGLE_CLIENT_ID);
async function verifyGoogleToken(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'no token' });
  try {
    const ticket = await client.verifyIdToken({ idToken: auth.slice(7), audience: GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    req.user = { email: payload.email, name: payload.name, picture: payload.picture };
    run(`INSERT INTO users (email,name,picture,role,created_at) VALUES (?,?,?,?,?)
      ON CONFLICT(email) DO UPDATE SET name=excluded.name, picture=excluded.picture`,
      payload.email, payload.name, payload.picture, resolveRole(payload.email), Date.now());
    next();
  } catch (e) {
    return res.status(401).json({ error: 'invalid token' });
  }
}

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(rateLimit({ windowMs: 60_000, max: 120 }));

const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

app.get('/api/me', verifyGoogleToken, (req, res) => {
  res.json(get('SELECT email,name,picture,role FROM users WHERE email=?', req.user.email));
});

app.get('/api/journeys', verifyGoogleToken, (req, res) => {
  res.json(all('SELECT * FROM journeys WHERE owner_email=? ORDER BY created_at DESC', req.user.email));
});
app.post('/api/journeys', verifyGoogleToken, (req, res) => {
  const id = uid();
  const { title, service_type, destination, start_date, end_date, purpose } = req.body;
  run('INSERT INTO journeys (id,owner_email,title,service_type,destination,start_date,end_date,purpose,stage,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)',
    id, req.user.email, title, service_type, destination, start_date, end_date, purpose, 'planning', Date.now());
  res.json({ id });
});
app.put('/api/journeys/:id', verifyGoogleToken, (req, res) => {
  const f = Object.keys(req.body).map(k => `${k}=?`).join(',');
  run(`UPDATE journeys SET ${f} WHERE id=? AND owner_email=?`, ...Object.values(req.body), req.params.id, req.user.email);
  res.json({ ok: true });
});
app.delete('/api/journeys/:id', verifyGoogleToken, (req, res) => {
  run('DELETE FROM journeys WHERE id=? AND owner_email=?', req.params.id, req.user.email);
  res.json({ ok: true });
});

app.get('/api/journeys/:id/prep', verifyGoogleToken, (req, res) => res.json(all('SELECT * FROM prep_items WHERE journey_id=?', req.params.id)));
app.post('/api/journeys/:id/prep', verifyGoogleToken, (req, res) => {
  const id = uid();
  run('INSERT INTO prep_items (id,journey_id,category,text,done,created_at) VALUES (?,?,?,?,?,?)',
    id, req.params.id, req.body.category, req.body.text, req.body.done ? 1 : 0, Date.now());
  res.json({ id });
});
app.put('/api/prep/:pid', verifyGoogleToken, (req, res) => {
  run('UPDATE prep_items SET done=?, text=?, category=? WHERE id=?', req.body.done ? 1 : 0, req.body.text, req.body.category, req.params.pid);
  res.json({ ok: true });
});

app.get('/api/journeys/:id/schedule', verifyGoogleToken, (req, res) => res.json(all('SELECT * FROM schedule WHERE journey_id=?', req.params.id)));
app.post('/api/journeys/:id/schedule', verifyGoogleToken, (req, res) => {
  const id = uid();
  const { title, date, time, location, alarm, note } = req.body;
  run('INSERT INTO schedule (id,journey_id,title,date,time,location,alarm,note) VALUES (?,?,?,?,?,?,?,?)',
    id, req.params.id, title, date, time, location, alarm ? 1 : 0, note);
  res.json({ id });
});

app.get('/api/journeys/:id/notes', verifyGoogleToken, (req, res) => res.json(all('SELECT * FROM notes WHERE journey_id=? ORDER BY created_at DESC', req.params.id)));
app.post('/api/journeys/:id/notes', verifyGoogleToken, (req, res) => {
  const id = uid();
  run('INSERT INTO notes (id,journey_id,date,mood,text,photo,created_at) VALUES (?,?,?,?,?,?,?)',
    id, req.params.id, req.body.date, req.body.mood, req.body.text, req.body.photo, Date.now());
  res.json({ id });
});

app.get('/api/journeys/:id/impact', verifyGoogleToken, (req, res) => res.json(all('SELECT * FROM impact WHERE journey_id=?', req.params.id)));
app.post('/api/journeys/:id/impact', verifyGoogleToken, (req, res) => {
  const id = uid();
  run('INSERT INTO impact (id,journey_id,metric_id,value,note) VALUES (?,?,?,?,?)',
    id, req.params.id, req.body.metric_id, req.body.value, req.body.note);
  res.json({ id });
});

app.get('/api/journeys/:id/public-report', verifyGoogleToken, (req, res) => {
  const j = get('SELECT * FROM journeys WHERE id=?', req.params.id);
  if (!j) return res.status(404).json({ error: 'not found' });
  const members = all('SELECT email,name,role,consent_public FROM journeys_members WHERE journey_id=?', req.params.id);
  const consented = members.filter(m => m.consent_public).map(m => ({ name: m.name, role: m.role }));
  const notes = all('SELECT date,mood,text FROM notes WHERE journey_id=?', req.params.id);
  res.json({ title: j.title, serviceType: j.service_type, destination: j.destination, participantCount: members.length, publicParticipants: consented, notes, privacyNote: '依台灣個資法去識別化，僅含同意公開者姓名。' });
});

app.listen(PORT, () => console.log(`FTG Journey server on :${PORT}`));
