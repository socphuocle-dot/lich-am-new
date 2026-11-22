import { getState, setState, updateSettings, saveGio, deleteGio, uid } from '../store.js';
import { jdFromDate, LUNAR_MONTH_NAME, canChiYear } from '../lib/lunar.js';
import { nextGioDate, describeDate, titleOf, EVENT_TYPES, deathJd, listEvents, TANG_MILESTONES } from '../lib/events.js';
import { jdToDate, THU } from '../lib/lunar.js';
import { esc, ICON, nav, sw, backHeader, toast, timeSelect } from './common.js';
import { solarToLunar } from '../lib/lunar.js';
import { upcomingEvents, eventRow } from './today.js';
import { ensurePermission } from '../notify.js';
import { confirmSheet } from './dialog.js';

const ui = { filter: 'all' };
const KIND = { moon: 'Rằm & Mùng 1', gio: 'Ngày giỗ', sinhnhat: 'Sinh nhật & kỷ niệm', le: 'Lễ Tết' };

export function renderReminders() {
  const st = getState();
  const s = st.settings;
  const now = new Date();
  const { todayJd, ev } = upcomingEvents(now, 400);
  const isBday = (e) => e.kind === 'gio' && ['sinhnhat', 'kyniem'].includes(e.gio?.type);
  const items = ev.filter((e) => ui.filter === 'all'
    || (ui.filter === 'gio' && e.kind === 'gio' && !isBday(e))
    || (ui.filter === 'sinhnhat' && isBday(e))
    || (ui.filter === 'le' && e.kind === 'le')
    || (ui.filter === 'moon' && (e.kind === 'moon' || e.isMoon))).slice(0, 60);
  const F = [['all', 'Tất cả'], ['gio', 'Ngày giỗ'], ['sinhnhat', 'Sinh nhật, kỷ niệm'], ['moon', 'Rằm, Mùng 1'], ['le', 'Lễ Tết']];
  let lastMonth = '';
  const rows = items.map((e) => {
    const month = `Tháng ${e.solar.month}/${e.solar.year}`;
    const head = month !== lastMonth ? `<div class="sec-title" style="padding:12px 14px 6px;border-top:0">${month}</div>` : '';
    lastMonth = month;
    const on = !st.disabled[e.key];
    const d = describeDate(e, todayJd);
    const right = e.kind === 'gio'
      ? `<span class="count" style="color:${d.diff <= 3 ? 'var(--accent)' : 'var(--muted)'}">${d.count}</span>`
      : sw(on, 'Bật nhắc ' + e.title, `data-key="${e.key}"`);
    return head + `<div style="opacity:${on ? 1 : .5}">${eventRow(e, todayJd, { right, href: e.kind === 'gio' ? `#/edit/${e.gio.id}` : '' })}</div>`;
  }).join('');

  return `<div class="screen has-fab" data-screen="reminders">
  <header class="top" style="flex-direction:column;align-items:stretch;gap:12px">
    <div class="row"><h1 tabindex="-1" class="grow">Nhắc việc</h1><span class="small muted row" style="gap:6px">${ICON.shield()} Lưu trên máy</span></div>
    <div class="chips scroll" role="group" aria-label="Lọc theo loại">${F.map(([id, l]) => `<button type="button" class="chip" data-filter="${id}" aria-pressed="${ui.filter === id}">${l}</button>`).join('')}</div>
  </header>
  <main class="body">
    <section class="dark-card col" style="gap:12px" aria-label="Nhắc tự động">
      <div class="row"><div class="col grow"><b>Tự động nhắc Mùng 1 &amp; Rằm</b><span class="m small">Mỗi tháng, không cần thêm tay</span></div>${sw(s.autoMoon, 'Tự động nhắc Mùng 1 và Rằm', 'data-set="autoMoon"')}</div>
      ${s.autoMoon ? `<div class="grid2">
        <div class="col" style="background:var(--dark2);border-radius:12px;padding:8px 10px;gap:6px"><span class="row" style="gap:6px;justify-content:space-between"><span class="m small">Tối hôm trước</span>${sw(s.moonEveOn, 'Bật nhắc tối hôm trước', 'data-set="moonEveOn" style="transform:scale(.85)"')}</span>${timeSelect(s.moonEve, 'data-time="moonEve" aria-label="Giờ nhắc tối hôm trước"', 'height:38px;padding:0 8px;font-size:.95rem;background:transparent;color:#fff;border-color:#57534E')}</div>
        <div class="col" style="background:var(--dark2);border-radius:12px;padding:8px 10px;gap:6px"><span class="row" style="gap:6px;justify-content:space-between"><span class="m small">Sáng hôm đó</span>${sw(s.moonMornOn, 'Bật nhắc sáng hôm đó', 'data-set="moonMornOn" style="transform:scale(.85)"')}</span>${timeSelect(s.moonMorning, 'data-time="moonMorning" aria-label="Giờ nhắc sáng hôm đó"', 'height:38px;padding:0 8px;font-size:.95rem;background:transparent;color:#fff;border-color:#57534E')}</div>
      </div>` : ''}
      <div class="row"><div class="col grow"><b>Nhắc ngày lễ Tết</b><span class="m small">7:00 sáng ngày lễ</span></div>${sw(s.holidayOn, 'Nhắc ngày lễ Tết', 'data-set="holidayOn"')}</div>
    </section>
    ${savedList(st, todayJd)}
    <section class="col" style="gap:8px"><h2 class="h">Sắp tới · ${KIND[ui.filter] || 'Tất cả'}</h2>
      <div class="card">${rows || '<div class="empty">Không có sự kiện</div>'}</div></section>
  </main>
  <a class="fab accent" href="#/add" aria-label="Thêm ngày giỗ, sinh nhật">${ICON.plus()}<span class="fab-t">Thêm</span></a>
  ${nav('reminders')}
</div>`;
}

