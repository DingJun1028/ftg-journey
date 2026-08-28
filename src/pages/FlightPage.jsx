import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { listFlights, addFlight, updateFlight, removeFlight } from '../db';

export default function FlightPage() {
  const { id } = useParams();
  const [flights, setFlights] = useState([]);
  const [f, setF] = useState({});

  async function load() { setFlights(await listFlights(id)); }
  useEffect(() => { load(); }, [id]);

  async function add(e) {
    e.preventDefault();
    if (!f.airline && !f.flightNo) return;
    await addFlight(id, f);
    setF({}); load();
  }

  return (
    <div className="page">
      <Link to={`/journey/${id}`} className="text-ftg-green text-sm">← 返回旅程</Link>
      <h1 className="section-title mt-2">✈️ 機票完整資訊</h1>
      <p className="text-gray-500 text-sm mb-4">記錄已訂購的航班明細，方便隨時查閱與分享給團員。</p>

      <form onSubmit={add} className="card mb-5 grid grid-cols-2 gap-2">
        <input className="input" placeholder="航空公司" value={f.airline || ''} onChange={e => setF({ ...f, airline: e.target.value })} />
        <input className="input" placeholder="航班號" value={f.flightNo || ''} onChange={e => setF({ ...f, flightNo: e.target.value })} />
        <input className="input" placeholder="出發機場" value={f.depAirport || ''} onChange={e => setF({ ...f, depAirport: e.target.value })} />
        <input className="input" placeholder="抵達機場" value={f.arrAirport || ''} onChange={e => setF({ ...f, arrAirport: e.target.value })} />
        <input className="input" type="datetime-local" value={f.depTime || ''} onChange={e => setF({ ...f, depTime: e.target.value })} />
        <input className="input" type="datetime-local" value={f.arrTime || ''} onChange={e => setF({ ...f, arrTime: e.target.value })} />
        <input className="input" placeholder="PNR / 訂位代號" value={f.pnr || ''} onChange={e => setF({ ...f, pnr: e.target.value })} />
        <input className="input" placeholder="座位" value={f.seat || ''} onChange={e => setF({ ...f, seat: e.target.value })} />
        <input className="input col-span-2" placeholder="乘客姓名" value={f.passenger || ''} onChange={e => setF({ ...f, passenger: e.target.value })} />
        <input className="input col-span-2" placeholder="備註" value={f.note || ''} onChange={e => setF({ ...f, note: e.target.value })} />
        <button className="btn-primary col-span-2" type="submit">加入機票</button>
      </form>

      <div className="space-y-2">
        {flights.map(x => (
          <div key={x.id} className="card text-sm">
            <div className="flex justify-between">
              <span className="font-semibold">{x.airline} {x.flightNo}</span>
              <button className="text-red-500 text-xs" onClick={async () => { await removeFlight(x.id); load(); }}>刪除</button>
            </div>
            <p className="text-xs text-gray-500">{x.depAirport} → {x.arrAirport}</p>
            <p className="text-xs text-gray-500">{x.depTime} ~ {x.arrTime}{x.pnr ? ' · PNR ' + x.pnr : ''}{x.seat ? ' · 座位 ' + x.seat : ''}</p>
            {x.passenger && <p className="text-xs text-gray-400">乘客：{x.passenger}</p>}
            {x.note && <p className="text-xs text-gray-400">{x.note}</p>}
          </div>
        ))}
        {flights.length === 0 && <p className="text-gray-400 text-center py-6">尚無機票資訊</p>}
      </div>
    </div>
  );
}
