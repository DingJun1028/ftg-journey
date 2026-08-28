import { useEffect, useRef } from 'react';
import { listJourneys, listSchedule } from './db';

// 重要時刻提醒：App 開啟時掃描所有旅程的日程，到點彈出 Notification
export function useScheduleAlarms() {
  const firedRef = useRef(new Set());

  useEffect(() => {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
    const tick = async () => {
      const now = Date.now();
      try {
        const journeys = await listJourneys();
        for (const j of journeys) {
          const items = await listSchedule(j.id);
          for (const s of items) {
            if (!s.reminder || !s.datetime || s.done) continue;
            const t = new Date(s.datetime).getTime();
            const key = s.id;
            if (t > 0 && t <= now && !firedRef.current.has(key)) {
              firedRef.current.add(key);
              try {
                if (Notification.permission === 'granted') {
                  new Notification('⏰ FTG 永續旅程提醒', {
                    body: `${j.name}｜${s.title}${s.location ? ' @ ' + s.location : ''}`,
                  });
                }
              } catch (e) { /* ignore */ }
            }
          }
        }
      } catch (e) { /* ignore */ }
    };
    tick();
    const iv = setInterval(tick, 30 * 1000);
    return () => clearInterval(iv);
  }, []);
}
