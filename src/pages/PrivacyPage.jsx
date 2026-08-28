import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { listMembers, updateMember, exportPublicReport } from '../db';

export default function PrivacyPage() {
  const { id } = useParams();
  const [members, setMembers] = useState([]);

  async function load() { setMembers(await listMembers(id)); }
  useEffect(() => { load(); }, [id]);

  async function toggleConsent(m) {
    await updateMember(m.id, { consentPublic: !m.consentPublic });
    load();
  }

  async function downloadReport() {
    const data = await exportPublicReport();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `ftg-永續成果去敏化報告-${Date.now()}.json`;
    a.click();
  }

  const consented = members.filter(m => m.consentPublic).length;

  return (
    <div className="page">
      <Link to={`/journey/${id}`} className="text-ftg-green text-sm">← 返回旅程</Link>
      <h1 className="section-title mt-2">🔐 資訊去敏化 · 個資保護</h1>
      <p className="text-gray-500 text-sm mb-3">
        依《個人資料保護法》規定，成員個資僅用於旅程執行目的。若欲將成果用於永續報告或公開展示，
        需經當事人<strong>明示同意</strong>。未同意者不會出現在任何公開成果中，且公開輸出自動遮蔽證件號、電話、Email、血型、房號、過敏史等直接識別資訊。
      </p>

      <div className="card mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="font-semibold">成員公開同意狀態</span>
          <span className="text-sm text-ftg-green">{consented}/{members.length} 已同意</span>
        </div>
        <div className="space-y-2">
          {members.map(m => (
            <label key={m.id} className="flex items-center gap-2 text-sm bg-gray-50 rounded-lg p-2">
              <input type="checkbox" checked={!!m.consentPublic} onChange={() => toggleConsent(m)} />
              <span className="font-medium">{m.name}</span>
              <span className="text-gray-400 text-xs">{m.consentPublic ? '✅ 同意公開' : '🔒 僅內部使用'}</span>
            </label>
          ))}
          {members.length === 0 && <p className="text-gray-400 text-center py-4">尚無梯次成員，請至後台新增</p>}
        </div>
      </div>

      <button className="btn-primary w-full" onClick={downloadReport}>
        ⬇️ 產出去敏化永續成果報告（公開安全版）
      </button>
      <p className="text-xs text-gray-400 mt-2 text-center">
        匯出檔不含任何未同意者與敏感欄位，可直接用於永續報告或對外發布。
      </p>
    </div>
  );
}