const SIDES = { noi: 'Bên Nội', ngoai: 'Bên Ngoại' };
const fold = (t) => String(t).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');

function savedList(st, todayJd) {
  const famBtns = `<div class="quick-acts" role="group" aria-label="Chia sẻ trong họ">
      ${st.gios.length ? `<a class="chip" href="#/chiase">${ICON.share(16)} Chia sẻ cho cả họ</a>` : ''}
      <a class="chip" href="#/nhap">${ICON.users(16)} Nhập từ người thân</a></div>`;
  if (!st.gios.length) return famBtns;
  const withNext = st.gios.map((g) => ({ g, nx: nextGioDate({ ...g, repeat: 'yearly' }, todayJd) }))
    .sort((a, b) => (a.nx?.jd ?? 1e9) - (b.nx?.jd ?? 1e9));
  const grouped = st.gios.some((g) => g.side);
  const groups = grouped ? [['noi', SIDES.noi], ['ngoai', SIDES.ngoai], ['', 'Khác']] : [['*', '']];
  const row = ({ g, nx }) => `<a class="item" href="#/edit/${g.id}" data-q="${esc(fold(titleOf(g) + ' ' + (g.rel || '') + ' ' + (g.note || '')))}"><div class="tile ${['sinhnhat', 'kyniem'].includes(g.type) ? 'bday' : 'ink'}"><b>${g.day}</b><span>${g.cal === 'am' ? 'TH ' + g.month + ' ÂL' : 'TH ' + g.month}</span></div>
        <div class="col grow"><span class="t">${esc(titleOf(g))}${g.tang ? ' <span class="badge-tang">Mới mất</span>' : ''}</span><span class="s">${g.cal === 'am' ? `${g.day} tháng ${LUNAR_MONTH_NAME[g.month]} âm lịch` : `${g.day}/${g.month} dương lịch`}${nx ? ` · lần tới ${nx.solar.day}/${nx.solar.month}` : ''}</span></div>
        ${g.enabled === false ? '<span class="count muted">Đang tắt</span>' : ICON.next()}</a>`;
  return `<section class="col" style="gap:8px" aria-label="Ngày đã lưu"><h2 class="h">Ngày đã lưu (${st.gios.length})</h2>
    ${famBtns}
    ${st.gios.length >= 5 ? `<label class="search"><span class="sr">Tìm trong ngày đã lưu</span>${ICON.search(18)}<input type="search" class="input" data-search placeholder="Tìm tên, quan hệ…" autocomplete="off"></label>` : ''}
    ${groups.map(([k, label]) => {
      const items = withNext.filter((x) => k === '*' || (x.g.side || '') === k);
      if (!items.length) return '';
      return `${label ? `<div class="sec-title" style="margin:6px 0 0">${label} · ${items.length}</div>` : ''}<div class="card list" data-group>${items.map(row).join('')}</div>`;
    }).join('')}
    <div class="empty" data-noresult hidden>Không tìm thấy</div></section>`;
}

