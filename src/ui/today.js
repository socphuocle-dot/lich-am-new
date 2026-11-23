import { getState, updateSettings } from '../store.js';
import { dayInfo, jdFromDate, canChiYear } from '../lib/lunar.js';
import { listEvents, describeDate } from '../lib/events.js';
import { esc, ICON, MONTH_SHORT, toast } from './common.js';
import { Capacitor } from '@capacitor/core';
import { APK_URL, APP_VERSION } from '../config.js';
import { pendingUpdate } from '../update.js';
import { setState } from '../store.js';
import { backupToCloud, daysSinceBackup } from '../sync.js';
import { toolsRow, converterCard, toggleConverter, onConverterEvent, nextOccasion } from './tools.js';
import { occasion, vanKhanFor } from '../lib/vankhan.js';
import { mascot, moonPhase, cloud, sparkle, lanternString, ILL, seasonOf, seasonDecor } from './art.js';
import { giap, giapName } from './zodiac.js';
import { isChay, CHAY, tetYear, lunarJd } from '../lib/tet.js';
import { whatsNewCard, hideWhatsNew } from '../whatsnew.js';
import { isAbroad, vnParts } from '../lib/tz.js';
import { solarToLunar } from '../lib/lunar.js';
import { speakParagraphs, stopSpeaking, ttsStatus, openVoiceInstall } from '../tts.js';

const THU_FULL = ['Chủ nhật', 'thứ Hai', 'thứ Ba', 'thứ Tư', 'thứ Năm', 'thứ Sáu', 'thứ Bảy'];
const say = { on: false };
export function stopTodaySpeech() { if (say.on) { say.on = false; stopSpeaking(); } }
const SPEAK = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>';
const STOP = '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor"/></svg>';

/** Lời đọc to tờ lịch hôm nay */
export function todaySpeech(now, info, ev, todayJd, chayToday) {
  const l = info.lunar;
  const P = [`Hôm nay ${THU_FULL[now.getDay()]}, ngày ${now.getDate()} tháng ${now.getMonth() + 1} năm ${now.getFullYear()}.`,
    `Âm lịch: ngày ${l.day} tháng ${l.month}${l.leap ? ' nhuận' : ''}, năm ${canChiYear(l.year)}. Ngày ${info.canChi.day}, tháng ${info.canChi.month}.`,
    `Ngày ${info.spirit.good ? 'hoàng đạo, tốt' : 'hắc đạo'}. Tiết ${info.solarTerm}.`];
  if (chayToday) P.push('Hôm nay là ngày ăn chay.');
  const near = ev.filter((e) => e.jd - todayJd <= 7).slice(0, 3);
  if (near.length) P.push(near.map((e) => { const d = e.jd - todayJd; return `${d === 0 ? 'Hôm nay' : d === 1 ? 'Ngày mai' : `${d} ngày nữa`}: ${e.title.replace(' · ', ', ')}.`; }).join(' '));
  else if (l.day < 15) P.push(`Còn ${15 - l.day} ngày nữa đến ngày rằm.`);
  P.push(`Giờ hoàng đạo: ${info.hours.map((h) => h.chi).join(', ')}.`);
  return P;
}

function vnStrip() {
  if (!isAbroad()) return '';
  const v = vnParts(); const lu = solarToLunar(v.day, v.month, v.year);
  return `<a class="vn-strip" href="#/settings" aria-label="Giờ Việt Nam ${v.hour} giờ ${v.minute}, ${THU_FULL[v.weekday]} ${v.day}/${v.month}, âm lịch ${lu.day}/${lu.month}. Mở cài đặt người ở nước ngoài">
    <span class="vn-flag" aria-hidden="true">VN</span><span class="grow">Ở quê: <b>${String(v.hour).padStart(2, '0')}:${String(v.minute).padStart(2, '0')}</b> · ${THU_FULL[v.weekday]} ${v.day}/${v.month} · <b>${lu.day}/${lu.month} âm</b></span>${ICON.next(16)}</a>`;
}

