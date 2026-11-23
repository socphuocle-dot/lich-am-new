// Dòng họ (phần 2): Tảo mộ (vị trí mộ phần, chỉ đường, nhắc Thanh Minh) và Sổ quỹ họ.
import { done as navDone, go } from '../nav.js';
import { getState, setState, updateSettings, uid } from '../store.js';
import { jdFromDate, jdToDate, lunarToSolar, solarToLunar } from '../lib/lunar.js';
import { nextThanhMinh, TAOMO_CUOINAM } from '../lib/events.js';
import { dirUrl, fmtLatLng } from '../lib/geo.js';
import { QUY_CATS, catName, money, dotStat, quySummary, quyReport } from '../lib/quy.js';
import { familyName } from '../lib/print.js';
import { esc, ICON, backHeader, toast, sw } from './common.js';
import { confirmSheet } from './dialog.js';
import { mascot, ILL } from './art.js';
import { PIN, shareText, editMemorial } from './giadinh.js';
import { mediaSrc } from '../media.js';

const THU = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
const todayJd = () => { const n = new Date(); return jdFromDate(n.getDate(), n.getMonth() + 1, n.getFullYear()); };
const isoToday = () => { const n = new Date(); return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`; };
const dayText = (jd) => { const d = jdToDate(jd); return `${THU[(jd + 1) % 7]} ${d.day}/${d.month}/${d.year}`; };

/* ============================== TẢO MỘ ============================== */
const TAOMO_ITEMS = ['Hương, nến, bật lửa', 'Hoa tươi, trái cây', 'Nước uống, nước rửa mộ', 'Khăn lau, chổi', 'Dao/liềm phát cỏ, găng tay', 'Sơn tô lại chữ bia (nếu cần)', 'Túi đựng rác mang về', 'Vàng mã (tùy gia đình)', 'Văn khấn Thanh Minh (mở trong app)'];

/** Lần tảo mộ cuối năm kế tiếp (20 tháng Chạp) */
function nextCuoiNam(tj) {
  const l = jdToDate(tj); const lu = solarToLunar(l.day, l.month, l.year);
  for (const y of [lu.year, lu.year + 1]) {
    const s = lunarToSolar(TAOMO_CUOINAM.d, TAOMO_CUOINAM.m, y, false);
    if (s && s.day) { const jd = jdFromDate(s.day, s.month, s.year); if (jd >= tj) return jd; }
  }
  return null;
}

export function renderTaomo() {
  const st = getState();
  const tj = todayJd();
  const tm = nextThanhMinh(tj); const cn = nextCuoiNam(tj);
  const graves = st.gios.filter((g) => (g.type || 'gio') === 'gio');
  const withLoc = graves.filter((g) => g.memo?.gLat).length;
  const ck = new Set(st.checklists.taomo || []);
  const left = (jd) => (jd - tj === 0 ? 'Hôm nay' : `còn ${jd - tj} ngày`);
  return `<div class="screen" data-screen="taomo">
  ${backHeader('Tảo mộ', '#/tienich', `${withLoc}/${graves.length} mộ đã lưu vị trí`)}
  <main class="body">
    <section class="card list" aria-label="Dịp tảo mộ">
      ${tm ? `<a class="item" href="#/vankhan/thanhminh?jd=${tm}"><span class="pastel sm mint">${ILL.lotus()}</span><span class="col grow"><span class="t">Tiết Thanh Minh</span><span class="s"><span class="when${tm - tj <= 7 ? ' soon' : ''}">${left(tm)}</span>${dayText(tm)} · có văn khấn</span></span>${ICON.next(18)}</a>` : ''}
      ${cn ? `<div class="item"><span class="pastel sm butter">${ILL.incense()}</span><span class="col grow"><span class="t">Tảo mộ cuối năm</span><span class="s">20 tháng Chạp · ${dayText(cn)}</span></span>${sw(!!st.settings.taoMo, 'Nhắc tảo mộ cuối năm', 'data-set="taoMo"')}</div>` : ''}
    </section>
    <span class="small muted" style="margin-top:-4px">Thanh Minh luôn có trong lịch và được nhắc như các ngày lễ. Bật thêm nhắc cuối năm để dọn mộ trước Tết.</span>
    <section class="col" style="gap:8px"><div class="h2row"><h2 class="h">Mộ phần ông bà, cha mẹ</h2></div>
      ${graves.length ? `<div class="card list">${graves.map((g) => {
        const m = g.memo || {};
        return `<div class="item grave-row" style="flex-wrap:wrap">
          ${m.gPhoto ? `<img class="grave-ph sm" src="${mediaSrc(m.gPhoto)}" alt="">` : `<span class="pastel sm ${m.gLat ? 'mint' : 'butter'}">${ILL.frame()}</span>`}
          <span class="col grow"><span class="t">${esc((g.rel ? g.rel + ' ' : '') + g.name)}</span><span class="s">${m.grave ? esc(m.grave) : m.gLat ? fmtLatLng(m.gLat, m.gLng) : 'Chưa ghi nơi an táng'}</span></span>
          ${m.gLat ? `<a class="chip on" href="${dirUrl(m.gLat, m.gLng)}" target="_blank" rel="noopener" aria-label="Chỉ đường đến mộ ${esc(g.name)}">${PIN} Chỉ đường</a>` : `<a class="chip" href="#/tuongnho/${g.id}?sua=1" aria-label="Lưu vị trí mộ ${esc(g.name)}">${ICON.plus(16)} Vị trí</a>`}</div>`;
      }).join('')}</div>`
        : `<section class="card empty-art">${mascot('pray', 90)}<b>Chưa có ngày giỗ nào</b><span>Thêm ngày giỗ của ông bà, cha mẹ, rồi lưu vị trí mộ trong trang tưởng nhớ.</span><a class="btn" style="margin-top:8px" href="#/add?type=gio">${ICON.plus()} Thêm ngày giỗ</a></section>`}
      ${graves.length && !withLoc ? `<div class="note occ"><span class="pastel sm mint">${PIN}</span><span class="small"><b>Mẹo:</b> lần tới ra mộ, mở app bấm <b>Vị trí</b> → <b>Lấy vị trí đang đứng</b>. Con cháu ở xa về chỉ cần bấm Chỉ đường.</span></div>` : ''}
    </section>
    <section class="col" style="gap:8px" aria-label="Đồ mang đi tảo mộ"><div class="h2row"><h2 class="h">Đồ mang theo</h2><span class="small muted">${ck.size}/${TAOMO_ITEMS.length}</span></div>
      <div class="card list">${TAOMO_ITEMS.map((t, i) => `<button type="button" class="item" role="checkbox" aria-checked="${ck.has(i)}" data-tm="${i}"><span class="tick ${ck.has(i) ? 'on' : ''}" aria-hidden="true"></span><span class="grow t">${t}</span></button>`).join('')}</div>
      ${ck.size ? '<button type="button" class="link" data-act="tm-reset" style="align-self:flex-end">Bỏ đánh dấu cho lần sau</button>' : ''}
    </section>
  </main>
</div>`;
}

export function mountTaomo(root) {
  root.addEventListener('click', (e) => {
    const ed = e.target.closest('a[href*="?sua=1"]');
    if (ed) { editMemorial(ed.getAttribute('href').split('/')[2].split('?')[0]); return; }
    const s = e.target.closest('[data-set]');
    if (s) { updateSettings({ [s.dataset.set]: s.getAttribute('aria-checked') !== 'true' }); if (s.dataset.set === 'taoMo' && s.getAttribute('aria-checked') !== 'true') toast('Sẽ nhắc tảo mộ vào 20 tháng Chạp'); return; }
    const t = e.target.closest('[data-tm]');
    if (t) {
      const i = Number(t.dataset.tm);
      setState((x) => { const cur = new Set(x.checklists.taomo || []); cur.has(i) ? cur.delete(i) : cur.add(i); return { ...x, checklists: { ...x.checklists, taomo: [...cur] } }; });
      return;
    }
    if (e.target.closest('[data-act="tm-reset"]')) setState((x) => ({ ...x, checklists: { ...x.checklists, taomo: [] } }));
  });
}

/* ============================== SỔ QUỸ HỌ ============================== */
const qy = { tab: 'so', form: null, key: '', dotForm: null, add: '' };
const QUICK = [100000, 200000, 500000, 1000000, 2000000];
const quyName = (st) => st.settings.quyName || (familyName(st.people) ? 'Quỹ họ ' + familyName(st.people) : 'Quỹ họ');
const saveQuy = (fn) => setState((s) => ({ ...s, quy: fn(s.quy) }));
const digits = (v) => Number(String(v || '').replace(/\D/g, '')) || 0;
const amtChips = (cur, attr) => `<div class="chips">${QUICK.map((v) => `<button type="button" class="chip" ${attr}="${v}" aria-pressed="${cur === v}">${v >= 1e6 ? v / 1e6 + ' triệu' : v / 1000 + 'k'}</button>`).join('')}</div>`;

export function renderQuyho(params) {
  const id = params.id || '';
  if (id === 'new' || id.startsWith('e-')) return renderEntryForm(params);
  if (id === 'dot') return renderDotForm();
  if (id.startsWith('d-')) return renderDot(id.slice(2));
  const st = getState();
  const q = st.quy; const s = quySummary(q);
  const list = [...q.entries].sort((a, b) => (a.date < b.date ? 1 : -1));
  let lastY = '';
  const rows = list.map((x) => {
    const yr = x.date.slice(0, 4);
    const head = yr !== lastY ? `<div class="sec-title" style="padding:12px 14px 6px">Năm ${yr}</div>` : '';
    lastY = yr;
    return head + `<a class="item" href="#/quyho/e-${x.id}"><span class="pastel sm ${x.dir === 'thu' ? 'mint' : 'rose'}">${ILL[x.dir === 'thu' ? 'coin' : 'hongbao']()}</span>
      <span class="col grow"><span class="t">${esc(x.who || catName(x.cat))}</span><span class="s">${esc(catName(x.cat))}${x.note ? ' · ' + esc(x.note) : ''} · ${x.date.split('-').reverse().join('/')}</span></span>
      <b class="hh-amt ${x.dir === 'thu' ? 'nhan' : 'di'}">${x.dir === 'thu' ? '+' : '−'}${money(x.amount)}</b></a>`;
  }).join('');
  return `<div class="screen has-fab" data-screen="quyho">
  ${backHeader(quyName(st), '#/tienich', 'Thu chi minh bạch, gửi tổng kết cả họ', (q.entries.length || q.dots.length) ? `<button type="button" class="icon-btn plain" data-act="q-share" aria-label="Gửi tổng kết quỹ cho cả họ">${ICON.share(20)}</button>` : '')}
  <main class="body">
    <section class="quy-bal${s.con < 0 ? ' neg' : ''}" aria-label="Số dư quỹ"><span>${s.con < 0 ? 'Quỹ đang chi vượt' : 'Quỹ còn lại'}</span><b data-test="quy-con">${money(s.con)}</b>
      <div class="row quy-sub"><span>Đã thu <b>${money(s.thu)}</b></span><span>Đã chi <b>${money(s.chi)}</b></span></div></section>
    <div class="seg" role="group" aria-label="Xem">${[['so', 'Sổ thu chi'], ['dot', `Đợt đóng góp${q.dots.length ? ' (' + q.dots.length + ')' : ''}`]].map(([k, l]) => `<button type="button" data-qtab="${k}" aria-pressed="${qy.tab === k}">${l}</button>`).join('')}</div>
    ${qy.tab === 'so'
      ? (list.length ? `<section class="card list">${rows}</section>` : `<section class="card empty-art">${mascot('book', 90)}<b>Sổ quỹ còn trống</b><span>Ghi các khoản đóng góp, chi giỗ tổ, khuyến học, sửa nhà thờ họ… để ai cũng nắm được.</span></section>`)
      : `${q.dots.length ? `<section class="card list">${q.dots.map((d) => { const t = dotStat(d); return `<a class="item" href="#/quyho/d-${d.id}"><span class="pastel sm butter">${ILL.checklist()}</span>
          <span class="col grow"><span class="t">${esc(d.name)}</span><span class="s">${d.per ? money(d.per) + '/hộ · ' : ''}đã đóng ${t.paid}/${t.total} hộ</span>
          <span class="quy-bar" aria-hidden="true"><i style="width:${t.total ? Math.round(t.paid / t.total * 100) : 0}%"></i></span></span><b class="hh-amt nhan">${money(t.collected)}</b></a>`; }).join('')}</section>`
        : `<section class="card empty-art">${mascot('letter', 90)}<b>Chưa có đợt đóng góp</b><span>Ví dụ: "Giỗ tổ 2027, mỗi hộ 200.000đ". Đánh dấu hộ nào đã đóng, app tự cộng vào quỹ.</span></section>`}
        <a class="btn ghost" href="#/quyho/dot">${ICON.plus()} Tạo đợt đóng góp</a>`}
    <div class="field"><label class="lb small" for="quy-name">Tên quỹ</label><input id="quy-name" class="input" maxlength="40" value="${esc(quyName(st))}"></div>
  </main>
  <a class="fab" href="#/quyho/new" aria-label="Ghi khoản thu chi">${ICON.plus()} Ghi khoản</a>
</div>`;
}

function renderEntryForm(params) {
  const st = getState();
  const key = params.id + (params.dir || '');
  if (qy.key !== key || !qy.form) {
    qy.key = key;
    const old = params.id.startsWith('e-') ? st.quy.entries.find((x) => x.id === params.id.slice(2)) : null;
    qy.form = old ? { ...old } : { id: '', dir: params.dir || 'thu', cat: 'giotho', who: '', amount: 0, date: isoToday(), note: '', error: '' };
  }
  const f = qy.form;
  const names = [...new Set(st.quy.entries.map((x) => x.who).filter(Boolean).concat(st.people.filter((p) => !p.died).map((p) => p.name)))].slice(0, 200);
  return `<div class="screen no-nav" data-screen="quy-form">
  ${backHeader(f.id ? 'Sửa khoản' : 'Ghi khoản quỹ', '#/quyho')}
  <main class="body">
    <div class="seg" role="group" aria-label="Thu hay chi">${[['thu', 'Thu vào quỹ'], ['chi', 'Chi ra']].map(([k, l]) => `<button type="button" data-qdir="${k}" aria-pressed="${f.dir === k}">${l}</button>`).join('')}</div>
    <div class="field"><span class="lb">Việc gì</span><div class="chips">${QUY_CATS.map(([k, l]) => `<button type="button" class="chip" data-qcat="${k}" aria-pressed="${f.cat === k}">${l}</button>`).join('')}</div></div>
    <div class="field"><label class="lb" for="q-who">${f.dir === 'thu' ? 'Ai đóng góp' : 'Chi cho ai / việc'}</label><input id="q-who" class="input" maxlength="60" list="q-names" autocomplete="off" placeholder="${f.dir === 'thu' ? 'Ví dụ: Gia đình chú Ba' : 'Ví dụ: Mua lễ giỗ tổ'}" value="${esc(f.who)}" data-q="who">
      <datalist id="q-names">${names.map((n) => `<option value="${esc(n)}">`).join('')}</datalist></div>
    <div class="grid2">
      <div class="field"><label class="lb" for="q-date">Ngày</label><input id="q-date" class="input" type="date" value="${esc(f.date)}" data-q="date"></div>
      <div class="field"><label class="lb" for="q-amount">Số tiền</label><input id="q-amount" class="input" inputmode="numeric" placeholder="0" value="${f.amount ? Number(f.amount).toLocaleString('vi-VN') : ''}" data-q="amount"></div>
    </div>
    ${amtChips(Number(f.amount), 'data-qamt')}
    <div class="field"><label class="lb" for="q-note">Ghi chú <span class="muted small">(không bắt buộc)</span></label><input id="q-note" class="input" maxlength="80" placeholder="Ví dụ: tiền mua hoa quả, trả công thợ" value="${esc(f.note)}" data-q="note"></div>
    ${f.error ? `<p class="err" role="alert">${esc(f.error)}</p>` : ''}
    ${f.id ? `<button type="button" class="btn danger" data-act="q-del">${ICON.trash()} Xóa khoản này</button>` : ''}
  </main>
  <div class="bottom-bar"><button type="button" class="btn" data-act="q-save">Lưu vào sổ quỹ</button></div>
</div>`;
}

function renderDotForm() {
  const f = qy.dotForm || (qy.dotForm = { name: `Giỗ tổ ${new Date().getFullYear() + 1}`, per: 200000, error: '' });
  return `<div class="screen no-nav" data-screen="quy-dot-form">
  ${backHeader('Tạo đợt đóng góp', '#/quyho')}
  <main class="body">
    <div class="field"><label class="lb" for="qd-name">Tên đợt</label><input id="qd-name" class="input" maxlength="50" value="${esc(f.name)}" data-qd="name"></div>
    <div class="field"><label class="lb" for="qd-per">Mức góp mỗi hộ</label><input id="qd-per" class="input" inputmode="numeric" value="${f.per ? Number(f.per).toLocaleString('vi-VN') : ''}" placeholder="Để trống nếu tùy tâm" data-qd="per"></div>
    ${amtChips(Number(f.per), 'data-qdamt')}
    <span class="small muted">Tạo xong, thêm tên các hộ (hoặc lấy nhanh từ gia phả) rồi đánh dấu hộ nào đã đóng.</span>
    ${f.error ? `<p class="err" role="alert">${esc(f.error)}</p>` : ''}
  </main>
  <div class="bottom-bar"><button type="button" class="btn" data-act="qd-save">Tạo đợt</button></div>
</div>`;
}

/** Người có thể là chủ hộ trong gia phả: còn sống, không phải dâu/rể, từ đời 2 trở đi hoặc đủ 18 tuổi */
function householdCandidates(st, d) {
  const y = new Date().getFullYear();
  const have = new Set((d.members || []).map((m) => m.name.trim().toLowerCase()));
  return st.people.filter((p) => !p.died && !p.spouseOf && (!p.born || y - Number(p.born) >= 18) && !have.has(p.name.trim().toLowerCase()));
}

function renderDot(id) {
  const st = getState();
  const d = st.quy.dots.find((x) => x.id === id);
  if (!d) return `<div class="screen" data-screen="quy-dot">${backHeader('Đợt đóng góp', '#/quyho')}<main class="body"><section class="card empty">Không tìm thấy đợt này</section></main></div>`;
  const t = dotStat(d);
  const cand = householdCandidates(st, d);
  return `<div class="screen" data-screen="quy-dot">
  ${backHeader(d.name, '#/quyho', `${d.per ? money(d.per) + '/hộ · ' : ''}${t.paid}/${t.total} hộ đã đóng`, `<button type="button" class="icon-btn plain" data-act="q-share" aria-label="Gửi tổng kết">${ICON.share(20)}</button>`)}
  <main class="body">
    <section class="hh-sum" aria-label="Tổng kết đợt"><div class="hh-box nhan"><span>Đã thu</span><b data-test="dot-collected">${money(t.collected)}</b><small>${t.paid} hộ đã đóng</small></div>
      <div class="hh-box di"><span>Còn thiếu</span><b>${money(Math.max(0, t.expected - t.collected))}</b><small>${t.total - t.paid} hộ chưa đóng</small></div></section>
    <form class="row" style="gap:8px" data-qadd><input id="qd-add" class="input grow" aria-label="Tên hộ" maxlength="50" placeholder="Thêm hộ: ví dụ Nhà chú Tư" autocomplete="off"><button type="submit" class="btn" style="width:auto;padding:0 18px;height:50px">Thêm</button></form>
    ${cand.length ? `<button type="button" class="chip" data-act="qd-fromgp" style="align-self:flex-start">${ICON.users(16)} Thêm ${cand.length} người từ gia phả</button>` : ''}
    ${d.members.length ? `<section class="card list" aria-label="Danh sách hộ">${d.members.map((m) => `<div class="item"><button type="button" class="tick ${m.paid ? 'on' : ''}" role="checkbox" aria-checked="${!!m.paid}" data-paid="${m.id}" aria-label="${esc(m.name)} đã đóng"></button>
        <span class="col grow"><span class="t">${esc(m.name)}</span><span class="s">${m.paid ? 'Đã đóng' + (m.at ? ' ' + m.at.split('-').reverse().join('/') : '') : 'Chưa đóng'}</span></span>
        <button type="button" class="icon-btn plain" data-rm="${m.id}" aria-label="Bỏ ${esc(m.name)} khỏi danh sách">${ICON.close(18)}</button></div>`).join('')}</section>`
      : `<section class="card empty">Chưa có hộ nào. Gõ tên rồi bấm Thêm.</section>`}
    <button type="button" class="btn danger ghost" data-act="qd-del">${ICON.trash()} Xóa đợt này</button>
  </main>
</div>`;
}

export function mountQuyho(root, rerender, params) {
  const id = params.id || '';
  const dot = id.startsWith('d-') ? id.slice(2) : '';
  root.querySelector('#quy-name')?.addEventListener('change', (e) => updateSettings({ quyName: e.target.value.trim() }));
  root.addEventListener('input', (e) => {
    const k = e.target.dataset?.q; const kd = e.target.dataset?.qd;
    if (k && qy.form) qy.form[k] = k === 'amount' ? digits(e.target.value) : e.target.value;
    if (kd && qy.dotForm) qy.dotForm[kd] = kd === 'per' ? digits(e.target.value) : e.target.value;
  });
  root.querySelector('[data-qadd]')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const inp = root.querySelector('#qd-add'); const name = inp.value.trim();
    if (!name) return;
    saveQuy((q) => ({ ...q, dots: q.dots.map((d) => (d.id === dot ? { ...d, members: [...d.members, { id: uid(), name, paid: false }] } : d)) }));
    requestAnimationFrame(() => document.querySelector('#qd-add')?.focus());
  });
  root.addEventListener('click', async (e) => {
    const tab = e.target.closest('[data-qtab]');
    if (tab) { qy.tab = tab.dataset.qtab; rerender(); return; }
    const dir = e.target.closest('[data-qdir]'); if (dir) { qy.form.dir = dir.dataset.qdir; rerender(); return; }
    const cat = e.target.closest('[data-qcat]'); if (cat) { qy.form.cat = cat.dataset.qcat; rerender(); return; }
    const qa = e.target.closest('[data-qamt]'); if (qa) { qy.form.amount = Number(qa.dataset.qamt); rerender(); return; }
    const qda = e.target.closest('[data-qdamt]'); if (qda) { qy.dotForm.per = Number(qda.dataset.qdamt); rerender(); return; }
    const pd = e.target.closest('[data-paid]');
    if (pd) {
      saveQuy((q) => ({ ...q, dots: q.dots.map((d) => (d.id === dot ? { ...d, members: d.members.map((m) => (m.id === pd.dataset.paid ? { ...m, paid: !m.paid, at: !m.paid ? isoToday() : '' } : m)) } : d)) }));
      return;
    }
    const rm = e.target.closest('[data-rm]');
    if (rm) { saveQuy((q) => ({ ...q, dots: q.dots.map((d) => (d.id === dot ? { ...d, members: d.members.filter((m) => m.id !== rm.dataset.rm) } : d)) })); return; }
    const act = e.target.closest('[data-act]')?.dataset.act;
    if (!act) return;
    const st = getState();
    if (act === 'q-save') {
      const f = qy.form;
      if (!f.amount) { f.error = 'Nhập số tiền'; rerender(); root.querySelector('#q-amount')?.focus(); return; }
      const rec = { id: f.id || uid(), dir: f.dir, cat: f.cat, who: (f.who || '').trim(), amount: Number(f.amount), date: f.date || isoToday(), note: (f.note || '').trim() };
      saveQuy((q) => ({ ...q, entries: q.entries.some((x) => x.id === rec.id) ? q.entries.map((x) => (x.id === rec.id ? rec : x)) : [...q.entries, rec] }));
      qy.form = null; qy.key = ''; qy.tab = 'so';
      toast(rec.dir === 'thu' ? 'Đã ghi khoản thu' : 'Đã ghi khoản chi');
      navDone('#/quyho');
      return;
    }
    if (act === 'q-del') {
      if (!(await confirmSheet({ title: 'Xóa khoản này khỏi sổ quỹ?', ok: 'Xóa', danger: true }))) return;
      const rid = qy.form.id;
      saveQuy((q) => ({ ...q, entries: q.entries.filter((x) => x.id !== rid) }));
      qy.form = null; qy.key = '';
      navDone('#/quyho');
      return;
    }
    if (act === 'qd-save') {
      const f = qy.dotForm;
      if (!f.name.trim()) { f.error = 'Đặt tên cho đợt'; rerender(); return; }
      const nd = { id: uid(), name: f.name.trim(), per: Number(f.per) || 0, members: [] };
      saveQuy((q) => ({ ...q, dots: [nd, ...q.dots] }));
      qy.dotForm = null; qy.tab = 'dot';
      go('#/quyho/d-' + nd.id, { replace: true });
      return;
    }
    if (act === 'qd-fromgp') {
      const d = st.quy.dots.find((x) => x.id === dot);
      const add = householdCandidates(st, d).map((p) => ({ id: uid(), name: p.name, paid: false }));
      saveQuy((q) => ({ ...q, dots: q.dots.map((x) => (x.id === dot ? { ...x, members: [...x.members, ...add] } : x)) }));
      toast(`Đã thêm ${add.length} người`);
      return;
    }
    if (act === 'qd-del') {
      const d = st.quy.dots.find((x) => x.id === dot);
      if (!(await confirmSheet({ title: `Xóa đợt “${d.name}”?`, message: 'Số tiền đã thu của đợt sẽ không còn tính vào quỹ.', ok: 'Xóa', danger: true }))) return;
      saveQuy((q) => ({ ...q, dots: q.dots.filter((x) => x.id !== dot) }));
      navDone('#/quyho');
      return;
    }
    if (act === 'q-share') shareText(quyReport(st.quy, quyName(st)), quyName(st));
  });
}
