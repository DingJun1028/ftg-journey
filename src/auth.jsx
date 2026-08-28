import { createContext, useContext, useEffect, useState, useCallback } from 'react';

// ===== 角色權限定義（依台灣企業旅遊場景）=====
// admin   : 系統最高權限，含後台 / CRM / BD / 匯入匯出 / 去敏化
// guide   : 導遊，負責帶團：點名、聯絡表、停靠記錄、工具、旅程執行
// staff   : 行政 / 業務，負責 CRM、BD、後台管理、行政專區
// member  : 一般參與者，僅自身旅程、心得、照片、準備清單
export const ROLES = {
  admin: {
    label: '系統管理員',
    can: ['journeys', 'prep', 'schedule', 'notes', 'photos', 'impact', 'sustain', 'survey', 'revisit', 'tools', 'privacy', 'admin', 'flights', 'crm', 'bd'],
  },
  guide: {
    label: '導遊',
    can: ['journeys', 'prep', 'schedule', 'notes', 'photos', 'tools', 'flights', 'privacy'],
  },
  staff: {
    label: '行政 / 業務',
    can: ['journeys', 'prep', 'schedule', 'notes', 'photos', 'impact', 'sustain', 'survey', 'admin', 'crm', 'bd', 'privacy'],
  },
  member: {
    label: '參與者',
    can: ['journeys', 'prep', 'schedule', 'notes', 'photos'],
  },
};

// 依 email 對應角色（實務上可由後端或管理後台設定；此處以網域/清單示範）
function resolveRole(email) {
  if (!email) return 'member';
  const adminList = ['dingjunhong1028@gmail.com']; // 系統管理員
  const staffDomains = ['@esggo.co', '@ftg.com.tw'];
  if (adminList.includes(email)) return 'admin';
  if (staffDomains.some(d => email.endsWith(d))) return 'staff';
  // 其餘預設為參與者（或可依邀請清單升為導遊）
  return 'member';
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { email, name, picture, role }
  const [ready, setReady] = useState(false);

  // 初始化：從 localStorage 恢復登入狀態
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ftg_user');
      if (saved) {
        const u = JSON.parse(saved);
        setUser(u);
      }
    } catch (e) { /* ignore */ }
    setReady(true);
  }, []);

  // Google GIS 回呼：接收 id_token，解碼 payload 取得 email/name
  const handleCredentialResponse = useCallback((response) => {
    try {
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      const email = payload.email;
      const u = {
        email,
        name: payload.name,
        picture: payload.picture,
        role: resolveRole(email),
      };
      localStorage.setItem('ftg_user', JSON.stringify(u));
      setUser(u);
    } catch (e) {
      console.error('Google 登入解碼失敗', e);
    }
  }, []);

  // 掛載 Google 登入按鈕
  const renderGoogleButton = useCallback((el) => {
    if (!window.google || !window.google.accounts || !window.google.accounts.id) return false;
    const clientId = document.querySelector('meta[name="google-signin-client_id"]')?.content;
    if (!clientId || clientId.includes('YOUR_GOOGLE_CLIENT_ID')) {
      // 尚未設定 Client ID，改用手動 email 登入（開發用）
      return false;
    }
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleCredentialResponse,
    });
    window.google.accounts.id.renderButton(el, {
      theme: 'outline', size: 'large', type: 'standard', text: 'signin_with',
    });
    return true;
  }, [handleCredentialResponse]);

  const loginAs = (email, name = '測試使用者') => {
    const u = { email, name, picture: '', role: resolveRole(email) };
    localStorage.setItem('ftg_user', JSON.stringify(u));
    setUser(u);
  };

  const logout = () => {
    localStorage.removeItem('ftg_user');
    setUser(null);
  };

  const can = (feature) => user ? ROLES[user.role]?.can.includes(feature) : false;

  return (
    <AuthContext.Provider value={{ user, ready, loginAs, logout, renderGoogleButton, can, ROLES }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