export function upcomingEvents(now, days = 120) {
  const st = getState();
  const todayJd = jdFromDate(now.getDate(), now.getMonth() + 1, now.getFullYear());
  const ev = listEvents(todayJd, days, st.gios.filter((g) => g.enabled !== false), { taoMo: !!st.settings.taoMo });
  return { todayJd, ev };
}

export function eventRow(e, todayJd, { right = '', href = '' } = {}) {
  const d = describeDate(e, todayJd);
  const bday = e.kind === 'gio' && ['sinhnhat', 'kyniem'].includes(e.gio?.type);
  const tileCls = bday ? 'tile bday' : e.kind === 'gio' ? 'tile ink' : e.kind === 'moon' ? 'tile gold' : 'tile';
  const sub = e.kind === 'gio'
    ? `${d.weekday} · ${d.lunarText}${e.gio.rel ? ' · ' + esc(e.gio.rel) : ''}`
    : `${d.weekday} · ${d.lunarText}`;
  const tag = href ? 'a' : 'div';
  const when = `<span class="when${d.diff <= 3 ? ' soon' : ''}">${d.count}</span>`;
  return `<${tag} class="item" ${href ? `href="${href}"` : ''}>
    <div class="${tileCls}"><b>${e.solar.day}</b><span>${MONTH_SHORT(e.solar.month)}</span></div>
    <div class="col grow"><span class="t">${esc(e.title)}</span><span class="s">${when}${sub}</span></div>
    ${right}
  </${tag}>`;
}

