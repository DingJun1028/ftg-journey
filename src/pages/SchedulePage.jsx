import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { listSchedule, addSchedule, updateSchedule, removeSchedule } from '../db';
import { useScheduleAlarms } from '../useScheduleAlarms';

export default function SchedulePage() {
  const { id } = useParams();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ title: '', datetime: '', location: '', note: '', reminder: true });

  const load = () => listSchedule(id).then(setItems);
  useEffect(() => { load(); }, [id]);
  useScheduleAlarms(id, items);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    await addSchedule(id, form);
    setForm({ title: '', datetime: '', location: '', note: '', reminder: true });
    load();
  };

  const enableNotif = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  return (
    <div className="page">
      <Link to={`/journey/${id}`} className="text-ftg-green text-sm">← 返回旅程</Link>
      <h1 className="section-title mt-2">🗓️ 旅程表與鬧鐘</h1>
      <p className="text-gray-500 text-sm mb-4">安排每日行程，開啟提醒可於時間到時收到通知（App 需保持開啟）。</p>

      {!('Notification' in window) || (typeof Notification !== 'undefined' && Notification.permission !== 'granted') ? (
        <button onClick={enableNotif} className="btn-ghost text-sm mb-3">🔔 啟用鬧鐘通知</button>
      ) : (
        <div className="text-xs text-ftg-green mb-3">🔔 通知已啟用</div>
      )}

      <form onSubmit={submit} className="card space-y-2 mb-4">
        <input className="input" placeholder="行程名稱（如：玉山森林漫步）" value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })} required />
        <div className="grid grid-cols-2 gap-2">
          <input className="input" type="datetime-local" value={form.datetime}
            onChange={e => setForm({ ...form, datetime: e.target.value })} />
          <input className="input" placeholder="地點" value={form.location}
            onChange={e => setForm({ ...form, location: e.target.value })} />
        </div>
        <textarea className="input" rows={2} placeholder="備註" value={form.note}
          onChange={e => setForm({ ...form, note: e.target.value })} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.reminder} onChange={e => setForm({ ...form, reminder: e.target.checked })} className="accent-ftg-green" />
          時間到時提醒我
        </label>
        <button className="btn-primary w-full">加入旅程表</button>
      </form>

      <div className="space-y-2">
        {items.length === 0 && <p className="text-gray-400 text-center mt-6">尚無行程。</p>}
        {items.map(s => (
          <div key={s.id} className={`card flex items-start justify-between ${s.done ? 'opacity-60' : ''}`}>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={s.done} onChange={() => updateSchedule(s.id, { done: !s.done }).then(load)} className="accent-ftg-green mt-1" />
                <div>
                  <div className="font-semibold">{s.title}</div>
                  <div className="text-xs text-gray-500">
                    {s.datetime ? new Date(s.datetime).toLocaleString('zh-TW') : '未設時間'}
                    {s.location ? ' @ ' + s.location : ''}
                    {s.reminder ? ' · ⏰' : ''}
                  </div>
                  {s.note && <div className="text-sm text-gray-600 mt-1">{s.note}</div>}
                </div>
              </div>
            </div>
            <button onClick={() => removeSchedule(s.id).then(load)} className="text-red-300 text-xs">刪</button>
          </div>
        ))}
      </div>
    </div>
  );
}
