import { done as navDone } from '../nav.js';
import { getState, setState } from '../store.js';
import { canChiYear, CHI, solarToLunar } from '../lib/lunar.js';
import { lifePath, nameNumbers, birthdayNumber, personalYear, birthChart, MEANINGS, YEAR_MEANINGS } from '../lib/numerology.js';
import { tossCoins, readCast, isYang, isMoving } from '../lib/iching.js';
import { giap, giapName } from './zodiac.js';
import { esc, ICON, backHeader, toast } from './common.js';

const HOURS = CHI.map((c, i) => { const s = (i * 2 + 23) % 24; return { i, label: `Giờ ${c} (${s}h–${(s + 2) % 24}h)` }; });
const hasProfile = () => { const p = getState().profile; return !!(p.dob && p.name); };
const initials = (n) => n.trim().split(/\s+/).slice(-2).map((w) => w[0]).join('').toUpperCase();

/* ---------- Hub ---------- */
export function renderCulture() {
  const p = getState().profile;
  const ok = hasProfile();
  let lp = '', tv = '';
  if (ok) {
    const [y, m, d] = p.dob.split('-').map(Number);
    lp = lifePath(d, m, y).value;
    const ty = canChiYear(solarToLunar(d, m, y).year);
    tv = `${d}/${m}/${y} · giờ ${CHI[p.hourChi]} · ${p.gender} · tuổi ${ty} (con ${giapName(ty)})`;
  }
  return `<div class="screen" data-screen="culture">
  ${backHeader('Văn hóa', '#/tienich', 'Tử Vi, Thần số, Kinh Dịch · tính ngay trên máy')}
  <main class="body" style="gap:12px">
    <a class="card pad row" href="#/profile" style="text-decoration:none;color:var(--ink)">
      ${ok ? `<span class="pastel butter giap-avatar">${giap(canChiYear(solarToLunar(...p.dob.split('-').map(Number).reverse()).year), 40)}</span>` : '<div class="tile ink" style="border-radius:24px;width:48px;height:48px"><b>?</b></div>'}
      <div class="col grow"><b>${ok ? esc(p.name) : 'Nhập ngày giờ sinh của bạn'}</b><span class="small muted">${ok ? tv : 'Cần cho lá số Tử Vi và Thần số học'}</span></div>
      <span class="chip" style="height:38px;display:inline-flex;align-items:center">${ok ? 'Sửa' : 'Nhập'}</span>
    </a>
    <a class="dark-card col" href="${ok ? '#/tuvi' : '#/profile'}" style="text-decoration:none;gap:8px">
      <div class="h2row" style="align-items:center"><span class="serif" style="font-size:1.25rem;font-weight:700">Lá số Tử Vi</span>${ICON.next(22)}</div>
      <span class="m small">12 cung, 14 chính tinh, Tứ hóa, đại hạn · lời bình từng cung</span>
    </a>
    <div class="grid2" style="gap:12px">
      <a class="card col" href="${ok ? '#/numerology' : '#/profile'}" style="text-decoration:none;color:var(--ink);padding:14px;gap:8px;min-height:150px">
        <b>Thần số học</b><span class="serif" style="font-size:3rem;font-weight:700;color:var(--accent);line-height:1">${lp || '?'}</span>
        <span class="small muted">${lp ? 'Số chủ đạo · ' + MEANINGS[lp].title.split(',')[0] : 'Nhập ngày sinh để tính'}</span></a>
      <a class="card col" href="#/iching" style="text-decoration:none;color:var(--ink);padding:14px;gap:8px;min-height:150px">
        <b>Kinh Dịch</b>
        <div class="col" style="gap:4px;width:56px;padding:4px 0">${[1, 0, 1, 1, 0, 1].map((b, i) => (b ? `<i style="height:6px;border-radius:2px;background:${i === 3 ? 'var(--accent)' : 'var(--ink)'}"></i>` : '<i style="height:6px;display:flex;gap:8px"><i style="flex:1;background:var(--ink);border-radius:2px"></i><i style="flex:1;background:var(--ink);border-radius:2px"></i></i>')).join('')}</div>
        <span class="small muted">Tĩnh tâm, gieo một quẻ</span></a>
    </div>
    <div class="row" style="background:var(--soft);border:1px dashed var(--field);border-radius:18px;padding:12px 14px">
      <span class="muted">${ICON.face()}</span><div class="col"><b style="font-size:.9rem">Xem tướng mặt · Tam Đình</b><span class="small muted">Sắp có ở bản sau</span></div>
    </div>
    <p class="small muted center" style="margin:0;line-height:1.5">Nội dung mang tính tham khảo văn hóa và giải trí,<br>không thay cho lời khuyên chuyên môn.</p>
  </main>
</div>`;
}

