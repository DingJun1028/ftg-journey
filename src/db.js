import { openDB } from 'idb';

// 與 ftgtours.esggo.co 對應的 FTG 永續旅遊服務類型
export const FTG_SERVICE_TYPES = [
  { id: 'corporate-travel', label: '企業員工旅遊', icon: '🚌' },
  { id: 'family-day', label: '企業家庭日', icon: '👨‍👩‍👧' },
  { id: 'esg-team-day', label: 'ESG 戶外團隊日', icon: '🌿' },
  { id: 'wellbeing-retreat', label: '員工身心平衡旅程', icon: '🧘' },
  { id: 'executive-retreat', label: '高階主管共識營', icon: '🤝' },
  { id: 'esg-impact-note', label: 'ESG Impact Note 專案', icon: '📊' },
];

// 準備清單六大類（前段）
export const PREP_CATEGORIES = [
  { id: 'people', label: '人選', icon: '👤', hint: '參與者名單、聯絡方式、緊急聯絡人' },
  { id: 'passport', label: '護照', icon: '🛂', hint: '護照效期、簽證、入境資格確認' },
  { id: 'docs', label: '文件資料', icon: '📄', hint: '保險、機票、住宿、同意書、健康證明' },
  { id: 'money', label: '錢', icon: '💰', hint: '預算、外幣、信用卡、零用金' },
  { id: 'items', label: '物品', icon: '🎒', hint: '衣著、裝備、藥品、環保用品' },
  { id: 'process', label: '流程', icon: '✅', hint: '出發前該完成的動作與流程' },
];

// 旅程階段：前 / 中 / 後
export const STAGES = {
  planning: { id: 'planning', label: '規劃中（前）', color: '#3b82f6' },
  active: { id: 'active', label: '進行中（中）', color: '#3c6e47' },
  done: { id: 'done', label: '已完成（後）', color: '#c9a24b' },
};

// 永續成果指標定義（後段收集，可進永續報告）
export const IMPACT_METRICS = [
  { id: 'walkKm', label: '步行 / 低碳移動距離 (km)', unit: 'km', default: 0 },
  { id: 'co2Saved', label: '預估減碳量 (kg CO₂e)', unit: 'kg', default: 0 },
  { id: 'localSpend', label: '在地消費金額 (NT$)', unit: 'NT$', default: 0 },
  { id: 'singleUseAvoided', label: '減少一次性用品 (件)', unit: '件', default: 0 },
  { id: 'participants', label: '參與人數 (人)', unit: '人', default: 0 },
  { id: 'volunteerHrs', label: '永續行動投入時數 (hr)', unit: 'hr', default: 0 },
  { id: 'treesPlanted', label: '種樹 / 復育數量 (株)', unit: '株', default: 0 },
  { id: 'wasteRecycled', label: '回收 / 堆肥量 (kg)', unit: 'kg', default: 0 },
];

