import { Capacitor } from '@capacitor/core';
import { isAbroad, deviceZone, diffText, vnMoment } from '../lib/tz.js';
import { exportFull, restoreFull, sizeText } from '../backup.js';
import { NEEDS } from './needs.js';
import { logEvent } from '../errlog.js';
import { resetTo } from '../nav.js';
import { getState, updateSettings, exportData, importData, resetAll, storageInfo } from '../store.js';
import { CHANNEL, DONATE_ACCOUNTS, DONATE_NAME, APP_VERSION, WEB_URL, CONTACT_PHONE, ZALO_URL, PLAY_ID, APPSTORE_ID } from '../config.js';
import { updateSupported, checkUpdate, cmpVersion } from '../update.js';
import { mascot, mascotName, MASCOTS } from './art.js';
import { esc, ICON, sw, backHeader, toast, timeSelect } from './common.js';
import { titleOf } from '../lib/events.js';
import { getLastSchedule, isNative, ensurePermission } from '../notify.js';
import { confirmSheet } from './dialog.js';
import { calendarPermission, writableCalendars, syncCalendar, removeCalendarEvents, backupToCloud, daysSinceBackup } from '../sync.js';
import { setState } from '../store.js';

let calList = null; // danh sách lịch máy (nạp khi bật đồng bộ)
const fmtTime = (iso) => new Date(iso).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });

/* ---------- Ủng hộ ---------- */
const dn = { acct: 0, tip: 1 };
const TIPS = [['Ly cà phê', '25.000đ'], ['Bữa sáng', '50.000đ'], ['Mâm cơm', '100.000đ']];

/** Link mở trang đánh giá trên cửa hàng của máy đang dùng ('' nếu chưa có) */
function rateUrl() {
  const pf = Capacitor.getPlatform();
  if (pf === 'ios') return APPSTORE_ID ? `https://apps.apple.com/app/id${APPSTORE_ID}?action=write-review` : '';
  return `https://play.google.com/store/apps/details?id=${PLAY_ID}`;
}

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
    : `<section class="card pad col" style="gap:10px"><b>Cảm ơn bạn đã dùng app!</b><span class="small muted" style="line-height:1.6">Nếu thấy hữu ích, hãy đánh giá 5 sao trên cửa hàng và giới thiệu cho người thân, bạn bè. Đó là sự ủng hộ lớn nhất để app luôn miễn phí, không quảng cáo.</span>
        ${rateUrl() ? `<a class="btn" style="height:50px" href="${rateUrl()}" rel="noopener" data-test="rate">★ Đánh giá 5 sao</a>` : ''}
        <button type="button" class="btn ghost" style="height:50px" data-act="share-app">${ICON.share(18)} Giới thiệu app cho người thân</button></section>`;
  return `<div class="screen" data-screen="donate">
  ${backHeader(CHANNEL === 'direct' ? 'Ủng hộ tác giả' : 'Đánh giá app', '#/canhan', '', `<span class="donate-m">${mascot('cake', 64, mascotName() + ' cảm ơn bạn')}</span>`)}
  <main class="body">
    <section class="card col" style="padding:16px;gap:12px">
      <b class="serif" style="font-size:1.2rem;line-height:1.35">Một người làm, miễn phí cho mọi nhà.</b>
      <span class="muted" style="font-size:.92rem;line-height:1.5">${CHANNEL === 'direct' ? 'Nếu app giúp bạn không quên ngày giỗ, ngày rằm, một ly cà phê sẽ giúp mình có thêm động lực cập nhật.' : 'Nếu app giúp bạn không quên ngày giỗ, ngày rằm, một lời đánh giá sẽ giúp mình có thêm động lực cập nhật.'}</span>
      ${['Không quảng cáo', 'Không thu thập dữ liệu, không cần tài khoản', 'Chạy hoàn toàn trên máy, không cần mạng'].map((t) => `<span class="check"><span style="color:var(--accent)">${ICON.check()}</span>${t}</span>`).join('')}
    </section>
    ${CHANNEL !== 'direct' ? '' : `<div class="grid3" role="group" aria-label="Chọn mức ủng hộ">${TIPS.map(([l, p], i) => `<button type="button" class="tip" data-tip="${i}" aria-pressed="${i === dn.tip}"><span style="font-size:.9rem;font-weight:600">${l}</span><b>${p}</b></button>`).join('')}</div>`}
    ${payment}
    <p class="small muted center" style="margin:0">Cảm ơn bạn rất nhiều! 🙏</p>
    <p class="small muted center" style="margin:4px 0 0">Liên hệ tác giả: <a class="link" href="tel:${CONTACT_PHONE}">${CONTACT_PHONE.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3')}</a> · <a class="link" href="${ZALO_URL}" ${isNative() ? '' : 'target="_blank"'} rel="noopener">Zalo</a></p>
  </main>
</div>`;
}

