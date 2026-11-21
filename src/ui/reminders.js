import { getState, setState, updateSettings, saveGio, deleteGio, uid } from '../store.js';
import { jdFromDate, LUNAR_MONTH_NAME, canChiYear } from '../lib/lunar.js';
import { nextGioDate, describeDate } from '../lib/events.js';
import { esc, ICON, nav, sw, backHeader, toast } from './common.js';
import { upcomingEvents, eventRow } from './today.js';
import { ensurePermission } from '../notify.js';
import { confirmSheet } from './dialog.js';

const ui = { filter: 'all' };
const KIND = { moon: 'Rằm & Mùng 1', gio: 'Ngày giỗ', le: 'Lễ Tết' };

export function renderReminders() {
  const st = getState();
  const s = st.settings;
  const now = new Date();
  const { todayJd, ev } = upcomingEvents(now, 400);
  const items = ev.filter((e) => ui.filter === 'all' || e.kind === ui.filter || (ui.filter === 'moon' && e.isMoon)).slice(0, 60);
  const F = [['all', 'Tất cả'], ['gio', 'Ngày giỗ'], ['moon', 'Rằm & Mùng 1'], ['le', 'Lễ Tết']];
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
        <div class="col" style="background:var(--dark2);border-radius:12px;padding:8px 10px;gap:6px"><span class="row" style="gap:6px;justify-content:space-between"><span class="m small">Tối hôm trước</span>${sw(s.moonEveOn, 'Bật nhắc tối hôm trước', 'data-set="moonEveOn" style="transform:scale(.85)"')}</span><input type="time" class="input" style="height:38px;padding:0 8px;font-size:.95rem;background:transparent;color:#fff;border-color:#57534E" value="${s.moonEve}" data-time="moonEve" aria-label="Giờ nhắc tối hôm trước"></div>
        <div class="col" style="background:var(--dark2);border-radius:12px;padding:8px 10px;gap:6px"><span class="row" style="gap:6px;justify-content:space-between"><span class="m small">Sáng hôm đó</span>${sw(s.moonMornOn, 'Bật nhắc sáng hôm đó', 'data-set="moonMornOn" style="transform:scale(.85)"')}</span><input type="time" class="input" style="height:38px;padding:0 8px;font-size:.95rem;background:transparent;color:#fff;border-color:#57534E" value="${s.moonMorning}" data-time="moonMorning" aria-label="Giờ nhắc sáng hôm đó"></div>
      </div>` : ''}
      <div class="row"><div class="col grow"><b>Nhắc ngày lễ Tết</b><span class="m small">7:00 sáng ngày lễ</span></div>${sw(s.holidayOn, 'Nhắc ngày lễ Tết', 'data-set="holidayOn"')}</div>
    </section>
    ${st.gios.length ? `<section class="col" style="gap:8px"><h2 class="h">Ngày giỗ đã lưu (${st.gios.length})</h2>
      <div class="card list">${st.gios.map((g) => `<a class="item" href="#/edit/${g.id}"><div class="tile ink"><b>${g.day}</b><span>${g.cal === 'am' ? 'TH ' + g.month + ' ÂL' : 'TH ' + g.month}</span></div>
        <div class="col grow"><span class="t">Giỗ ${esc(g.name)}</span><span class="s">${g.cal === 'am' ? `${g.day} tháng ${LUNAR_MONTH_NAME[g.month]} âm lịch` : `${g.day}/${g.month} dương lịch`} · nhắc ${(g.remind || []).map((x) => (x ? x + ' ngày trước' : 'đúng ngày')).join(', ') || 'đúng ngày'}</span></div>
        ${g.enabled === false ? '<span class="count muted">Đang tắt</span>' : ICON.next()}</a>`).join('')}</div></section>` : ''}
    <section class="col" style="gap:8px"><h2 class="h">Sắp tới · ${KIND[ui.filter] || 'Tất cả'}</h2>
      <div class="card">${rows || '<div class="empty">Không có sự kiện</div>'}</div></section>
  </main>
  <a class="fab accent" href="#/add">${ICON.plus()} Thêm ngày giỗ</a>
  ${nav('reminders')}
</div>`;
}

