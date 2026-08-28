import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { listImpact, setImpact, getJourney, listNotes, IMPACT_METRICS, FTG_SERVICE_TYPES } from '../db';

export default function ImpactPage() {
  const { id } = useParams();
  const [j, setJ] = useState(null);
  const [impact, setImpactState] = useState({});
  const [notes, setNotes] = useState([]);

  const load = async () => {
    setJ(await getJourney(id));
    const list = await listImpact(id);
    const map = {};
    list.forEach(i => { map[i.metricId] = i; });
    setImpactState(map);
    setNotes(await listNotes(id));
  };
  useEffect(() => { load(); }, [id]);

  const setVal = async (metricId, value) => {
    await setImpact(id, metricId, Number(value) || 0);
    load();
  };

  const genReport = () => {
    const svc = FTG_SERVICE_TYPES.find(s => s.id === j.serviceType);
    const lines = [];
    lines.push(`# ${j.title} — 永續旅程影響力報告`);
    lines.push('');
    lines.push(`- 服務類型：${svc?.label || ''}`);
    lines.push(`- 目的地：${j.destination || '—'}`);
    lines.push(`- 日期：${j.startDate || '—'}${j.endDate ? ' ~ ' + j.endDate : ''}`);
    if (j.purpose) lines.push(`- 推廣目的：${j.purpose}`);
    lines.push('');
    lines.push('## 永續指標');
    IMPACT_METRICS.forEach(m => {
      const v = impact[m.id]?.value || 0;
      if (v) lines.push(`- ${m.label}：${v} ${m.unit}`);
    });
    lines.push('');
    lines.push('## 旅程心得摘要');
    notes.slice(0, 5).forEach(n => {
      lines.push(`- ${new Date(n.date).toLocaleDateString('zh-TW')} ${n.mood}：${n.text.slice(0, 80)}`);
    });
    lines.push('');
    lines.push('— 本報告由 FTG 永續旅程 App 自動彙整，可供企業永續報告 / ESG 揭露引用。');
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${j.title}-永續報告.md`;
    a.click();
  };

  if (!j) return <div className="p-6 text-gray-400">載入中…</div>;

  return (
    <div className="page">
      <Link to={`/journey/${id}`} className="text-ftg-green text-sm">← 返回旅程</Link>
      <h1 className="section-title mt-2">🌱 永續成果收集</h1>
      <p className="text-gray-500 text-sm mb-4">記錄旅程帶來的永續影響，一鍵產出可寫進永續報告的成果摘要。</p>

      <div className="space-y-3">
        {IMPACT_METRICS.map(m => (
          <div key={m.id} className="card flex items-center justify-between">
            <div className="flex-1">
              <div className="font-medium text-sm">{m.label}</div>
              <div className="text-xs text-gray-400">單位：{m.unit} · {m.note}</div>
              {m.sdg && m.sdg.length > 0 && (
                <div className="text-xs text-ftg-green mt-1">SDG {m.sdg.join(', ')}</div>
              )}
            </div>
            <input type="number" className="input w-24 text-right" value={impact[m.id]?.value || 0}
              onChange={e => setVal(m.id, e.target.value)} />
          </div>
        ))}
      </div>

      {/* 官網 ESG Impact Note 對應：SDGs 彙總 */}
      <div className="card mt-4 bg-ftg-sand">
        <h2 className="font-bold text-sm mb-2">📊 官網 ESG Impact Note 對應（SDGs 彙總）</h2>
        <p className="text-xs text-gray-500 mb-2">自動彙整所有指標對應的聯合國永續發展目標，對應官網「ESG／SDGs 對應整理」。</p>
        <div className="flex flex-wrap gap-1">
          {Array.from(new Set(IMPACT_METRICS.flatMap(m => m.sdg || []))).sort((a, b) => a - b).map(sdg => (
            <span key={sdg} className="text-xs bg-ftg-green text-white px-2 py-0.5 rounded-full">SDG {sdg}</span>
          ))}
        </div>
      </div>

      <button onClick={genReport} className="btn-primary w-full mt-5">📥 產出永續報告（Markdown）</button>
      <p className="text-xs text-gray-400 mt-2 text-center">報告含服務類型、永續指標與心得摘要，可直接引用於 ESG 揭露。</p>
    </div>
  );
}
