// Tết & tuổi: Chuẩn bị Tết, tuổi xông đất, giờ – hướng xuất hành, lịch ăn chay, mệnh & màu hợp tuổi.
import { getState, setState, uid, updateSettings } from '../store.js';
import { jdFromDate, jdToDate, solarToLunar, canChiYear, dayInfo, canChiDay } from '../lib/lunar.js';
import { dayExtras } from '../lib/goodday.js';
import { tetYear, lunarJd, ngay30, goiYXongDat, xongDatScore, menhInfo, MAU_HEX, CHAY, nextChayDays, chayDaysOfMonth } from '../lib/tet.js';
import { chiOfYear } from '../lib/xemtuoi.js';
import { esc, ICON, backHeader, toast } from './common.js';
import { confirmSheet } from './dialog.js';
import { ILL, blossomBranch, mascot } from './art.js';
import { giap, giapName } from './zodiac.js';

const THU = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
const THU_S = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const todayJd = () => { const n = new Date(); return jdFromDate(n.getDate(), n.getMonth() + 1, n.getFullYear()); };
const sd = (jd) => { const d = jdToDate(jd); return `${THU_S[(jd + 1) % 7]} ${d.day}/${d.month}`; };
const profileYear = () => Number(String(getState().profile.dob || '').slice(0, 4)) || 0;

/* ============================== CHUẨN BỊ TẾT ============================== */
// dk: mốc ngày (c = tháng Chạp, m = tháng Giêng, gt = đêm giao thừa)
export const TET_STEPS = [
  ['c23', 23, 12, '23 tháng Chạp · Ông Công ông Táo', [['Cúng ông Công ông Táo (trước 12 giờ trưa)', 'ongtao'], ['Thả cá chép (nếu cúng cá sống)']]],
  ['c24', 24, 12, '24 tháng Chạp', [['Bao sái bát hương, lau dọn bàn thờ'], ['Dọn dẹp, trang trí nhà cửa']]],
  ['c25', 25, 12, '25 tháng Chạp', [['Sắm đồ khô: bánh kẹo, mứt, trà, rượu'], ['Mua hương, nến, vàng mã'], ['Chuẩn bị tiền mới, bao lì xì']]],
  ['c27', 27, 12, '27 tháng Chạp', [['Gói hoặc đặt bánh chưng, bánh tét'], ['Mua hoa đào, mai, cúc, cây cảnh']]],
  ['c28', 28, 12, '28 tháng Chạp', [['Đi chợ Tết đồ tươi'], ['Bày mâm ngũ quả']]],
  ['c30', 0, 12, 'Ngày cuối năm · Tất niên', [['Cúng tất niên, mời ông bà về ăn Tết', 'tatnien'], ['Dọn rác, tắm tất niên']]],
  ['gt', 0, 12, 'Đêm giao thừa', [['Cúng giao thừa ngoài trời và trong nhà', 'giaothua']]],
  ['m1', 1, 1, 'Mùng 1 Tết', [['Cúng mùng Một Tết', 'tet'], ['Đón người xông đất', '', '#/xongdat'], ['Xuất hành theo giờ, hướng tốt', '', '#/xuathanh'], ['Mừng tuổi, chúc Tết ông bà, cha mẹ']]],
  ['m2', 2, 1, 'Mùng 2 Tết', [['Chúc Tết bên ngoại']]],
  ['m3', 3, 1, 'Mùng 3 Tết', [['Chúc Tết thầy cô']]],
  ['m4', 4, 1, 'Mùng 3–4 Tết · Hóa vàng', [['Cúng hóa vàng, tiễn ông bà', 'hoavang']]]
];
const tetUi = { who: '' };

function stepJd(st, Y) {
  const [, d, m] = st;
  if (m === 12) return lunarJd(d || ngay30(Y), 12, Y - 1);
  return lunarJd(d, 1, Y);
}
export function tetPrepOf(s, Y) {
  return s.prep['tet:' + Y] || { tasks: TET_STEPS.flatMap(([dk, , , , tasks]) => tasks.map(([t, vk = '', href = ''], i) => ({ id: dk + i, dk, t, vk, href, done: false, who: '' }))) };
}
const saveTet = (Y, fn) => setState((s) => ({ ...s, prep: { ...s.prep, ['tet:' + Y]: fn(tetPrepOf(s, Y)) } }));