/* ---------- Hồ sơ ---------- */
export function renderProfile() {
  const p = getState().profile;
  return `<div class="screen no-nav" data-screen="profile">
  ${backHeader('Hồ sơ ngày sinh', '#/culture', 'Chỉ lưu trên máy của bạn')}
  <main class="body" style="gap:16px">
    <div class="field"><label class="lb" for="p-name">Họ và tên</label><input id="p-name" class="input" maxlength="60" value="${esc(p.name)}" placeholder="Ví dụ: Nguyễn Minh Khôi" autocomplete="name"></div>
    <div class="field"><label class="lb" for="p-dob">Ngày sinh (dương lịch)</label><input id="p-dob" class="input" type="date" min="1900-01-01" max="2100-12-31" value="${esc(p.dob)}"></div>
    <div class="field"><label class="lb" for="p-hour">Giờ sinh</label><select id="p-hour" class="input">${HOURS.map((h) => `<option value="${h.i}" ${Number(p.hourChi) === h.i ? 'selected' : ''}>${h.label}</option>`).join('')}</select></div>
    <div class="field" role="group" aria-label="Giới tính"><span class="lb">Giới tính</span>
      <div class="seg"><button type="button" data-g="Nam" aria-pressed="${p.gender === 'Nam'}">Nam</button><button type="button" data-g="Nữ" aria-pressed="${p.gender === 'Nữ'}">Nữ</button></div></div>
    <p class="err" role="alert" id="p-err"></p>
  </main>
  <div class="bottom-bar"><button type="button" class="btn" data-act="save">Lưu hồ sơ</button></div>
</div>`;
}