export function mountReminders(root, rerender) {
  root.querySelector('[data-search]')?.addEventListener('input', (e) => {
    const q = fold(e.target.value.trim());
    let any = false;
    root.querySelectorAll('[data-q]').forEach((a) => { const on = !q || a.dataset.q.includes(q); a.hidden = !on; any ||= on; });
    root.querySelectorAll('[data-group]').forEach((gEl) => { const vis = [...gEl.children].some((c) => !c.hidden); gEl.hidden = !vis; if (gEl.previousElementSibling?.classList.contains('sec-title')) gEl.previousElementSibling.hidden = !vis; });
    root.querySelector('[data-noresult]').hidden = any;
  });
  root.addEventListener('click', (e) => {
    const f = e.target.closest('[data-filter]');
    if (f) { ui.filter = f.dataset.filter; rerender(); return; }
    const k = e.target.closest('[data-key]');
    if (k) {
      e.preventDefault();
      const key = k.dataset.key;
      setState((s) => { const d = { ...s.disabled }; if (d[key]) delete d[key]; else d[key] = true; return { ...s, disabled: d }; });
      return;
    }
    const t = e.target.closest('[data-set]');
    if (t) {
      e.preventDefault();
      const key = t.dataset.set;
      const val = !getState().settings[key];
      updateSettings({ [key]: val });
      if (val) ensurePermission();
    }
  });
  root.addEventListener('change', (e) => {
    const t = e.target.closest('[data-time]');
    if (t && t.value) updateSettings({ [t.dataset.time]: t.value });
  });
}

/* ---------- Mới mất: các mốc cúng ---------- */
function tangCard(f, todayJd) {
  const on = !!f.tang;
  let list = '';
  if (on) {
    const dj = deathJd({ ...f, year: Number(f.year) || '' });
    if (!dj) list = '<span class="small" style="color:var(--accent)">Nhập <b>năm mất</b> ở trên để app tính các mốc cúng.</span>';
    else {
      const g = { ...f, id: 'preview', name: f.name || 'người mất', year: Number(f.year), tang: true };
      const evs = listEvents(dj, 3 * 366, [g], { moon: false, lunarHolidays: false, solarHolidays: false })
        .filter((e) => e.milestone).slice(0, 5);
      list = `<div class="card list tang-list">${evs.map((e) => {
        const past = e.jd < todayJd;
        const lb = e.title.replace(' ' + g.name, '');
        return `<div class="item ${past ? 'past' : ''}"><div class="tile ${past ? '' : 'ink'}"><b>${e.solar.day}</b><span>TH ${e.solar.month}</span></div>
          <span class="grow col"><span class="t">${esc(lb)}</span><span class="s">${THU[(e.jd + 1) % 7]}, ${e.solar.day}/${e.solar.month}/${e.solar.year} · âm ${e.lunar.day}/${e.lunar.month}</span></span>
          <span class="count ${past ? 'muted' : ''}">${past ? 'Đã qua' : e.jd === todayJd ? 'Hôm nay' : `còn ${e.jd - todayJd} ngày`}</span></div>`;
      }).join('')}</div>
      <span class="small muted">App tự nhắc các mốc trên. Giỗ hết làm sau 2 năm; một số nơi làm sau 3 năm (đàm tế).</span>`;
    }
  }
  return `<section class="card pad col" style="gap:12px" aria-label="Người mới mất">
    <div class="row"><div class="col grow"><span class="lb">Người mới mất (dưới 3 năm)</span><span class="small muted">Tự tính và nhắc cúng 7 ngày, 49 ngày, 100 ngày, giỗ đầu, giỗ hết</span></div>${sw(on, 'Người mới mất', 'data-tang')}</div>
    ${list}</section>`;
}

