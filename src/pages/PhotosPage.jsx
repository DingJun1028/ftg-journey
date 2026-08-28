import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { listPhotos, addPhoto, removePhoto } from '../db';

export default function PhotosPage() {
  const { id } = useParams();
  const [photos, setPhotos] = useState([]);
  const [url, setUrl] = useState('');
  const [cap, setCap] = useState('');

  async function load() { setPhotos(await listPhotos(id)); }
  useEffect(() => { load(); }, [id]);

  async function add(e) {
    e.preventDefault();
    if (!url.trim()) return;
    await addPhoto(id, { url: url.trim(), caption: cap.trim() });
    setUrl(''); setCap(''); load();
  }

  return (
    <div className="page">
      <Link to={`/journey/${id}`} className="text-ftg-green text-sm">← 返回旅程</Link>
      <h1 className="section-title mt-2">📷 照片分享區</h1>
      <p className="text-gray-500 text-sm mb-4">旅程中與旅程後的照片，匯集成永續故事牆，可作為永續報告的視覺素材。</p>

      <form onSubmit={add} className="card mb-5">
        <input className="input" placeholder="貼上照片網址 (URL) 或上傳後的連結" value={url} onChange={e => setUrl(e.target.value)} />
        <input className="input mt-2" placeholder="照片說明（選填）" value={cap} onChange={e => setCap(e.target.value)} />
        <button className="btn-primary w-full mt-3" type="submit">加入分享牆</button>
      </form>

      {photos.length === 0 ? (
        <p className="text-gray-400 text-center py-10">尚無照片，快來分享第一張！</p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {photos.map(p => (
            <div key={p.id} className="rounded-xl overflow-hidden bg-white shadow">
              <img src={p.url} alt={p.caption} className="w-full h-40 object-cover" />
              {p.caption && <p className="text-xs p-2 text-gray-600">{p.caption}</p>}
              <button className="text-red-500 text-xs w-full py-1" onClick={async () => { await removePhoto(p.id); load(); }}>刪除</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