export function renderTetPrep() {
  const st = getState();
  const Y = tetYear();
  const tj = todayJd();
  const tet = lunarJd(1, 1, Y);
  const p = tetPrepOf(st, Y);
  const done = p.tasks.filter((x) => x.done).length;
  const left = tet - tj;
  const row = (x, due) => `<div class="item prep-task ${x.done ? 'done' : ''}">
    <button type="button" class="tick ${x.done ? 'on' : ''}" data-tk="${x.id}" role="checkbox" aria-checked="${x.done}" aria-label="${esc(x.t)}"></button>
    <span class="col grow"><span class="t">${esc(x.t)}</span>
      <span class="row" style="gap:6px;flex-wrap:wrap;margin-top:4px">
      ${tetUi.who === x.id ? `<input class="input who-in" id="who-in" maxlength="30" placeholder="Ai lo việc này?" value="${esc(x.who)}" data-who="${x.id}">` : `<button type="button" class="who ${x.who ? 'set' : ''}" style="margin:0" data-whoedit="${x.id}">${x.who ? 'Ai lo: ' + esc(x.who) : '+ Phân công'}</button>`}
      ${x.vk ? `<a class="who set" style="margin:0;text-decoration:none" href="#/vankhan/${x.vk}?jd=${due}">Văn khấn, mâm</a>` : ''}${x.href ? `<a class="who set" style="margin:0;text-decoration:none" href="${x.href}">Xem</a>` : ''}
      ${!x.done && due < tj ? '<span class="err small">Đã qua</span>' : ''}</span></span>
    ${x.custom ? `<button type="button" class="icon-btn plain" style="width:40px;height:40px" data-tkdel="${x.id}" aria-label="Xóa việc">${ICON.close()}</button>` : ''}</div>`;
  return `<div class="screen no-nav" data-screen="tetprep">
  ${backHeader('Chuẩn bị Tết ' + canChiYear(Y), '#/tienich', 'Từ ông Công ông Táo đến hóa vàng')}
  <main class="body">
    <section class="banner red tet-banner"><span class="tet-branch">${blossomBranch(150, 'mai')}</span>
      <div class="col grow" style="gap:4px;position:relative"><b>${left > 0 ? `Còn ${left} ngày đến Tết` : left === 0 ? 'Chúc mừng năm mới!' : 'Đang trong Tết'}</b><span>Mùng 1 Tết: ${THU[(tet + 1) % 7]}, ${jdToDate(tet).day}/${jdToDate(tet).month}/${jdToDate(tet).year} · xong ${done}/${p.tasks.length} việc</span></div>
      <div class="bn-mascot">${mascot('star', 88)}</div></section>
    <div class="bar" role="progressbar" aria-label="Tiến độ chuẩn bị Tết" aria-valuemin="0" aria-valuemax="${p.tasks.length}" aria-valuenow="${done}"><i style="width:${Math.round((done / p.tasks.length) * 100)}%"></i></div>
    ${TET_STEPS.map((s) => { const due = stepJd(s, Y); const tasks = p.tasks.filter((x) => x.dk === s[0]); return tasks.length ? `<section class="col" style="gap:6px"><div class="h2row"><h2 class="h">${s[0] === 'c30' ? (ngay30(Y) === 29 ? '29 Tết (tháng thiếu) · Tất niên' : '30 Tết · Tất niên') : s[3]}</h2><span class="small muted">${sd(due)}</span></div>
      <div class="card list">${tasks.map((x) => row(x, due)).join('')}</div></section>` : ''; }).join('')}
    <section class="card pad col" style="gap:8px" aria-label="Thêm việc">
      <span class="lb">Thêm việc riêng của nhà mình</span>
      <div class="row" style="gap:8px"><input id="tk-new" class="input grow" maxlength="60" placeholder="Ví dụ: Đón con về quê" aria-label="Việc cần thêm">
        <select id="tk-dk" class="input" style="width:auto" aria-label="Làm vào ngày nào">${TET_STEPS.map((s) => `<option value="${s[0]}">${s[0].startsWith('c') ? (s[1] || 30) + '/Chạp' : s[0] === 'gt' ? 'Giao thừa' : 'Mùng ' + s[1]}</option>`).join('')}</select></div>
      <button type="button" class="btn ghost" style="height:46px" data-act="tk-add">${ICON.plus(18)} Thêm việc</button>
    </section>
    <button type="button" class="btn text" data-act="tet-reset">Bỏ đánh dấu tất cả</button>
  </main>
</div>`;
}