/* ---------- Thêm / sửa ngày giỗ ---------- */
const RELS = ['Ông', 'Bà', 'Cha', 'Mẹ', 'Cụ', 'Khác'];
const REMINDS = [[0, 'Đúng ngày'], [1, '1 ngày'], [3, '3 ngày'], [7, '7 ngày']];
let form = null;

function todayIn(cal) {
  const n = new Date();
  if (cal === 'duong') return { day: n.getDate(), month: n.getMonth() + 1 };
  const l = solarToLunar(n.getDate(), n.getMonth() + 1, n.getFullYear());
  return { day: l.day, month: l.month };
}

function newForm(params) {
  const s = getState().settings;
  const cal = params.cal || (params.type === 'sinhnhat' || params.type === 'kyniem' ? 'duong' : 'am');
  const t = todayIn(cal);
  return { id: '', type: params.type || 'gio', name: params.name || '', rel: params.type === 'kyniem' ? 'Khác' : 'Ông', cal, day: Number(params.ld) || t.day, month: Number(params.lm) || t.month, touched: !!params.ld, year: '', leap: false, tang: params.tang === '1', remind: params.once ? [0, 1] : [0, 3], time: s.gioTime || '07:00', repeat: params.once ? 'once' : 'yearly', note: '', enabled: true, error: '' };
}

