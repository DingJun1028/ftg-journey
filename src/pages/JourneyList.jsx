import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  listJourneys, createJourney, deleteJourney,
  FTG_SERVICE_TYPES, STAGES,
} from '../db';

export default function JourneyList() {
  const [journeys, setJourneys] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '', serviceType: 'corporate-travel', purpose: '',
    startDate: '', endDate: '', destination: '',
  });
  const nav = useNavigate();

  const load = () => listJourneys().then(setJourneys);
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    const j = await createJourney(form);
    setShowForm(false);
    setForm({ title: '', serviceType: 'corporate-travel', purpose: '', startDate: '', endDate: '', destination: '' });
    nav(`/journey/${j.id}`);
  };

  const del = async (id) => {
    if (confirm('確定刪除這趟旅程？')) { await deleteJourney(id); load(); }
  };

  return (
    <div className="page">
      <div className="flex items-center justify-between">
        <h1 className="section-title">我的旅程</h1>
        <button onClick={() => setShowForm(s => !s)} className="btn-primary text-sm">{showForm ? '取消' : '+ 新增'}</button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="card mt-4 space-y-3">
          <input className="input" placeholder="旅程名稱（如：2026 玉山ESG團隊日）" value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })} required />
          <select className="input" value={form.serviceType}
            onChange={e => setForm({ ...form, serviceType: e.target.value })}>
            {FTG_SERVICE_TYPES.map(s => <option key={s.id} value={s.id}>{s.icon} {s.label}</option>)}
          </select>
          <input className="input" type="text" placeholder="目的地" value={form.destination}
            onChange={e => setForm({ ...form, destination: e.target.value })} />
          <div className="grid grid-cols-2 gap-2">
            <input className="input" type="date" value={form.startDate}
              onChange={e => setForm({ ...form, startDate: e.target.value })} />
            <input className="input" type="date" value={form.endDate}
              onChange={e => setForm({ ...form, endDate: e.target.value })} />
          </div>
          <textarea className="input" rows={2} placeholder="推廣目的 / 備註（如：員工福祉 + 品牌雇主）" value={form.purpose}
            onChange={e => setForm({ ...form, purpose: e.target.value })} />
          <button className="btn-primary w-full">建立旅程</button>
        </form>
      )}

      <div className="space-y-3 mt-5">
        {journeys.length === 0 && <p className="text-gray-400 text-center mt-10">尚無旅程，點擊右上角新增。</p>}
        {journeys.map(j => {
          const st = STAGES[j.stage] || STAGES.planning;
          const svc = FTG_SERVICE_TYPES.find(s => s.id === j.serviceType);
          return (
            <div key={j.id} className="card flex items-center justify-between">
              <Link to={`/journey/${j.id}`} className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{svc?.icon}</span>
                  <div>
                    <div className="font-semibold">{j.title}</div>
                    <div className="text-xs text-gray-500">{j.destination || svc?.label}{j.startDate ? ' · ' + j.startDate : ''}</div>
                  </div>
                </div>
                <span className="badge mt-1 inline-block" style={{ background: st.color + '22', color: st.color }}>{st.label}</span>
              </Link>
              <button onClick={() => del(j.id)} className="text-red-400 text-xs ml-2">刪除</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
