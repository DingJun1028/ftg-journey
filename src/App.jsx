import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth.jsx';
import { useScheduleAlarms } from './useScheduleAlarms';
import Home from './pages/Home';
import JourneyList from './pages/JourneyList';
import JourneyDetail from './pages/JourneyDetail';
import PrepPage from './pages/PrepPage';
import SchedulePage from './pages/SchedulePage';
import NotesPage from './pages/NotesPage';
import ImpactPage from './pages/ImpactPage';
import ToolsPage from './pages/ToolsPage';
import PhotosPage from './pages/PhotosPage';
import SurveyPage from './pages/SurveyPage';
import RevisitPage from './pages/RevisitPage';
import SustainPage from './pages/SustainPage';
import AdminPage from './pages/AdminPage';
import FlightPage from './pages/FlightPage';
import PrivacyPage from './pages/PrivacyPage';
import Login from './pages/Login';

// 角色守門：僅當使用者擁有該功能權限時才渲染
function Guard({ feature, children }) {
  const { can } = useAuth();
  return can(feature) ? children : <Navigate to="/journeys" replace />;
}

function TabBar() {
  const loc = useLocation();
  const { can } = useAuth();
  const tabs = [
    { to: '/', icon: '🏠', label: '首頁' },
    { to: '/journeys', icon: '🧭', label: '旅程' },
  ];
  const m = loc.pathname.match(/^\/journey\/(.+)$/);
  if (m) {
    const id = m[1];
    return (
      <nav className="tabbar">
        {can('prep') && <Link to={`/journey/${id}`} className="tab-item"><span className="text-xl">🎒</span>準備</Link>}
        {can('schedule') && <Link to={`/journey/${id}/schedule`} className="tab-item"><span className="text-xl">🗓️</span>旅程表</Link>}
        {can('notes') && <Link to={`/journey/${id}/notes`} className="tab-item"><span className="text-xl">✍️</span>心得</Link>}
        {can('impact') && <Link to={`/journey/${id}/impact`} className="tab-item"><span className="text-xl">🌱</span>成果</Link>}
      </nav>
    );
  }
  return (
    <nav className="tabbar">
      {tabs.map((t) => (
        <Link key={t.to} to={t.to} className="tab-item">
          <span className="text-xl">{t.icon}</span>{t.label}
        </Link>
      ))}
    </nav>
  );
}

function AppInner() {
  const loc = useLocation();
  const { user, ready, logout, ROLES } = useAuth();
  useScheduleAlarms();

  if (!ready) return <div className="p-6 text-gray-400">載入中…</div>;
  if (!user) return <Login />;

  const showTab = !loc.pathname.startsWith('/journey/');

  return (
    <div className="min-h-full pb-20">
      {loc.pathname === '/journeys' || loc.pathname === '/' ? (
        <div className="user-bar">
          <span>👤 {user.name} · {ROLES[user.role]?.label}</span>
          <button onClick={logout} className="underline">登出</button>
        </div>
      ) : null}
      <div className={loc.pathname === '/journeys' || loc.pathname === '/' ? 'pt-9' : ''}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/journeys" element={<JourneyList />} />
          <Route path="/journey/:id" element={<JourneyDetail />} />
          <Route path="/journey/:id/prep" element={<Guard feature="prep"><PrepPage /></Guard>} />
          <Route path="/journey/:id/schedule" element={<Guard feature="schedule"><SchedulePage /></Guard>} />
          <Route path="/journey/:id/notes" element={<Guard feature="notes"><NotesPage /></Guard>} />
          <Route path="/journey/:id/impact" element={<Guard feature="impact"><ImpactPage /></Guard>} />
          <Route path="/journey/:id/tools" element={<Guard feature="tools"><ToolsPage /></Guard>} />
          <Route path="/journey/:id/photos" element={<Guard feature="photos"><PhotosPage /></Guard>} />
          <Route path="/journey/:id/survey" element={<Guard feature="survey"><SurveyPage /></Guard>} />
          <Route path="/journey/:id/revisit" element={<Guard feature="revisit"><RevisitPage /></Guard>} />
          <Route path="/journey/:id/sustain" element={<Guard feature="sustain"><SustainPage /></Guard>} />
          <Route path="/journey/:id/admin" element={<Guard feature="admin"><AdminPage /></Guard>} />
          <Route path="/journey/:id/flights" element={<Guard feature="flights"><FlightPage /></Guard>} />
          <Route path="/journey/:id/privacy" element={<Guard feature="privacy"><PrivacyPage /></Guard>} />
        </Routes>
      </div>
      {showTab && <TabBar />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