export function renderToday() {
  const now = new Date();
  const info = dayInfo(now.getDate(), now.getMonth() + 1, now.getFullYear());
  const { todayJd, ev } = upcomingEvents(now);
  const st = getState();
  const soon = ev.filter((e) => !st.disabled[e.key]).slice(0, 3);
  const hourNow = now.getHours();
  const inHour = (h) => (h.from === 23 ? hourNow >= 23 || hourNow < 1 : hourNow >= h.from && hourNow < h.to);
  const l = info.lunar;
  const season = seasonOf(info.lunar);
  const greet = hourNow < 11 ? 'Chào buổi sáng' : hourNow < 14 ? 'Chào buổi trưa' : hourNow < 18 ? 'Chào buổi chiều' : 'Chào buổi tối';

  return `<div class="screen has-fab" data-screen="today">
  <header class="top hero-top">
    <div class="hero-mascot">${mascot(season ? season.pose : l.day === 15 || l.day === 14 ? 'lantern' : 'wave', 76)}
      <span class="year-pal" title="Linh vật năm ${canChiYear(l.year)}">${giap(canChiYear(l.year), 36)}</span></div>
    <div class="grow col bubble-wrap"><div class="bubble"><span class="sub">${season ? season.greet : greet}!</span><h1 tabindex="-1">${info.weekday}, ${now.getDate()}/${now.getMonth() + 1}</h1>
      <span class="bubble-tip">${tipOf(ev, todayJd, l, info)}</span></div></div>
  </header>
  <main class="body">
    <section class="card sheet${season ? ' season-' + season.id : ''}" aria-label="Tờ lịch hôm nay">${seasonDecor(season)}
      <div class="sheet-band"><span class="band-cloud l">${cloud(64, '#F6D27A', .55)}</span><span>THÁNG ${now.getMonth() + 1} · ${now.getFullYear()}</span><span>${info.weekday.toUpperCase()}</span><span class="band-cloud r">${cloud(64, '#F6D27A', .55)}</span></div>
      <div class="sheet-moon">${moonPhase(l.day, 58)}<span>Trăng ${l.day}</span></div>
      <span class="sheet-spark s1">${sparkle(12)}</span><span class="sheet-spark s2">${sparkle(9, '#E9A23B')}</span>
      <div class="sheet-day">${now.getDate()}</div>
      <div class="center row" style="gap:8px;justify-content:center;flex-wrap:wrap"><span class="pill ${info.spirit.good ? '' : 'neutral'}">Ngày ${info.spirit.good ? 'Hoàng đạo' : 'Hắc đạo'} · ${info.spirit.name}</span>
        <button type="button" class="speak-btn${say.on ? ' on' : ''}" data-act="speak" aria-pressed="${say.on}">${say.on ? STOP + ' Dừng đọc' : SPEAK + ' Đọc to'}</button></div>
      <div class="sheet-foot">
        <div class="col"><span class="muted small">Âm lịch</span>
          <span class="big-lunar" data-test="lunar">${l.day}<span class="muted" style="font-size:1.1rem">/${l.month}${l.leap ? ' nhuận' : ''}</span></span>
          <span class="year-giap">${giap(canChiYear(l.year), 34)}<b>Năm ${canChiYear(l.year)}</b><span>Năm con ${giapName(canChiYear(l.year))}</span></span></div>
        <div class="r"><span class="cc">${giap(info.canChi.day, 22)}<span><span class="nw">Ngày <b>${info.canChi.day}</b></span><br><span class="nw">Tháng <b>${info.canChi.month}</b></span></span></span><span class="term">Tiết <b>${info.solarTerm}</b></span></div>
      </div>
    </section>
    ${vnStrip()}
    ${occasionNote(todayJd)}
    ${chayNote(info.lunar)}
    ${tetNote(todayJd)}
    <section aria-label="Sắp tới" class="col" style="gap:8px">
      <div class="h2row"><h2 class="h">Sắp tới</h2><a class="link" href="#/reminders">Xem tất cả</a></div>
      <div class="card list">${soon.length ? soon.map((e) => { const v = vanKhanFor(e); return eventRow(e, todayJd, { href: e.kind === 'gio' ? `#/edit/${e.gio.id}` : v ? `#/vankhan/${v}?jd=${e.jd}` : '' }); }).join('') : '<div class="empty">Chưa có sự kiện</div>'}</div>
    </section>
    ${updateCard(st)}
    ${whatsNewCard()}
    ${toolsRow()}
    ${converterCard()}

    ${st.settings.simple && Array.isArray(st.settings.needs) && !st.settings.needs.includes('xem') ? '' : `<section aria-label="Giờ hoàng đạo" class="col" style="gap:8px">
      <div class="h2row"><h2 class="h">Giờ hoàng đạo</h2><span class="muted small xung">Tuổi xung ngày: ${giap(info.xung, 20)}<b>${info.xung}</b> (${giapName(info.xung)})</span></div>
      <div class="hours">${info.hours.map((h) => `<div class="hour ${inHour(h) ? 'now' : ''}">${giap(h.chi, 30)}<b>${h.chi}</b><span>${h.label}</span></div>`).join('')}</div>
    </section>`}


    ${st.gios.length ? '' : `<a class="card pad row" href="#/add" style="text-decoration:none;color:var(--ink)">
      <div class="tile ink">${ICON.plus(22)}</div>
      <div class="col grow"><b>Thêm ngày giỗ đầu tiên</b><span class="muted small">App sẽ tự đổi sang dương lịch và nhắc trước cho bạn</span></div></a>`}

    ${!Capacitor.isNativePlatform() && !st.settings.webTipHidden ? `<section class="card pad col" style="gap:8px" aria-label="Cài ứng dụng">
      <div class="row" style="align-items:flex-start"><div class="col grow"><b>Bản web không tự gửi thông báo nhắc</b>
        <span class="small muted" style="line-height:1.5">Để được nhắc giỗ, rằm đúng giờ, hãy cài app Android. Trên iPhone: bấm nút Chia sẻ → <b>Thêm vào MH chính</b> để mở nhanh như app.</span></div>
        <button type="button" class="icon-btn plain" data-act="hide-tip" aria-label="Ẩn gợi ý" style="width:40px;height:40px">${ICON.close()}</button></div>
      ${APK_URL ? `<a class="btn" style="height:46px" href="${esc(APK_URL)}" rel="noopener">${ICON.down()} Tải app Android (.apk)</a>` : ''}
    </section>` : ''}
    ${backupNudge(st)}

  </main>
  <a class="fab" href="#/add" aria-label="Thêm ngày giỗ, sinh nhật">${ICON.plus()}<span class="fab-t">Thêm</span></a>
</div>`;
}

/** Lời nhắn của linh vật: sự kiện gần nhất hoặc ngày tốt/xấu */
function tipOf(ev, todayJd, l, info) {
  const e = ev.find((x) => x.jd - todayJd <= 7);
  if (e) {
    const d = e.jd - todayJd;
    const name = e.title.includes(' · ') ? e.title.split(' · ').pop() : e.title; // "Rằm tháng Bảy · Lễ Vu Lan" → "Lễ Vu Lan"
    return `${d === 0 ? 'Hôm nay' : d === 1 ? 'Ngày mai' : `${d} ngày nữa`}: ${esc(name)} 🌸`;
  }
  if (l.day === 1 || l.day === 15) return `Hôm nay ${l.day === 15 ? 'Rằm' : 'mùng Một'}, nhớ thắp nén hương nhé 🙏`;
  const toRam = l.day < 15 ? 15 - l.day : null;
  return toRam ? `${toRam} ngày nữa đến Rằm · ${info.spirit.good ? 'Hoàng đạo ✨' : 'Hắc đạo'}` : `Ngày ${info.spirit.good ? 'Hoàng đạo ✨' : 'Hắc đạo'}`;
}

function updateCard(st) {
  const u = pendingUpdate(st);
  if (!u) return '';
  return `<section class="card pad col update-card" style="gap:10px" aria-label="Có bản cập nhật">
    <div class="row" style="gap:12px;align-items:flex-start"><span class="nudge-ic">${ICON.down(22)}</span>
      <div class="col grow" style="gap:2px"><b>Có bản mới ${esc(u.latest)}</b><span class="small muted">Bạn đang dùng ${APP_VERSION}. Cài đè lên bản cũ, dữ liệu vẫn giữ nguyên.</span>
      ${u.notes ? `<span class="small" style="white-space:pre-line;margin-top:4px">${esc(u.notes)}</span>` : ''}</div></div>
    <div class="row" style="gap:8px;justify-content:flex-end"><button type="button" class="chip" data-act="upd-later">Để sau</button><a class="chip on" style="display:inline-flex;align-items:center;text-decoration:none" href="${esc(APK_URL)}" rel="noopener">Tải bản mới</a></div></section>`;
}

function chayNote(l) {
  const k = getState().settings.chay;
  if (!k || k === 'off' || !isChay(k, l)) return '';
  return `<a class="note occ" href="#/anchay" style="text-decoration:none;color:var(--ink)"><span class="pastel sm mint" style="width:34px;height:34px">${ILL.lotus()}</span>
    <span class="grow col"><b>Hôm nay ăn chay</b><span class="small muted">Lịch chay ${CHAY[k].name} mỗi tháng</span></span>${ICON.next(18)}</a>`;
}

function tetNote(todayJd) {
  const Y = tetYear(); const left = lunarJd(1, 1, Y) - todayJd;
  if (left > 30 || left < -4) return '';
  return `<a class="note occ" href="#/chuanbitet" style="text-decoration:none;color:var(--ink)"><span class="pastel sm rose" style="width:34px;height:34px">${ILL.lantern()}</span>
    <span class="grow col"><b>${left > 0 ? `Còn ${left} ngày đến Tết` : 'Tết ' + canChiYear(Y)}</b><span class="small muted">Việc cần làm, tuổi xông đất, giờ xuất hành</span></span>${ICON.next(18)}</a>`;
}

function occasionNote() {
  const nx = nextOccasion();
  if (!nx || nx.diff > 1) return '';
  const o = occasion(nx.id);
  return `<a class="note occ" href="#/vankhan/${nx.id}?jd=${nx.jd}" style="text-decoration:none;color:var(--ink)"><span class="nudge-ic" style="width:34px;height:34px;border-radius:10px">${ICON.book(18)}</span>
    <span class="grow col"><b>${nx.diff === 0 ? 'Hôm nay' : 'Ngày mai'}: ${esc(o.title.replace('Văn khấn ', ''))}</b><span class="small muted">Xem văn khấn và mâm cúng</span></span>${ICON.next(18)}</a>`;
}

function backupNudge(st) {
  if (!Capacitor.isNativePlatform() || st.gios.length < 1) return '';
  const d = daysSinceBackup(st);
  const snooze = st.settings.backupSnooze ? (Date.now() - Date.parse(st.settings.backupSnooze)) / 864e5 : 99;
  if ((d !== null && d < 30) || snooze < 14) return '';
  return `<section class="card pad backup-nudge" aria-label="Nhắc sao lưu">
    <div class="row" style="gap:12px;align-items:flex-start"><span class="nudge-ic">${ICON.cloud(22)}</span>
      <div class="col grow" style="gap:2px"><b>${d === null ? 'Chưa sao lưu dữ liệu' : `${d} ngày chưa sao lưu`}</b><span class="small muted">Lưu ${st.gios.length} ngày đã ghi lên Google Drive / iCloud Drive để không mất khi đổi máy.</span></div></div>
    <div class="row" style="gap:8px;justify-content:flex-end"><button type="button" class="chip" data-act="snooze">Để sau</button><button type="button" class="chip on" data-act="backup">Sao lưu ngay</button></div></section>`;
}

export function mountToday(root, rerender) {
  root.addEventListener('change', (e) => { if (onConverterEvent(e)) rerender(); });
  root.addEventListener('click', async (e) => {
    if (e.target.closest('[data-act="conv"]')) { const open = toggleConverter(); rerender(); if (open) document.querySelector('.conv')?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); return; }
    if (e.target.closest('[data-cvdir]')) { onConverterEvent(e); rerender(); return; }
    if (e.target.closest('[data-act="backup"]')) { try { await backupToCloud(); toast('Đã tạo bản sao lưu'); } catch { /* hủy */ } return; }
    if (e.target.closest('[data-act="upd-later"]')) { setState((x) => ({ ...x, update: { ...x.update, dismissed: x.update.latest } })); return; }
    if (e.target.closest('[data-act="snooze"]')) { updateSettings({ backupSnooze: new Date().toISOString() }); return; }
    if (e.target.closest('[data-act="new-hide"]')) { hideWhatsNew(); return; }
    if (e.target.closest('[data-act="speak"]')) {
      if (say.on) { say.on = false; await stopSpeaking(); rerender(); return; }
      const stt = await ttsStatus();
      if (stt === 'none') { toast('Máy này chưa hỗ trợ đọc to'); return; }
      if (stt === 'missing') { toast('Máy chưa có giọng tiếng Việt — đang mở phần cài giọng đọc'); openVoiceInstall(); return; }
      const now = new Date();
      const info = dayInfo(now.getDate(), now.getMonth() + 1, now.getFullYear());
      const { todayJd, ev } = upcomingEvents(now);
      const k = getState().settings.chay;
      say.on = true; rerender();
      await speakParagraphs(todaySpeech(now, info, ev.filter((x) => !getState().disabled[x.key]), todayJd, k && k !== 'off' && isChay(k, info.lunar)), getState().settings.ttsRate || 1, (i) => { if (i < 0 && say.on) { say.on = false; rerender(); } });
      return;
    }
    if (e.target.closest('[data-act="hide-tip"]')) updateSettings({ webTipHidden: true });
  });
}
