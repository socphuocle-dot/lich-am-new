import { getState, updateSettings, exportData, importData, resetAll } from '../store.js';
import { CHANNEL, DONATE_ACCOUNTS, DONATE_NAME, APP_VERSION } from '../config.js';
import { esc, ICON, nav, sw, backHeader, toast } from './common.js';
import { getLastSchedule, isNative, ensurePermission } from '../notify.js';
import { confirmSheet } from './dialog.js';

/* ---------- Ủng hộ ---------- */
const dn = { acct: 0, tip: 1 };
const TIPS = [['Ly cà phê', '25.000đ'], ['Bữa sáng', '50.000đ'], ['Mâm cơm', '100.000đ']];

export function renderDonate() {
  const a = DONATE_ACCOUNTS[dn.acct];
  const payment = CHANNEL === 'direct'
    ? `<section class="card pad col" style="align-items:center;gap:12px" aria-label="Chuyển khoản ủng hộ">
        <div class="seg" role="group" aria-label="Chọn tài khoản" style="align-self:stretch">${DONATE_ACCOUNTS.map((x, i) => `<button type="button" data-acct="${i}" aria-pressed="${i === dn.acct}">${x.tab}</button>`).join('')}</div>
        <img class="qr" src="${a.qr}" alt="Mã QR chuyển khoản ${esc(a.tab)} của ${DONATE_NAME}" data-test="qr">
        <div class="col" style="align-items:center"><b style="letter-spacing:.02em">${DONATE_NAME}</b><span class="small muted">${a.bank} · ${a.number}</span></div>
        ${a.copy ? `<button type="button" class="chip" data-copy="${a.copy}">${ICON.copy()} Sao chép số tài khoản</button>` : ''}
        <span class="small muted center">Mở app ngân hàng hoặc MoMo, quét mã và nhập số tiền ${TIPS[dn.tip][1]}.<br>Nội dung gợi ý: <b style="color:var(--ink)">Ung ho Lich Am</b></span>
      </section>`
    : `<section class="card pad col" style="gap:8px"><b>Ủng hộ qua cửa hàng ứng dụng</b><span class="small muted">Tính năng ủng hộ trong app sẽ có ở bản cập nhật. Cảm ơn bạn đã dùng app!</span></section>`;
  return `<div class="screen" data-screen="donate">
  <header class="top"><h1 tabindex="-1">Ủng hộ tác giả</h1></header>
  <main class="body">
    <section class="card col" style="padding:16px;gap:12px">
      <b class="serif" style="font-size:1.2rem;line-height:1.35">Một người làm, miễn phí cho mọi nhà.</b>
      <span class="muted" style="font-size:.92rem;line-height:1.5">Nếu app giúp bạn không quên ngày giỗ, ngày rằm, một ly cà phê sẽ giúp mình có thêm động lực cập nhật.</span>
      ${['Không quảng cáo', 'Không thu thập dữ liệu, không cần tài khoản', 'Chạy hoàn toàn trên máy, không cần mạng'].map((t) => `<span class="check"><span style="color:var(--accent)">${ICON.check()}</span>${t}</span>`).join('')}
    </section>
    <div class="grid3" role="group" aria-label="Chọn mức ủng hộ">${TIPS.map(([l, p], i) => `<button type="button" class="tip" data-tip="${i}" aria-pressed="${i === dn.tip}"><span style="font-size:.9rem;font-weight:600">${l}</span><b>${p}</b></button>`).join('')}</div>
    ${payment}
    <p class="small muted center" style="margin:0">Cảm ơn bạn rất nhiều! 🙏</p>
  </main>
  ${nav('donate')}
</div>`;
}

