// Sự kiện: Mùng 1, Rằm, lễ Tết (âm + dương) và ngày giỗ người dùng nhập.
import { jdFromDate, jdToDate, solarToLunar, lunarToSolar, THU, LUNAR_MONTH_NAME } from './lunar.js';

export const LUNAR_HOLIDAYS = [
  { m: 1, d: 1, title: 'Tết Nguyên Đán', big: true },
  { m: 1, d: 2, title: 'Mùng 2 Tết' },
  { m: 1, d: 3, title: 'Mùng 3 Tết' },
  { m: 1, d: 15, title: 'Rằm tháng Giêng · Tết Nguyên Tiêu' },
  { m: 3, d: 3, title: 'Tết Hàn Thực' },
  { m: 3, d: 10, title: 'Giỗ Tổ Hùng Vương' },
  { m: 4, d: 15, title: 'Lễ Phật Đản' },
  { m: 5, d: 5, title: 'Tết Đoan Ngọ' },
  { m: 7, d: 15, title: 'Rằm tháng Bảy · Lễ Vu Lan' },
  { m: 8, d: 15, title: 'Tết Trung Thu' },
  { m: 10, d: 15, title: 'Rằm tháng Mười · Tết Hạ Nguyên' },
  { m: 12, d: 23, title: 'Ông Công Ông Táo', big: true }
];

export const SOLAR_HOLIDAYS = [
  { m: 1, d: 1, title: 'Tết Dương lịch' },
  { m: 2, d: 3, title: 'Ngày thành lập Đảng' },
  { m: 3, d: 8, title: 'Quốc tế Phụ nữ' },
  { m: 4, d: 30, title: 'Ngày Giải phóng miền Nam' },
  { m: 5, d: 1, title: 'Quốc tế Lao động' },
  { m: 6, d: 1, title: 'Quốc tế Thiếu nhi' },
  { m: 9, d: 2, title: 'Quốc khánh' },
  { m: 10, d: 20, title: 'Ngày Phụ nữ Việt Nam' },
  { m: 11, d: 20, title: 'Ngày Nhà giáo Việt Nam' },
  { m: 12, d: 22, title: 'Ngày Quân đội Nhân dân' },
  { m: 12, d: 25, title: 'Lễ Giáng sinh' }
];

export const pad2 = (n) => String(n).padStart(2, '0');
export const jdOfDate = (d) => jdFromDate(d.getDate(), d.getMonth() + 1, d.getFullYear());

function lunarAt(jd, cache) {
  if (cache.has(jd)) return cache.get(jd);
  const s = jdToDate(jd);
  const l = solarToLunar(s.day, s.month, s.year);
  cache.set(jd, l);
  return l;
}

/** Giỗ có rơi vào ngày jd không (lunar = âm lịch của jd) */
function gioMatches(g, jd, s, l, cache) {
  if (g.cal === 'duong') {
    if (g.repeat === 'once') return s.day === g.day && s.month === g.month && s.year === g.onceYear;
    return s.day === g.day && s.month === g.month;
  }
  // Âm lịch: luôn cúng vào tháng chính (không nhuận)
  if (l.leap || l.month !== g.month) return false;
  if (g.repeat === 'once' && g.onceYear && l.year !== g.onceYear) return false;
  if (l.day === g.day) return true;
  // Mất ngày 30 mà năm nay tháng đó chỉ có 29 ngày → cúng ngày 29
  if (g.day === 30 && l.day === 29) {
    const next = lunarAt(jd + 1, cache);
    return next.day === 1;
  }
  return false;
}

/**
 * Liệt kê sự kiện từ ngày fromJd trong `days` ngày.
 * Trả về mảng sắp xếp theo ngày: { key, jd, solar, lunar, kind: 'moon'|'le'|'gio', title, gio? }
 */
export function listEvents(fromJd, days, gios = [], opts = {}) {
  const { moon = true, lunarHolidays = true, solarHolidays = true } = opts;
  const out = [];
  const cache = new Map();
  for (let jd = fromJd; jd < fromJd + days; jd++) {
    const s = jdToDate(jd);
    const l = lunarAt(jd, cache);
    let holidayHere = null;
    if (lunarHolidays && !l.leap) {
      const h = LUNAR_HOLIDAYS.find((x) => x.m === l.month && x.d === l.day);
      if (h) holidayHere = h;
      if (!h && l.month === 12) {
        // Giao thừa: ngày cuối tháng Chạp
        const next = lunarAt(jd + 1, cache);
        if (next.day === 1 && next.month === 1) holidayHere = { title: 'Giao thừa · Tất niên', big: true };
      }
    }
    if (holidayHere) {
      out.push({ key: `le-${jd}`, jd, solar: s, lunar: l, kind: 'le', title: holidayHere.title, isMoon: l.day === 1 || l.day === 15 });
    } else if (moon && (l.day === 1 || l.day === 15)) {
      const title = (l.day === 1 ? 'Mùng 1 ' : 'Rằm ') + 'tháng ' + LUNAR_MONTH_NAME[l.month] + (l.leap ? ' nhuận' : '');
      out.push({ key: `moon-${jd}`, jd, solar: s, lunar: l, kind: 'moon', title, isMoon: true });
    }
    if (solarHolidays) {
      const h = SOLAR_HOLIDAYS.find((x) => x.m === s.month && x.d === s.day);
      if (h) out.push({ key: `duong-${jd}`, jd, solar: s, lunar: l, kind: 'le', title: h.title });
    }
    for (const g of gios) {
      if (gioMatches(g, jd, s, l, cache)) {
        out.push({ key: `gio-${g.id}-${jd}`, jd, solar: s, lunar: l, kind: 'gio', title: 'Giỗ ' + g.name, gio: g });
      }
    }
  }
  return out;
}

/** Ngày dương gần nhất (từ fromJd) của một ngày giỗ âm lịch — dùng cho màn Thêm giỗ */
export function nextGioDate(g, fromJd) {
  const ev = listEvents(fromJd, 400, [g], { moon: false, lunarHolidays: false, solarHolidays: false });
  return ev.length ? ev[0] : null;
}

export function describeDate(ev, todayJd) {
  const s = ev.solar;
  const wd = THU[(ev.jd + 1) % 7];
  const diff = ev.jd - todayJd;
  const count = diff === 0 ? 'Hôm nay' : diff === 1 ? 'Ngày mai' : `còn ${diff} ngày`;
  return { weekday: wd, solarText: `${s.day}/${s.month}/${s.year}`, lunarText: `${ev.lunar.day}/${ev.lunar.month}${ev.lunar.leap ? 'N' : ''} âm`, count, diff };
}

/** Kiểm tra một ngày âm có hợp lệ trong năm hiện tại không (để cảnh báo người dùng) */
export function lunarDateExists(day, month, year) {
  return !!lunarToSolar(day, month, year, false);
}
