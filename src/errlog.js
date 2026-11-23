// Nhật ký lỗi trên máy: ghi lại lỗi giao diện / thao tác thất bại để người dùng gửi kèm góp ý.
// Chỉ lưu trên máy (tối đa 80 dòng), không tự gửi đi đâu, không chứa dữ liệu cá nhân (tên, ngày giỗ…).
import { APP_VERSION, CHANNEL } from './config.js';

const KEY = 'lamng.log';
const MAX = 80;
let mem = null;

function load() {
  if (mem) return mem;
  try { mem = JSON.parse(localStorage.getItem(KEY) || '[]'); if (!Array.isArray(mem)) mem = []; } catch { mem = []; }
  return mem;
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(mem)); } catch { /* đầy thì thôi */ } }

/** level: 'error' | 'warn' | 'info' */
export function logEvent(level, msg, extra = '') {
  const list = load();
  const text = String(msg || '').slice(0, 300);
  const last = list[list.length - 1];
  const page = (typeof location !== 'undefined' ? location.hash.split('?')[0] : '').slice(0, 40);
  if (last && last.m === text && last.p === page) { last.n = (last.n || 1) + 1; last.t = Date.now(); save(); return; } // lỗi lặp lại: chỉ đếm
  list.push({ t: Date.now(), l: level, m: text, x: String(extra || '').slice(0, 400), p: page, v: APP_VERSION });
  if (list.length > MAX) list.splice(0, list.length - MAX);
  save();
}

export const getLog = () => load().slice();
export const errorCount = () => load().filter((e) => e.l === 'error').length;
export function clearLog() { mem = []; save(); }

/** Bắt mọi lỗi chưa xử lý */
export function installErrorLog() {
  window.addEventListener('error', (e) => {
    if (!e.message && e.target && e.target !== window) return; // lỗi tải ảnh/âm thanh: bỏ qua
    logEvent('error', e.message || 'Lỗi không rõ', e.error?.stack || `${e.filename || ''}:${e.lineno || ''}`);
  });
  window.addEventListener('unhandledrejection', (e) => {
    const r = e.reason;
    const msg = r?.message || String(r || '');
    if (/cancel|abort|canceled|share canceled/i.test(msg)) return; // người dùng hủy bảng chia sẻ
    logEvent('error', 'Promise: ' + msg, r?.stack || '');
  });
}

/** Văn bản gửi kèm góp ý: thông tin máy + các dòng nhật ký (không có dữ liệu cá nhân) */
export function logReport(extra = {}) {
  const ua = navigator.userAgent;
  const head = [`App ${APP_VERSION} (${CHANNEL})`, `Máy: ${ua}`, `Màn hình: ${screen.width}x${screen.height} @${window.devicePixelRatio || 1}`,
    `Giờ máy: ${Intl.DateTimeFormat().resolvedOptions().timeZone || ''} · ${new Date().toISOString()}`,
    ...Object.entries(extra).map(([k, v]) => `${k}: ${v}`)];
  const rows = load().map((e) => `[${new Date(e.t).toLocaleString('vi-VN')}] ${e.l.toUpperCase()}${e.n > 1 ? ' ×' + e.n : ''} ${e.p} v${e.v}\n  ${e.m}${e.x ? '\n  ' + e.x.split('\n').slice(0, 4).join('\n  ') : ''}`);
  return `${head.join('\n')}\n\n— Nhật ký (${rows.length} dòng) —\n${rows.join('\n') || '(trống)'}`;
}