export function renderGioForm(params) {
  const editing = params.id ? getState().gios.find((g) => g.id === params.id) : null;
  const fkey = params.id || ['new', params.type, params.cal, params.ld, params.lm, params.name, params.tang].join(':');
  if (!form || form._for !== fkey) {
    form = editing ? { ...editing, year: editing.year || '', error: '' } : newForm(params);
    form._for = fkey;
  }
  const f = form;
  const now = new Date();
  const todayJd = jdFromDate(now.getDate(), now.getMonth() + 1, now.getFullYear());
  let preview = '';
  if (f.cal === 'am') {
    const nx = nextGioDate({ ...f, id: 'preview', name: 'x' }, todayJd);
    if (nx) { const d = describeDate(nx, todayJd); preview = `Lần tới: <b>${d.weekday}, ${d.solarText}</b> · ${d.count}`; }
  } else {
    const nx = nextGioDate({ ...f, id: 'preview', name: 'x', repeat: 'yearly' }, todayJd);
    if (nx) { const d = describeDate(nx, todayJd); preview = `Lần tới: <b>${d.weekday}, ${d.solarText}</b> (âm ${nx.lunar.day}/${nx.lunar.month}) · ${d.count}`; }
  }
  const dayOpts = Array.from({ length: f.cal === 'am' ? 30 : 31 }, (_, i) => `<option value="${i + 1}" ${f.day === i + 1 ? 'selected' : ''}>${i + 1}</option>`).join('');
  const monOpts = Array.from({ length: 12 }, (_, i) => `<option value="${i + 1}" ${f.month === i + 1 ? 'selected' : ''}>${i + 1}</option>`).join('');
  const yr = Number(f.year);
  const type = f.type || 'gio';
  const noun = type === 'sinhnhat' ? 'Sinh nhật' : type === 'kyniem' ? 'Ngày kỷ niệm' : 'Ngày giỗ';
  const nameLabel = type === 'sinhnhat' ? 'Tên người' : type === 'kyniem' ? 'Tên sự kiện' : 'Tên người đã khuất';
  const namePh = type === 'sinhnhat' ? 'Ví dụ: Bé Na, Mẹ' : type === 'kyniem' ? 'Ví dụ: Kỷ niệm ngày cưới' : 'Ví dụ: Ông nội, Cụ Nguyễn Văn A';
  const dateLabel = type === 'gio' ? 'Ngày mất' : type === 'sinhnhat' ? 'Ngày sinh' : 'Ngày';
  return `<div class="screen no-nav" data-screen="gio-form">
  ${backHeader((editing ? 'Sửa ' : 'Thêm ') + noun.toLowerCase(), '#/reminders')}
  <main class="body" style="gap:18px">
    <div class="seg" role="group" aria-label="Loại sự kiện">${Object.entries(EVENT_TYPES).map(([k, l]) => `<button type="button" data-type="${k}" aria-pressed="${type === k}">${l}</button>`).join('')}</div>
    <div class="field"><label class="lb" for="g-name">${nameLabel}</label>
      <input id="g-name" class="input" type="text" maxlength="60" placeholder="${namePh}" value="${esc(f.name)}" data-f="name" autocomplete="off"></div>
    ${type === 'kyniem' ? '' : `<div class="field" role="group" aria-label="Quan hệ"><span class="lb">Quan hệ</span>
      <div class="chips">${RELS.map((r) => `<button type="button" class="chip" data-rel="${r}" aria-pressed="${f.rel === r}">${r}</button>`).join('')}</div></div>
    <div class="field" role="group" aria-label="Thuộc bên"><span class="lb">Thuộc bên <span class="small muted">(để nhóm danh sách)</span></span>
      <div class="seg">${[['noi', 'Nội'], ['ngoai', 'Ngoại'], ['', 'Không chọn']].map(([k, l]) => `<button type="button" data-side="${k}" aria-pressed="${(f.side || '') === k}">${l}</button>`).join('')}</div></div>`}
    <section class="card pad col" style="gap:12px" aria-label="${dateLabel}">
      <div class="h2row" style="align-items:center"><span class="lb">${dateLabel}</span>
        <div class="seg" role="group" aria-label="Loại lịch" style="width:190px"><button type="button" data-cal="am" aria-pressed="${f.cal === 'am'}">Âm lịch</button><button type="button" data-cal="duong" aria-pressed="${f.cal === 'duong'}">Dương lịch</button></div></div>
      <div class="grid3">
        <label class="field"><span class="small muted">Ngày</span><select class="input" data-f="day" aria-label="Ngày">${dayOpts}</select></label>
        <label class="field"><span class="small muted">Tháng</span><select class="input" data-f="month" aria-label="Tháng">${monOpts}</select></label>
        <label class="field"><span class="small muted">${type === 'gio' ? 'Năm mất' : 'Năm'}</span><input class="input" type="number" inputmode="numeric" min="1800" max="${now.getFullYear()}" placeholder="—" value="${esc(f.year)}" data-f="year" aria-label="Năm (tùy chọn)"></label>
      </div>
      <span class="small muted">${f.cal === 'am' ? `Ngày ${f.day} tháng ${LUNAR_MONTH_NAME[f.month]} âm lịch` : `Ngày ${f.day}/${f.month} dương lịch`}${yr > 1800 ? ` · năm ${f.cal === 'am' ? canChiYear(yr) : yr}` : ''}</span>
      ${preview ? `<div class="note" data-test="preview"><span style="color:var(--accent)">${ICON.cal(18)}</span><span>${preview}</span></div>` : ''}
      ${f.cal === 'am' && type === 'gio' ? `<div class="row"><div class="col grow"><span class="lb">Mất vào tháng nhuận</span><span class="small muted">Giỗ sẽ cúng vào tháng chính (không nhuận) hằng năm</span></div>${sw(f.leap, 'Mất vào tháng nhuận', 'data-leap')}</div>` : ''}
      ${f.cal === 'am' && f.day === 30 ? '<span class="small muted">Năm nào tháng này chỉ có 29 ngày, app sẽ nhắc vào ngày 29.</span>' : ''}
    </section>
    ${type === 'gio' ? tangCard(f, todayJd) : ''}
    <div class="field" role="group" aria-label="Nhắc trước"><div class="h2row"><span class="lb">Nhắc trước</span><span class="small muted">Chọn được nhiều mốc</span></div>
      <div class="grid4">${REMINDS.map(([v, l]) => `<button type="button" class="chip accent rem" data-rem="${v}" aria-pressed="${f.remind.includes(v)}">${l}</button>`).join('')}</div></div>
    <div class="grid2">
      <div class="field"><label class="lb" for="g-time">Giờ nhắc</label>${timeSelect(f.time, 'id="g-time" data-f="time"')}</div>
      <div class="field"><label class="lb" for="g-rep">Lặp lại</label><select id="g-rep" class="input" data-f="repeat"><option value="yearly" ${f.repeat === 'yearly' ? 'selected' : ''}>Hằng năm</option><option value="once" ${f.repeat === 'once' ? 'selected' : ''}>Chỉ năm nay</option></select></div>
    </div>
    <div class="field"><label class="lb" for="g-note">Ghi chú</label><textarea id="g-note" class="input" rows="2" maxlength="200" placeholder="Mâm cỗ, người cần mời, việc cần chuẩn bị…" data-f="note">${esc(f.note)}</textarea></div>
    ${editing && type === 'gio' ? `<div class="quick-acts" role="group" aria-label="Chuẩn bị ngày giỗ">
      <a class="chip" href="#/vankhan/gio?gid=${editing.id}&jd=${nextGioDate({ ...editing, repeat: 'yearly' }, todayJd)?.jd || ''}">${ICON.book(16)} Văn khấn</a>
      <a class="chip" href="#/vankhan/gio?tab=mam&gid=${editing.id}&jd=${nextGioDate({ ...editing, repeat: 'yearly' }, todayJd)?.jd || ''}">${ICON.tray(16)} Mâm cúng</a>
      <a class="chip" href="#/thiep/${editing.id}">${ICON.card(16)} Gửi thiệp mời</a></div>` : ''}
    ${editing ? `<div class="row"><div class="col grow"><span class="lb">Bật nhắc ${noun.toLowerCase()} này</span></div>${sw(f.enabled !== false, 'Bật nhắc ' + noun.toLowerCase() + ' này', 'data-enabled')}</div>
      <button type="button" class="btn danger" data-act="delete">${ICON.trash()} Xóa ${noun.toLowerCase()}</button>` : ''}
    ${f.error ? `<p class="err" role="alert">${esc(f.error)}</p>` : ''}
  </main>
  <div class="bottom-bar"><button type="button" class="btn" data-act="save">Lưu ${noun.toLowerCase()}</button></div>
</div>`;
}

