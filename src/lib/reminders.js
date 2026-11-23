// Lập lịch thông báo cục bộ từ danh sách sự kiện. Không cần server.
import { nextChayDays } from './tet.js';
import { listEvents, jdOfDate } from './events.js';
import { jdToDate, jdFromDate } from './lunar.js';
import { vanKhanFor } from './vankhan.js';
import { vnMoment, vnParts } from './tz.js';

export const MAX_PENDING = 60; // iOS giới hạn 64 thông báo chờ

function hashId(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 1) % 2000000000 + 1;
}

/** Thời điểm nhắc: theo giờ máy, hoặc (người ở nước ngoài bật "nhắc theo giờ Việt Nam") đúng lúc hh:mm ở Việt Nam */
function at(jd, hhmm, vn = false) {
  const s = jdToDate(jd);
  const [h, m] = String(hhmm || '07:00').split(':').map(Number);
  return vn ? vnMoment(s.year, s.month, s.day, h || 0, m || 0) : new Date(s.year, s.month - 1, s.day, h || 0, m || 0, 0, 0);
}

const offsetText = (n) => (n === 0 ? 'Hôm nay' : n === 1 ? 'Ngày mai' : `Còn ${n} ngày nữa`);

/** Trả về danh sách thông báo sắp tới (đã sắp xếp, tối đa MAX_PENDING) */
export function buildSchedule(now, state) {
  const s = state.settings;
  const disabled = state.disabled || {};
  const vn = !!s.vnTime;
  const vp = vnParts(now);
  const fromJd = vn ? jdFromDate(vp.day, vp.month, vp.year) - 1 : jdOfDate(now);
  const events = listEvents(fromJd, 400, (state.gios || []).filter((g) => g.enabled !== false), {
    moon: true, lunarHolidays: true, solarHolidays: true, taoMo: !!s.taoMo
  });
  const out = [];
  let cur = null;
  const push = (key, jd, time, title, body, vk = vanKhanFor(cur)) => {
    const when = at(jd, time, vn);
    if (when.getTime() <= now.getTime()) return;
    if (vn) body += ` (${time || '07:00'} giờ Việt Nam)`;
    out.push({ id: hashId(key + '|' + jd + '|' + time), title, body, at: when, key, kind: cur.kind, evJd: cur.jd, gid: cur.gio?.id || '', vk: vk || '' });
  };
  for (const ev of events) {
    if (disabled[ev.key]) continue;
    cur = ev;
    const lunarTxt = `${ev.lunar.day}/${ev.lunar.month}${ev.lunar.leap ? ' nhuận' : ''} âm lịch`;
    if (ev.kind === 'gio') {
      const g = ev.gio;
      for (const off of g.remind && g.remind.length ? g.remind : [0]) {
        const base = vanKhanFor(ev);
        const vk = !base ? '' : off === 0 ? base : off === 1 ? (base === 'gio' ? 'tienthuong' : base) : '';
        push(ev.key + '-' + off, ev.jd - off, g.time, `${offsetText(off)}: ${ev.title}`, `Ngày ${ev.solar.day}/${ev.solar.month} (${lunarTxt}).${g.note ? ' ' + g.note : ''}`, vk);
      }
      continue;
    }
    const moonish = ev.kind === 'moon' || ev.isMoon;
    if (moonish && s.autoMoon) {
      if (s.moonEveOn) push(ev.key + '-eve', ev.jd - 1, s.moonEve, `Ngày mai: ${ev.title}`, `Chuẩn bị hoa quả, hương đèn · ${lunarTxt}`);
      if (s.moonMornOn) push(ev.key + '-morn', ev.jd, s.moonMorning, `Hôm nay: ${ev.title}`, lunarTxt);
      continue;
    }
    if (ev.kind === 'le' && s.holidayOn) {
      push(ev.key + '-morn', ev.jd, '07:00', `Hôm nay: ${ev.title}`, `${ev.solar.day}/${ev.solar.month} · ${lunarTxt}`);
    }
  }
  // Ngày chay: nhắc tối hôm trước
  if (s.chay && s.chay !== 'off' && s.chayRemind !== false) {
    for (const d of nextChayDays(s.chay, fromJd, 45)) {
      cur = { kind: 'chay', jd: d.jd };
      push('chay-' + d.jd, d.jd - 1, s.chayTime || '19:00', 'Mai là ngày ăn chay', `${d.lunar.day}/${d.lunar.month} âm lịch · chuẩn bị món chay cho cả nhà`, '');
    }
  }
  out.sort((a, b) => a.at - b.at);
  return out.slice(0, MAX_PENDING);
}
