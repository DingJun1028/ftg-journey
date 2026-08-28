import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  listMembers, addMember, updateMember, removeMember,
  listSouvenirs, addSouvenir, updateSouvenir, removeSouvenir,
  listStops, addStop, removeStop,
  getLodging, saveLodging,
  listMeals, addMeal, updateMeal, removeMeal,
} from '../db';

// 景點觀賞計時器組件
function SpotTimer() {
  const [sec, setSec] = useState(0);
  const [running, setRunning] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (running) {
      ref.current = setInterval(() => setSec(s => s + 1), 1000);
    } else clearInterval(ref.current);
    return () => clearInterval(ref.current);
  }, [running]);
  const mm = String(Math.floor(sec / 60)).padStart(2, '0');
  const ss = String(sec % 60).padStart(2, '0');
  return (
    <div className="card">
      <h3 className="font-bold mb-2">⏱️ 景點觀賞計時器</h3>
      <div className="text-4xl font-mono text-center text-ftg-green py-2">{mm}:{ss}</div>
      <div className="flex gap-2 justify-center">
        <button className="btn-ghost text-sm" onClick={() => setRunning(r => !r)}>{running ? '暫停' : '開始'}</button>
        <button className="btn-ghost text-sm" onClick={() => { setSec(0); setRunning(false); }}>重設</button>
      </div>
    </div>
  );
}