let _db;
export async function getDB() {
  if (_db) return _db;
  _db = await openDB('ftg-journey', 1, {
    upgrade(db) {
      const journeys = db.createObjectStore('journeys', { keyPath: 'id' });
      journeys.createIndex('byUpdated', 'updatedAt');

      const prep = db.createObjectStore('prepItems', { keyPath: 'id' });
      prep.createIndex('byJourney', 'journeyId');

      const sched = db.createObjectStore('schedule', { keyPath: 'id' });
      sched.createIndex('byJourney', 'journeyId');

      const notes = db.createObjectStore('notes', { keyPath: 'id' });
      notes.createIndex('byJourney', 'journeyId');

      const impact = db.createObjectStore('impact', { keyPath: 'id' });
      impact.createIndex('byJourney', 'journeyId');

      const members = db.createObjectStore('members', { keyPath: 'id' });
      members.createIndex('byJourney', 'journeyId');

      const souvenirs = db.createObjectStore('souvenirs', { keyPath: 'id' });
      souvenirs.createIndex('byJourney', 'journeyId');

      const stops = db.createObjectStore('stops', { keyPath: 'id' });
      stops.createIndex('byJourney', 'journeyId');

      const lodging = db.createObjectStore('lodging', { keyPath: 'id' });
      lodging.createIndex('byJourney', 'journeyId');

      const meals = db.createObjectStore('meals', { keyPath: 'id' });
      meals.createIndex('byJourney', 'journeyId');

      const photos = db.createObjectStore('photos', { keyPath: 'id' });
      photos.createIndex('byJourney', 'journeyId');
      const surveys = db.createObjectStore('surveys', { keyPath: 'id' });
      surveys.createIndex('byJourney', 'journeyId');
      const revisits = db.createObjectStore('revisits', { keyPath: 'id' });
      revisits.createIndex('byJourney', 'journeyId');
      const sustainability = db.createObjectStore('sustainability', { keyPath: 'id' });
      sustainability.createIndex('byJourney', 'journeyId');
      const crm = db.createObjectStore('crm', { keyPath: 'id' });
      crm.createIndex('byJourney', 'journeyId');
      const bd = db.createObjectStore('bd', { keyPath: 'id' });
      bd.createIndex('byJourney', 'journeyId');

      const flights = db.createObjectStore('flights', { keyPath: 'id' });
      flights.createIndex('byJourney', 'journeyId');
    },
  });
  return _db;
}

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

// ---------- Journeys ----------
export async function createJourney(data) {
  const db = await getDB();
  const now = Date.now();
  const j = {
    id: uid(),
    title: data.title || '未命名旅程',
    serviceType: data.serviceType || 'corporate-travel',
    purpose: data.purpose || '',
    stage: 'planning',
    startDate: data.startDate || '',
    endDate: data.endDate || '',
    destination: data.destination || '',
    createdAt: now,
    updatedAt: now,
  };
  await db.put('journeys', j);
  await seedPrepTemplate(j.id);
  return j;
}

export async function updateJourney(id, patch) {
  const db = await getDB();
  const j = await db.get('journeys', id);
  if (!j) return null;
  Object.assign(j, patch, { updatedAt: Date.now() });
  await db.put('journeys', j);
  return j;
}

