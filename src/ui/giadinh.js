import { done as navDone } from '../nav.js';
// Gia đình & dòng họ: Sổ hiếu hỉ, Chuẩn bị đám giỗ, Trang tưởng nhớ, Gia phả, Xem tuổi.
// Mọi dữ liệu nằm trên máy (cùng bản sao lưu với ngày giỗ).
import { getState, setState, uid, saveGio } from '../store.js';
import { jdFromDate, jdToDate, solarToLunar, canChiYear } from '../lib/lunar.js';
import { nextGioDate, describeDate, titleOf } from '../lib/events.js';
import { xemNam, tamTaiYears, chiOfYear } from '../lib/xemtuoi.js';
import { esc, ICON, backHeader, toast } from './common.js';
import { confirmSheet } from './dialog.js';
import { mascot, ILL } from './art.js';
import { giap, giapName } from './zodiac.js';
import { Capacitor } from '@capacitor/core';

/** Chia sẻ chữ qua Zalo, Messenger… (web: Web Share hoặc sao chép) */
async function shareText(text, title) {
  try {
    if (Capacitor.isNativePlatform()) { const { Share } = await import('@capacitor/share'); await Share.share({ title, text, dialogTitle: 'Gửi qua…' }); return; }
    if (navigator.share) { await navigator.share({ title, text }); return; }
    await navigator.clipboard.writeText(text); toast('Đã sao chép, dán vào Zalo để gửi');
  } catch { /* người dùng hủy */ }
}

