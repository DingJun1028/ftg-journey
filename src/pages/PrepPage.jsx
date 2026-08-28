import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { listPrep, addPrep, togglePrep, removePrep, PREP_CATEGORIES } from '../db';

export default function PrepPage() {
  const { id } = useParams();
  const [items, setItems] = useState([]);
  const [adding, setAdding] = useState(null); // category id
  const [text, setText] = useState('');

  const load = () => listPrep(id).then(setItems);
  useEffect(() => { load(); }, [id]);

  const grouped = PREP_CATEGORIES.map(cat => ({
    ...cat,
    list: items.filter(i => i.category === cat.id),
  }));

  const submitAdd = async (cat) => {
    if (!text.trim()) return;
    await addPrep(id, cat, text.trim());
    setText('');
    setAdding(null);
    load();
  };

  return (
    <div className="page">
      <Link to={`/journey/${id}`} className="text-ftg-green text-sm">← 返回旅程</Link>
      <h1 className="section-title mt-2">🎒 行程前準備</h1>
      <p className="text-gray-500 text-sm mb-4">可自訂：人選、護照、文件、錢、物品、流程。勾選完成，出發前不再遺漏。</p>

      <div className="space-y-4">
        {grouped.map(cat => (
          <div key={cat.id} className="card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">{cat.icon}</span>
                <h2 className="font-bold">{cat.label}</h2>
                <span className="text-xs text-gray-400">{cat.list.filter(i => i.done).length}/{cat.list.length}</span>
              </div>
              <button onClick={() => { setAdding(cat.id); setText(''); }}
                className="text-ftg-green text-sm">+ 自訂</button>
            </div>
            <p className="text-xs text-gray-400 mb-2">{cat.hint}</p>

            {adding === cat.id && (
              <div className="flex gap-2 mb-2">
                <input className="input" autoFocus placeholder="新增準備項目…" value={text}
                  onChange={e => setText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && submitAdd(cat.id)} />
                <button className="btn-primary text-sm" onClick={() => submitAdd(cat.id)}>加</button>
              </div>
            )}

            <ul className="space-y-1">
              {cat.list.map(it => (
                <li key={it.id} className="flex items-center justify-between group">
                  <label className="flex items-center gap-2 flex-1 cursor-pointer">
                    <input type="checkbox" checked={it.done} onChange={() => togglePrep(it.id).then(load)}
                      className="w-4 h-4 accent-ftg-green" />
                    <span className={it.done ? 'line-through text-gray-400' : ''}>{it.text}</span>
                  </label>
                  <button onClick={() => removePrep(it.id).then(load)}
                    className="text-red-300 text-xs opacity-0 group-hover:opacity-100">刪</button>
                </li>
              ))}
              {cat.list.length === 0 && <li className="text-gray-300 text-sm">尚無項目，點「+ 自訂」新增</li>}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