export default function ToolsPage() {
  const { id } = useParams();

  // members
  const [members, setMembers] = useState([]);
  const [mForm, setMForm] = useState({ name: '', phone: '', role: '' });
  // souvenirs
  const [souvs, setSouvs] = useState([]);
  const [sForm, setSForm] = useState({ name: '', forWhom: '' });
  // stops
  const [stops, setStops] = useState([]);
  const [stopName, setStopName] = useState('');
  const [stopNote, setStopNote] = useState('');
  // lodging
  const [lodg, setLodg] = useState({ name: '', address: '', phone: '', checkIn: '', checkOut: '', room: '', note: '' });
  // meals
  const [meals, setMeals] = useState([]);
  const [mealForm, setMealForm] = useState({ type: '早餐', item: '', qty: 1, note: '' });

  const loadAll = async () => {
    setMembers(await listMembers(id));
    setSouvs(await listSouvenirs(id));
    setStops(await listStops(id));
    setLodg(await getLodging(id) || { name: '', address: '', phone: '', checkIn: '', checkOut: '', room: '', note: '' });
    setMeals(await listMeals(id));
  };
  useEffect(() => { loadAll(); }, [id]);

  const capture = () => {
    // 呼叫裝置相機/拍照，回傳 dataURL（簡易實作：用 file input 暫代）
    return new Promise((resolve) => {
      const inp = document.createElement('input');
      inp.type = 'file';
      inp.accept = 'image/*';
      inp.capture = 'environment';
      inp.onchange = () => {
        const f = inp.files[0];
        if (!f) return resolve('');
        const r = new FileReader();
        r.onload = () => resolve(r.result);
        r.readAsDataURL(f);
      };
      inp.click();
    });
  };

  return (
    <div className="page">
      <Link to={`/journey/${id}`} className="text-ftg-green text-sm">← 返回旅程</Link>
      <h1 className="section-title mt-2">🧰 實用工具</h1>
      <p className="text-gray-500 text-sm mb-4">行程前中後都好用的小工具，讓帶隊更輕鬆、不漏東西。</p>

      {/* 點名器 + 聯絡表 */}
      <div className="card mb-4">
        <h3 className="font-bold mb-2">🚌 遊覽車上車點名器 / 團員聯絡表</h3>
        <div className="flex gap-2 mb-2">
          <input className="input" placeholder="姓名" value={mForm.name} onChange={e => setMForm({ ...mForm, name: e.target.value })} />
          <input className="input" placeholder="電話" value={mForm.phone} onChange={e => setMForm({ ...mForm, phone: e.target.value })} />
          <input className="input" placeholder="角色" value={mForm.role} onChange={e => setMForm({ ...mForm, role: e.target.value })} />
          <button className="btn-primary text-sm" onClick={async () => {
            if (!mForm.name.trim()) return;
            await addMember(id, mForm); setMForm({ name: '', phone: '', role: '' }); loadAll();
          }}>加</button>
        </div>
        <p className="text-xs text-gray-400 mb-1">已到 {members.filter(m => m.present).length} / {members.length} 人</p>
        <ul className="space-y-1">
          {members.map(m => (
            <li key={m.id} className="flex items-center justify-between group text-sm">
              <label className="flex items-center gap-2 flex-1 cursor-pointer">
                <input type="checkbox" checked={m.present} onChange={async () => { await updateMember(m.id, { present: !m.present }); loadAll(); }} className="accent-ftg-green" />
                <span className={m.present ? 'line-through text-gray-400' : ''}>{m.name} <span className="text-gray-400 text-xs">{m.role}</span></span>
              </label>
              <span className="text-gray-400 text-xs">{m.phone}</span>
              <button onClick={async () => { await removeMember(m.id); loadAll(); }} className="text-red-300 text-xs opacity-0 group-hover:opacity-100 ml-2">刪</button>
            </li>
          ))}
        </ul>
      </div>

      {/* 紀念品 + 發送對象 */}
      <div className="card mb-4">
        <h3 className="font-bold mb-2">🎁 必備紀念品與發送對象集合</h3>
        <div className="flex gap-2 mb-2">
          <input className="input" placeholder="紀念品名稱" value={sForm.name} onChange={e => setSForm({ ...sForm, name: e.target.value })} />
          <input className="input" placeholder="發送對象（如：張經理、全體同仁）" value={sForm.forWhom} onChange={e => setSForm({ ...sForm, forWhom: e.target.value })} />
          <button className="btn-primary text-sm" onClick={async () => {
            if (!sForm.name.trim()) return;
            await addSouvenir(id, sForm); setSForm({ name: '', forWhom: '' }); loadAll();
          }}>加</button>
        </div>
        <ul className="space-y-1">
          {souvs.map(s => (
            <li key={s.id} className="flex items-center justify-between group text-sm">
              <label className="flex items-center gap-2 flex-1 cursor-pointer">
                <input type="checkbox" checked={s.bought} onChange={async () => { await updateSouvenir(s.id, { bought: !s.bought }); loadAll(); }} className="accent-ftg-green" />
                <span className={s.bought ? 'line-through text-gray-400' : ''}>{s.name} <span className="text-gray-400 text-xs">→ {s.forWhom}</span></span>
              </label>
              <button onClick={async () => { await removeSouvenir(s.id); loadAll(); }} className="text-red-300 text-xs opacity-0 group-hover:opacity-100">刪</button>
            </li>
          ))}
          {souvs.length === 0 && <li className="text-gray-300 text-sm">尚無紀念品清單</li>}
        </ul>
      </div>

      {/* 遊覽車停靠處記錄器 */}
      <div className="card mb-4">
        <h3 className="font-bold mb-2">📍 遊覽車停靠處記錄器（一鍵拍照不迷路）</h3>
        <div className="flex gap-2 mb-2">
          <input className="input" placeholder="停靠點名稱（如：台中服務區）" value={stopName} onChange={e => setStopName(e.target.value)} />
          <button className="btn-primary text-sm" onClick={async () => {
            const photo = await capture();
            await addStop(id, { name: stopName, note: stopNote, photo });
            setStopName(''); setStopNote(''); loadAll();
          }}>📷 拍照記錄</button>
        </div>
        <input className="input mb-2" placeholder="備註（如：集合時間 14:30）" value={stopNote} onChange={e => setStopNote(e.target.value)} />
        <div className="grid grid-cols-2 gap-2">
          {stops.map(s => (
            <div key={s.id} className="border rounded-xl p-2 relative">
              <button onClick={async () => { await removeStop(s.id); loadAll(); }} className="absolute top-1 right-1 text-red-300 text-xs">✕</button>
              <div className="font-medium text-sm">{s.name}</div>
              {s.photo && <img src={s.photo} alt={s.name} className="w-full h-24 object-cover rounded-lg mt-1" />}
              {s.note && <div className="text-xs text-gray-500 mt-1">{s.note}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* 景點觀賞計時器 */}
      <SpotTimer />

      {/* 早餐晚餐訂購器 */}
      <div className="card mt-4 mb-4">
        <h3 className="font-bold mb-2">🍽️ 早餐晚餐訂購器</h3>
        <div className="flex gap-2 mb-2">
          <select className="input" value={mealForm.type} onChange={e => setMealForm({ ...mealForm, type: e.target.value })}>
            <option>早餐</option><option>晚餐</option><option>午餐</option><option>點心</option>
          </select>
          <input className="input" placeholder="餐點（如：素食便當x10）" value={mealForm.item} onChange={e => setMealForm({ ...mealForm, item: e.target.value })} />
          <input className="input w-20" type="number" min="1" value={mealForm.qty} onChange={e => setMealForm({ ...mealForm, qty: e.target.value })} />
          <button className="btn-primary text-sm" onClick={async () => {
            if (!mealForm.item.trim()) return;
            await addMeal(id, mealForm); setMealForm({ type: '早餐', item: '', qty: 1, note: '' }); loadAll();
          }}>加</button>
        </div>
        <ul className="space-y-1">
          {meals.map(m => (
            <li key={m.id} className="flex items-center justify-between group text-sm">
              <label className="flex items-center gap-2 flex-1 cursor-pointer">
                <input type="checkbox" checked={m.ordered} onChange={async () => { await updateMeal(m.id, { ordered: !m.ordered }); loadAll(); }} className="accent-ftg-green" />
                <span className={m.ordered ? 'line-through text-gray-400' : ''}>[{m.type}] {m.item} ×{m.qty}</span>
              </label>
              <button onClick={async () => { await removeMeal(m.id); loadAll(); }} className="text-red-300 text-xs opacity-0 group-hover:opacity-100">刪</button>
            </li>
          ))}
          {meals.length === 0 && <li className="text-gray-300 text-sm">尚無訂餐</li>}
        </ul>
      </div>

      {/* 下榻旅館詳細資訊 */}
      <div className="card mb-4">
        <h3 className="font-bold mb-2">🏨 下榻旅館詳細資訊</h3>
        <div className="grid grid-cols-2 gap-2">
          <input className="input" placeholder="旅館名稱" value={lodg.name} onChange={e => setLodg({ ...lodg, name: e.target.value })} />
          <input className="input" placeholder="電話" value={lodg.phone} onChange={e => setLodg({ ...lodg, phone: e.target.value })} />
          <input className="input col-span-2" placeholder="地址" value={lodg.address} onChange={e => setLodg({ ...lodg, address: e.target.value })} />
          <input className="input" type="date" placeholder="入住" value={lodg.checkIn} onChange={e => setLodg({ ...lodg, checkIn: e.target.value })} />
          <input className="input" type="date" placeholder="退房" value={lodg.checkOut} onChange={e => setLodg({ ...lodg, checkOut: e.target.value })} />
          <input className="input col-span-2" placeholder="房型 / 房號" value={lodg.room} onChange={e => setLodg({ ...lodg, room: e.target.value })} />
        </div>
        <textarea className="input mt-2" rows={2} placeholder="備註（如：早餐時間、停車資訊）" value={lodg.note} onChange={e => setLodg({ ...lodg, note: e.target.value })} />
        <button className="btn-primary w-full mt-2 text-sm" onClick={async () => { await saveLodging(id, lodg); alert('旅館資訊已儲存'); }}>儲存旅館資訊</button>
      </div>
    </div>
  );
}