export function mountTetPrep(root, rerender) {
  const Y = tetYear();
  const whoIn = root.querySelector('#who-in');
  if (whoIn) {
    whoIn.focus();
    const commit = () => { const v = whoIn.value.trim(); const id = whoIn.dataset.who; tetUi.who = ''; saveTet(Y, (p) => ({ ...p, tasks: p.tasks.map((x) => (x.id === id ? { ...x, who: v } : x)) })); };
    whoIn.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); commit(); } });
    whoIn.addEventListener('blur', commit);
  }
  root.addEventListener('click', async (e) => {
    const t = e.target.closest('[data-tk],[data-whoedit],[data-tkdel],[data-act]');
    if (!t) return;
    if (t.dataset.tk) { saveTet(Y, (p) => ({ ...p, tasks: p.tasks.map((x) => (x.id === t.dataset.tk ? { ...x, done: !x.done } : x)) })); return; }
    if (t.dataset.whoedit) { tetUi.who = t.dataset.whoedit; rerender(); return; }
    if (t.dataset.tkdel) { saveTet(Y, (p) => ({ ...p, tasks: p.tasks.filter((x) => x.id !== t.dataset.tkdel) })); return; }
    if (t.dataset.act === 'tk-add') {
      const v = root.querySelector('#tk-new').value.trim();
      if (!v) { root.querySelector('#tk-new').focus(); return; }
      const dk = root.querySelector('#tk-dk').value;
      saveTet(Y, (p) => ({ ...p, tasks: [...p.tasks, { id: uid(), dk, t: v, vk: '', href: '', done: false, who: '', custom: true }] }));
      toast('Đã thêm việc');
    }
    if (t.dataset.act === 'tet-reset') {
      if (!(await confirmSheet({ title: 'Bỏ đánh dấu tất cả?', message: 'Danh sách việc và người lo vẫn giữ nguyên.', ok: 'Bỏ đánh dấu' }))) return;
      saveTet(Y, (p) => ({ ...p, tasks: p.tasks.map((x) => ({ ...x, done: false })) }));
    }
  });
}

/* ============================== XÔNG ĐẤT ============================== */
const xd = { host: 0, check: 0 };
const yearOpts = (sel, from, to) => { const o = []; for (let y = to; y >= from; y--) o.push(`<option value="${y}" ${y === sel ? 'selected' : ''}>${y} · ${canChiYear(y)}</option>`); return o.join(''); };
const scoreLv = (s) => (s >= 3 ? ['Rất hợp', 'good'] : s >= 1 ? ['Hợp', 'good'] : s >= 0 ? ['Bình thường', 'mid'] : ['Không hợp', 'bad']);

