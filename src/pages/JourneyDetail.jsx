import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getJourney, updateJourney, listPrep, getLodging, saveLodging, FTG_SERVICE_TYPES, STAGES } from '../db';
import { useAuth } from '../auth.jsx';

export default function JourneyDetail() {
  const { id } = useParams();
  const { can } = useAuth();
  const [j, setJ] = useState(null);
  const [prepCount, setPrepCount] = useState({ total: 0, done: 0 });
  const [lodging, setLodging] = useState(null);
  const [lg, setLg] = useState({});

  const load = async () => {
    const jr = await getJourney(id);
    setJ(jr);
    const prep = await listPrep(id);
    setPrepCount({ total: prep.length, done: prep.filter(p => p.done).length });
    const lg = await getLodging(id);
    setLodging(lg);
    setLg(lg || {});
  };
  useEffect(() => { load(); }, [id]);

  if (!j) return <div className="p-6 text-gray-400">載入中…</div>;

  const svc = FTG_SERVICE_TYPES.find(s => s.id === j.serviceType);
  const pct = prepCount.total ? Math.round((prepCount.done / prepCount.total) * 100) : 0;

  async function saveLodgingInfo(e) {
    e.preventDefault();
    await saveLodging(id, lg);
    load();
  }

  return (
    <div className="page">
      <Link to="/journeys" className="text-ftg-green text-sm">← 返回旅程列表</Link>
      <div className="flex items-center gap-2 mt-2">
        <span className="text-3xl">{svc?.icon}</span>
        <h1 className="section-title">{j.title}</h1>
      </div>
      <p className="text-gray-500 text-sm">{svc?.label}{j.destination ? ' · ' + j.destination : ''}{j.startDate ? ' · ' + j.startDate + (j.endDate ? ' ~ ' + j.endDate : '') : ''}</p>
      {j.purpose && <p className="text-gray-600 mt-2 text-sm bg-ftg-cream rounded-xl p-3">{j.purpose}</p>}

      {/* 階段切換 */}
      <div className="flex gap-2 mt-4 flex-wrap">
        {Object.values(STAGES).map(s => (
          <button key={s.id}
            onClick={() => updateJourney(id, { stage: s.id }).then(load)}
            className="badge"
            style={{ background: j.stage === s.id ? s.color : '#eee', color: j.stage === s.id ? '#fff' : '#666' }}>
            {s.label}
          </button>
        ))}
      </div>

      {/* 準備進度 */}
      <div className="card mt-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="font-medium">行程前準備進度</span>
          <span>{prepCount.done}/{prepCount.total} · {pct}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div className="bg-ftg-green h-2.5 rounded-full transition-all" style={{ width: pct + '%' }}></div>
        </div>
      </div>

      {/* 飯店資訊 */}
      <form onSubmit={saveLodgingInfo} className="card mt-4">
        <h2 className="font-bold text-ftg-forest mb-2">🏨 飯店完整資訊</h2>
        <input className="input" placeholder="飯店名稱" value={lg.name || ''} onChange={e => setLg({ ...lg, name: e.target.value })} />
        <input className="input mt-2" placeholder="地址" value={lg.address || ''} onChange={e => setLg({ ...lg, address: e.target.value })} />
        <div className="flex gap-2 mt-2">
          <input className="input" placeholder="入住" value={lg.checkIn || ''} onChange={e => setLg({ ...lg, checkIn: e.target.value })} />
          <input className="input" placeholder="退房" value={lg.checkOut || ''} onChange={e => setLg({ ...lg, checkOut: e.target.value })} />
        </div>
        <input className="input mt-2" placeholder="訂房確認號 / 備註" value={lg.note || ''} onChange={e => setLg({ ...lg, note: e.target.value })} />
        <button className="btn-primary w-full mt-3" type="submit">儲存飯店資訊</button>
      </form>

      {/* 階段入口 */}
      <div className="grid grid-cols-2 gap-3 mt-5">
        {can('prep') && <Link to={`/journey/${id}/prep`} className="card text-center hover:shadow-md transition"><div className="text-2xl">🎒</div><div className="font-semibold text-sm mt-1">準備清單</div></Link>}
        {can('schedule') && <Link to={`/journey/${id}/schedule`} className="card text-center hover:shadow-md transition"><div className="text-2xl">🗓️</div><div className="font-semibold text-sm mt-1">旅程表 / 鬧鐘</div></Link>}
        {can('flights') && <Link to={`/journey/${id}/flights`} className="card text-center hover:shadow-md transition"><div className="text-2xl">✈️</div><div className="font-semibold text-sm mt-1">機票資訊</div></Link>}
        {can('notes') && <Link to={`/journey/${id}/notes`} className="card text-center hover:shadow-md transition"><div className="text-2xl">✍️</div><div className="font-semibold text-sm mt-1">旅程心得</div></Link>}
        {can('photos') && <Link to={`/journey/${id}/photos`} className="card text-center hover:shadow-md transition"><div className="text-2xl">📷</div><div className="font-semibold text-sm mt-1">照片分享區</div></Link>}
        {can('impact') && <Link to={`/journey/${id}/impact`} className="card text-center hover:shadow-md transition"><div className="text-2xl">🌱</div><div className="font-semibold text-sm mt-1">永續成果</div></Link>}
        {can('sustain') && <Link to={`/journey/${id}/sustain`} className="card text-center hover:shadow-md transition"><div className="text-2xl">🌍</div><div className="font-semibold text-sm mt-1">永續專案</div></Link>}
        {can('survey') && <Link to={`/journey/${id}/survey`} className="card text-center hover:shadow-md transition"><div className="text-2xl">📝</div><div className="font-semibold text-sm mt-1">滿意度調查</div></Link>}
        {can('revisit') && <Link to={`/journey/${id}/revisit`} className="card text-center hover:shadow-md transition"><div className="text-2xl">🔁</div><div className="font-semibold text-sm mt-1">舊地重遊</div></Link>}
        {can('tools') && <Link to={`/journey/${id}/tools`} className="card text-center hover:shadow-md transition"><div className="text-2xl">🧰</div><div className="font-semibold text-sm mt-1">實用工具</div></Link>}
        {can('privacy') && <Link to={`/journey/${id}/privacy`} className="card text-center hover:shadow-md transition col-span-2"><div className="text-2xl">🔐</div><div className="font-semibold text-sm mt-1">資訊去敏化 · 個資保護</div></Link>}
        {can('admin') && <Link to={`/journey/${id}/admin`} className="card text-center hover:shadow-md transition col-span-2"><div className="text-2xl">🛠️</div><div className="font-semibold text-sm mt-1">後台管理（導遊 / 行政 / CRM / BD）</div></Link>}
      </div>
    </div>
  );
}
