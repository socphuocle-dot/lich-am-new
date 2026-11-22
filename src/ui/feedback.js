// Gửi góp ý / báo lỗi: tự kèm phiên bản, đời máy để tác giả dễ tìm lỗi. Không gửi tự động — người dùng tự chọn nơi gửi.
import { Capacitor } from '@capacitor/core';
import { getState } from '../store.js';
import { APP_VERSION, CHANNEL, REPO, CONTACT_PHONE, ZALO_URL } from '../config.js';
import { esc, ICON, backHeader, toast } from './common.js';

const fb = { kind: 'loi', text: '', info: true };
const KINDS = [['loi', 'Báo lỗi'], ['gopy', 'Góp ý'], ['khac', 'Khác']];

export function deviceInfo() {
  const st = getState();
  const ua = navigator.userAgent;
  const android = ua.match(/Android [\d.]+/)?.[0];
  const ios = ua.match(/OS ([\d_]+) like Mac OS X/)?.[1]?.replace(/_/g, '.');
  const model = ua.match(/Android [\d.]+; ([^;)]+)/)?.[1]?.replace(/ Build.*/, '');
  return [
    `Phiên bản app: ${APP_VERSION} (${CHANNEL === 'store' ? 'cửa hàng' : 'tải trực tiếp'})`,
    `Nền tảng: ${Capacitor.getPlatform()}${android ? ' · ' + android : ''}${ios ? ' · iOS ' + ios : ''}${model ? ' · ' + model : ''}`,
    `Màn hình: ${screen.width}×${screen.height} @${window.devicePixelRatio}x`,
    `Ngày đã lưu: ${st.gios.length} · Giao diện: ${st.settings.theme} · Cỡ chữ: ${st.settings.size}`,
    `Nhắc rằm: ${st.settings.autoMoon ? 'bật' : 'tắt'} · Đồng bộ lịch: ${st.calSync?.enabled ? 'bật' : 'tắt'}${st.calSync?.error ? ' (lỗi: ' + st.calSync.error + ')' : ''}`,
    `Thời gian: ${new Date().toLocaleString('vi-VN')}`
  ].join('\n');
}

function message() {
  const k = KINDS.find((x) => x[0] === fb.kind)[1];
  return `[${k}] ${fb.text.trim()}${fb.info ? '\n\n— Thông tin máy —\n' + deviceInfo() : ''}`;
}

export function renderFeedback() {
  return `<div class="screen no-nav" data-screen="feedback">
  ${backHeader('Góp ý & báo lỗi', '#/settings', 'Mỗi góp ý giúp app tốt hơn')}
  <main class="body" style="gap:14px">
    <section class="card pad col contact" style="gap:12px" aria-label="Liên hệ nhanh">
      <div class="row" style="gap:12px"><span class="nudge-ic">${ICON.phone(20)}</span>
        <span class="col grow"><b>Cần gấp? Gọi hoặc nhắn Zalo</b><span class="small muted">Lê Hữu Phước · ${CONTACT_PHONE.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3')}</span></span></div>
      <div class="row" style="gap:8px"><a class="btn" style="flex:1;height:44px" href="tel:${CONTACT_PHONE}">${ICON.phone(18)} Gọi</a>
        <a class="btn ghost" style="flex:1;height:44px" href="${ZALO_URL}" rel="noopener">Nhắn Zalo</a></div></section>
    <div class="seg" role="group" aria-label="Loại góp ý">${KINDS.map(([k, l]) => `<button type="button" data-kind="${k}" aria-pressed="${fb.kind === k}">${l}</button>`).join('')}</div>
    <div class="field"><label class="lb" for="fb-text">${fb.kind === 'loi' ? 'Lỗi xảy ra thế nào?' : 'Bạn muốn góp ý điều gì?'}</label>
      <textarea id="fb-text" class="input" rows="6" maxlength="2000" placeholder="${fb.kind === 'loi' ? 'Ví dụ: Bấm Lưu ngày giỗ thì app đứng, không nhắc đúng giờ…' : 'Ví dụ: Thêm văn khấn cúng cơm, đổi màu…'}">${esc(fb.text)}</textarea></div>
    <div class="row"><div class="col grow"><span class="lb">Kèm thông tin máy</span><span class="small muted">Phiên bản app, đời máy, cài đặt chính — không có tên hay ngày giỗ của bạn</span></div>
      <button type="button" class="switch" role="switch" aria-checked="${fb.info}" aria-label="Kèm thông tin máy" data-act="info"></button></div>
    ${fb.info ? `<pre class="fb-info" aria-label="Thông tin sẽ gửi kèm">${esc(deviceInfo())}</pre>` : ''}
    <button type="button" class="btn" data-act="share">${ICON.share(18)} Gửi qua Zalo, Messenger, email…</button>
    <button type="button" class="btn ghost" data-act="github">Gửi lên trang GitHub của app</button>
    <button type="button" class="btn text" data-act="copy">${ICON.copy(16)} Sao chép nội dung</button>
  </main>
</div>`;
}

export function mountFeedback(root, rerender) {
  root.querySelector('#fb-text')?.addEventListener('input', (e) => { fb.text = e.target.value; });
  root.addEventListener('click', async (e) => {
    const k = e.target.closest('[data-kind]');
    if (k) { fb.kind = k.dataset.kind; rerender(); return; }
    const act = e.target.closest('[data-act]')?.dataset.act;
    if (!act) return;
    if (act === 'info') { fb.info = !fb.info; rerender(); return; }
    if (!fb.text.trim()) { toast('Bạn hãy viết vài dòng trước khi gửi'); root.querySelector('#fb-text')?.focus(); return; }
    const text = message();
    if (act === 'share') {
      try {
        if (Capacitor.isNativePlatform()) { const { Share } = await import('@capacitor/share'); await Share.share({ title: 'Góp ý Lịch Âm & Nhắc Giỗ', text, dialogTitle: 'Gửi góp ý qua…' }); return; }
        if (navigator.share) { await navigator.share({ title: 'Góp ý Lịch Âm & Nhắc Giỗ', text }); return; }
      } catch { return; }
      toast('Máy không hỗ trợ chia sẻ — đã sao chép, bạn dán vào Zalo hoặc email');
      try { await navigator.clipboard.writeText(text); } catch { /* */ }
    }
    if (act === 'github') {
      const title = `[${KINDS.find((x) => x[0] === fb.kind)[1]}] ${fb.text.trim().split('\n')[0].slice(0, 70)}`;
      location.href = `https://github.com/${REPO}/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(text)}`;
    }
    if (act === 'copy') { try { await navigator.clipboard.writeText(text); toast('Đã sao chép'); } catch { toast('Không sao chép được'); } }
  });
}