export function renderXongdat() {
  const st = getState();
  const Y = tetYear();
  if (!xd.host) xd.host = profileYear() || 1975;
  const top = goiYXongDat(xd.host, Y, 8);
  const ppl = st.people.filter((p) => p.born && !p.died).map((p) => ({ name: p.name, ...xongDatScore(Number(p.born), xd.host, Y) })).filter((x) => Y - x.year + 1 >= 12)
    .sort((a, b) => b.score - a.score);
  const chk = xd.check ? xongDatScore(xd.check, xd.host, Y) : null;
  const card = (r, name = '') => { const [lv, c] = scoreLv(r.score); return `<article class="card xt-year">
    <div class="row">${giap(chiOfYear(r.year), 36)}<span class="col grow"><b>${name ? esc(name) + ' · ' : ''}${r.year} · ${r.canChi}</b><span class="small muted">Mệnh ${r.menh.name} · ${Y - r.year + 1} tuổi mụ</span></span><span class="xt-lv ${c}">${lv}</span></div>
    <div class="xt-tags">${r.notes.map(([sg, t]) => `<span class="${sg === '+' ? 'ok2' : 'bad'}">${sg === '+' ? '✓' : '✗'} ${esc(t)}</span>`).join('')}</div></article>`; };
  return `<div class="screen no-nav" data-screen="xongdat">
  ${backHeader('Tuổi xông đất ' + canChiYear(Y), '#/tienich', 'Người đầu tiên vào nhà sau giao thừa')}
  <main class="body">
    <div class="grid2"><div class="field"><label class="lb" for="xd-host">Tuổi gia chủ</label><select id="xd-host" class="input">${yearOpts(xd.host, 1930, Y - 16)}</select></div>
      <div class="field"><span class="lb">Mệnh gia chủ</span><div class="xt-me">${giap(chiOfYear(xd.host), 34)}<span class="col"><b>${canChiYear(xd.host)}</b><span class="small muted">${menhInfo(xd.host).name}</span></span></div></div></div>
    <section class="col" style="gap:8px" aria-label="Tuổi hợp nhất"><h2 class="h">Tuổi hợp xông đất nhất</h2>${top.map((r) => card(r)).join('')}</section>
    ${ppl.length ? `<section class="col" style="gap:8px" aria-label="Người trong gia phả"><h2 class="h">Người thân trong gia phả</h2>${ppl.slice(0, 6).map((r) => card(r, r.name)).join('')}</section>` : ''}
    <section class="card pad col" style="gap:8px"><label class="lb" for="xd-check">Xem một tuổi bất kỳ</label><select id="xd-check" class="input"><option value="">— Chọn năm sinh —</option>${yearOpts(xd.check, Y - 80, Y - 12)}</select></section>
    ${chk ? card(chk) : ''}
    <details class="card pad xt-help"><summary><b>Chọn người xông đất thế nào?</b></summary>
      <p>Ngoài hợp tuổi, nên chọn người vui vẻ, khỏe mạnh, gia đình êm ấm, làm ăn thuận lợi và không có tang trong năm.</p>
      <p>Người xông đất vào nhà sau giao thừa, chúc Tết ngắn gọn, vui vẻ rồi về. Không tìm được người hợp, gia chủ có thể tự xông nhà: ra ngoài trước giao thừa, đúng giờ tốt thì quay vào.</p>
      <p class="small muted">Cách chấm: mệnh ngũ hành nạp âm của khách với gia chủ và với năm; địa chi tam hợp, lục hợp (tốt), xung, hại (xấu); thiên can hợp, khắc. Chỉ để tham khảo.</p></details>
  </main>
</div>`;
}
export function mountXongdat(root, rerender) {
  root.querySelector('#xd-host')?.addEventListener('change', (e) => { xd.host = Number(e.target.value); rerender(); });
  root.querySelector('#xd-check')?.addEventListener('change', (e) => { xd.check = Number(e.target.value) || 0; rerender(); });
}

