import { getState } from '../store.js';
import { dayInfo, jdFromDate, jdToDate, solarToLunar, canChiYear, LUNAR_MONTH_NAME } from '../lib/lunar.js';
import { listEvents } from '../lib/events.js';
import { esc, ICON, nav } from './common.js';

const ui = { y: 0, m: 0, sel: 0, anim: '' };

export function resetCalendar() { ui.y = 0; }

export function renderCalendar() {
  const now = new Date();
  const todayJd = jdFromDate(now.getDate(), now.getMonth() + 1, now.getFullYear());
  if (!ui.y) { ui.y = now.getFullYear(); ui.m = now.getMonth() + 1; ui.sel = todayJd; }
  const st = getState();
  const monday = st.settings.monday;
  const first = jdFromDate(1, ui.m, ui.y);
  const nextFirst = ui.m === 12 ? jdFromDate(1, 1, ui.y + 1) : jdFromDate(1, ui.m + 1, ui.y);
  const days = nextFirst - first;
  const events = listEvents(first, days, st.gios.filter((g) => g.enabled !== false));
  const byJd = new Map();
  events.forEach((e) => { if (!byJd.has(e.jd)) byJd.set(e.jd, []); byJd.get(e.jd).push(e); });
  const firstWd = (first + 1) % 7; // 0 = CN
  const lead = monday ? (firstWd + 6) % 7 : firstWd;
  const heads = monday ? ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'] : ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

  const lStart = solarToLunar(1, ui.m, ui.y);
  const lEnd = solarToLunar(...Object.values(jdToDate(nextFirst - 1)));
  const lunarRange = lStart.month === lEnd.month
    ? `Tháng ${LUNAR_MONTH_NAME[lStart.month]} năm ${canChiYear(lStart.year)}`
    : `Tháng ${LUNAR_MONTH_NAME[lStart.month]}${lStart.leap ? ' nhuận' : ''} – ${LUNAR_MONTH_NAME[lEnd.month]}${lEnd.leap ? ' nhuận' : ''} năm ${canChiYear(lEnd.year)}`;

  let cells = '';
  for (let i = 0; i < lead; i++) cells += '<div></div>';
  for (let d = 1; d <= days; d++) {
    const jd = first + d - 1;
    const l = solarToLunar(d, ui.m, ui.y);
    const wd = (jd + 1) % 7;
    const evs = byJd.get(jd) || [];
    const moon = l.day === 1 || l.day === 15;
    const cls = ['cell', wd === 0 ? 'sun' : '', moon ? 'moon' : '', jd === todayJd ? 'today' : ''].join(' ');
    const mk = evs.some((e) => e.kind === 'gio') ? '<span class="mk gio"></span>' : evs.some((e) => e.kind === 'le') ? '<span class="mk le"></span>' : '';
    const lt = l.day === 1 ? `${l.day}/${l.month}${l.leap ? 'N' : ''}` : l.day;
    cells += `<button type="button" class="${cls}" data-jd="${jd}" aria-pressed="${jd === ui.sel}" aria-label="Ngày ${d} tháng ${ui.m}, âm lịch ${l.day} tháng ${l.month}${evs.length ? ', ' + esc(evs.map((e) => e.title).join(', ')) : ''}"><span class="d">${d}</span><span class="l">${lt}</span>${mk}</button>`;
  }

  const s = jdToDate(ui.sel);
  const info = dayInfo(s.day, s.month, s.year);
  const selEvents = listEvents(ui.sel, 1, st.gios.filter((g) => g.enabled !== false));
  const L = info.lunar;

  return `<div class="screen" data-screen="calendar">
  <header class="top">
    <div class="grow"><h1 tabindex="-1">Tháng ${ui.m}, ${ui.y}</h1><span class="sub">${lunarRange}</span></div>
    <button type="button" class="icon-btn" data-act="prev" aria-label="Tháng trước">${ICON.back(20)}</button>
    <button type="button" class="icon-btn" data-act="next" aria-label="Tháng sau">${ICON.next(20)}</button>
  </header>
  <main class="body tight">
    <section class="card ${ui.anim}" style="padding:10px 6px 8px;touch-action:pan-y" aria-label="Lưới lịch, vuốt ngang để đổi tháng" data-swipe>
      <div class="cal-head">${heads.map((h) => `<span class="${h === 'CN' ? 'sun' : ''}">${h}</span>`).join('')}</div>
      <div class="cal-grid">${cells}</div>
    </section>
    <div class="legend">
      <span><b style="color:var(--gold-ink)">1/10</b> Mùng 1, Rằm</span>
      <span><i class="mk gio" style="position:static;display:inline-block"></i> Ngày giỗ</span>
      <span><i class="mk le" style="position:static;display:inline-block"></i> Ngày lễ</span>
      ${ui.sel !== todayJd || ui.m !== now.getMonth() + 1 || ui.y !== now.getFullYear() ? '<button type="button" class="link" data-act="today">Về hôm nay</button>' : ''}
    </div>
    <section class="card pad col" style="gap:10px" aria-label="Chi tiết ngày đã chọn" data-test="detail">
      <div class="row">
        <div class="tile" style="width:58px;height:62px"><b class="serif" style="font-size:1.6rem">${L.day}</b><span>TH ${L.month}${L.leap ? 'N' : ''} ÂL</span></div>
        <div class="col"><b style="font-size:1.05rem">${info.weekday}, ${s.day}/${s.month}/${s.year}</b>
          <span class="muted small">Ngày ${info.canChi.day} · Tháng ${info.canChi.month} · Năm ${info.canChi.year}</span></div>
      </div>
      <div class="grid3" style="gap:6px">
        <div class="kv ${info.spirit.good ? 'good' : ''}"><span class="k">Loại ngày</span><span class="v">${info.spirit.good ? 'Hoàng đạo' : 'Hắc đạo'}</span><span class="k">${info.spirit.name}</span></div>
        <div class="kv"><span class="k">Tuổi xung</span><span class="v">Tuổi ${info.xung}</span></div>
        <div class="kv"><span class="k">Tam hợp</span><span class="v">${info.tamHop.join(' · ')}</span></div>
      </div>
      <div class="small muted" style="line-height:1.5"><b style="color:var(--ink)">Giờ hoàng đạo:</b> ${info.hours.map((h) => `${h.chi} (${h.label})`).join(', ')}</div>
      <div class="small muted"><b style="color:var(--ink)">Tiết khí:</b> ${info.solarTerm}</div>
      ${selEvents.map((e) => `<div class="note"><span style="color:var(--accent)">${ICON.bell(18)}</span><b>${esc(e.title)}</b></div>`).join('')}
      <a class="link" href="#/add?ld=${L.leap ? '' : L.day}&lm=${L.leap ? '' : L.month}">+ Thêm ngày giỗ vào ngày âm này</a>
    </section>
  </main>
  ${nav('calendar')}
</div>`;
}

function shift(dir) {
  ui.m += dir;
  if (ui.m < 1) { ui.m = 12; ui.y--; }
  if (ui.m > 12) { ui.m = 1; ui.y++; }
  ui.sel = jdFromDate(1, ui.m, ui.y);
  ui.anim = dir > 0 ? 'cal-anim-l' : 'cal-anim-r';
}

export function mountCalendar(root, rerender) {
  const grid = root.querySelector('[data-swipe]');
  ui.anim = '';
  let sx = 0, sy = 0, st = 0;
  grid?.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; st = Date.now(); }, { passive: true });
  grid?.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5 && Date.now() - st < 600) { shift(dx < 0 ? 1 : -1); rerender(); }
  }, { passive: true });
  root.addEventListener('click', (e) => {
    const c = e.target.closest('[data-jd]');
    if (c) { ui.sel = Number(c.dataset.jd); rerender(); return; }
    const a = e.target.closest('[data-act]');
    if (!a) return;
    if (a.dataset.act === 'prev') shift(-1);
    if (a.dataset.act === 'next') shift(1);
    if (a.dataset.act === 'today') { ui.y = 0; }
    rerender();
  });
}