export function mountGioForm(root, rerender, params) {
  const f = () => form;
  const readInputs = () => {
    root.querySelectorAll('[data-f]').forEach((el) => {
      const k = el.dataset.f;
      if (k === 'day' || k === 'month') f()[k] = Number(el.value);
      else f()[k] = el.value;
    });
  };
  root.addEventListener('change', (e) => {
    if (e.target.closest('select[data-f="day"], select[data-f="month"]')) f().touched = true;
    if (e.target.closest('select[data-f], input[data-f="year"]')) { readInputs(); rerender(); }
  });
  root.addEventListener('click', async (e) => {
    const el = e.target.closest('button');
    if (!el) return;
    readInputs();
    if (el.dataset.rel) { f().rel = el.dataset.rel; rerender(); return; }
    if (el.dataset.side !== undefined) { f().side = el.dataset.side; rerender(); return; }
    if (el.dataset.type) {
      f().type = el.dataset.type;
      if (!f().id && !f().touched) { f().cal = el.dataset.type === 'gio' ? 'am' : 'duong'; Object.assign(f(), todayIn(f().cal)); }
      rerender(); return;
    }
    if (el.dataset.cal) {
      f().cal = el.dataset.cal;
      if (!f().id && !f().touched) Object.assign(f(), todayIn(f().cal));
      if (f().cal === 'am' && f().day > 30) f().day = 30;
      rerender(); return;
    }
    if (el.dataset.rem !== undefined) {
      const v = Number(el.dataset.rem);
      f().remind = f().remind.includes(v) ? f().remind.filter((x) => x !== v) : [...f().remind, v].sort((a, b) => a - b);
      rerender(); return;
    }
    if (el.hasAttribute('data-leap')) { f().leap = !f().leap; rerender(); return; }
    if (el.hasAttribute('data-tang')) { f().tang = !f().tang; rerender(); return; }
    if (el.hasAttribute('data-enabled')) { f().enabled = f().enabled === false; rerender(); return; }
    if (el.dataset.act === 'delete') {
      const g = getState().gios.find((x) => x.id === f().id);
      if (!g) return;
      const t = titleOf(g);
      const ok = await confirmSheet({ title: `Xóa ${t.charAt(0).toLowerCase() + t.slice(1)}?`, message: 'Các nhắc nhở của mục này cũng sẽ bị xóa.', ok: 'Xóa', danger: true });
      if (!ok) return;
      deleteGio(g.id);
      form = null;
      location.hash = '#/reminders';
      toast(`Đã xóa ${t.charAt(0).toLowerCase() + t.slice(1)}`, { label: 'Hoàn tác', run: () => { saveGio(g); toast('Đã khôi phục'); } });
      return;
    }
    if (el.dataset.act === 'save') {
      const g = f();
      g.name = g.name.trim();
      if (!g.name) { g.error = g.type === 'kyniem' ? 'Vui lòng nhập tên sự kiện' : g.type === 'sinhnhat' ? 'Vui lòng nhập tên người' : 'Vui lòng nhập tên người đã khuất'; rerender(); root.querySelector('#g-name')?.focus(); return; }
      if (g.tang && g.type === 'gio' && !(Number(g.year) > 1800)) { g.error = 'Nhập năm mất để tính các mốc cúng cho người mới mất'; rerender(); return; }
      if (g.cal === 'duong') {
        const dim = new Date(2000, g.month, 0).getDate();
        if (g.day > dim) { g.error = `Tháng ${g.month} chỉ có ${dim} ngày`; rerender(); return; }
      }
      const now = new Date();
      let onceYear;
      if (g.repeat === 'once') {
        const nx = nextGioDate({ ...g, id: 'tmp', repeat: 'yearly' }, jdFromDate(now.getDate(), now.getMonth() + 1, now.getFullYear()));
        onceYear = nx ? (g.cal === 'am' ? nx.lunar.year : nx.solar.year) : now.getFullYear();
      }
      const rec = {
        id: g.id || uid(), type: g.type || 'gio', name: g.name, rel: g.rel, cal: g.cal,
        ...(g.contactId ? { contactId: g.contactId, source: g.source } : {}), day: g.day, month: g.month,
        year: g.year ? Number(g.year) : '', leap: !!g.leap, remind: g.remind.length ? g.remind : [0],
        time: g.time || '07:00', repeat: g.repeat, ...(g.tang && g.type === 'gio' ? { tang: true } : {}), ...(g.side && g.type !== 'kyniem' ? { side: g.side } : {}), note: g.note.trim(), enabled: g.enabled !== false,
        ...(g.repeat === 'once' ? { onceYear } : {})
      };
      saveGio(rec);
      form = null;
      const perm = await ensurePermission();
      toast(perm === 'denied' ? 'Đã lưu. Hãy bật quyền thông báo trong Cài đặt máy để được nhắc.' : 'Đã lưu');
      location.hash = '#/reminders';
    }
  });
  root.querySelector('#g-name')?.addEventListener('input', (e) => { f().name = e.target.value; });
  root.querySelector('#g-note')?.addEventListener('input', (e) => { f().note = e.target.value; });
}

export function clearGioForm() { form = null; }