const THU = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const money = (n) => (Number(n) || 0).toLocaleString('vi-VN') + 'đ';
const todayJd = () => { const n = new Date(); return jdFromDate(n.getDate(), n.getMonth() + 1, n.getFullYear()); };
const isoToday = () => { const n = new Date(); return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`; };
const fold = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
const shortDate = (jd) => { const d = jdToDate(jd); return `${THU[(jd + 1) % 7]} ${d.day}/${d.month}`; };

/* ============================== 1. SỔ HIẾU HỈ ============================== */
export const HH_KINDS = [
  ['cuoi', 'Đám cưới', 'rings'], ['tang', 'Đám tang', 'incense'], ['tangia', 'Tân gia', 'house'],
  ['be', 'Đầy tháng, thôi nôi', 'cake'], ['tho', 'Mừng thọ', 'star'], ['khac', 'Khác', 'hongbao']
];
const kindOf = (k) => HH_KINDS.find((x) => x[0] === k) || HH_KINDS[5];
const QUICK = [200000, 300000, 500000, 1000000, 2000000];
const hh = { filter: 'all', form: null, formKey: '' };

/** Tóm tắt qua lại với một người: để đáp lễ cho đúng */
export function hhHistory(list, person, exceptId = '') {
  const k = fold(person).trim();
  if (!k) return [];
  return list.filter((x) => x.id !== exceptId && fold(x.person).trim() === k).sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function renderHieuhi(params) {
  return params.id ? renderHHForm(params) : renderHHList();
}

function renderHHList() {
  const st = getState();
  const all = [...st.hieuhi].sort((a, b) => (a.date < b.date ? 1 : -1));
  const list = all.filter((x) => hh.filter === 'all' || x.dir === hh.filter);
  const y = new Date().getFullYear();
  const sum = (dir, yr) => all.filter((x) => x.dir === dir && (!yr || x.date.startsWith(String(yr)))).reduce((a, x) => a + (Number(x.amount) || 0), 0);
  let lastY = '';
  const rows = list.map((x) => {
    const yr = x.date.slice(0, 4);
    const head = yr !== lastY ? `<div class="sec-title" style="padding:12px 14px 6px">Năm ${yr}</div>` : '';
    lastY = yr;
    const [, label, ic] = kindOf(x.kind);
    const [yy, mm, dd] = x.date.split('-').map(Number);
    return head + `<a class="item" href="#/hieuhi/${x.id}" data-q="${esc(fold(x.person + ' ' + x.note))}">
      <span class="pastel sm ${x.dir === 'nhan' ? 'mint' : 'rose'}">${ILL[ic]()}</span>
      <span class="col grow"><span class="t">${esc(x.person)}</span><span class="s">${esc(label)}${x.note ? ' · ' + esc(x.note) : ''} · ${dd}/${mm}/${yy}</span></span>
      <span class="col" style="align-items:flex-end;gap:2px"><b class="hh-amt ${x.dir}">${x.dir === 'nhan' ? '+' : '−'}${x.amount ? money(x.amount) : ''}</b>${x.gift ? `<span class="small muted">${esc(x.gift)}</span>` : ''}</span></a>`;
  }).join('');
  return `<div class="screen has-fab" data-screen="hieuhi">
  ${backHeader('Sổ hiếu hỉ', '#/tienich', 'Ghi lại để đáp lễ cho chu đáo')}
  <main class="body">
    <section class="hh-sum" aria-label="Tổng kết">
      <div class="hh-box nhan"><span>Đã nhận</span><b>${money(sum('nhan'))}</b><small>Năm ${y}: ${money(sum('nhan', y))}</small></div>
      <div class="hh-box di"><span>Đã đi</span><b>${money(sum('di'))}</b><small>Năm ${y}: ${money(sum('di', y))}</small></div>
    </section>
    <div class="seg" role="group" aria-label="Lọc">${[['all', 'Tất cả'], ['nhan', 'Mình nhận'], ['di', 'Mình đi']].map(([k, l]) => `<button type="button" data-hf="${k}" aria-pressed="${hh.filter === k}">${l}</button>`).join('')}</div>
    ${all.length > 4 ? `<label class="search">${ICON.search(18)}<input id="hh-q" class="input" type="search" placeholder="Tìm theo tên người, việc…" aria-label="Tìm trong sổ"></label>` : ''}
    ${list.length ? `<section class="card list" id="hh-list">${rows}</section>` : `<section class="card empty-art">${mascot('letter', 96)}<b>Sổ còn trống</b><span>Ghi lại ai đã mừng cưới, phúng viếng, mừng tân gia… để lần sau đáp lễ cho đúng.</span></section>`}
  </main>
  <a class="fab" href="#/hieuhi/new" aria-label="Ghi một khoản hiếu hỉ">${ICON.plus()} Ghi khoản</a>
</div>`;
}

function hhInit(params) {
  if (hh.formKey === params.id && hh.form) return hh.form;
  const old = getState().hieuhi.find((x) => x.id === params.id);
  hh.formKey = params.id;
  hh.form = old ? { ...old, amount: old.amount ? String(old.amount) : '' } : { id: '', dir: params.dir || 'nhan', kind: 'cuoi', person: params.person || '', note: '', date: isoToday(), amount: '', gift: '', error: '' };
  return hh.form;
}

function histHtml(f, hist) {
  return hist.length ? `<section class="note occ col" style="align-items:stretch;gap:4px" aria-label="Lịch sử qua lại"><b>Qua lại với ${esc(f.person)}</b>
      ${hist.slice(0, 4).map((x) => `<span class="small">${x.dir === 'nhan' ? 'Mình nhận' : 'Mình đi'} <b class="hh-amt ${x.dir}">${x.amount ? money(x.amount) : ''}</b>${x.gift ? ' + ' + esc(x.gift) : ''} · ${esc(kindOf(x.kind)[1].toLowerCase())}${x.note ? ' (' + esc(x.note) + ')' : ''}, ${x.date.split('-').reverse().join('/')}</span>`).join('')}</section>` : '';
}

function renderHHForm(params) {
  const st = getState();
  const f = hhInit(params);
  const hist = hhHistory(st.hieuhi, f.person, f.id);
  const names = [...new Set(st.hieuhi.map((x) => x.person))].slice(0, 200);
  const amt = Number(String(f.amount).replace(/\D/g, '')) || 0;
  return `<div class="screen no-nav" data-screen="hieuhi-form">
  ${backHeader(f.id ? 'Sửa khoản hiếu hỉ' : 'Ghi khoản hiếu hỉ', '#/hieuhi')}
  <main class="body">
    <div class="seg" role="group" aria-label="Chiều">${[['nhan', 'Mình nhận'], ['di', 'Mình đi']].map(([k, l]) => `<button type="button" data-dir="${k}" aria-pressed="${f.dir === k}">${l}</button>`).join('')}</div>
    <div class="field"><span class="lb">Dịp gì</span><div class="chips">${HH_KINDS.map(([k, l]) => `<button type="button" class="chip" data-kind="${k}" aria-pressed="${f.kind === k}">${l}</button>`).join('')}</div></div>
    <div class="field"><label class="lb" for="hh-person">${f.dir === 'nhan' ? 'Ai mừng / phúng' : 'Mình mừng / phúng ai'}</label>
      <input id="hh-person" class="input" maxlength="60" list="hh-names" autocomplete="off" placeholder="Ví dụ: Gia đình chú Hai Tâm" value="${esc(f.person)}" data-hh="person">
      <datalist id="hh-names">${names.map((n) => `<option value="${esc(n)}">`).join('')}</datalist></div>
    <div id="hh-hist">${histHtml(f, hist)}</div>
    <div class="field"><label class="lb" for="hh-note">Việc gì <span class="muted small">(không bắt buộc)</span></label>
      <input id="hh-note" class="input" maxlength="80" placeholder="Ví dụ: cưới con trai, giỗ đầu bà nội" value="${esc(f.note)}" data-hh="note"></div>
    <div class="grid2">
      <div class="field"><label class="lb" for="hh-date">Ngày</label><input id="hh-date" class="input" type="date" value="${esc(f.date)}" data-hh="date"></div>
      <div class="field"><label class="lb" for="hh-amount">Số tiền</label><input id="hh-amount" class="input" inputmode="numeric" placeholder="0" value="${amt ? amt.toLocaleString('vi-VN') : ''}" data-hh="amount"></div>
    </div>
    <div class="chips">${QUICK.map((v) => `<button type="button" class="chip" data-amt="${v}" aria-pressed="${amt === v}">${v >= 1000000 ? v / 1000000 + ' triệu' : v / 1000 + 'k'}</button>`).join('')}</div>
    <div class="field"><label class="lb" for="hh-gift">Quà hiện vật <span class="muted small">(không bắt buộc)</span></label>
      <input id="hh-gift" class="input" maxlength="60" placeholder="Ví dụ: vòng hoa, bộ ấm chén" value="${esc(f.gift)}" data-hh="gift"></div>
    ${f.error ? `<p class="err" role="alert">${esc(f.error)}</p>` : ''}
    ${f.id ? `<button type="button" class="btn danger" data-act="hh-del">${ICON.trash()} Xóa khoản này</button>` : ''}
  </main>
  <div class="bottom-bar"><button type="button" class="btn" data-act="hh-save">Lưu vào sổ</button></div>
</div>`;
}

export function mountHieuhi(root, rerender, params) {
  const q = root.querySelector('#hh-q');
  q?.addEventListener('input', () => {
    const k = fold(q.value).trim();
    root.querySelectorAll('#hh-list [data-q]').forEach((a) => { a.hidden = !!k && !a.dataset.q.includes(k); });
  });
  root.addEventListener('input', (e) => {
    const k = e.target.dataset?.hh;
    if (!k || !hh.form) return;
    hh.form[k] = k === 'amount' ? e.target.value.replace(/\D/g, '') : e.target.value;
  });
  // Cập nhật tại chỗ (không vẽ lại cả màn) để cú bấm "Lưu" ngay sau khi gõ không bị mất
  root.addEventListener('change', (e) => {
    const k = e.target.dataset?.hh;
    if (!hh.form) return;
    if (k === 'person') { const box = root.querySelector('#hh-hist'); if (box) box.innerHTML = histHtml(hh.form, hhHistory(getState().hieuhi, hh.form.person, hh.form.id)); }
    if (k === 'amount') {
      const n = Number(String(hh.form.amount).replace(/\D/g, '')) || 0;
      e.target.value = n ? n.toLocaleString('vi-VN') : '';
      root.querySelectorAll('[data-amt]').forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.amt) === n)));
    }
  });
  root.addEventListener('click', async (e) => {
    const t = e.target.closest('[data-hf],[data-dir],[data-kind],[data-amt],[data-act]');
    if (!t) return;
    if (t.dataset.hf) { hh.filter = t.dataset.hf; rerender(); return; }
    const f = hh.form;
    if (t.dataset.dir) { f.dir = t.dataset.dir; rerender(); return; }
    if (t.dataset.kind) { f.kind = t.dataset.kind; rerender(); return; }
    if (t.dataset.amt) { f.amount = t.dataset.amt; rerender(); return; }
    if (t.dataset.act === 'hh-save') {
      f.person = f.person.trim();
      if (!f.person) { f.error = 'Vui lòng nhập tên người'; rerender(); root.querySelector('#hh-person')?.focus(); return; }
      const rec = { id: f.id || uid(), dir: f.dir, kind: f.kind, person: f.person, note: f.note.trim(), date: f.date || isoToday(), amount: Number(String(f.amount).replace(/\D/g, '')) || 0, gift: f.gift.trim() };
      setState((s) => ({ ...s, hieuhi: s.hieuhi.some((x) => x.id === rec.id) ? s.hieuhi.map((x) => (x.id === rec.id ? rec : x)) : [...s.hieuhi, rec] }));
      hh.form = null; hh.formKey = '';
      toast('Đã ghi vào sổ');
      navDone('#/hieuhi');
      return;
    }
    if (t.dataset.act === 'hh-del') {
      if (!(await confirmSheet({ title: 'Xóa khoản này?', ok: 'Xóa', danger: true }))) return;
      const id = f.id;
      setState((s) => ({ ...s, hieuhi: s.hieuhi.filter((x) => x.id !== id) }));
      hh.form = null; hh.formKey = '';
      toast('Đã xóa');
      navDone('#/hieuhi');
    }
  });
  void params;
}

/* ============================== 2. CHUẨN BỊ ĐÁM GIỖ ============================== */
export const PREP_DEFAULT = [
  [-7, 'Mời họ hàng, gửi thiệp mời'], [-7, 'Chốt số mâm, lên thực đơn hoặc đặt cỗ'],
  [-3, 'Dọn dẹp nhà cửa, lau bàn thờ'], [-3, 'Mua hương, nến, vàng mã'], [-3, 'Mua đồ khô, rượu, bia, nước ngọt'],
  [-1, 'Mua hoa tươi, mâm ngũ quả'], [-1, 'Đi chợ đồ tươi'], [-1, 'Cúng Tiên thường (chiều hôm trước)'],
  [0, 'Nấu cỗ, bày mâm cúng'], [0, 'Thắp hương, đọc văn khấn'], [0, 'Hóa vàng, mời khách thụ lộc']
];
const OFF_LABEL = { '-7': 'Trước 1 tuần', '-3': 'Trước 3 ngày', '-1': 'Hôm trước', 0: 'Ngày giỗ' };
const GUEST_ST = ['Chưa mời', 'Đã mời', 'Sẽ đến'];
const prepUi = { who: '', addOff: -3 };

export function prepOf(s, id) {
  return s.prep[id] || { tasks: PREP_DEFAULT.map(([off, t], i) => ({ id: 'd' + i, t, off, done: false, who: '' })), guests: [] };
}
const savePrep = (id, fn) => setState((s) => ({ ...s, prep: { ...s.prep, [id]: fn(prepOf(s, id)) } }));

/** Chọn người đã khuất khi mở thẳng "Tưởng nhớ" / "Chuẩn bị giỗ" từ Tiện ích */
function pickGio(title, sub, base) {
  const st = getState();
  const tj = todayJd();
  const list = st.gios.filter((g) => (g.type || 'gio') === 'gio').map((g) => ({ g, nx: nextGioDate({ ...g, repeat: 'yearly' }, tj) })).sort((a, b) => (a.nx?.jd ?? 1e9) - (b.nx?.jd ?? 1e9));
  return `<div class="screen no-nav" data-screen="pick-gio">
  ${backHeader(title, '#/tienich', sub)}
  <main class="body">
    ${list.length ? `<section class="card list">${list.map(({ g, nx }) => { const d = nx ? describeDate(nx, tj) : null; return `<a class="item" href="#/${base}/${g.id}">
      <span class="giap-avatar pastel sm ${g.memo?.photo ? '' : 'butter'}" style="overflow:hidden">${g.memo?.photo ? `<img src="${g.memo.photo}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:inherit">` : ILL.frame()}</span>
      <span class="col grow"><span class="t">${esc((g.rel ? g.rel + ' ' : '') + g.name)}</span><span class="s">${d ? `<span class="when${d.diff <= 7 ? ' soon' : ''}">${d.count}</span>` : ''}Giỗ ${g.day}/${g.month}${g.cal === 'duong' ? '' : ' âm'}</span></span>${ICON.next(18)}</a>`; }).join('')}</section>`
      : `<section class="card empty-art">${mascot('pray', 90)}<b>Chưa có ngày giỗ nào</b><span>Thêm ngày giỗ của ông bà, cha mẹ trước.</span><a class="btn" style="margin-top:8px" href="#/add?type=gio">${ICON.plus()} Thêm ngày giỗ</a></section>`}
  </main></div>`;
}

export function renderPrep(params) {
  if (!params.id) return pickGio('Chuẩn bị đám giỗ', 'Chọn đám giỗ cần lo', 'chuanbi');
  const st = getState();
  const g = st.gios.find((x) => x.id === params.id);
  if (!g) return missing('Không tìm thấy ngày giỗ', '#/reminders');
  const tj = todayJd();
  const nx = nextGioDate({ ...g, repeat: 'yearly' }, tj);
  const d = nx ? describeDate(nx, tj) : null;
  const p = prepOf(st, g.id);
  const done = p.tasks.filter((x) => x.done).length;
  const people = p.guests.filter((x) => x.st !== 3).reduce((a, x) => a + (Number(x.n) || 1), 0);
  const offs = [...new Set(p.tasks.map((x) => x.off))].sort((a, b) => a - b);
  const taskRow = (x) => {
    const due = nx ? nx.jd + x.off : null;
    const late = due !== null && !x.done && due < tj;
    return `<div class="item prep-task ${x.done ? 'done' : ''}">
      <button type="button" class="tick ${x.done ? 'on' : ''}" data-tk="${x.id}" role="checkbox" aria-checked="${x.done}" aria-label="${esc(x.t)}"></button>
      <span class="col grow"><span class="t">${esc(x.t)}</span>
        ${prepUi.who === x.id ? `<input class="input who-in" id="who-in" maxlength="30" placeholder="Ai lo việc này?" value="${esc(x.who)}" data-who="${x.id}">`
          : `<button type="button" class="who ${x.who ? 'set' : ''}" data-whoedit="${x.id}">${x.who ? 'Ai lo: ' + esc(x.who) : '+ Phân công'}</button>`}
        ${late ? '<span class="err small">Đã quá hạn</span>' : ''}</span>
      ${x.custom ? `<button type="button" class="icon-btn plain" style="width:40px;height:40px" data-tkdel="${x.id}" aria-label="Xóa việc">${ICON.close()}</button>` : ''}</div>`;
  };
  return `<div class="screen no-nav" data-screen="prep">
  ${backHeader('Chuẩn bị đám giỗ', `#/edit/${g.id}`, titleOf(g))}
  <main class="body">
    <section class="card pad col prep-head" style="gap:10px">
      <div class="row"><span class="pastel">${ILL.checklist()}</span><span class="col grow"><b>${nx ? `${d.weekday}, ${d.solarText}` : 'Chưa tính được ngày'}</b><span class="small muted">${nx ? `${d.lunarText} · ${d.count}` : ''}</span></span></div>
      <div class="bar" role="progressbar" aria-label="Tiến độ chuẩn bị" aria-valuemin="0" aria-valuemax="${p.tasks.length}" aria-valuenow="${done}"><i style="width:${p.tasks.length ? Math.round((done / p.tasks.length) * 100) : 0}%"></i></div>
      <span class="small muted">Đã xong ${done}/${p.tasks.length} việc · ${people} khách · khoảng ${Math.max(1, Math.ceil(people / 6))} mâm (6 người/mâm)</span>
      <div class="quick-acts"><a class="chip" href="#/vankhan/gio?gid=${g.id}&jd=${nx?.jd || ''}">${ICON.book(16)} Văn khấn</a>
        <a class="chip" href="#/vankhan/gio?tab=mam&gid=${g.id}&jd=${nx?.jd || ''}">${ICON.tray(16)} Mâm cúng</a>
        <a class="chip" href="#/thiep/${g.id}">${ICON.card(16)} Thiệp mời</a></div>
    </section>
    ${offs.map((o) => `<section class="col" style="gap:6px"><div class="h2row"><h2 class="h">${OFF_LABEL[o] ?? `Trước ${-o} ngày`}</h2>${nx ? `<span class="small muted">${shortDate(nx.jd + o)}</span>` : ''}</div>
      <div class="card list">${p.tasks.filter((x) => x.off === o).map(taskRow).join('')}</div></section>`).join('')}
    <section class="card pad col" style="gap:8px" aria-label="Thêm việc">
      <span class="lb">Thêm việc khác</span>
      <div class="row" style="gap:8px"><input id="tk-new" class="input grow" maxlength="60" aria-label="Việc cần thêm" placeholder="Ví dụ: Thuê bàn ghế, mượn nồi to">
        <select id="tk-off" class="input" style="width:auto" aria-label="Làm khi nào">${Object.entries(OFF_LABEL).sort((a, b) => a[0] - b[0]).map(([k, l]) => `<option value="${k}" ${Number(k) === prepUi.addOff ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
      <button type="button" class="btn ghost" style="height:46px" data-act="tk-add">${ICON.plus(18)} Thêm việc</button>
    </section>

    <section class="col" style="gap:6px" aria-label="Khách mời">
      <div class="h2row"><h2 class="h">Khách mời</h2><span class="small muted">${p.guests.length} nhà · ${people} người</span></div>
      <div class="card list">${p.guests.length ? p.guests.map((x) => `<div class="item">
        <span class="col grow"><span class="t">${esc(x.name)}</span><span class="s">${Number(x.n) || 1} người</span></span>
        <button type="button" class="gst s${x.st || 0}" data-gst="${x.id}">${GUEST_ST[x.st || 0]}</button>
        <button type="button" class="icon-btn plain" style="width:40px;height:40px" data-gdel="${x.id}" aria-label="Xóa ${esc(x.name)}">${ICON.close()}</button></div>`).join('') : '<div class="empty">Chưa có khách. Thêm từng nhà bên dưới.</div>'}</div>
      <div class="row" style="gap:8px"><input id="g-new" class="input grow" maxlength="50" aria-label="Tên khách" placeholder="Nhà bác Cả, gia đình cô Út…"><input id="g-n" class="input" style="width:76px" type="number" min="1" max="50" value="4" aria-label="Số người"></div>
      <button type="button" class="btn ghost" style="height:46px" data-act="g-add">${ICON.plus(18)} Thêm khách</button>
    </section>
    <button type="button" class="btn text" data-act="prep-reset">Làm lại từ đầu cho lần giỗ sau</button>
  </main>
</div>`;
}

export function mountPrep(root, rerender, params) {
  const id = params.id;
  if (!id) return;
  const whoIn = root.querySelector('#who-in');
  if (whoIn) {
    whoIn.focus();
    const commit = () => { const v = whoIn.value.trim(); const tid = whoIn.dataset.who; prepUi.who = ''; savePrep(id, (p) => ({ ...p, tasks: p.tasks.map((x) => (x.id === tid ? { ...x, who: v } : x)) })); };
    whoIn.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); commit(); } });
    whoIn.addEventListener('blur', commit);
  }
  root.querySelector('#tk-off')?.addEventListener('change', (e) => { prepUi.addOff = Number(e.target.value); });
  root.addEventListener('click', async (e) => {
    const t = e.target.closest('[data-tk],[data-whoedit],[data-tkdel],[data-gst],[data-gdel],[data-act]');
    if (!t) return;
    if (t.dataset.tk) { savePrep(id, (p) => ({ ...p, tasks: p.tasks.map((x) => (x.id === t.dataset.tk ? { ...x, done: !x.done } : x)) })); return; }
    if (t.dataset.whoedit) { prepUi.who = t.dataset.whoedit; rerender(); return; }
    if (t.dataset.tkdel) { savePrep(id, (p) => ({ ...p, tasks: p.tasks.filter((x) => x.id !== t.dataset.tkdel) })); return; }
    if (t.dataset.gst) { savePrep(id, (p) => ({ ...p, guests: p.guests.map((x) => (x.id === t.dataset.gst ? { ...x, st: ((x.st || 0) + 1) % 3 } : x)) })); return; }
    if (t.dataset.gdel) { savePrep(id, (p) => ({ ...p, guests: p.guests.filter((x) => x.id !== t.dataset.gdel) })); return; }
    const act = t.dataset.act;
    if (act === 'tk-add') {
      const v = root.querySelector('#tk-new').value.trim();
      if (!v) { root.querySelector('#tk-new').focus(); return; }
      const off = Number(root.querySelector('#tk-off').value);
      savePrep(id, (p) => ({ ...p, tasks: [...p.tasks, { id: uid(), t: v, off, done: false, who: '', custom: true }] }));
      toast('Đã thêm việc');
    } else if (act === 'g-add') {
      const v = root.querySelector('#g-new').value.trim();
      if (!v) { root.querySelector('#g-new').focus(); return; }
      const n = Math.max(1, Math.min(50, Number(root.querySelector('#g-n').value) || 1));
      savePrep(id, (p) => ({ ...p, guests: [...p.guests, { id: uid(), name: v, n, st: 0 }] }));
    } else if (act === 'prep-reset') {
      if (!(await confirmSheet({ title: 'Làm lại danh sách?', message: 'Bỏ đánh dấu mọi việc đã xong và trạng thái mời khách. Danh sách việc, người lo và khách vẫn giữ.', ok: 'Làm lại' }))) return;
      savePrep(id, (p) => ({ ...p, tasks: p.tasks.map((x) => ({ ...x, done: false })), guests: p.guests.map((x) => ({ ...x, st: 0 })) }));
      toast('Đã làm lại cho lần giỗ sau');
    }
  });
}