/* ============================== XUẤT HÀNH ============================== */
export function renderXuathanh() {
  const Y = tetYear();
  const days = [1, 2, 3].map((d) => lunarJd(d, 1, Y));
  const block = (jd, i) => {
    const s = jdToDate(jd);
    const info = dayInfo(s.day, s.month, s.year);
    const ex = dayExtras(jd);
    return `<section class="card pad col xh-day" style="gap:10px" aria-label="Mùng ${i + 1} Tết">
      <div class="row"><span class="tile ${i === 0 ? '' : 'gold'}" style="width:58px;height:60px"><b class="serif" style="font-size:1.5rem">${i + 1}</b><span>Tết</span></span>
        <span class="col grow"><b>Mùng ${i + 1} · ${THU[(jd + 1) % 7]}, ${s.day}/${s.month}/${s.year}</b><span class="small muted">Ngày ${canChiDay(jd)} · ${info.spirit.good ? 'Hoàng đạo' : 'Hắc đạo'} (${info.spirit.name})</span></span></div>
      <div class="sh-pair"><div class="sh-box"><span class="small muted">Hỷ thần (may mắn)</span><b>Hướng ${esc(ex.hyThan)}</b></div><div class="sh-box"><span class="small muted">Tài thần (tiền tài)</span><b>Hướng ${esc(ex.taiThan)}</b></div></div>
      <div class="col" style="gap:6px"><span class="lb">Giờ tốt để xuất hành</span><div class="gd-hours">${info.hours.map((h) => `<span>${giap(h.chi, 22)}${h.chi} <small>${h.label}</small></span>`).join('')}</div></div>
      <span class="small muted">Tuổi ${info.xung} (con ${giapName(info.xung)}) xung với ngày, nên tránh đi xa hoặc làm việc lớn.</span>
    </section>`;
  };
  return `<div class="screen no-nav" data-screen="xuathanh">
  ${backHeader('Xuất hành đầu năm', '#/tienich', `Tết ${canChiYear(Y)} · giờ và hướng tốt`)}
  <main class="body">
    <p class="note small" style="display:block">Xuất hành là bước ra khỏi nhà lần đầu trong năm mới để cầu may. Chọn giờ tốt, đi về hướng Hỷ thần hoặc Tài thần, có thể ghé chùa, đền gần nhà.</p>
    ${days.map(block).join('')}
    <a class="note occ" href="#/vankhan?g=chua" style="text-decoration:none;color:var(--ink)"><span class="pastel sm butter">${ILL.lotus()}</span><span class="grow"><b>Đi lễ chùa, đền đầu năm</b><br><span class="small muted">Văn khấn Đức Ông, Tam Bảo, Thánh Mẫu</span></span>${ICON.next(18)}</a>
  </main>
</div>`;
}

/* ============================== ĂN CHAY ============================== */
export function renderAnchay() {
  const st = getState();
  const kind = st.settings.chay || 'off';
  const tj = todayJd();
  const list = kind === 'off' ? [] : nextChayDays(kind, tj, 45);
  const n = new Date(); const l = solarToLunar(n.getDate(), n.getMonth() + 1, n.getFullYear());
  return `<div class="screen no-nav" data-screen="anchay">
  ${backHeader('Lịch ăn chay', '#/tienich', 'Nhắc trước một ngày để chuẩn bị')}
  <main class="body">
    <div class="field"><span class="lb">Ăn chay mỗi tháng</span><div class="chips">${[['off', 'Không'], ...Object.entries(CHAY).map(([k, v]) => [k, v.name])].map(([k, lb]) => `<button type="button" class="chip" data-chay="${k}" aria-pressed="${kind === k}">${lb}</button>`).join('')}</div></div>
    ${kind !== 'off' ? `<p class="note small" style="display:block">Các ngày âm: <b>${CHAY[kind].days.join(', ')}</b>. Tháng thiếu (29 ngày) dời lùi: tháng này là ngày <b>${chayDaysOfMonth(kind, l.month, l.year, l.leap).join(', ')}</b>.</p>
    <div class="row"><div class="col grow"><span class="lb">Nhắc tối hôm trước</span><span class="small muted">Thông báo "Mai là ngày chay" lúc ${esc(st.settings.chayTime || '19:00')}</span></div>
      <button type="button" class="switch" role="switch" aria-checked="${st.settings.chayRemind !== false}" aria-label="Nhắc tối hôm trước" data-act="chay-remind"></button></div>
    <section class="col" style="gap:6px"><h2 class="h">Ngày chay sắp tới</h2><div class="card list">${list.map((d) => { const diff = d.jd - tj; return `<div class="item"><span class="tile gold"><b>${d.solar.day}</b><span>TH ${d.solar.month}</span></span>
      <span class="col grow"><span class="t">${THU[(d.jd + 1) % 7]} · ${d.lunar.day}/${d.lunar.month} âm</span><span class="s"><span class="when${diff <= 1 ? ' soon' : ''}">${diff === 0 ? 'Hôm nay' : diff === 1 ? 'Ngày mai' : 'còn ' + diff + ' ngày'}</span></span></span></div>`; }).join('')}</div></section>`
      : `<section class="card empty-art">${ILL.lotus().replace('width="34" height="34"', 'width="80" height="80"')}<b>Chọn số ngày chay mỗi tháng</b><span>App sẽ hiện ngày chay trên màn Hôm nay và nhắc trước một ngày.</span></section>`}
  </main>
</div>`;
}
export function mountAnchay(root) {
  root.addEventListener('click', (e) => {
    const c = e.target.closest('[data-chay]');
    if (c) { updateSettings({ chay: c.dataset.chay }); return; }
    if (e.target.closest('[data-act="chay-remind"]')) updateSettings({ chayRemind: getState().settings.chayRemind === false });
  });
}