export function mountDonate(root, rerender) {
  root.addEventListener('click', async (e) => {
    const a = e.target.closest('[data-acct]');
    if (a) { dn.acct = Number(a.dataset.acct); rerender(); return; }
    const t = e.target.closest('[data-tip]');
    if (t) { dn.tip = Number(t.dataset.tip); rerender(); return; }
    if (e.target.closest('[data-act="share-app"]')) {
      const text = 'App Lịch Âm & Nhắc Giỗ: nhắc ngày giỗ, rằm, văn khấn, gia phả — miễn phí, không quảng cáo.';
      const url = Capacitor.getPlatform() === 'ios' ? (APPSTORE_ID ? `https://apps.apple.com/app/id${APPSTORE_ID}` : WEB_URL) : `https://play.google.com/store/apps/details?id=${PLAY_ID}`;
      try {
        if (Capacitor.isNativePlatform()) { const { Share } = await import('@capacitor/share'); await Share.share({ title: 'Lịch Âm & Nhắc Giỗ', text, url, dialogTitle: 'Giới thiệu qua…' }); }
        else if (navigator.share) await navigator.share({ title: 'Lịch Âm & Nhắc Giỗ', text, url });
        else { await navigator.clipboard.writeText(text + ' ' + url); toast('Đã sao chép lời giới thiệu'); }
      } catch { /* người dùng hủy */ }
      return;
    }
    const c = e.target.closest('[data-copy]');
    if (c) {
      try { await navigator.clipboard.writeText(c.dataset.copy); toast('Đã sao chép số tài khoản'); }
      catch { toast('Số tài khoản: ' + c.dataset.copy); }
    }
  });
}

/* ---------- Cài đặt ---------- */
const vnExample = () => { const n = new Date(); const d = vnMoment(n.getFullYear(), n.getMonth() + 1, n.getDate(), 7, 0); return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + (d.getDate() !== n.getDate() ? (d < n ? ' hôm trước' : ' hôm sau') : ''); };

const needsText = (s) => (Array.isArray(s.needs) && s.needs.length ? NEEDS.filter((n) => s.needs.includes(n[0])).map((n) => n[1]).join(' · ') : 'Chọn để app ghim sẵn tiện ích phù hợp');

function mediaCount() {
  const st = getState();
  const photos = st.gios.reduce((a, g) => a + (g.memo?.photo ? 1 : 0) + (g.memo?.gPhoto ? 1 : 0), 0);
  const voices = Object.keys(st.voices || {}).length + st.people.reduce((a, p) => a + (p.recs || []).length, 0);
  return { photos, voices, total: photos + voices };
}

function storageCard() {
  const i = storageInfo();
  const pct = Math.min(100, Math.round(i.ratio * 100));
  const warn = i.failed || pct >= 80;
  return `<section class="card pad col store-card${warn ? ' warn' : ''}" style="gap:8px" aria-label="Dung lượng dữ liệu">
    <div class="row"><span class="grow lb">Bộ nhớ dữ liệu chữ</span><b data-test="store-pct">${pct}%</b></div>
    <span class="store-bar" aria-hidden="true"><i style="width:${Math.max(2, pct)}%"></i></span>
    <span class="small muted">${sizeText(i.used)} / khoảng 5 MB. Ảnh và bản ghi âm lưu riêng, không tính vào đây.</span>
    ${i.failed ? '<p class="err" role="alert">Lần lưu gần nhất thất bại vì bộ nhớ đầy. Hãy sao lưu ra file ngay, rồi xóa bớt ghi chú dài, văn khấn tự soạn hoặc các ngày cũ không dùng.</p>'
      : pct >= 80 ? '<p class="err" role="alert">Bộ nhớ sắp đầy. Nên sao lưu ra file và dọn bớt dữ liệu cũ.</p>' : ''}
  </section>`;
}

