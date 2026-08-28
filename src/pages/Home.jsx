import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="page">
      <div className="text-4xl mb-3">🌿</div>
      <h1 className="section-title">FTG 永續旅程</h1>
      <p className="text-gray-600 mt-2 leading-relaxed">
        與 <span className="text-ftg-green font-semibold">墾趣旅遊 FTG TOURS</span> 企業戶外方案對應的旅程實用 App。
        從行程前準備、旅程中提醒，到旅程後心得與永續成果收集，一站式打造可寫進永續報告的真實紀錄。
      </p>

      <div className="grid grid-cols-2 gap-3 mt-6">
        <Link to="/journeys" className="card text-center hover:shadow-md transition">
          <div className="text-3xl">🧭</div>
          <div className="font-semibold mt-1">我的旅程</div>
          <div className="text-xs text-gray-500">前中後全記錄</div>
        </Link>
        <Link to="/journeys" className="card text-center hover:shadow-md transition">
          <div className="text-3xl">📊</div>
          <div className="font-semibold mt-1">永續報告</div>
          <div className="text-xs text-gray-500">成果一鍵產出</div>
        </Link>
      </div>

      <div className="card mt-5 bg-ftg-forest text-white">
        <h2 className="font-bold mb-1">為什麼用 FTG 永續旅程？</h2>
        <ul className="text-sm text-gray-200 space-y-1 mt-2">
          <li>✓ 準備清單可自訂：人選 / 護照 / 文件 / 錢 / 物品 / 流程</li>
          <li>✓ 旅程表 + 時間鬧鐘提醒，不漏行程</li>
          <li>✓ 心得日誌記錄當下感受與照片</li>
          <li>✓ 永續指標收集，直接對應 ESG / SDGs</li>
        </ul>
      </div>

      <Link to="/journeys" className="btn-primary w-full mt-5 block text-center">開始規劃旅程 →</Link>
    </div>
  );
}
