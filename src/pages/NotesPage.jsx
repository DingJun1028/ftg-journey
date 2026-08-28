import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { listNotes, addNote, removeNote } from '../db';

const MOODS = ['😊', '😌', '🤩', '🥰', '😮', '🧘', '🌟', '😐'];

export default function NotesPage() {
  const { id } = useParams();
  const [notes, setNotes] = useState([]);
  const [form, setForm] = useState({ text: '', mood: '😊', photo: '', date: new Date().toISOString().slice(0, 10) });

  const load = () => listNotes(id).then(setNotes);
  useEffect(() => { load(); }, [id]);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.text.trim()) return;
    await addNote(id, { ...form, date: new Date(form.date).getTime() });
    setForm({ text: '', mood: '😊', photo: '', date: new Date().toISOString().slice(0, 10) });
    load();
  };

  return (
    <div className="page">
      <Link to={`/journey/${id}`} className="text-ftg-green text-sm">← 返回旅程</Link>
      <h1 className="section-title mt-2">✍️ 旅程心得</h1>
      <p className="text-gray-500 text-sm mb-4">記錄當下感受、發現與照片，旅程後可成為永續故事的素材。</p>

      <form onSubmit={submit} className="card space-y-2 mb-4">
        <div className="flex gap-1 flex-wrap">
          {MOODS.map(m => (
            <button type="button" key={m} onClick={() => setForm({ ...form, mood: m })}
              className={`text-2xl p-1 rounded-lg ${form.mood === m ? 'bg-ftg-cream' : 'opacity-50'}`}>{m}</button>
          ))}
        </div>
        <input className="input" type="date" value={form.date}
          onChange={e => setForm({ ...form, date: e.target.value })} />
        <textarea className="input" rows={3} placeholder="今天在旅程中的觀察、感受或收穫…" value={form.text}
          onChange={e => setForm({ ...form, text: e.target.value })} />
        <input className="input" placeholder="照片連結 (選填，貼圖床網址)" value={form.photo}
          onChange={e => setForm({ ...form, photo: e.target.value })} />
        <button className="btn-primary w-full">儲存心得</button>
      </form>

      <div className="space-y-3">
        {notes.length === 0 && <p className="text-gray-400 text-center mt-6">尚無心得。</p>}
        {notes.map(n => (
          <div key={n.id} className="card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{n.mood}</span>
                <span className="text-xs text-gray-500">{new Date(n.date).toLocaleDateString('zh-TW')}</span>
              </div>
              <button onClick={() => removeNote(n.id).then(load)} className="text-red-300 text-xs">刪</button>
            </div>
            {n.photo && <img src={n.photo} alt="心得" className="w-full rounded-xl mt-2 max-h-60 object-cover" />}
            <p className="text-gray-700 mt-2 whitespace-pre-wrap">{n.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