export function mountReminders(root, rerender) {
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

/* ---------- Thêm / sửa ngày giỗ ---------- */
const RELS = ['Ông', 'Bà', 'Cha', 'Mẹ', 'Cụ', 'Khác'];
const REMINDS = [[0, 'Đúng ngày'], [1, '1 ngày'], [3, '3 ngày'], [7, '7 ngày']];
let form = null;

function newForm(params) {
  const s = getState().settings;
  return { id: '', name: '', rel: 'Ông', cal: 'am', day: Number(params.ld) || 1, month: Number(params.lm) || 1, year: '', leap: false, remind: [0, 3], time: s.gioTime || '07:00', repeat: 'yearly', note: '', enabled: true, error: '' };
}

export function renderGioForm(params) {
  const editing = params.id ? getState().gios.find((g) => g.id === params.id) : null;
  if (!form || form._for !== (params.id || 'new:' + (params.ld || '') + '-' + (params.lm || ''))) {
    form = editing ? { ...editing, year: editing.year || '', error: '' } : newForm(params);
    form._for = params.id || 'new:' + (params.ld || '') + '-' + (params.lm || '');
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
  return `<div class="screen no-nav" data-screen="gio-form">
  ${backHeader(editing ? 'Sửa ngày giỗ' : 'Thêm ngày giỗ', '#/reminders')}
  <main class="body" style="gap:18px">
    <div class="field"><label class="lb" for="g-name">Tên người đã khuất</label>
      <input id="g-name" class="input" type="text" maxlength="60" placeholder="Ví dụ: Ông nội, Cụ Nguyễn Văn A" value="${esc(f.name)}" data-f="name" autocomplete="off"></div>
    <div class="field" role="group" aria-label="Quan hệ"><span class="lb">Quan hệ</span>
      <div class="chips">${RELS.map((r) => `<button type="button" class="chip" data-rel="${r}" aria-pressed="${f.rel === r}">${r}</button>`).join('')}</div></div>
    <section class="card pad col" style="gap:12px" aria-label="Ngày mất">
      <div class="h2row" style="align-items:center"><span class="lb">Ngày mất</span>
        <div class="seg" role="group" aria-label="Loại lịch" style="width:190px"><button type="button" data-cal="am" aria-pressed="${f.cal === 'am'}">Âm lịch</button><button type="button" data-cal="duong" aria-pressed="${f.cal === 'duong'}">Dương lịch</button></div></div>
      <div class="grid3">
        <label class="field"><span class="small muted">Ngày</span><select class="input" data-f="day" aria-label="Ngày">${dayOpts}</select></label>
        <label class="field"><span class="small muted">Tháng</span><select class="input" data-f="month" aria-label="Tháng">${monOpts}</select></label>
        <label class="field"><span class="small muted">Năm mất</span><input class="input" type="number" inputmode="numeric" min="1800" max="${now.getFullYear()}" placeholder="Tùy chọn" value="${esc(f.year)}" data-f="year" aria-label="Năm mất (tùy chọn)"></label>
      </div>
      <span class="small muted">${f.cal === 'am' ? `Ngày ${f.day} tháng ${LUNAR_MONTH_NAME[f.month]} âm lịch` : `Ngày ${f.day}/${f.month} dương lịch`}${yr > 1800 ? ` · năm ${f.cal === 'am' ? canChiYear(yr) : yr}` : ''}</span>
      ${preview ? `<div class="note" data-test="preview"><span style="color:var(--accent)">${ICON.cal(18)}</span><span>${preview}</span></div>` : ''}
      ${f.cal === 'am' ? `<div class="row"><div class="col grow"><span class="lb">Mất vào tháng nhuận</span><span class="small muted">Giỗ sẽ cúng vào tháng chính (không nhuận) hằng năm</span></div>${sw(f.leap, 'Mất vào tháng nhuận', 'data-leap')}</div>` : ''}
      ${f.cal === 'am' && f.day === 30 ? '<span class="small muted">Năm nào tháng này chỉ có 29 ngày, app sẽ nhắc vào ngày 29.</span>' : ''}
    </section>
    <div class="field" role="group" aria-label="Nhắc trước"><div class="h2row"><span class="lb">Nhắc trước</span><span class="small muted">Chọn được nhiều mốc</span></div>
      <div class="grid4">${REMINDS.map(([v, l]) => `<button type="button" class="chip accent" style="padding:0 4px" data-rem="${v}" aria-pressed="${f.remind.includes(v)}">${l}</button>`).join('')}</div></div>
    <div class="grid2">
      <div class="field"><label class="lb" for="g-time">Giờ nhắc</label><input id="g-time" class="input" type="time" value="${f.time}" data-f="time"></div>
      <div class="field"><label class="lb" for="g-rep">Lặp lại</label><select id="g-rep" class="input" data-f="repeat"><option value="yearly" ${f.repeat === 'yearly' ? 'selected' : ''}>Hằng năm</option><option value="once" ${f.repeat === 'once' ? 'selected' : ''}>Chỉ năm nay</option></select></div>
    </div>
    <div class="field"><label class="lb" for="g-note">Ghi chú</label><textarea id="g-note" class="input" rows="2" maxlength="200" placeholder="Mâm cỗ, người cần mời, việc cần chuẩn bị…" data-f="note">${esc(f.note)}</textarea></div>
    ${editing ? `<div class="row"><div class="col grow"><span class="lb">Bật nhắc ngày giỗ này</span></div>${sw(f.enabled !== false, 'Bật nhắc ngày giỗ này', 'data-enabled')}</div>
      <button type="button" class="btn danger" data-act="delete">${ICON.trash()} Xóa ngày giỗ</button>` : ''}
    ${f.error ? `<p class="err" role="alert">${esc(f.error)}</p>` : ''}
  </main>
  <div class="bottom-bar"><button type="button" class="btn" data-act="save">Lưu ngày giỗ</button></div>
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
    if (e.target.closest('select[data-f], input[data-f="year"], input[data-f="time"]')) { readInputs(); rerender(); }
  });
  root.addEventListener('click', async (e) => {
    const el = e.target.closest('button');
    if (!el) return;
    readInputs();
    if (el.dataset.rel) { f().rel = el.dataset.rel; rerender(); return; }
    if (el.dataset.cal) { f().cal = el.dataset.cal; if (f().cal === 'am' && f().day > 30) f().day = 30; rerender(); return; }
    if (el.dataset.rem !== undefined) {
      const v = Number(el.dataset.rem);
      f().remind = f().remind.includes(v) ? f().remind.filter((x) => x !== v) : [...f().remind, v].sort((a, b) => a - b);
      rerender(); return;
    }
    if (el.hasAttribute('data-leap')) { f().leap = !f().leap; rerender(); return; }
    if (el.hasAttribute('data-enabled')) { f().enabled = f().enabled === false; rerender(); return; }
    if (el.dataset.act === 'delete') {
      const g = getState().gios.find((x) => x.id === f().id);
      if (!g) return;
      const ok = await confirmSheet({ title: `Xóa giỗ ${g.name}?`, message: 'Các nhắc nhở của ngày giỗ này cũng sẽ bị xóa.', ok: 'Xóa ngày giỗ', danger: true });
      if (!ok) return;
      deleteGio(g.id);
      form = null;
      location.hash = '#/reminders';
      toast(`Đã xóa giỗ ${g.name}`, { label: 'Hoàn tác', run: () => { saveGio(g); toast('Đã khôi phục'); } });
      return;
    }
    if (el.dataset.act === 'save') {
      const g = f();
      g.name = g.name.trim();
      if (!g.name) { g.error = 'Vui lòng nhập tên người đã khuất'; rerender(); root.querySelector('#g-name')?.focus(); return; }
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
        id: g.id || uid(), name: g.name, rel: g.rel, cal: g.cal, day: g.day, month: g.month,
        year: g.year ? Number(g.year) : '', leap: !!g.leap, remind: g.remind.length ? g.remind : [0],
        time: g.time || '07:00', repeat: g.repeat, note: g.note.trim(), enabled: g.enabled !== false,
        ...(g.repeat === 'once' ? { onceYear } : {})
      };
      saveGio(rec);
      form = null;
      const perm = await ensurePermission();
      toast(perm === 'denied' ? 'Đã lưu. Hãy bật quyền thông báo trong Cài đặt máy để được nhắc.' : 'Đã lưu ngày giỗ');
      location.hash = '#/reminders';
    }
  });
  root.querySelector('#g-name')?.addEventListener('input', (e) => { f().name = e.target.value; });
  root.querySelector('#g-note')?.addEventListener('input', (e) => { f().note = e.target.value; });
}

export function clearGioForm() { form = null; }