/* ============================== 3. TRANG TƯỞNG NHỚ ============================== */
const tn = { edit: false, form: null, key: '' };

/** Thu nhỏ ảnh còn cạnh dài 480px (JPEG) để lưu gọn trên máy */
function shrinkImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const k = Math.min(1, 480 / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Không đọc được ảnh')); };
    img.src = url;
  });
}

const ageWord = (age) => (age >= 60 ? 'Hưởng thọ' : 'Hưởng dương');

export function renderMemorial(params) {
  if (!params.id) return pickGio('Tưởng nhớ', 'Ảnh, tiểu sử, nơi an táng của người đã khuất', 'tuongnho');
  const st = getState();
  const g = st.gios.find((x) => x.id === params.id);
  if (!g) return missing('Không tìm thấy người đã khuất', '#/reminders');
  const m = g.memo || {};
  if (tn.key !== g.id) { tn.key = g.id; tn.edit = !g.memo; tn.form = null; }
  const died = Number(m.died || g.year) || 0;
  const born = Number(m.born) || 0;
  const age = born && died ? died - born + 1 : 0;
  const tj = todayJd();
  const nx = nextGioDate({ ...g, repeat: 'yearly' }, tj);
  const d = nx ? describeDate(nx, tj) : null;
  const person = st.people.find((p) => p.gioId === g.id);
  if (tn.edit) {
    const f = tn.form || (tn.form = { photo: m.photo || '', born: m.born || '', died: m.died || g.year || '', home: m.home || '', grave: m.grave || '', bio: m.bio || '', words: m.words || '' });
    return `<div class="screen no-nav" data-screen="memorial-edit">
    ${backHeader('Trang tưởng nhớ', g.memo ? `#/tuongnho/${g.id}` : `#/edit/${g.id}`, (g.rel ? g.rel + ' ' : '') + g.name)}
    <main class="body">
      <section class="card pad col center" style="gap:10px;align-items:center">
        <div class="portrait ${f.photo ? '' : 'empty'}">${f.photo ? `<img src="${f.photo}" alt="Ảnh ${esc(g.name)}">` : mascot('pray', 92)}</div>
        <div class="row" style="gap:8px;justify-content:center"><label class="chip" style="display:inline-flex;align-items:center;gap:6px">${ICON.up(16)} ${f.photo ? 'Đổi ảnh' : 'Chọn ảnh'}<input type="file" accept="image/*" id="tn-photo" hidden></label>
          ${f.photo ? '<button type="button" class="chip" data-act="tn-nophoto">Bỏ ảnh</button>' : ''}</div>
        <span class="small muted">Ảnh được thu nhỏ và chỉ lưu trên máy này (không gửi kèm khi chia sẻ cả họ)</span>
      </section>
      <div class="grid2"><div class="field"><label class="lb" for="tn-born">Năm sinh</label><input id="tn-born" class="input" type="number" inputmode="numeric" min="1800" max="2100" placeholder="Ví dụ: 1932" value="${esc(f.born)}" data-tn="born"></div>
        <div class="field"><label class="lb" for="tn-died">Năm mất</label><input id="tn-died" class="input" type="number" inputmode="numeric" min="1800" max="2100" placeholder="Ví dụ: 2015" value="${esc(f.died)}" data-tn="died"></div></div>
      <div class="field"><label class="lb" for="tn-home">Quê quán</label><input id="tn-home" class="input" maxlength="80" placeholder="Ví dụ: Làng Phù Lưu, Từ Sơn, Bắc Ninh" value="${esc(f.home)}" data-tn="home"></div>
      <div class="field"><label class="lb" for="tn-grave">Nơi an táng</label><input id="tn-grave" class="input" maxlength="120" placeholder="Ví dụ: Nghĩa trang quê, khu B, hàng 3" value="${esc(f.grave)}" data-tn="grave"></div>
      <div class="field"><label class="lb" for="tn-bio">Đôi dòng về cuộc đời</label><textarea id="tn-bio" class="input" rows="5" maxlength="1500" placeholder="Nghề nghiệp, tính tình, những điều con cháu nên biết…" data-tn="bio">${esc(f.bio)}</textarea></div>
      <div class="field"><label class="lb" for="tn-words">Lời dặn, kỷ niệm đáng nhớ</label><textarea id="tn-words" class="input" rows="3" maxlength="600" placeholder="Ví dụ: Ông luôn dặn: anh em phải biết nhường nhịn nhau." data-tn="words">${esc(f.words)}</textarea></div>
    </main>
    <div class="bottom-bar"><button type="button" class="btn" data-act="tn-save">Lưu trang tưởng nhớ</button></div>
  </div>`;
  }
  return `<div class="screen no-nav" data-screen="memorial">
  ${backHeader('Tưởng nhớ', `#/edit/${g.id}`, '', `<button type="button" class="chip" data-act="tn-edit" style="height:38px">Sửa</button>`)}
  <main class="body">
    <section class="memorial card">
      <div class="portrait ${m.photo ? '' : 'empty'}">${m.photo ? `<img src="${m.photo}" alt="Ảnh ${esc(g.name)}">` : mascot('pray', 100)}</div>
      <span class="small muted">${esc(g.rel || '')}</span>
      <h2 class="serif mem-name">${esc(g.name)}</h2>
      ${born || died ? `<span class="mem-years">${born || '?'} – ${died || '?'}${age > 0 ? ` · ${ageWord(age)} ${age} tuổi` : ''}</span>` : ''}
      <span class="small">Ngày giỗ: <b>${g.day}/${g.month}${g.cal === 'duong' ? '' : ' âm lịch'}</b>${d ? ` · lần tới ${d.weekday} ${d.solarText} (${d.count})` : ''}</span>
      ${m.words ? `<blockquote class="mem-words serif">“${esc(m.words)}”</blockquote>` : ''}
    </section>
    ${m.bio ? `<section class="card pad col" style="gap:6px"><h2 class="h">Cuộc đời</h2><p class="mem-bio">${esc(m.bio).replace(/\n/g, '<br>')}</p></section>` : ''}
    ${m.home || m.grave ? `<section class="card list">${m.home ? `<div class="item"><span class="pastel sm butter">${ILL.house()}</span><span class="col grow"><span class="s">Quê quán</span><span class="t">${esc(m.home)}</span></span></div>` : ''}
      ${m.grave ? `<div class="item"><span class="pastel sm mint">${ILL.lotus()}</span><span class="col grow"><span class="s">Nơi an táng</span><span class="t">${esc(m.grave)}</span></span></div>` : ''}</section>` : ''}
    <div class="quick-acts"><a class="chip" href="#/vankhan/gio?gid=${g.id}&jd=${nx?.jd || ''}">${ICON.book(16)} Văn khấn giỗ</a>
      <a class="chip" href="#/chuanbi/${g.id}">${ICON.check(16)} Chuẩn bị giỗ</a>
      <a class="chip" href="#/giapha${person ? '?focus=' + person.id : ''}">${ICON.users(16)} ${person ? 'Xem trong gia phả' : 'Gia phả'}</a>
      <button type="button" class="chip" data-act="tn-share">${ICON.share(16)} Gửi con cháu</button></div>
  </main>
</div>`;
}

export function mountMemorial(root, rerender, params) {
  root.addEventListener('input', (e) => { const k = e.target.dataset?.tn; if (k && tn.form) tn.form[k] = e.target.value; });
  root.querySelector('#tn-photo')?.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try { tn.form.photo = await shrinkImage(file); rerender(); } catch { toast('Không đọc được ảnh này'); }
  });
  root.addEventListener('click', async (e) => {
    const act = e.target.closest('[data-act]')?.dataset.act;
    if (!act) return;
    const g = getState().gios.find((x) => x.id === params.id);
    if (act === 'tn-edit') { tn.edit = true; tn.form = null; rerender(); return; }
    if (act === 'tn-nophoto') { tn.form.photo = ''; rerender(); return; }
    if (act === 'tn-save') {
      const f = tn.form;
      const memo = { photo: f.photo, born: Number(f.born) || '', died: Number(f.died) || '', home: f.home.trim(), grave: f.grave.trim(), bio: f.bio.trim(), words: f.words.trim() };
      try { saveGio({ ...g, memo }); } catch { toast('Bộ nhớ đầy — thử ảnh nhỏ hơn'); return; }
      tn.edit = false; tn.form = null;
      toast('Đã lưu trang tưởng nhớ');
      rerender();
      return;
    }
    if (act === 'tn-share') {
      const m = g.memo || {};
      const lines = [`Tưởng nhớ ${g.rel ? g.rel + ' ' : ''}${g.name}`, m.born || m.died ? `${m.born || '?'} – ${m.died || '?'}` : '', `Ngày giỗ: ${g.day}/${g.month}${g.cal === 'duong' ? '' : ' âm lịch'}`, m.home ? 'Quê quán: ' + m.home : '', m.grave ? 'Nơi an táng: ' + m.grave : '', m.bio ? '\n' + m.bio : '', m.words ? `\n“${m.words}”` : ''].filter(Boolean);
      shareText(lines.join('\n'), 'Tưởng nhớ ' + g.name);
    }
  });
}

/* ============================== 4. GIA PHẢ ============================== */
const gp = { form: null, key: '' };
const lifeText = (p) => (p.born || p.died ? `${p.born || '?'}${p.died ? ' – ' + p.died : ''}` : '');

export function renderGiapha(params) {
  if (params.id) return renderPersonForm(params);
  const st = getState();
  const ppl = st.people;
  const spousesOf = (id) => ppl.filter((p) => p.spouseOf === id);
  const kids = (id) => ppl.filter((p) => p.parentId === id && !p.spouseOf).sort((a, b) => (Number(a.born) || 9999) - (Number(b.born) || 9999));
  const roots = ppl.filter((p) => !p.parentId && !p.spouseOf);
  let maxGen = 0;
  const node = (p, gen) => {
    maxGen = Math.max(maxGen, gen);
    const sp = spousesOf(p.id);
    const ch = kids(p.id).concat(sp.flatMap((s) => kids(s.id)));
    const card = (x, main) => `<a class="gp-person ${x.gender === 'nu' ? 'nu' : 'nam'} ${x.died ? 'mat' : ''} ${params.focus === x.id ? 'focus' : ''}" href="#/giapha/${x.id}">
      <span class="gp-av">${x.born ? giap(chiOfYear(Number(x.born)), 30) : (x.gender === 'nu' ? '♀' : '♂')}</span>
      <span class="col"><b>${esc(x.name)}</b><span class="small muted">${main ? '' : 'Vợ/chồng · '}${lifeText(x)}${x.died ? ' · đã mất' : ''}</span></span></a>`;
    return `<li><div class="gp-row">${card(p, true)}${sp.map((s) => card(s, false)).join('')}</div>
      <div class="gp-acts"><a class="gp-add" href="#/giapha/new?parent=${p.id}">+ Con</a><a class="gp-add" href="#/giapha/new?spouse=${p.id}">+ Vợ/chồng</a></div>
      ${ch.length ? `<ul>${ch.map((c) => node(c, gen + 1)).join('')}</ul>` : ''}</li>`;
  };
  const tree = roots.map((r) => node(r, 1)).join('');
  return `<div class="screen has-fab" data-screen="giapha">
  ${backHeader('Gia phả', '#/tienich', ppl.length ? `${ppl.length} người · ${maxGen} đời` : 'Cây gia đình nhiều đời', ppl.length ? `<button type="button" class="icon-btn plain" data-act="gp-share" aria-label="Gửi gia phả cho người thân">${ICON.share(20)}</button>` : '')}
  <main class="body">
    ${ppl.length ? `<section class="card pad gp-tree" aria-label="Cây gia phả"><ul class="gp-root">${tree}</ul></section>
      <span class="small muted center">Bấm vào tên để sửa, nối với ngày giỗ và trang tưởng nhớ. Người đã mất có viền xám.</span>`
      : `<section class="card empty-art">${ILL.tree().replace('width="34" height="34"', 'width="96" height="96"')}<b>Bắt đầu từ ông bà</b><span>Thêm người đời đầu tiên mà gia đình còn nhớ, rồi thêm con cháu và vợ/chồng của từng người.</span></section>`}
  </main>
  <a class="fab" href="#/giapha/new" aria-label="${ppl.length ? 'Thêm nhánh mới (người đời đầu)' : 'Thêm người đầu tiên'}">${ICON.plus()} ${ppl.length ? 'Thêm nhánh' : 'Thêm người'}</a>
</div>`;
}

function renderPersonForm(params) {
  const st = getState();
  const key = params.id + (params.parent || '') + (params.spouse || '');
  if (gp.key !== key || !gp.form) {
    const old = st.people.find((p) => p.id === params.id);
    const sp = params.spouse ? st.people.find((p) => p.id === params.spouse) : null;
    gp.key = key;
    gp.form = old ? { ...old } : { id: '', name: '', gender: sp ? (sp.gender === 'nu' ? 'nam' : 'nu') : 'nam', born: '', died: '', parentId: params.parent || '', spouseOf: params.spouse || '', gioId: '', note: '', error: '' };
  }
  const f = gp.form;
  const rel = f.spouseOf ? st.people.find((p) => p.id === f.spouseOf) : f.parentId ? st.people.find((p) => p.id === f.parentId) : null;
  const gios = st.gios.filter((x) => (x.type || 'gio') === 'gio');
  const hasKids = f.id && st.people.some((p) => p.parentId === f.id || p.spouseOf === f.id);
  return `<div class="screen no-nav" data-screen="person">
  ${backHeader(f.id ? 'Sửa thông tin' : f.spouseOf ? 'Thêm vợ/chồng' : f.parentId ? 'Thêm con' : 'Thêm người', '#/giapha', rel ? (f.spouseOf ? 'Vợ/chồng của ' : 'Con của ') + rel.name : '')}
  <main class="body">
    <div class="field"><label class="lb" for="gp-name">Họ và tên</label><input id="gp-name" class="input" maxlength="60" placeholder="Ví dụ: Nguyễn Văn Bình" value="${esc(f.name)}" data-gp="name"></div>
    <div class="seg" role="group" aria-label="Giới tính">${[['nam', 'Nam'], ['nu', 'Nữ']].map(([k, l]) => `<button type="button" data-gender="${k}" aria-pressed="${f.gender === k}">${l}</button>`).join('')}</div>
    <div class="grid2"><div class="field"><label class="lb" for="gp-born">Năm sinh</label><input id="gp-born" class="input" type="number" inputmode="numeric" min="1700" max="2100" placeholder="—" value="${esc(f.born)}" data-gp="born"></div>
      <div class="field"><label class="lb" for="gp-died">Năm mất <span class="muted small">(nếu đã mất)</span></label><input id="gp-died" class="input" type="number" inputmode="numeric" min="1700" max="2100" placeholder="—" value="${esc(f.died)}" data-gp="died"></div></div>
    ${gios.length ? `<div class="field"><label class="lb" for="gp-gio">Nối với ngày giỗ</label><select id="gp-gio" class="input" data-gp="gioId"><option value="">— Không —</option>${gios.map((x) => `<option value="${x.id}" ${f.gioId === x.id ? 'selected' : ''}>${esc(titleOf(x))}${x.rel ? ' (' + esc(x.rel) + ')' : ''}</option>`).join('')}</select>
      <span class="small muted">Để mở nhanh trang tưởng nhớ và văn khấn từ gia phả</span></div>` : ''}
    <div class="field"><label class="lb" for="gp-note">Ghi chú</label><input id="gp-note" class="input" maxlength="120" placeholder="Ví dụ: Con trưởng, sống ở Hà Nội" value="${esc(f.note)}" data-gp="note"></div>
    ${f.gioId ? `<a class="note occ" href="#/tuongnho/${f.gioId}" style="text-decoration:none;color:var(--ink)"><span class="pastel sm butter">${ILL.frame()}</span><span class="grow"><b>Trang tưởng nhớ</b><br><span class="small muted">Ảnh, tiểu sử, nơi an táng</span></span>${ICON.next(18)}</a>` : ''}
    ${f.error ? `<p class="err" role="alert">${esc(f.error)}</p>` : ''}
    ${f.id ? `<button type="button" class="btn danger" data-act="gp-del" ${hasKids ? 'disabled' : ''}>${ICON.trash()} Xóa người này</button>${hasKids ? '<span class="small muted center">Cần xóa con cháu, vợ/chồng của người này trước</span>' : ''}` : ''}
  </main>
  <div class="bottom-bar"><button type="button" class="btn" data-act="gp-save">Lưu</button></div>
</div>`;
}

export function mountGiapha(root, rerender, params) {
  const fx = params.focus && root.querySelector('.gp-person.focus');
  if (fx) fx.scrollIntoView({ block: 'center' });
  root.addEventListener('input', (e) => { const k = e.target.dataset?.gp; if (k && gp.form) gp.form[k] = e.target.value; });
  root.addEventListener('change', (e) => { if (e.target.dataset?.gp === 'gioId') { gp.form.gioId = e.target.value; rerender(); } });
  root.addEventListener('click', async (e) => {
    const t = e.target.closest('[data-gender],[data-act]');
    if (!t) return;
    const f = gp.form || {};
    if (t.dataset.gender) { f.gender = t.dataset.gender; rerender(); return; }
    if (t.dataset.act === 'gp-save') {
      f.name = f.name.trim();
      if (!f.name) { f.error = 'Vui lòng nhập tên'; rerender(); root.querySelector('#gp-name')?.focus(); return; }
      const rec = { id: f.id || uid(), name: f.name, gender: f.gender, born: Number(f.born) || '', died: Number(f.died) || '', parentId: f.parentId || '', spouseOf: f.spouseOf || '', gioId: f.gioId || '', note: (f.note || '').trim() };
      setState((s) => ({ ...s, people: s.people.some((p) => p.id === rec.id) ? s.people.map((p) => (p.id === rec.id ? rec : p)) : [...s.people, rec] }));
      gp.form = null; gp.key = '';
      toast('Đã lưu vào gia phả');
      navDone('#/giapha', { to: '#/giapha?focus=' + rec.id });
      return;
    }
    if (t.dataset.act === 'gp-share') {
      const ppl = getState().people;
      const lines = ['GIA PHẢ'];
      const walk = (p, depth) => {
        const sp = ppl.filter((x) => x.spouseOf === p.id);
        lines.push(`${'    '.repeat(depth)}${depth ? '└ ' : ''}${p.name}${lifeText(p) ? ' (' + lifeText(p) + ')' : ''}${sp.length ? ' — vợ/chồng: ' + sp.map((x) => x.name + (lifeText(x) ? ' (' + lifeText(x) + ')' : '')).join(', ') : ''}`);
        ppl.filter((x) => !x.spouseOf && (x.parentId === p.id || sp.some((s2) => s2.id === x.parentId))).sort((a, b) => (Number(a.born) || 9999) - (Number(b.born) || 9999)).forEach((c) => walk(c, depth + 1));
      };
      ppl.filter((p) => !p.parentId && !p.spouseOf).forEach((r) => walk(r, 0));
      lines.push('', 'Gửi từ app Lịch Âm & Nhắc Giỗ');
      shareText(lines.join('\n'), 'Gia phả');
      return;
    }
    if (t.dataset.act === 'gp-del') {
      if (!(await confirmSheet({ title: `Xóa ${f.name} khỏi gia phả?`, ok: 'Xóa', danger: true }))) return;
      const id = f.id;
      setState((s) => ({ ...s, people: s.people.filter((p) => p.id !== id) }));
      gp.form = null; gp.key = '';
      navDone('#/giapha');
    }
  });
}

/* ============================== 5. XEM TUỔI ============================== */
const xt = { born: 0, viec: 'nha', gender: 'nam' };
const LV = [['Tốt', 'good'], ['Cân nhắc', 'mid'], ['Nên tránh', 'bad']];

export function renderXemtuoi() {
  const st = getState();
  const n = new Date();
  const lyNow = solarToLunar(n.getDate(), n.getMonth() + 1, n.getFullYear()).year;
  if (!xt.born) xt.born = Number(String(st.profile.dob || '').slice(0, 4)) || 1990;
  const years = Array.from({ length: 6 }, (_, i) => xemNam(xt.born, lyNow + i, xt.viec));
  const best = years.find((r) => r.level === 0);
  const tt = tamTaiYears(chiOfYear(xt.born));
  const opts = [];
  for (let y = lyNow - 15; y >= 1930; y--) opts.push(`<option value="${y}" ${y === xt.born ? 'selected' : ''}>${y} · ${canChiYear(y)}</option>`);
  return `<div class="screen no-nav" data-screen="xemtuoi">
  ${backHeader('Xem tuổi làm việc lớn', '#/tienich', 'Kim Lâu · Hoang Ốc · Tam Tai')}
  <main class="body">
    <div class="seg" role="group" aria-label="Việc định làm">${[['nha', 'Làm nhà'], ['cuoi', 'Cưới hỏi']].map(([k, l]) => `<button type="button" data-viec="${k}" aria-pressed="${xt.viec === k}">${l}</button>`).join('')}</div>
    <div class="grid2"><div class="field"><label class="lb" for="xt-born">Năm sinh (âm lịch)</label><select id="xt-born" class="input">${opts.join('')}</select></div>
      <div class="field"><span class="lb">Tuổi</span><div class="xt-me">${giap(chiOfYear(xt.born), 34)}<span class="col"><b>${canChiYear(xt.born)}</b><span class="small muted">con ${giapName(chiOfYear(xt.born))}</span></span></div></div></div>
    ${xt.viec === 'cuoi' ? '<p class="note warn small">Theo lệ thường, Kim Lâu cưới hỏi xét theo tuổi cô dâu. Hãy chọn năm sinh của cô dâu.</p>' : '<p class="note small">Làm nhà xét theo tuổi người đứng tên chủ nhà (thường là người đàn ông trụ cột).</p>'}
    <section class="card pad col" style="gap:4px" aria-label="Kết luận nhanh">
      <b>${best ? `Năm hợp nhất gần đây: ${best.year} (${best.canChi})` : 'Trong 6 năm tới năm nào cũng phạm ít nhất một hạn'}</b>
      <span class="small muted">${best ? `Tuổi mụ ${best.age}, không phạm hạn nào.` : 'Có thể “mượn tuổi” người hợp tuổi trong gia đình để đứng ra làm lễ.'}</span>
    </section>
    <section class="col" style="gap:8px" aria-label="Từng năm">${years.map((r) => `<article class="card xt-year">
      <div class="row"><span class="col grow"><b>${r.year} · ${r.canChi}</b><span class="small muted">Tuổi mụ ${r.age}</span></span><span class="xt-lv ${LV[r.level][1]}">${LV[r.level][0]}</span></div>
      <div class="xt-tags"><span class="${r.kimLau.bad ? 'bad' : 'ok'}">${esc(r.kimLau.name)}</span>
        ${r.hoangOc ? `<span class="${r.hoangOc.bad ? 'bad' : 'ok'}">Hoang Ốc: ${esc(r.hoangOc.name)}</span>` : ''}
        <span class="${r.tamTai.bad ? 'bad' : 'ok'}">${esc(r.tamTai.name)}</span></div></article>`).join('')}</section>
    <details class="card pad xt-help"><summary><b>Các hạn này là gì?</b></summary>
      <p><b>Kim Lâu:</b> lấy tuổi mụ chia 9, dư 1, 3, 6, 8 là phạm (hại bản thân, vợ/chồng, con cái, vật nuôi).</p>
      ${xt.viec === 'nha' ? '<p><b>Hoang Ốc:</b> 6 cung Nhất Cát, Nhì Nghi, Tam Địa Sát, Tứ Tấn Tài, Ngũ Thọ Tử, Lục Hoang Ốc. Rơi vào Tam Địa Sát, Ngũ Thọ Tử, Lục Hoang Ốc là xấu.</p>' : ''}
      <p><b>Tam Tai:</b> tuổi ${canChiYear(xt.born)} gặp Tam Tai vào các năm ${tt.join(', ')}.</p>
      <p class="small muted">Đây là cách tính dân gian để tham khảo. Việc lớn nên bàn với người lớn trong nhà hoặc thầy có uy tín.</p></details>
    <a class="note occ" href="#/ngaytot" style="text-decoration:none;color:var(--ink)"><span class="pastel sm butter">${ILL.star()}</span><span class="grow"><b>Chọn ngày tốt trong năm</b><br><span class="small muted">Lọc theo việc và tuổi của bạn</span></span>${ICON.next(18)}</a>
  </main>
</div>`;
}

export function mountXemtuoi(root, rerender) {
  root.querySelector('#xt-born')?.addEventListener('change', (e) => { xt.born = Number(e.target.value); rerender(); });
  root.addEventListener('click', (e) => {
    const v = e.target.closest('[data-viec]');
    if (v) { xt.viec = v.dataset.viec; rerender(); }
  });
}

/* ============================== chung ============================== */
function missing(msg, back) {
  return `<div class="screen no-nav">${backHeader('Không tìm thấy', back)}<main class="body"><section class="card empty-art">${mascot('book', 90)}<b>${esc(msg)}</b><span>Có thể mục này đã bị xóa.</span></section></main></div>`;
}
