import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSurvey, saveSurvey } from '../db';

const QUESTIONS = [
  { id: 'overall', label: '整體滿意度' },
  { id: 'organization', label: '行程安排與組織' },
  { id: 'guide', label: '導覽與服務品質' },
  { id: 'sustainability', label: '永續體驗感受' },
  { id: 'recommend', label: '推薦意願' },
];

export default function SurveyPage() {
  const { id } = useParams();
  const [scores, setScores] = useState({});
  const [comment, setComment] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      const s = await getSurvey(id);
      if (s) { setScores(s.scores || {}); setComment(s.comment || ''); }
    })();
  }, [id]);

  async function save() {
    await saveSurvey(id, { scores, comment });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="page">
      <Link to={`/journey/${id}`} className="text-ftg-green text-sm">← 返回旅程</Link>
      <h1 className="section-title mt-2">📝 滿意度調查表</h1>
      <p className="text-gray-500 text-sm mb-4">旅程結束後收集參與者回饋，可作為雇主品牌與永續報告依據。</p>

      <div className="card space-y-4">
        {QUESTIONS.map(q => (
          <div key={q.id}>
            <p className="font-medium text-sm mb-1">{q.label}</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  onClick={() => setScores({ ...scores, [q.id]: n })}
                  className={`flex-1 py-2 rounded ${scores[q.id] === n ? 'bg-ftg-green text-white' : 'bg-gray-100 text-gray-600'}`}
                >{n}</button>
              ))}
            </div>
          </div>
        ))}
        <div>
          <p className="font-medium text-sm mb-1">其他建議</p>
          <textarea className="input" rows={3} value={comment} onChange={e => setComment(e.target.value)} />
        </div>
        <button className="btn-primary w-full" onClick={save}>{saved ? '已儲存 ✅' : '送出調查'}</button>
      </div>
    </div>
  );
}
