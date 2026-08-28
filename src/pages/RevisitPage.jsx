import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { listRevisits, addRevisit, removeRevisit } from '../db';

export default function RevisitPage() {
  const { id } = useParams();
  const [list, setList] = useState([]);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');

  async function load() { setList(await listRevisits(id)); }
  useEffect(() => { load(); }, [id]);

  async function add(e) {
    e.preventDefault();
    if (!text.trim()) return;
    await addRevisit(id, { title: title.trim(), text: text.trim() });
    setTitle(''); setText(''); load();
  }

  return (
    <div className="page">
      <Link to={`/journey/${id}`} className="text-ftg-green text-sm">← 返回旅程</Link>
      <h1 className="section-title mt-2">🔁 舊地重遊心得區</h1>
      <p className="text-gray-500 text-sm mb-4">事後回顧這趟永續旅程，記錄重遊或回味的點滴。</p>

      <form onSubmit={add} className="card mb-5">
        <input className="input" placeholder="標題（選填）" value={title} onChange={e => setTitle(e.target.value)} />
        <textarea className="input mt-2" rows={3} placeholder="重遊心得…" value={text} onChange={e => setText(e.target.value)} />
        <button className="btn-primary w-full mt-3" type="submit">留下心得</button>
      </form>

      <div className="space-y-3">
        {list.map(r => (
          <div key={r.id} className="card">
            <div className="flex justify-between items-start">
              <div>
                {r.title && <p className="font-semibold">{r.title}</p>}
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{r.text}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(r.date).toLocaleDateString()}</p>
              </div>
              <button className="text-red-500 text-xs" onClick={async () => { await removeRevisit(r.id); load(); }}>刪除</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