export function renderSettings() {
  const s = getState().settings;
  const by = Number(String(getState().profile.dob || '').slice(0, 4));
  const myChi = by ? ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'][(((by + 8) % 12) + 12) % 12] : '';
  const seg = (key, opts) => `<div class="seg" role="group">${opts.map(([v, l]) => `<button type="button" data-seg="${key}" data-v="${v}" aria-pressed="${s[key] === v}">${l}</button>`).join('')}</div>`;
  const pending = getLastSchedule();
  const next = pending[0];
  return `<div class="screen no-nav" data-screen="settings">
  ${backHeader('Cài đặt', '#/canhan')}
  <main class="body">
    <h2 class="sec-title">Hiển thị</h2>
    <section class="card pad col" style="gap:14px">
      <div class="field"><span class="lb">Cỡ chữ</span>${seg('size', [[0, 'Vừa'], [1, 'Lớn'], [2, 'Rất lớn']])}</div>
      <div class="field"><span class="lb">Giao diện</span>${seg('theme', [['light', 'Sáng'], ['dark', 'Tối'], ['auto', 'Theo máy']])}</div>
      <div class="field"><span class="lb">Linh vật · 12 con giáp</span><div class="mascot-pick" role="radiogroup" aria-label="Chọn linh vật">${Object.entries(MASCOTS).map(([k, m]) => `${k === 'tho' ? '</div><span class="lb" style="margin-top:6px">Linh vật khác</span><div class="mascot-pick" role="radiogroup" aria-label="Linh vật khác">' : ''}<button type="button" role="radio" class="mp ${(s.mascot || 'tho') === k ? 'on' : ''}" aria-checked="${(s.mascot || 'tho') === k}" data-mascot="${k}">${m.chi && m.chi === myChi ? '<i class="mp-me">tuổi bạn</i>' : ''}${mascot('wave', 64, m.name, k)}<span>${m.chi ? m.chi + ' · ' : ''}${m.pick}</span></button>`).join('')}</div>
        <span class="small muted">Đổi linh vật trên mọi màn hình và widget.</span></div>
      <div class="row"><div class="col grow"><span class="lb">Chế độ đơn giản</span><span class="small muted">Chữ to, màn Tiện ích chỉ hiện các việc bạn hay làm</span></div>${sw(!!s.simple, 'Chế độ đơn giản', 'data-tg="simple"')}</div>
      <a class="row link-row" href="#/nhucau" style="text-decoration:none;color:var(--ink)"><div class="col grow"><span class="lb">Việc bạn hay làm</span><span class="small muted">${needsText(s)}</span></div>${ICON.next(18)}</a>
      <div class="row"><div class="col grow"><span class="lb">Hiện tab Văn hóa</span><span class="small muted">Tử Vi, Thần số, Kinh Dịch</span></div>${sw(s.culture, 'Hiện tab Văn hóa', 'data-tg="culture"')}</div>
      <div class="row"><div class="col grow"><span class="lb">Tuần bắt đầu từ Thứ Hai</span><span class="small muted">Tắt để bắt đầu từ Chủ Nhật</span></div>${sw(s.monday, 'Tuần bắt đầu từ Thứ Hai', 'data-tg="monday"')}</div>
    </section>
    <h2 class="sec-title">Thông báo</h2>
    <section class="card list">
      <a class="item" href="#/reminders"><span class="grow t">Nhắc Mùng 1 &amp; Rằm</span><span class="small muted">${s.autoMoon ? 'Đang bật' : 'Đang tắt'}</span>${ICON.next(18)}</a>
      <div class="item"><span class="grow col"><span class="t">Đến giờ cúng tự đọc văn khấn</span><span class="s">Bấm thông báo đúng ngày cúng là mở bài và đọc to — giọng người nhà nếu đã ghi âm</span></span>${sw(s.readOnTap !== false, 'Đến giờ cúng tự đọc văn khấn', 'data-tg2="readOnTap"')}</div>
      <div class="item"><label class="grow t" for="s-gt">Giờ nhắc giỗ mặc định</label>${timeSelect(s.gioTime, 'id="s-gt"', 'width:104px;height:42px')}</div>
      <div class="item"><span class="grow col"><span class="t">Thông báo đã lập</span><span class="s" data-test="pending">${pending.length} thông báo${next ? ` · gần nhất ${next.at.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}` : ''}</span></span>
        ${isNative() ? '<button type="button" class="chip" data-act="perm">Kiểm tra quyền</button>' : ''}</div>
    </section>
    <h2 class="sec-title">Người ở nước ngoài</h2>
    <section class="card pad col" style="gap:10px" id="s-abroad">
      <div class="row"><div class="col grow"><span class="lb">Nhắc theo giờ Việt Nam</span><span class="small muted">Giờ nhắc giỗ, rằm, mùng một tính theo giờ ở quê — để thắp hương, gọi về nhà cùng lúc với cả nhà.</span></div>${sw(!!s.vnTime, 'Nhắc theo giờ Việt Nam', 'data-tg="vnTime"')}</div>
      <span class="small ${isAbroad() ? '' : 'muted'}" data-test="tz">Máy đang ở múi giờ <b>${esc(deviceZone())}</b> — ${diffText()}.${isAbroad() && s.vnTime ? ` Ví dụ: nhắc 7:00 sáng ở Việt Nam sẽ kêu lúc <b>${vnExample()}</b> giờ của bạn.` : ''}</span>
    </section>
    <h2 class="sec-title">Widget màn hình chính</h2>
    <section class="card pad col" style="gap:12px">
      <div class="field"><label class="lb" for="s-cd">Widget đếm ngược tới <span class="small muted">(mặc định)</span></label>
        <select id="s-cd" class="input">${[['auto', 'Tự động (giỗ gần nhất hoặc Tết)'], ['tet', 'Tết Nguyên Đán'], ['ongtao', 'Ông Công Ông Táo'], ...getState().gios.map((g) => ['gio:' + g.id, titleOf(g)])]
          .map(([v, l]) => `<option value="${esc(v)}" ${s.widgetCountdown === v ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select></div>
      <div class="field"><span class="lb" id="s-cs-l">Kiểu widget Đồng hồ &amp; lịch âm</span>
        <div class="seg" role="group" aria-labelledby="s-cs-l">${[['giay', 'Giấy · ô ngày đỏ'], ['sonmai', 'Sơn mài · dải đỏ']].map(([v, l]) => `<button type="button" data-seg="clockStyle" data-v="${v}" aria-pressed="${(s.clockStyle || 'giay') === v}">${l}</button>`).join('')}</div>
        <span class="small muted">Áp dụng cho widget có đồng hồ tự chạy (Android và iPhone).</span></div>
      <p class="small muted" style="margin:0">Android: mỗi widget Đếm ngược và Đồng hồ còn chọn được nội dung riêng — khi thêm widget, hoặc nhấn giữ widget → <b>Cấu hình lại</b> (biểu tượng bút chì).</p>
      <details><summary class="lb" style="cursor:pointer">Cách thêm widget</summary>
        <ol class="small muted" style="margin:8px 0 0;padding-left:18px;line-height:1.6">
          <li><b>Android:</b> nhấn giữ chỗ trống trên màn hình chính → <b>Widget</b> → tìm <b>Lịch Âm</b> → kéo ra. Có 7 loại: Ngày hôm nay, Tờ lịch, Lịch &amp; sắp tới, Đồng hồ &amp; lịch âm, Lịch tháng, Đếm ngược, Lời nhắc hôm nay. Kéo to nhỏ thoải mái — widget tự đổi bố cục cho vừa (ví dụ Sắp tới: 4×1 một việc, 4×2 ba việc, 4×3 sáu việc).</li>
          <li><b>iPhone:</b> nhấn giữ màn hình chính → nút <b>+</b> (hoặc Sửa → Thêm tiện ích) → <b>Lịch Âm</b>. Màn hình khóa: nhấn giữ màn hình khóa → Tùy chỉnh → Màn hình khóa → thêm tiện ích.</li>
          <li>Widget tự đổi ngày lúc nửa đêm, không cần mạng. Đồng hồ là đồng hồ của máy nên luôn đúng giờ; bấm vào giờ để mở báo thức.</li>
        </ol></details>
    </section>
    ${syncSection()}
    <h2 class="sec-title" id="s-data">Dữ liệu · chỉ lưu trên máy</h2>
    ${storageCard()}
    <section class="card list">
      <button type="button" class="item" data-act="export">${ICON.down()}<span class="grow col"><span class="t">Sao lưu ra file</span><span class="s">Gồm cả ảnh và bản ghi âm${mediaCount().total ? ` (${mediaCount().photos} ảnh, ${mediaCount().voices} bản ghi)` : ''}</span></span></button>
      <label class="item" style="cursor:pointer">${ICON.up()}<span class="grow t">Khôi phục từ file</span><input type="file" accept="application/json,.json" class="sr" data-act="import"></label>
      <button type="button" class="item" data-act="reset" style="color:var(--accent)">${ICON.trash()}<span class="grow t">Xóa toàn bộ dữ liệu</span></button>
    </section>
    ${updateSupported() ? `<h2 class="sec-title">Cập nhật</h2>
    <section class="card list">
      <div class="item"><span class="grow col"><span class="t">Tự kiểm tra bản mới</span><span class="s">Mỗi ngày 1 lần, chỉ hỏi GitHub số phiên bản</span></span>${sw(s.autoUpdateCheck !== false, 'Tự kiểm tra bản mới', 'data-tg="autoUpdateCheck"')}</div>
      <button type="button" class="item" data-act="check-upd">${ICON.sync()}<span class="grow col"><span class="t">Kiểm tra ngay</span><span class="s" data-test="upd">${updText()}</span></span></button>
    </section>` : ''}
    <h2 class="sec-title">Giới thiệu</h2>
    <section class="card list">
      <a class="item" href="#/donate"><span class="grow t">Ủng hộ tác giả</span>${ICON.next(18)}</a>
      <a class="item" href="tel:${CONTACT_PHONE}">${ICON.phone()}<span class="grow col"><span class="t">Liên hệ tác giả</span><span class="s">Lê Hữu Phước · ${CONTACT_PHONE.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3')} (gọi / Zalo)</span></span>${ICON.next(18)}</a>
      <a class="item" href="#/gopy"><span class="grow col"><span class="t">Góp ý &amp; báo lỗi</span><span class="s">Gửi cho tác giả qua Zalo, email hoặc GitHub</span></span>${ICON.next(18)}</a>
      <a class="item" href="${WEB_URL}privacy.html" ${isNative() ? '' : 'target="_blank"'} rel="noopener"><span class="grow col"><span class="t">Chính sách quyền riêng tư</span><span class="s">Không thu thập dữ liệu, không quảng cáo</span></span>${ICON.next(18)}</a>
      <div class="item"><span class="grow t">Phiên bản</span><span class="small muted">${APP_VERSION}</span></div>
    </section>
  </main>
</div>`;
}

function updText() {
  const u = getState().update || {};
  if (!u.checkedAt) return 'Chưa kiểm tra';
  const when = fmtTime(u.checkedAt);
  if (u.latest && cmpVersion(u.latest, APP_VERSION) > 0) return `Có bản ${u.latest} · ${when}`;
  return u.latest ? `Đang dùng bản mới nhất · ${when}` : `Không kết nối được · ${when}`;
}

function syncSection() {
  const st = getState();
  const o = st.calSync || {};
  const nat = isNative();
  const days = daysSinceBackup(st);
  const calStatus = o.error ? `<span class="s" style="color:var(--accent)" role="alert">Lỗi: ${esc(o.error)}</span>`
    : o.lastSync ? `<span class="s" data-test="calsync">Đã ghi ${o.count || 0} sự kiện · ${fmtTime(o.lastSync)}</span>`
      : '<span class="s">Ghi ngày giỗ, sinh nhật, lễ vào Google Calendar / Lịch iPhone</span>';
  return `<h2 class="sec-title">Đồng bộ &amp; sao lưu</h2>
    <section class="card list" aria-label="Đồng bộ và sao lưu">
      <div class="item"><span class="grow col"><span class="t">Ghi vào lịch của máy</span>${nat ? calStatus : '<span class="s">Chỉ có trong app Android / iPhone</span>'}</span>
        ${nat ? sw(!!o.enabled, 'Ghi vào lịch của máy', 'data-act="cal"') : ''}</div>
      ${nat && o.enabled ? `
      ${calList && calList.length > 1 ? `<div class="item"><label class="grow t" for="s-cal">Lịch đích</label>
        <select id="s-cal" class="input" style="max-width:190px;height:42px">${calList.map((c) => `<option value="${esc(c.id)}" ${c.id === o.calendarId ? 'selected' : ''}>${esc(c.title)}${c.account && c.account !== c.title ? ' · ' + esc(c.account) : ''}</option>`).join('')}</select></div>` : ''}
      <div class="item"><span class="grow t">Kèm ngày lễ, Tết âm lịch</span>${sw(o.holidays !== false, 'Kèm ngày lễ, Tết âm lịch', 'data-act="cal-le"')}</div>
      <div class="item"><span class="grow t">Kèm Mùng 1 &amp; Rằm</span>${sw(!!o.moon, 'Kèm Mùng 1 và Rằm', 'data-act="cal-moon"')}</div>
      <button type="button" class="item" data-act="cal-now">${ICON.sync()}<span class="grow t">Đồng bộ ngay</span></button>` : ''}
      <a class="item" href="#/contacts">${ICON.users()}<span class="grow col"><span class="t">Nhập ngày sinh từ danh bạ</span><span class="s">Chọn người thân để nhắc sinh nhật</span></span>${ICON.next(18)}</a>
      <button type="button" class="item" data-act="cloud">${ICON.cloud()}<span class="grow col"><span class="t">Sao lưu lên Google Drive / iCloud Drive</span>
        <span class="s" data-test="lastbackup">${days === null ? 'Chưa sao lưu lần nào' : days === 0 ? 'Đã sao lưu hôm nay' : `Lần cuối: ${days} ngày trước`}</span></span></button>
      <div class="item"><span class="grow small muted">Dữ liệu cũng được tự sao lưu theo bản sao lưu của máy (Google / iCloud). Cài lại app trên máy mới cùng tài khoản sẽ tự khôi phục.</span></div>
    </section>`;
}

export async function enableCalendar() {
  const p = await calendarPermission(true);
  if (p !== 'granted') { toast('Chưa có quyền truy cập lịch. Hãy cho phép trong Cài đặt của máy.'); return; }
  try { calList = await writableCalendars(); } catch { calList = []; }
  if (!calList.length) { toast('Không tìm thấy lịch nào có thể ghi trên máy'); return; }
  setState((s) => ({ ...s, calSync: { ...s.calSync, enabled: true, calendarId: s.calSync?.calendarId || calList[0].id, error: '' } }));
  await runSync('Đã ghi vào lịch');
  return true;
}

async function runSync(msg) {
  toast('Đang đồng bộ…');
  try { const r = await syncCalendar({ force: true }); if (!r.skipped) toast(`${msg}: ${r.count} sự kiện`); }
  catch (e) { toast('Không đồng bộ được: ' + (e.message || e)); }
}

const setCal = (p) => setState((s) => ({ ...s, calSync: { ...s.calSync, ...p } }));

export function mountSettings(root, rerender, params = {}) {
  if (params.muc === 'dulieu') requestAnimationFrame(() => root.querySelector('#s-data')?.scrollIntoView({ block: 'start' }));
  if (isNative() && getState().calSync?.enabled && !calList) {
    writableCalendars().then((l) => { calList = l; if (l.length > 1) rerender(); }).catch(() => {});
  }
  root.addEventListener('click', async (e) => {
    const mc = e.target.closest('[data-mascot]');
    if (mc) { updateSettings({ mascot: mc.dataset.mascot }); toast('Đã đổi sang ' + MASCOTS[mc.dataset.mascot].name); return; }
    const sg = e.target.closest('[data-seg]');
    if (sg) { const k = sg.dataset.seg; const v = k === 'size' ? Number(sg.dataset.v) : sg.dataset.v; updateSettings({ [k]: v }); return; }
    const tg = e.target.closest('[data-tg]');
    const tg2 = e.target.closest('[data-tg2]');
    if (tg2) { const k = tg2.dataset.tg2; updateSettings({ [k]: getState().settings[k] === false }); return; }
    if (tg) {
      const k = tg.dataset.tg; const on = !getState().settings[k];
      if (k === 'simple' && on) {
        const st = getState().settings;
        updateSettings({ simple: true, size: Math.max(1, Number(st.size) || 0), ...(Array.isArray(st.needs) && st.needs.length ? {} : { needs: ['gio', 'cung'] }) });
        toast('Đã bật chế độ đơn giản — chữ to, ít mục hơn');
        return;
      }
      updateSettings({ [k]: on }); return;
    }
    const act = e.target.closest('[data-act]')?.dataset.act;
    if (act === 'cal') {
      if (getState().calSync?.enabled) {
        const ok = await confirmSheet({ title: 'Tắt ghi vào lịch?', message: 'Các sự kiện app đã ghi sẽ được xóa khỏi lịch của máy.', ok: 'Tắt và xóa', danger: true });
        if (ok) { await removeCalendarEvents(); toast('Đã tắt và xóa khỏi lịch'); }
      } else await enableCalendar();
      return;
    }
    if (act === 'cal-le') { setCal({ holidays: getState().calSync.holidays === false }); runSync('Đã cập nhật lịch'); return; }
    if (act === 'cal-moon') { setCal({ moon: !getState().calSync.moon }); runSync('Đã cập nhật lịch'); return; }
    if (act === 'cal-now') { runSync('Đã đồng bộ'); return; }
    if (act === 'check-upd') {
      toast('Đang kiểm tra…');
      const r = await checkUpdate({ force: true });
      if (!r) toast('Không kết nối được. Thử lại khi có mạng.');
      else if (r.newer) { setState((x) => ({ ...x, update: { ...x.update, dismissed: '' } })); toast(`Có bản ${r.latest}. Xem ở màn Hôm nay.`); }
      else toast('Bạn đang dùng bản mới nhất');
      return;
    }
    if (act === 'cloud') {
      try { await backupToCloud(); toast('Đã tạo bản sao lưu'); } catch (err) { if (!/cancel/i.test(String(err?.message))) toast('Không sao lưu được: ' + (err?.message || err)); }
      return;
    }
    if (act === 'export') {
      toast('Đang gom dữ liệu, ảnh, bản ghi âm…');
      const full = await exportFull();
      if (full.missing) logEvent('warn', `Sao lưu: ${full.missing} tệp không đọc được`);
      const blob = new Blob([full.text], { type: 'application/json' });
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
      if (ok) { resetAll(); toast('Đã xóa dữ liệu'); resetTo('#/today'); }
    }
    if (act === 'perm') { const p = await ensurePermission(); toast(p === 'granted' ? 'Đã có quyền thông báo' : 'Chưa có quyền. Hãy bật trong Cài đặt của máy.'); }
  });
  root.addEventListener('change', async (e) => {
    if (e.target.id === 's-gt' && e.target.value) { updateSettings({ gioTime: e.target.value }); toast('Đã lưu'); }
    if (e.target.id === 's-cal') { setCal({ calendarId: e.target.value }); runSync('Đã chuyển lịch'); return; }
    if (e.target.id === 's-cd') { updateSettings({ widgetCountdown: e.target.value }); toast('Đã cập nhật widget'); }
    if (e.target.dataset.act === 'import' && e.target.files[0]) {
      try { const r = await restoreFull(await e.target.files[0].text()); toast(r.files ? `Đã khôi phục dữ liệu và ${r.files} ảnh, bản ghi âm` : 'Đã khôi phục dữ liệu'); resetTo('#/reminders'); }
      catch (err) { toast('Không đọc được file: ' + err.message); }
    }
  });
}