export function mountProfile(root) {
  let gender = getState().profile.gender;
  root.addEventListener('click', (e) => {
    const g = e.target.closest('[data-g]');
    if (g) { gender = g.dataset.g; root.querySelectorAll('[data-g]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.g === gender)); return; }
    if (e.target.closest('[data-act="save"]')) {
      const name = root.querySelector('#p-name').value.trim();
      const dob = root.querySelector('#p-dob').value;
      const err = root.querySelector('#p-err');
      if (!name) { err.textContent = 'Vui lòng nhập họ tên'; return; }
      const y = Number((dob || '').slice(0, 4));
      if (!dob || y < 1900 || y > 2100) { err.textContent = 'Vui lòng chọn ngày sinh hợp lệ (1900–2100)'; return; }
      setState((s) => ({ ...s, profile: { name, dob, hourChi: Number(root.querySelector('#p-hour').value), gender } }));
      toast('Đã lưu hồ sơ');
      navDone('#/culture');
    }
  });
}

/* ---------- Tử Vi ---------- */
const tvUi = { picked: null, key: '' };
let tuviMod = null;
export async function loadTuvi() {
  if (!tuviMod) tuviMod = await import('../lib/tuvi.js');
  return tuviMod;
}

export function renderTuvi() {
  if (!hasProfile()) return renderProfile();
  const p = getState().profile;
  if (!tuviMod) return `<div class="screen no-nav">${backHeader('Lá số Tử Vi', '#/culture')}<main class="body"><div class="empty">Đang an sao…</div></main></div>`;
  const key = `${p.dob}|${p.hourChi}|${p.gender}`;
  const chart = tuviMod.buildChart({ dob: p.dob, hourChi: Number(p.hourChi), gender: p.gender });
  if (tvUi.key !== key) { tvUi.key = key; tvUi.picked = chart.menhBranch; }
  const sel = chart.palaces.find((x) => x.branch === tvUi.picked) || chart.palaces[0];
  const cells = chart.palaces.map((x) => `<button type="button" class="palace ${x.name === 'Mệnh' ? 'menh' : ''}" style="grid-row:${x.pos[0]};grid-column:${x.pos[1]}" data-branch="${x.branch}" aria-pressed="${x.branch === sel.branch}" aria-label="Cung ${x.name} tại ${x.branch}">
    <span class="pn"><b>${x.name}${x.isBody ? ' · Thân' : ''}</b><span>${x.branch}</span></span>
    <span class="mj">${x.majors.length ? x.majors.map((m) => m.name + (m.hoa ? ' ·' + m.hoa.replace('Hóa ', '') : '')).join('<br>') : '<i>Vô chính diệu</i>'}</span>
    <span class="mn">${x.minors.slice(0, 3).map((s) => s.split(' (')[0]).join(', ')}</span>
    <span class="dv">${x.decadal}</span></button>`).join('');
  return `<div class="screen no-nav" data-screen="tuvi">
  ${backHeader('Lá số Tử Vi', '#/culture', 'Chạm vào một cung để xem luận giải')}
  <main class="body tight" style="gap:10px">
    <div class="card tv-grid" data-test="tuvi-grid">${cells}
      <div class="tv-center"><span style="letter-spacing:.12em;color:var(--on-dark-muted)">THIÊN BÀN</span>
        <b class="serif" style="font-size:.95rem">${esc(p.name)}</b><span>${chart.birth} · âm ${esc(chart.lunarText)}</span>
        <span>Giờ ${CHI[p.hourChi]} · ${chart.yinYang}</span><span>${esc(chart.five)}</span>
        <span>Mệnh chủ ${esc(chart.soul)} · Thân chủ ${esc(chart.body)}</span>
        ${chart.menhBranch === chart.bodyBranch ? '<span class="pill" style="background:var(--accent);color:var(--on-accent);margin-top:3px">Thân cư Mệnh</span>' : ''}</div>
    </div>
    <section class="card pad col" style="gap:10px" aria-live="polite">
      <div class="h2row"><span class="serif" style="font-size:1.1rem;font-weight:700">Cung ${sel.name} <span class="muted small">· ${sel.stem} ${sel.branch}</span></span><span class="small muted">Đại hạn ${sel.decadal}</span></div>
      <div class="chips" style="gap:6px">${sel.majors.map((m) => `<span class="tag">${m.name}${m.brightness ? ' (' + m.brightness + ')' : ''}${m.hoa ? ' · ' + m.hoa : ''}</span>`).join('')}${sel.minors.map((s) => `<span class="tag n">${esc(s)}</span>`).join('')}</div>
      <p style="margin:0;line-height:1.55;font-size:.92rem">${esc(tuviMod.palaceText(sel))}</p>
      <span class="small muted">Lời bình mang tính tham khảo · tính bằng thư viện iztro trên máy</span>
    </section>
  </main>
</div>`;
}

export function mountTuvi(root, rerender) {
  if (!tuviMod && hasProfile()) loadTuvi().then(rerender);
  root.addEventListener('click', (e) => {
    const b = e.target.closest('[data-branch]');
    if (b) { tvUi.picked = b.dataset.branch; rerender(); }
  });
}

/* ---------- Thần số học ---------- */
const nsUi = { picked: 0 };
export function renderNumerology() {
  if (!hasProfile()) return renderProfile();
  const p = getState().profile;
  const [y, m, d] = p.dob.split('-').map(Number);
  const year = new Date().getFullYear();
  const lp = lifePath(d, m, y);
  const nn = nameNumbers(p.name);
  const py = personalYear(d, m, year);
  const N = [
    { n: lp.value, short: 'Chủ đạo', kind: 'SỐ CHỦ ĐẠO', how: `${lp.digits.split('').join('+')} = ${lp.total} → ${lp.value}`, ...MEANINGS[lp.value] },
    { n: nn.expression, short: 'Sứ mệnh', kind: 'SỐ SỨ MỆNH (TỪ TÊN)', how: `Tổng chữ cái ${nn.letters} = ${nn.totals.all} → ${nn.expression}`, ...MEANINGS[nn.expression] },
    { n: nn.soul, short: 'Linh hồn', kind: 'SỐ LINH HỒN (NGUYÊN ÂM)', how: `Tổng nguyên âm = ${nn.totals.v} → ${nn.soul}`, ...MEANINGS[nn.soul] },
    { n: nn.personality, short: 'Nhân cách', kind: 'SỐ NHÂN CÁCH (PHỤ ÂM)', how: `Tổng phụ âm = ${nn.totals.k} → ${nn.personality}`, ...MEANINGS[nn.personality] },
    { n: birthdayNumber(d), short: 'Ngày sinh', kind: 'SỐ NGÀY SINH', how: `Ngày ${d} → ${birthdayNumber(d)}`, ...MEANINGS[birthdayNumber(d)] },
    { n: py, short: 'Năm ' + year, kind: 'NĂM CÁ NHÂN ' + year, how: `${d} + ${m} + ${year} → ${py}`, title: 'Năm cá nhân số ' + py, text: YEAR_MEANINGS[py] }
  ].map((x) => ({ ...x, title: x.title || '', text: x.text || '' }));
  const sel = N[nsUi.picked] || N[0];
  const chart = birthChart(d, m, y);
  return `<div class="screen no-nav" data-screen="numerology">
  ${backHeader('Thần số học', '#/culture', `${p.name} · ${d}/${m}/${y}`)}
  <main class="body" style="gap:12px">
    <section class="card row" style="padding:16px;gap:16px" aria-live="polite">
      <div style="width:92px;height:92px;border-radius:46px;border:3px solid var(--accent);display:flex;align-items:center;justify-content:center;flex-shrink:0"><span class="serif" style="font-size:3.2rem;font-weight:700;color:var(--accent);line-height:1" data-test="num-main">${sel.n}</span></div>
      <div class="col" style="gap:4px"><span class="small muted" style="font-weight:700;letter-spacing:.06em">${sel.kind}</span><b class="serif" style="font-size:1.15rem;line-height:1.25">${esc(sel.title)}</b><span class="small muted">${esc(sel.how)}</span></div>
    </section>
    <p class="card pad" style="margin:0;line-height:1.55;font-size:.92rem">${esc(sel.text)}</p>
    <div class="grid3" role="group" aria-label="Các chỉ số">${N.map((x, i) => `<button type="button" class="num-btn" data-i="${i}" aria-pressed="${i === nsUi.picked}"><b>${x.n}</b><span>${x.short}</span></button>`).join('')}</div>
    <section class="card pad row" style="gap:14px" aria-label="Biểu đồ ngày sinh">
      <div class="grid3" style="gap:4px;width:150px;flex-shrink:0">${chart.map((c) => `<div class="bc ${c.count ? 'has' : ''}">${c.count ? String(c.n).repeat(c.count) : ''}</div>`).join('')}</div>
      <div class="col" style="gap:4px"><b>Biểu đồ ngày sinh</b><span class="small muted" style="line-height:1.45">Các số có trong ngày sinh. Ô trống là phần nên rèn luyện thêm.</span></div>
    </section>
  </main>
</div>`;
}

export function mountNumerology(root, rerender) {
  root.addEventListener('click', (e) => {
    const b = e.target.closest('[data-i]');
    if (b) { nsUi.picked = Number(b.dataset.i); rerender(); }
  });
}

/* ---------- Kinh Dịch ---------- */
const kd = { lines: [], coins: [3, 2, 3], q: '', flip: false };
export function renderIching() {
  const done = kd.lines.length === 6;
  const res = done ? readCast(kd.lines) : null;
  const rows = [];
  for (let i = 5; i >= 0; i--) {
    const v = kd.lines[i];
    const mv = v !== undefined && isMoving(v);
    const shape = v === undefined ? '<span class="slot"></span>' : isYang(v) ? '<span class="bar"></span>' : '<span class="yin"><i></i><i></i></span>';
    rows.push(`<div class="hex-line ${mv ? 'mv' : ''}"><span class="no">H${i + 1}</span>${shape}<span class="mvl">${mv ? 'động' : ''}</span></div>`);
  }
  return `<div class="screen no-nav" data-screen="iching">
  ${backHeader('Gieo quẻ Kinh Dịch', '#/culture', '3 đồng xu · gieo 6 lần, từ dưới lên')}
  <main class="body" style="gap:12px">
    <div class="field"><label class="lb" for="kd-q">Điều bạn muốn hỏi</label><input id="kd-q" class="input" maxlength="120" value="${esc(kd.q)}" placeholder="Ví dụ: Có nên đổi việc trong năm nay?"></div>
    <section class="card row" style="padding:16px;gap:16px" aria-label="Quẻ đang gieo">
      <div class="col grow" style="gap:7px" data-test="lines">${rows.join('')}</div>
      <div class="col" style="width:150px;align-items:center;gap:8px">
        <div class="row" style="gap:3px">${kd.coins.map((c) => `<span class="coin ${c === 2 ? 's' : ''} ${kd.flip ? 'flip' : ''}">${c === 3 ? 'Ngửa' : 'Sấp'}</span>`).join('')}</div>
        <span class="small muted center" data-test="status">${done ? 'Đã đủ 6 hào' : `Đã gieo ${kd.lines.length}/6 hào`}</span>
      </div>
    </section>
    <div class="grid2"><button type="button" class="btn ghost" data-act="one">${done ? 'Gieo lại' : 'Gieo từng hào'}</button><button type="button" class="btn" data-act="all">Gieo nhanh 6 hào</button></div>
    ${res ? `<section class="dark-card col" style="gap:12px" aria-live="polite" data-test="result">
      <div class="col"><span class="m small" style="letter-spacing:.06em">QUẺ CHỦ · SỐ ${res.main.no}</span><span class="serif" style="font-size:1.4rem;font-weight:700">${res.main.name}</span>
        <span class="m small">Thượng ${res.main.upper} · Hạ ${res.main.lower}</span></div>
      <p style="margin:0;line-height:1.5">${res.main.text}</p>
      <div class="row" style="gap:8px;align-items:stretch">
        <div class="col" style="flex:1;background:var(--dark2);border-radius:12px;padding:10px"><span class="m small">Hào động</span><b>${res.moving.length ? 'Hào ' + res.moving.join(', ') : 'Không có'}</b></div>
        <div class="col" style="flex:2;background:var(--dark2);border-radius:12px;padding:10px"><span class="m small">Quẻ biến</span><b>${res.changed ? res.changed.no + ' · ' + res.changed.name : 'Quẻ tĩnh, không biến'}</b></div>
      </div>
      ${res.changed ? `<p class="m small" style="margin:0;line-height:1.5">Quẻ biến cho thấy xu hướng về sau: ${res.changed.text}</p>` : ''}
    </section>` : ''}
    <span class="small muted center">Để tham khảo, chiêm nghiệm · không thay cho quyết định của bạn</span>
  </main>
</div>`;
}

export function mountIching(root, rerender) {
  root.querySelector('#kd-q')?.addEventListener('input', (e) => { kd.q = e.target.value; });
  root.addEventListener('click', (e) => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    if (b.dataset.act === 'one') {
      if (kd.lines.length >= 6) kd.lines = [];
      const t = tossCoins();
      kd.lines = [...kd.lines, t.value];
      kd.coins = t.coins;
    } else {
      const ls = [];
      let t;
      for (let i = 0; i < 6; i++) { t = tossCoins(); ls.push(t.value); }
      kd.lines = ls;
      kd.coins = t.coins;
    }
    kd.flip = true;
    rerender();
    setTimeout(() => { kd.flip = false; }, 600);
  });
}
