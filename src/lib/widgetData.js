// Dữ liệu cho widget màn hình chính / màn hình khóa.
// - Bảng lịch tĩnh (âm lịch, can chi, lễ, rằm) sinh sẵn lúc build → widget chạy được dù chưa mở app.
// - Dữ liệu động (ngày giỗ, mốc đếm ngược) do app ghi mỗi khi người dùng thay đổi.
import { jdFromDate, jdToDate, solarToLunar, lunarToSolar, canChiDay, canChiYear, dayChiIndex, daySpirit } from './lunar.js';
import { listEvents, jdOfDate, pad2 } from './events.js';

export const ymd = (s) => `${s.year}-${pad2(s.month)}-${pad2(s.day)}`;
// Số ngày kể từ 1970-01-01 (giống LocalDate.toEpochDay)
export const epochDay = (d, m, y) => jdFromDate(d, m, y) - 2440588;

/** Bảng lịch tĩnh cho widget */
export function buildStaticCalendar(fromYear, toYear) {
  const start = jdFromDate(1, 1, fromYear);
  const end = jdFromDate(31, 12, toYear);
  const evs = listEvents(start, end - start + 1, []);
  const byJd = new Map();
  for (const e of evs) {
    const cur = byJd.get(e.jd) || { titles: [], kind: 0 };
    cur.titles.push(e.title);
    cur.kind = Math.max(cur.kind, e.kind === 'le' ? 2 : 1);
    byJd.set(e.jd, cur);
  }
  const years = {};
  const days = [];
  for (let jd = start; jd <= end; jd++) {
    const s = jdToDate(jd);
    const l = solarToLunar(s.day, s.month, s.year);
    years[l.year] = canChiYear(l.year);
    const sp = daySpirit(l.month, dayChiIndex(jd));
    const ev = byJd.get(jd);
    days.push([l.day, l.month, l.leap ? 1 : 0, l.year, canChiDay(jd), sp.good ? 1 : 0, ev ? ev.titles.join(' · ') : '', ev ? ev.kind : 0]);
  }
  return { v: 1, start: `${fromYear}-01-01`, startEpochDay: epochDay(1, 1, fromYear), count: days.length, years, days };
}

function nextTet(fromJd) {
  const s = jdToDate(fromJd);
  for (const y of [s.year, s.year + 1]) {
    const t = lunarToSolar(1, 1, y);
    if (t && jdFromDate(t.day, t.month, t.year) >= fromJd) return { t: 'Tết Nguyên Đán', d: ymd(t) };
  }
  return null;
}

function nextOngTao(fromJd) {
  const s = jdToDate(fromJd);
  for (const y of [s.year - 1, s.year, s.year + 1]) {
    const t = lunarToSolar(23, 12, y);
    if (t && jdFromDate(t.day, t.month, t.year) >= fromJd) return { t: 'Ông Công Ông Táo', d: ymd(t) };
  }
  return null;
}

/** Dữ liệu động: ngày giỗ 400 ngày tới + mốc đếm ngược */
export function buildUserWidgetData(now, state) {
  const fromJd = jdOfDate(now);
  const gios = (state.gios || []).filter((g) => g.enabled !== false);
  const evs = listEvents(fromJd, 400, gios, { moon: false, lunarHolidays: false, solarHolidays: false });
  const list = evs.map((e) => ({ d: ymd(e.solar), t: e.title, l: `${e.lunar.day}/${e.lunar.month}` }));
  const choice = state.settings.widgetCountdown || 'auto';
  let cd = null;
  if (choice === 'tet') cd = nextTet(fromJd);
  else if (choice === 'ongtao') cd = nextOngTao(fromJd);
  else if (choice.startsWith('gio:')) {
    const e = evs.find((x) => x.gio.id === choice.slice(4));
    cd = e ? { t: e.title, d: ymd(e.solar) } : nextTet(fromJd);
  } else {
    cd = list.length && list[0].d < (nextTet(fromJd) || { d: '9999' }).d ? { t: list[0].t, d: list[0].d } : nextTet(fromJd);
  }
  return { v: 1, updated: now.toISOString(), gios: list, cd };
}