export async function listJourneys() {
  const db = await getDB();
  const all = await db.getAll('journeys');
  return all.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function getJourney(id) {
  const db = await getDB();
  return db.get('journeys', id);
}

export async function deleteJourney(id) {
  const db = await getDB();
  await db.delete('journeys', id);
  for (const store of ['prepItems', 'schedule', 'notes', 'impact', 'members', 'souvenirs', 'stops', 'lodging', 'meals', 'photos', 'surveys', 'revisits', 'sustainability', 'crm', 'bd']) {
    const items = await db.getAllFromIndex(store, 'byJourney', id);
    for (const it of items) await db.delete(store, it.id);
  }
}

// ---------- Prep Items ----------
const TEMPLATE = {
  people: ['列出參與者名單與聯絡方式', '指定隨隊聯絡人', '緊急聯絡人電話'],
  passport: ['確認護照效期 > 6 個月', '確認是否需要簽證', '備份護照影本'],
  docs: ['旅遊保險', '機票 / 交通票券', '住宿確認單', '健康證明 / 疫苗接種'],
  money: ['預算編列', '兌換外幣 / 準備零錢', '信用卡 / 零用金'],
  items: ['合適衣著與鞋', '防曬 / 雨具', '個人藥品', '環保餐具 / 水壺'],
  process: ['行前說明會', '永續旅遊須知', '無痕山林 (Leave No Trace) 承諾'],
};

export async function seedPrepTemplate(journeyId) {
  const db = await getDB();
  const tx = db.transaction('prepItems', 'readwrite');
  for (const cat of Object.keys(TEMPLATE)) {
    for (const text of TEMPLATE[cat]) {
      await tx.store.put({
        id: uid(),
        journeyId,
        category: cat,
        text,
        done: false,
        createdAt: Date.now(),
      });
    }
  }
  await tx.done;
}

export async function listPrep(journeyId) {
  const db = await getDB();
  return db.getAllFromIndex('prepItems', 'byJourney', journeyId);
}

export async function addPrep(journeyId, category, text) {
  const db = await getDB();
  const item = { id: uid(), journeyId, category, text, done: false, createdAt: Date.now() };
  await db.put('prepItems', item);
  return item;
}

export async function togglePrep(id) {
  const db = await getDB();
  const it = await db.get('prepItems', id);
  if (!it) return;
  it.done = !it.done;
  await db.put('prepItems', it);
  return it;
}

export async function removePrep(id) {
  const db = await getDB();
  await db.delete('prepItems', id);
}

// ---------- Schedule (旅程表 + 鬧鐘) ----------
export async function listSchedule(journeyId) {
  const db = await getDB();
  const items = await db.getAllFromIndex('schedule', 'byJourney', journeyId);
  return items.sort((a, b) => (a.datetime || '').localeCompare(b.datetime || ''));
}

export async function addSchedule(journeyId, data) {
  const db = await getDB();
  const item = {
    id: uid(),
    journeyId,
    title: data.title || '未命名行程',
    datetime: data.datetime || '',
    location: data.location || '',
    note: data.note || '',
    reminder: data.reminder || false,
    done: false,
    createdAt: Date.now(),
  };
  await db.put('schedule', item);
  return item;
}

export async function updateSchedule(id, patch) {
  const db = await getDB();
  const it = await db.get('schedule', id);
  if (!it) return;
  Object.assign(it, patch);
  await db.put('schedule', it);
  return it;
}

export async function removeSchedule(id) {
  const db = await getDB();
  await db.delete('schedule', id);
}

// ---------- Notes (心得) ----------
export async function listNotes(journeyId) {
  const db = await getDB();
  const items = await db.getAllFromIndex('notes', 'byJourney', journeyId);
  return items.sort((a, b) => (b.date || 0) - (a.date || 0));
}

export async function addNote(journeyId, data) {
  const db = await getDB();
  const item = {
    id: uid(),
    journeyId,
    date: data.date || Date.now(),
    mood: data.mood || '😊',
    text: data.text || '',
    photo: data.photo || '',
    createdAt: Date.now(),
  };
  await db.put('notes', item);
  return item;
}

export async function removeNote(id) {
  const db = await getDB();
  await db.delete('notes', id);
}

// ---------- Impact (成果收集) ----------
export async function listImpact(journeyId) {
  const db = await getDB();
  return db.getAllFromIndex('impact', 'byJourney', journeyId);
}

export async function setImpact(journeyId, metricId, value, note = '') {
  const db = await getDB();
  let it = await db.get('impact', `${journeyId}:${metricId}`);
  if (!it) it = { id: `${journeyId}:${metricId}`, journeyId, metricId, value: 0, note: '' };
  it.value = value;
  it.note = note;
  await db.put('impact', it);
  return it;
}

// ---------- Members (點名器 + 聯絡表) ----------
export async function listMembers(journeyId) {
  const db = await getDB();
  return db.getAllFromIndex('members', 'byJourney', journeyId);
}
export async function addMember(journeyId, data) {
  const db = await getDB();
  const m = {
    id: uid(), journeyId,
    name: data.name || '', phone: data.phone || '', role: data.role || '',
    email: data.email || '', idNo: data.idNo || '', bloodType: data.bloodType || '',
    allergy: data.allergy || '', room: data.room || '', note: data.note || '',
    consentPublic: data.consentPublic ?? false,
    present: false, createdAt: Date.now(),
  };
  await db.put('members', m);
  return m;
}
export async function updateMember(id, patch) {
  const db = await getDB();
  const m = await db.get('members', id);
  if (!m) return;
  Object.assign(m, patch);
  await db.put('members', m);
  return m;
}
export async function removeMember(id) {
  const db = await getDB();
  await db.delete('members', id);
}

// ---------- Souvenirs (紀念品 + 發送對象集合) ----------
export async function listSouvenirs(journeyId) {
  const db = await getDB();
  return db.getAllFromIndex('souvenirs', 'byJourney', journeyId);
}
export async function addSouvenir(journeyId, data) {
  const db = await getDB();
  const s = { id: uid(), journeyId, name: data.name || '', forWhom: data.forWhom || '', bought: false, createdAt: Date.now() };
  await db.put('souvenirs', s);
  return s;
}
export async function updateSouvenir(id, patch) {
  const db = await getDB();
  const s = await db.get('souvenirs', id);
  if (!s) return;
  Object.assign(s, patch);
  await db.put('souvenirs', s);
  return s;
}
export async function removeSouvenir(id) {
  const db = await getDB();
  await db.delete('souvenirs', id);
}

// ---------- Stops (遊覽車停靠處記錄器 + 拍照) ----------
export async function listStops(journeyId) {
  const db = await getDB();
  return db.getAllFromIndex('stops', 'byJourney', journeyId);
}
export async function addStop(journeyId, data) {
  const db = await getDB();
  const s = { id: uid(), journeyId, name: data.name || '', photo: data.photo || '', note: data.note || '', createdAt: Date.now() };
  await db.put('stops', s);
  return s;
}
export async function removeStop(id) {
  const db = await getDB();
  await db.delete('stops', id);
}

// ---------- Lodging (下榻旅館詳細資訊) ----------
export async function getLodging(journeyId) {
  const db = await getDB();
  const all = await db.getAllFromIndex('lodging', 'byJourney', journeyId);
  return all[0] || null;
}
export async function saveLodging(journeyId, data) {
  const db = await getDB();
  let it = await getLodging(journeyId);
  if (!it) it = { id: uid(), journeyId };
  Object.assign(it, data, { updatedAt: Date.now() });
  await db.put('lodging', it);
  return it;
}

// ---------- Meals (早餐晚餐訂購器) ----------
export async function listMeals(journeyId) {
  const db = await getDB();
  return db.getAllFromIndex('meals', 'byJourney', journeyId);
}
export async function addMeal(journeyId, data) {
  const db = await getDB();
  const m = { id: uid(), journeyId, type: data.type || '早餐', item: data.item || '', qty: data.qty || 1, note: data.note || '', ordered: false, createdAt: Date.now() };
  await db.put('meals', m);
  return m;
}
export async function updateMeal(id, patch) {
  const db = await getDB();
  const m = await db.get('meals', id);
  if (!m) return;
  Object.assign(m, patch);
  await db.put('meals', m);
  return m;
}
export async function removeMeal(id) {
  const db = await getDB();
  await db.delete('meals', id);
}

// ---------- Photos (照片分享區) ----------
export async function listPhotos(journeyId) {
  const db = await getDB();
  const items = await db.getAllFromIndex('photos', 'byJourney', journeyId);
  return items.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}
export async function addPhoto(journeyId, data) {
  const db = await getDB();
  const p = { id: uid(), journeyId, url: data.url || '', caption: data.caption || '', createdAt: Date.now() };
  await db.put('photos', p);
  return p;
}
export async function removePhoto(id) {
  const db = await getDB();
  await db.delete('photos', id);
}

// ---------- Surveys (滿意度調查表) ----------
export async function getSurvey(journeyId) {
  const db = await getDB();
  const all = await db.getAllFromIndex('surveys', 'byJourney', journeyId);
  return all[0] || null;
}
export async function saveSurvey(journeyId, data) {
  const db = await getDB();
  let it = await getSurvey(journeyId);
  if (!it) it = { id: uid(), journeyId };
  Object.assign(it, data, { updatedAt: Date.now() });
  await db.put('surveys', it);
  return it;
}

// ---------- Revisits (舊地重遊心得區) ----------
export async function listRevisits(journeyId) {
  const db = await getDB();
  const items = await db.getAllFromIndex('revisits', 'byJourney', journeyId);
  return items.sort((a, b) => (b.date || 0) - (a.date || 0));
}
export async function addRevisit(journeyId, data) {
  const db = await getDB();
  const r = { id: uid(), journeyId, date: data.date || Date.now(), title: data.title || '', text: data.text || '', photo: data.photo || '', createdAt: Date.now() };
  await db.put('revisits', r);
  return r;
}
export async function removeRevisit(id) {
  const db = await getDB();
  await db.delete('revisits', id);
}

// ---------- Sustainability (永續專案訂立 + 追蹤目標成果) ----------
export async function listSustainability(journeyId) {
  const db = await getDB();
  return db.getAllFromIndex('sustainability', 'byJourney', journeyId);
}
export async function addSustainability(journeyId, data) {
  const db = await getDB();
  const s = {
    id: uid(), journeyId,
    name: data.name || '', target: Number(data.target) || 0, unit: data.unit || '',
    actual: Number(data.actual) || 0, createdAt: Date.now(),
  };
  await db.put('sustainability', s);
  return s;
}
export async function updateSustainability(id, patch) {
  const db = await getDB();
  const s = await db.get('sustainability', id);
  if (!s) return;
  Object.assign(s, patch);
  await db.put('sustainability', s);
  return s;
}
export async function removeSustainability(id) {
  const db = await getDB();
  await db.delete('sustainability', id);
}

// ---------- CRM ----------
export async function listCRM(journeyId) {
  const db = await getDB();
  return db.getAllFromIndex('crm', 'byJourney', journeyId);
}
export async function addCRM(journeyId, data) {
  const db = await getDB();
  const c = {
    id: uid(), journeyId,
    company: data.company || '', contact: data.contact || '', phone: data.phone || '',
    email: data.email || '', stage: data.stage || '潛在', note: data.note || '', createdAt: Date.now(),
  };
  await db.put('crm', c);
  return c;
}
export async function updateCRM(id, patch) {
  const db = await getDB();
  const c = await db.get('crm', id);
  if (!c) return;
  Object.assign(c, patch);
  await db.put('crm', c);
  return c;
}
export async function removeCRM(id) {
  const db = await getDB();
  await db.delete('crm', id);
}

// ---------- BD (業務開發) ----------
export async function listBD(journeyId) {
  const db = await getDB();
  return db.getAllFromIndex('bd', 'byJourney', journeyId);
}
export async function addBD(journeyId, data) {
  const db = await getDB();
  const b = {
    id: uid(), journeyId,
    lead: data.lead || '', source: data.source || '', value: Number(data.value) || 0,
    status: data.status || '開發中', owner: data.owner || '', note: data.note || '', createdAt: Date.now(),
  };
  await db.put('bd', b);
  return b;
}
export async function updateBD(id, patch) {
  const db = await getDB();
  const b = await db.get('bd', id);
  if (!b) return;
  Object.assign(b, patch);
  await db.put('bd', b);
  return b;
}
export async function removeBD(id) {
  const db = await getDB();
  await db.delete('bd', id);
}

// ---------- 全內容匯出 / 匯入 ----------
export async function exportAll() {
  const db = await getDB();
  const stores = ['journeys', 'prepItems', 'schedule', 'notes', 'impact', 'members', 'souvenirs', 'stops', 'lodging', 'meals', 'photos', 'surveys', 'revisits', 'sustainability', 'crm', 'bd'];
  const out = {};
  for (const s of stores) out[s] = await db.getAll(s);
  return { _type: 'ftg-journey-backup', version: 1, exportedAt: Date.now(), data: out };
}
export async function importAll(payload) {
  if (!payload || !payload.data) throw new Error('無效的備份檔');
  const db = await getDB();
  const stores = ['journeys', 'prepItems', 'schedule', 'notes', 'impact', 'members', 'souvenirs', 'stops', 'lodging', 'meals', 'photos', 'surveys', 'revisits', 'sustainability', 'crm', 'bd', 'flights'];
  for (const s of stores) {
    if (!payload.data[s]) continue;
    const tx = db.transaction(s, 'readwrite');
    for (const rec of payload.data[s]) await tx.store.put(rec);
    await tx.done;
  }
  return true;
}

// ---------- Flights (機票完整資訊) ----------
export async function listFlights(journeyId) {
  const db = await getDB();
  return db.getAllFromIndex('flights', 'byJourney', journeyId);
}
export async function addFlight(journeyId, data) {
  const db = await getDB();
  const f = { id: uid(), journeyId, airline: data.airline || '', flightNo: data.flightNo || '', depAirport: data.depAirport || '', arrAirport: data.arrAirport || '', depTime: data.depTime || '', arrTime: data.arrTime || '', pnr: data.pnr || '', seat: data.seat || '', passenger: data.passenger || '', note: data.note || '', createdAt: Date.now() };
  await db.put('flights', f);
  return f;
}
export async function updateFlight(id, patch) {
  const db = await getDB();
  const f = await db.get('flights', id);
  if (!f) return;
  Object.assign(f, patch);
  await db.put('flights', f);
  return f;
}
export async function removeFlight(id) {
  const db = await getDB();
  await db.delete('flights', id);
}

// ---------- 資訊去敏化（台灣個資法） ----------
// 依個資法第 2 條、第 5 條、第 16 條與第 27 條精神：
// 1. 蒐集最小化：僅保留必要欄位
// 2. 目的外利用需同意：成員需勾選「同意公開」方可出現於公開成果
// 3. 去識別化：公開輸出時遮蔽姓名以外之直接識別碼
const SENSITIVE_FIELDS = ['idNo', 'phone', 'email', 'bloodType', 'room', 'allergy', 'note'];

export function desensitizeMember(m) {
  // 未同意公開者：完全不納入公開成果（僅保留彙總計數）
  if (!m.consentPublic) return null;
  // 已同意者：遮蔽敏感欄位，僅留姓名（經當事人明示同意之必要展示）
  return { name: m.name, role: m.role };
}

// 去敏化匯出：產出可供永續報告/公開展示之成果包，不含未同意者與敏感欄位
export async function exportPublicReport() {
  const db = await getDB();
  const journeys = await db.getAll('journeys');
  const out = { _type: 'ftg-journey-public-report', version: 1, generatedAt: Date.now(), journeys: [] };
  for (const j of journeys) {
    const members = await db.getAllFromIndex('members', 'byJourney', j.id);
    const consented = members.map(desensitizeMember).filter(Boolean);
    const notes = await db.getAllFromIndex('notes', 'byJourney', j.id);
    const photos = await db.getAllFromIndex('photos', 'byJourney', j.id);
    const sustain = await db.getAllFromIndex('sustainability', 'byJourney', j.id);
    const impact = await db.getAllFromIndex('impact', 'byJourney', j.id);
    out.journeys.push({
      title: j.title,
      serviceType: j.serviceType,
      destination: j.destination,
      startDate: j.startDate,
      endDate: j.endDate,
      purpose: j.purpose,
      participantCount: members.length,
      publicParticipants: consented.map(m => m.name),
      notes: notes.map(n => ({ date: n.date, mood: n.mood, text: n.text })),
      photos: photos.map(p => ({ url: p.url, caption: p.caption })),
      sustainability: sustain,
      impact,
      privacyNote: '本報告依台灣個資法去識別化產出，僅含已同意公開之參與者姓名與彙總統計，不含任何直接識別個資。',
    });
  }
  return out;
}
