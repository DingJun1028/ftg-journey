import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../auth.jsx';

export default function Login() {
  const { renderGoogleButton, loginAs } = useAuth();
  const btnRef = useRef(null);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');

  useEffect(() => {
    // 嘗試掛載 Google 官方按鈕；若未設定 Client ID 則降級為手動登入
    const ok = renderGoogleButton(btnRef.current);
    if (!ok) {
      btnRef.current.innerHTML = '<span class="text-gray-400 text-sm">尚未設定 Google Client ID，請使用下方開發登入</span>';
    }
  }, [renderGoogleButton]);

  return (
    <div className="min-h-full flex flex-col items-center justify-center px-6 py-10">
      <div className="text-5xl mb-3">🌿</div>
      <h1 className="text-2xl font-bold text-ftg-forest mb-1">FTG 永續旅程</h1>
      <p className="text-gray-500 text-sm mb-6 text-center">打造永續旅遊最實用的 App</p>

      <div ref={btnRef} className="mb-6 min-h-[44px] flex items-center justify-center"></div>

      <div className="card w-full max-w-sm">
        <p className="text-sm font-medium text-gray-600 mb-2">開發 / 演示登入（依角色預覽權限）</p>
        <input className="input" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <select className="input mt-2" value={role} onChange={e => setRole(e.target.value)}>
          <option value="admin">管理員 (admin)</option>
          <option value="guide">導遊 (guide)</option>
          <option value="staff">行政/業務 (staff)</option>
          <option value="member">參與者 (member)</option>
        </select>
        <button className="btn-primary w-full mt-3" onClick={() => loginAs(email || `demo@${role}.com`, `演示 ${role}`)}>
          以 {role} 身分登入
        </button>
      </div>
      <p className="text-xs text-gray-400 mt-4 text-center max-w-xs">
        實際上線時將啟用 Google 帳號登入，並依貴公司組織清單自動對應角色權限。
      </p>
    </div>
  );
}
