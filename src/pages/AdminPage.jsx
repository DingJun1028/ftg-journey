import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  listMembers, addMember, updateMember, removeMember,
  listCRM, addCRM, updateCRM, removeCRM,
  listBD, addBD, updateBD, removeBD,
  listOpportunity, addOpportunity, removeOpportunity,
  exportAll, importAll,
} from '../db';

export default function AdminPage() {
  const { id } = useParams();
  const [tab, setTab] = useState('members');
  const [members, setMembers] = useState([]);
  const [crm, setCrm] = useState([]);
  const [bd, setBd] = useState([]);
  const [opp, setOpp] = useState([]);
  const [oppForm, setOppForm] = useState({});
  const fileRef = useRef(null);

  async function loadAll() {
    setMembers(await listMembers(id));
    setCrm(await listCRM(id));
    setBd(await listBD(id));
    setOpp(await listOpportunity(id));
  }
  useEffect(() => { loadAll(); }, [id]);

  // 梯次成員
  const [m, setM] = useState({});
  async function addM(e) {
    e.preventDefault();
    if (!m.name) return;
    await addMember(id, m);
    setM({}); loadAll();
  }

  // CRM
  const [c, setC] = useState({});
  async function addC(e) {
    e.preventDefault();
    if (!c.company) return;
    await addCRM(id, c);
    setC({}); loadAll();
  }

  // BD
  const [b, setB] = useState({});
  async function addB(e) {
    e.preventDefault();
    if (!b.lead) return;
    await addBD(id, b);
    setB({}); loadAll();
  }

  // 匯出匯入
  async function doExport() {
    const data = await exportAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `ftg-journey-backup-${Date.now()}.json`;
    a.click();
  }
  async function doImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    const text = await file.text();
    try {
      await importAll(JSON.parse(text));
      alert('匯入成功');
      loadAll();
    } catch (err) {
      alert('匯入失敗：' + err.message);
    }
    e.target.value = '';
  }

  return (
    <div className="page">
      <Link to={`/journey/${id}`} className="text-ftg-green text-sm">← 返回旅程</Link>
      <h1 className="section-title mt-2">🛠️ 墾趣旅遊 後台管理</h1>

      <div className="flex gap-2 my-3 text-sm">
        <button className={tab === 'members' ? 'chip-on' : 'chip'} onClick={() => setTab('members')}>梯次成員一覽表</button>
        <button className={tab === 'crm' ? 'chip-on' : 'chip'} onClick={() => setTab('crm')}>導遊專區 · CRM</button>
        <button className={tab === 'bd' ? 'chip-on' : 'chip'} onClick={() => setTab('bd')}>行政專區 · BD</button>
        <button className={tab === 'opp' ? 'chip-on' : 'chip'} onClick={() => setTab('opp')}>Opportunity Map</button>
        <button className={tab === 'io' ? 'chip-on' : 'chip'} onClick={() => setTab('io')}>匯入匯出</button>
      </div>

      {tab === 'members' && (
        <div>
          <form onSubmit={addM} className="card mb-4 grid grid-cols-2 gap-2">
            <input className="input col-span-2" placeholder="姓名 *" value={m.name || ''} onChange={e => setM({ ...m, name: e.target.value })} />
            <input className="input" placeholder="角色" value={m.role || ''} onChange={e => setM({ ...m, role: e.target.value })} />
            <input className="input" placeholder="電話" value={m.phone || ''} onChange={e => setM({ ...m, phone: e.target.value })} />
            <input className="input" placeholder="Email" value={m.email || ''} onChange={e => setM({ ...m, email: e.target.value })} />
            <input className="input" placeholder="證件號" value={m.idNo || ''} onChange={e => setM({ ...m, idNo: e.target.value })} />
            <input className="input" placeholder="血型" value={m.bloodType || ''} onChange={e => setM({ ...m, bloodType: e.target.value })} />
            <input className="input" placeholder="過敏史" value={m.allergy || ''} onChange={e => setM({ ...m, allergy: e.target.value })} />
            <input className="input" placeholder="房號" value={m.room || ''} onChange={e => setM({ ...m, room: e.target.value })} />
            <input className="input col-span-2" placeholder="備註" value={m.note || ''} onChange={e => setM({ ...m, note: e.target.value })} />
            <button className="btn-primary col-span-2" type="submit">加入梯次成員</button>
          </form>

          <div className="space-y-2">
            {members.map(mem => (
              <div key={mem.id} className="card text-sm">
                <div className="flex justify-between">
                  <span className="font-semibold">{mem.name} {mem.role && <span className="text-gray-400 text-xs">（{mem.role}）</span>}</span>
                  <button className="text-red-500 text-xs" onClick={async () => { await removeMember(mem.id); loadAll(); }}>刪除</button>
                </div>
                <div className="text-gray-500 text-xs mt-1 space-y-0.5">
                  {mem.phone && <div>📞 {mem.phone}</div>}
                  {mem.email && <div>✉️ {mem.email}</div>}
                  {mem.idNo && <div>🪪 證件 {mem.idNo}</div>}
                  {mem.bloodType && <div>🩸 血型 {mem.bloodType}</div>}
                  {mem.allergy && <div>⚠️ 過敏 {mem.allergy}</div>}
                  {mem.room && <div>🚪 房號 {mem.room}</div>}
                  {mem.note && <div>📝 {mem.note}</div>}
                  <label className="flex items-center gap-1 mt-1">
                    <input type="checkbox" checked={!!mem.present} onChange={async e => { await updateMember(mem.id, { present: e.target.checked }); loadAll(); }} />
                    已點名到場
                  </label>
                </div>
              </div>
            ))}
            {members.length === 0 && <p className="text-gray-400 text-center py-6">尚無梯次成員</p>}
          </div>
        </div>
      )}

      {tab === 'crm' && (
        <div>
          <form onSubmit={addC} className="card mb-4 grid grid-cols-2 gap-2">
            <input className="input col-span-2" placeholder="客戶公司 *" value={c.company || ''} onChange={e => setC({ ...c, company: e.target.value })} />
            <input className="input" placeholder="聯絡人" value={c.contact || ''} onChange={e => setC({ ...c, contact: e.target.value })} />
            <input className="input" placeholder="電話" value={c.phone || ''} onChange={e => setC({ ...c, phone: e.target.value })} />
            <input className="input col-span-2" placeholder="Email" value={c.email || ''} onChange={e => setC({ ...c, email: e.target.value })} />
            <input className="input" placeholder="階段" value={c.stage || '潛在'} onChange={e => setC({ ...c, stage: e.target.value })} />
            <input className="input" placeholder="備註" value={c.note || ''} onChange={e => setC({ ...c, note: e.target.value })} />
            <button className="btn-primary col-span-2" type="submit">新增 CRM 客戶</button>
          </form>
          <div className="space-y-2">
            {crm.map(x => (
              <div key={x.id} className="card text-sm">
                <div className="flex justify-between">
                  <span className="font-semibold">{x.company}</span>
                  <button className="text-red-500 text-xs" onClick={async () => { await removeCRM(x.id); loadAll(); }}>刪除</button>
                </div>
                <p className="text-xs text-gray-500">{x.contact} · {x.phone} · {x.stage}</p>
                {x.note && <p className="text-xs text-gray-400">{x.note}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'bd' && (
        <div>
          <form onSubmit={addB} className="card mb-4 grid grid-cols-2 gap-2">
            <input className="input col-span-2" placeholder="開發標的 / 商機 *" value={b.lead || ''} onChange={e => setB({ ...b, lead: e.target.value })} />
            <input className="input" placeholder="來源" value={b.source || ''} onChange={e => setB({ ...b, source: e.target.value })} />
            <input className="input" placeholder="預估金額" type="number" value={b.value || ''} onChange={e => setB({ ...b, value: e.target.value })} />
            <input className="input" placeholder="狀態" value={b.status || '開發中'} onChange={e => setB({ ...b, status: e.target.value })} />
            <input className="input" placeholder="負責人" value={b.owner || ''} onChange={e => setB({ ...b, owner: e.target.value })} />
            <input className="input col-span-2" placeholder="備註" value={b.note || ''} onChange={e => setB({ ...b, note: e.target.value })} />
            <button className="btn-primary col-span-2" type="submit">新增 BD 商機</button>
          </form>
          <div className="space-y-2">
            {bd.map(x => (
              <div key={x.id} className="card text-sm">
                <div className="flex justify-between">
                  <span className="font-semibold">{x.lead}</span>
                  <button className="text-red-500 text-xs" onClick={async () => { await removeBD(x.id); loadAll(); }}>刪除</button>
                </div>
                <p className="text-xs text-gray-500">{x.source} · {x.status} · {x.value} · {x.owner}</p>
                {x.note && <p className="text-xs text-gray-400">{x.note}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'opp' && (
        <div>
          <p className="text-sm text-gray-500 mb-3">對應官網「高階主管共識營」模組五/六：收斂 Opportunity Map 與後續行動路線（Roadmap）。</p>
          <form onSubmit={async (e) => { e.preventDefault(); if (!oppForm.title) return; await addOpportunity(id, oppForm); setOppForm({}); loadAll(); }}
            className="card mb-4 grid grid-cols-2 gap-2">
            <input className="input col-span-2" placeholder="機會 / 行動項目 *" value={oppForm.title || ''} onChange={e => setOppForm({ ...oppForm, title: e.target.value })} />
            <input className="input" placeholder="負責人" value={oppForm.owner || ''} onChange={e => setOppForm({ ...oppForm, owner: e.target.value })} />
            <select className="input" value={oppForm.priority || 'P2'} onChange={e => setOppForm({ ...oppForm, priority: e.target.value })}>
              <option value="P0">P0 最高</option>
              <option value="P1">P1 高</option>
              <option value="P2">P2 中</option>
              <option value="P3">P3 低</option>
            </select>
            <select className="input" value={oppForm.status || 'idea'} onChange={e => setOppForm({ ...oppForm, status: e.target.value })}>
              <option value="idea">想法</option>
              <option value="planning">規劃中</option>
              <option value="doing">執行中</option>
              <option value="done">已完成</option>
            </select>
            <input className="input col-span-2" placeholder="備註" value={oppForm.note || ''} onChange={e => setOppForm({ ...oppForm, note: e.target.value })} />
            <button className="btn-primary col-span-2" type="submit">＋ 加入 Opportunity Map</button>
          </form>

          <div className="space-y-2">
            {opp.map(o => (
              <div key={o.id} className="card text-sm">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-medium">{o.title}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      負責人：{o.owner || '—'} · 優先序：<span className="text-ftg-orange font-bold">{o.priority}</span> · 狀態：{o.status}
                    </div>
                    {o.note && <div className="text-xs text-gray-500 mt-1">{o.note}</div>}
                  </div>
                  <button className="text-red-500 text-xs ml-2" onClick={async () => { await removeOpportunity(o.id); loadAll(); }}>刪除</button>
                </div>
              </div>
            ))}
            {opp.length === 0 && <p className="text-gray-400 text-sm text-center py-4">尚無 Opportunity Map 項目</p>}
          </div>
        </div>
      )}

      {tab === 'io' && (
        <div className="card space-y-3">
          <p className="text-sm text-gray-600">全內容匯出 / 匯入：備份所有旅程、成員、準備、日程、心得、成果、照片、CRM、BD 等資料。</p>
          <button className="btn-primary w-full" onClick={doExport}>⬇️ 匯出全部備份 (JSON)</button>
          <button className="btn-outline w-full" onClick={() => fileRef.current.click()}>⬆️ 匯入備份 (JSON)</button>
          <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={doImport} />
        </div>
      )}
    </div>
  );
}