/* ============================== MỆNH & MÀU HỢP TUỔI ============================== */
const mn = { y: 0 };
export function renderMenh() {
  if (!mn.y) mn.y = profileYear() || 1990;
  const m = menhInfo(mn.y);
  const sw = (c) => `<span class="mau"><i style="background:${MAU_HEX[c]}"></i>${c}</span>`;
  return `<div class="screen no-nav" data-screen="menh">
  ${backHeader('Mệnh & màu hợp tuổi', '#/tienich', 'Ngũ hành nạp âm')}
  <main class="body">
    <div class="field"><label class="lb" for="mn-y">Năm sinh (âm lịch)</label><select id="mn-y" class="input">${yearOpts(mn.y, 1930, new Date().getFullYear())}</select></div>
    <section class="card sh-hero menh-${m.hanh}">
      <div class="row" style="gap:12px"><span class="sh-me">${giap(chiOfYear(mn.y), 44)}</span><span class="col grow"><b>${m.canChi} · con ${giapName(chiOfYear(mn.y))}</b><span class="small muted">Mệnh</span><b class="serif" style="font-size:1.5rem">${m.name}</b></span><span class="hanh-badge">${m.hanh}</span></div>
    </section>
    <section class="card pad col" style="gap:10px"><h2 class="h">Màu hợp</h2><div class="mau-row">${m.hopMau.map(sw).join('')}</div>
      <span class="small muted">Màu của hành ${m.hanh} (bản mệnh) và hành ${m.tuongSinh} (sinh ra ${m.hanh}) — hợp để chọn quần áo, xe, đồ dùng.</span>
      <h2 class="h" style="margin-top:6px">Màu nên hạn chế</h2><div class="mau-row">${m.kyMau.map(sw).join('')}</div>
      <span class="small muted">Màu của hành ${m.kyHanh} (khắc ${m.hanh}).</span></section>
    <section class="card list">
      <div class="item"><span class="col grow"><span class="s">Con số hợp</span><span class="t">${m.so.join(', ')}</span></span></div>
      <div class="item"><span class="col grow"><span class="s">Tuổi tam hợp, lục hợp (hợp làm ăn, kết bạn)</span><span class="t">${[...m.tamHop, m.lucHop].join(', ')}</span></span></div>
      <div class="item"><span class="col grow"><span class="s">Tuổi tứ hành xung (nên nhường nhịn)</span><span class="t">${m.tuHanhXung.join(', ')}</span></span></div>
    </section>
    <p class="small muted center">Theo ngũ hành dân gian, chỉ để tham khảo khi chọn màu sắc, đồ dùng.</p>
  </main>
</div>`;
}
export function mountMenh(root, rerender) {
  root.querySelector('#mn-y')?.addEventListener('change', (e) => { mn.y = Number(e.target.value); rerender(); });
}
