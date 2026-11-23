// Người ở nước ngoài: so giờ máy với giờ Việt Nam (UTC+7) — lịch âm luôn tính theo giờ Việt Nam.
export const VN_OFFSET_MIN = 7 * 60;

/** Máy đang lệch giờ Việt Nam bao nhiêu giờ (dương: máy đi sau VN). 0 nếu cùng múi giờ */
export const hoursBehindVN = (d = new Date()) => (VN_OFFSET_MIN + d.getTimezoneOffset()) / 60;
export const isAbroad = (d = new Date()) => hoursBehindVN(d) !== 0;

/** Ngày giờ hiện tại ở Việt Nam: { day, month, year, hour, minute, weekday (0=CN) } */
export function vnParts(d = new Date()) {
  const v = new Date(d.getTime() + VN_OFFSET_MIN * 60000);
  return { day: v.getUTCDate(), month: v.getUTCMonth() + 1, year: v.getUTCFullYear(), hour: v.getUTCHours(), minute: v.getUTCMinutes(), weekday: v.getUTCDay() };
}

/** Thời điểm (Date) khi ở Việt Nam là ngày y-m-d lúc hh:mm */
export const vnMoment = (y, m, d, hh, mm) => new Date(Date.UTC(y, m - 1, d, hh - 7, mm, 0, 0));

/** Tên múi giờ của máy (ví dụ America/Los_Angeles) hoặc UTC±h */
export function deviceZone(d = new Date()) {
  try { const z = Intl.DateTimeFormat().resolvedOptions().timeZone; if (z) return z; } catch { /* */ }
  const o = -d.getTimezoneOffset() / 60;
  return `UTC${o >= 0 ? '+' : ''}${o}`;
}

/** "chậm 14 giờ" / "nhanh 2 giờ" so với Việt Nam */
export function diffText(d = new Date()) {
  const h = hoursBehindVN(d);
  if (!h) return 'cùng giờ Việt Nam';
  const a = Math.abs(h);
  return `${h > 0 ? 'chậm' : 'nhanh'} ${Number.isInteger(a) ? a : a.toFixed(1).replace('.', ',')} giờ so với Việt Nam`;
}
