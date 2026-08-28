import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { listSustainability, addSustainability, updateSustainability, removeSustainability } from '../db';

export default function SustainPage() {
  const { id } = useParams();
  const [list, setList] = useState([]);
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [unit, setUnit] = useState('');

  async function load() { setList(await listSustainability(id)); }
  useEffect(() => { load(); }, [id]);

  async function add(e) {
    e.preventDefault();
    if (!name.trim()) return;
    await addSustainability(id, { name: name.trim(), target: Number(target) || 0, unit: unit.trim() });
    setName(''); setTarget(''); setUnit(''); load();
  }

  return (
    <div className="page">
      <Link to={`/journey/${id}`} className="text-ftg-green text-sm">← 返回旅程</Link>
      <h1 className="section-title mt-2">🌍 永續專案訂立區</h1>
      <p className="text-gray-500 text-sm mb-2">訂立這趟旅程的永續目標，後續在「永續成果」填寫實際值即可追蹤達成率。</p>

      <form onSubmit={add} className="card mb-5 flex gap-2 flex-wrap">
        <input className="input flex-1 min-w-[120px]" placeholder="目標名稱（如：減碳）" value={name} onChange={e => setName(e.target.value)} />
        <input className="input w-24" type="number" placeholder="目標值" value={target} onChange={e => setTarget(e.target.value)} />
        <input className="input w-20" placeholder="單位" value={unit} onChange={e => setUnit(e.target.value)} />
        <button className="btn-primary" type="submit">訂立</button>
      </form>

      <h2 className="font-bold text-ftg-forest mb-2">📊 追蹤目標成果區</h2>
      <div className="space-y-3">
        {list.length === 0 && <p className="text-gray-400 text-center py-6">尚無永續目標，先訂立一項吧。</p>}
        {list.map(s => {
          const pct = s.target > 0 ? Math.min(100, Math.round((s.actual / s.target) * 100)) : 0;
          return (
            <div key={s.id} className="card">
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold">{s.name}</span>
                <button className="text-red-500 text-xs" onClick={async () => { await removeSustainability(s.id); load(); }}>刪除</button>
              </div>
              <p className="text-xs text-gray-500 mb-2">目標 {s.target} {s.unit}</p>
              <input
                type="range" min="0" max={Math.max(s.target, s.actual, 1)} value={s.actual}
                onChange={async e => { await updateSustainability(s.id, { actual: Number(e.target.value) }); load(); }}
                className="w-full"
              />
              <div className="flex justify-between text-xs mt-1">
                <span>實際 {s.actual} {s.unit}</span>
                <span className={pct >= 100 ? 'text-ftg-green font-bold' : 'text-ftg-green'}>達成 {pct}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