export function mountDonate(root, rerender) {
  root.addEventListener('click', async (e) => {
    const a = e.target.closest('[data-acct]');
    if (a) { dn.acct = Number(a.dataset.acct); rerender(); return; }
    const t = e.target.closest('[data-tip]');
    if (t) { dn.tip = Number(t.dataset.tip); rerender(); return; }
    const c = e.target.closest('[data-copy]');
    if (c) {
      try { await navigator.clipboard.writeText(c.dataset.copy); toast('Đã sao chép số tài khoản'); }
      catch { toast('Số tài khoản: ' + c.dataset.copy); }
    }
  });
}

/* ---------- Cài đặt ---------- */
export function renderSettings() {
  const s = getState().settings;
  const seg = (key, opts) => `<div class="seg" role="group">${opts.map(([v, l]) => `<button type="button" data-seg="${key}" data-v="${v}" aria-pressed="${s[key] === v}">${l}</button>`).join('')}</div>`;
  const pending = getLastSchedule();
  const next = pending[0];
  return `<div class="screen no-nav" data-screen="settings">
  ${backHeader('Cài đặt', '#/today')}
  <main class="body">
    <h2 class="sec-title">Hiển thị</h2>
    <section class="card pad col" style="gap:14px">
      <div class="field"><span class="lb">Cỡ chữ</span>${seg('size', [[0, 'Vừa'], [1, 'Lớn'], [2, 'Rất lớn']])}</div>
      <div class="field"><span class="lb">Giao diện</span>${seg('theme', [['light', 'Sáng'], ['dark', 'Tối'], ['auto', 'Theo máy']])}</div>
      <div class="row"><div class="col grow"><span class="lb">Hiện tab Văn hóa</span><span class="small muted">Tử Vi, Thần số, Kinh Dịch</span></div>${sw(s.culture, 'Hiện tab Văn hóa', 'data-tg="culture"')}</div>
      <div class="row"><div class="col grow"><span class="lb">Tuần bắt đầu từ Thứ Hai</span><span class="small muted">Tắt để bắt đầu từ Chủ Nhật</span></div>${sw(s.monday, 'Tuần bắt đầu từ Thứ Hai', 'data-tg="monday"')}</div>
    </section>
    <h2 class="sec-title">Thông báo</h2>
    <section class="card list">
      <a class="item" href="#/reminders"><span class="grow t">Nhắc Mùng 1 &amp; Rằm</span><span class="small muted">${s.autoMoon ? 'Đang bật' : 'Đang tắt'}</span>${ICON.next(18)}</a>
      <div class="item"><label class="grow t" for="s-gt">Giờ nhắc giỗ mặc định</label><input id="s-gt" type="time" class="input" style="width:120px;height:42px" value="${s.gioTime}"></div>
      <div class="item"><span class="grow col"><span class="t">Thông báo đã lập</span><span class="s" data-test="pending">${pending.length} thông báo${next ? ` · gần nhất ${next.at.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}` : ''}</span></span>
        ${isNative() ? '<button type="button" class="chip" data-act="perm">Kiểm tra quyền</button>' : ''}</div>
    </section>
    <h2 class="sec-title">Widget màn hình chính</h2>
    <section class="card pad col" style="gap:12px">
      <div class="field"><label class="lb" for="s-cd">Widget đếm ngược tới</label>
        <select id="s-cd" class="input">${[['auto', 'Tự động (giỗ gần nhất hoặc Tết)'], ['tet', 'Tết Nguyên Đán'], ['ongtao', 'Ông Công Ông Táo'], ...getState().gios.map((g) => ['gio:' + g.id, 'Giỗ ' + g.name])]
          .map(([v, l]) => `<option value="${esc(v)}" ${s.widgetCountdown === v ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select></div>
      <details><summary class="lb" style="cursor:pointer">Cách thêm widget</summary>
        <ol class="small muted" style="margin:8px 0 0;padding-left:18px;line-height:1.6">
          <li><b>Android:</b> nhấn giữ chỗ trống trên màn hình chính → <b>Widget</b> → tìm <b>Lịch Âm</b> → kéo ra. Có 4 loại: Tờ lịch, Lịch &amp; sắp tới, Lịch tháng, Đếm ngược.</li>
          <li><b>iPhone:</b> nhấn giữ màn hình chính → nút <b>+</b> (hoặc Sửa → Thêm tiện ích) → <b>Lịch Âm</b>. Màn hình khóa: nhấn giữ màn hình khóa → Tùy chỉnh → Màn hình khóa → thêm tiện ích.</li>
          <li>Widget tự đổi ngày lúc nửa đêm, không cần mạng.</li>
        </ol></details>
    </section>
    <h2 class="sec-title">Dữ liệu · chỉ lưu trên máy</h2>
    <section class="card list">
      <button type="button" class="item" data-act="export">${ICON.down()}<span class="grow t">Sao lưu ra file</span></button>
      <label class="item" style="cursor:pointer">${ICON.up()}<span class="grow t">Khôi phục từ file</span><input type="file" accept="application/json,.json" class="sr" data-act="import"></label>
      <button type="button" class="item" data-act="reset" style="color:var(--accent)">${ICON.trash()}<span class="grow t">Xóa toàn bộ dữ liệu</span></button>
    </section>
    <h2 class="sec-title">Giới thiệu</h2>
    <section class="card list">
      <a class="item" href="#/donate"><span class="grow t">Ủng hộ tác giả</span>${ICON.next(18)}</a>
      <div class="item"><span class="grow t">Quyền riêng tư</span><span class="small muted">Không thu thập dữ liệu</span></div>
      <div class="item"><span class="grow t">Phiên bản</span><span class="small muted">${APP_VERSION}</span></div>
    </section>
  </main>
</div>`;
}

export function mountSettings(root, rerender) {
  root.addEventListener('click', async (e) => {
    const sg = e.target.closest('[data-seg]');
    if (sg) { const k = sg.dataset.seg; const v = k === 'size' ? Number(sg.dataset.v) : sg.dataset.v; updateSettings({ [k]: v }); return; }
    const tg = e.target.closest('[data-tg]');
    if (tg) { updateSettings({ [tg.dataset.tg]: !getState().settings[tg.dataset.tg] }); return; }
    const act = e.target.closest('[data-act]')?.dataset.act;
    if (act === 'export') {
      const blob = new Blob([exportData()], { type: 'application/json' });
      const name = `lich-am-sao-luu-${new Date().toISOString().slice(0, 10)}.json`;
      if (isNative() && navigator.share && navigator.canShare?.({ files: [new File([blob], name, { type: 'application/json' })] })) {
        try { await navigator.share({ files: [new File([blob], name, { type: 'application/json' })], title: 'Sao lưu Lịch Âm' }); return; } catch { /* người dùng hủy */ }
      }
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove();
      toast('Đã tạo file sao lưu');
    }
    if (act === 'reset') {
      const ok = await confirmSheet({ title: 'Xóa toàn bộ dữ liệu?', message: 'Tất cả ngày giỗ, hồ sơ và cài đặt sẽ bị xóa khỏi máy. Nên sao lưu ra file trước.', ok: 'Xóa tất cả', danger: true });
      if (ok) { resetAll(); toast('Đã xóa dữ liệu'); location.hash = '#/today'; }
    }
    if (act === 'perm') { const p = await ensurePermission(); toast(p === 'granted' ? 'Đã có quyền thông báo' : 'Chưa có quyền. Hãy bật trong Cài đặt của máy.'); }
  });
  root.addEventListener('change', async (e) => {
    if (e.target.id === 's-gt' && e.target.value) { updateSettings({ gioTime: e.target.value }); toast('Đã lưu'); }
    if (e.target.id === 's-cd') { updateSettings({ widgetCountdown: e.target.value }); toast('Đã cập nhật widget'); }
    if (e.target.dataset.act === 'import' && e.target.files[0]) {
      try { importData(await e.target.files[0].text()); toast('Đã khôi phục dữ liệu'); location.hash = '#/reminders'; }
      catch (err) { toast('Không đọc được file: ' + err.message); }
    }
  });
}
