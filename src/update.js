// Báo có bản mới (chỉ bản APK tự phát hành trên Android).
// Gọi 1 yêu cầu tới GitHub (không gửi dữ liệu cá nhân), tối đa 1 lần/ngày.
import { Capacitor } from '@capacitor/core';
import { getState, setState } from './store.js';
import { APP_VERSION, CHANNEL, REPO } from './config.js';

const DAY = 864e5;

/** So sánh phiên bản "1.2.0" / "v1.10.1" → 1, 0, -1 */
export function cmpVersion(a, b) {
  const pa = String(a).replace(/^v/i, '').split('.').map((x) => parseInt(x, 10) || 0);
  const pb = String(b).replace(/^v/i, '').split('.').map((x) => parseInt(x, 10) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] || 0) - (pb[i] || 0);
    if (d) return d > 0 ? 1 : -1;
  }
  return 0;
}

export const updateSupported = () => CHANNEL === 'direct' && !!REPO && Capacitor.getPlatform() === 'android';

/** Kiểm tra bản mới. force = bỏ qua giới hạn 1 lần/ngày. Trả về { latest, newer } hoặc null */
export async function checkUpdate({ force = false } = {}) {
  const st = getState();
  if (!updateSupported() || (!force && st.settings.autoUpdateCheck === false)) return null;
  const u = st.update || {};
  if (!force && u.checkedAt && Date.now() - Date.parse(u.checkedAt) < DAY) return u.latest ? { latest: u.latest, newer: cmpVersion(u.latest, APP_VERSION) > 0 } : null;
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    const r = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`, { headers: { Accept: 'application/vnd.github+json' }, signal: ctrl.signal, cache: 'no-store' });
    clearTimeout(t);
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const j = await r.json();
    const latest = String(j.tag_name || '').replace(/^v/i, '');
    const notes = String(j.body || '').split('\n').filter((l) => /^\s*[-*•]/.test(l)).slice(0, 4).map((l) => l.replace(/^\s*[-*•]\s*/, '').replace(/\*\*/g, '')).join('\n');
    setState((s) => ({ ...s, update: { ...s.update, latest, notes, checkedAt: new Date().toISOString() } }));
    return { latest, newer: cmpVersion(latest, APP_VERSION) > 0 };
  } catch {
    setState((s) => ({ ...s, update: { ...s.update, checkedAt: new Date().toISOString() } }));
    return null;
  }
}

/** Có bản mới chưa bị "Để sau" */
export function pendingUpdate(st = getState()) {
  const u = st.update || {};
  if (!updateSupported() || !u.latest || cmpVersion(u.latest, APP_VERSION) <= 0 || u.dismissed === u.latest) return null;
  return u;
}
