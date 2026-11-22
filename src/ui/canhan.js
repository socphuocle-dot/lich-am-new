// Tab "Cá nhân": hồ sơ, cài đặt, sao lưu, linh vật, có gì mới, góp ý, ủng hộ, giới thiệu.
import { getState } from '../store.js';
import { APP_VERSION, CHANNEL, WEB_URL, CONTACT_PHONE } from '../config.js';
import { canChiYear } from '../lib/lunar.js';
import { chiOfYear } from '../lib/xemtuoi.js';
import { esc, ICON } from './common.js';
import { mascot, mascotName, ILL } from './art.js';
import { giap, giapName } from './zodiac.js';

const row = (href, ic, t, s = '', ext = false) => `<a class="item" href="${href}" ${ext ? 'target="_blank" rel="noopener"' : ''}>
  <span class="pastel sm butter">${ILL[ic] ? ILL[ic]() : ''}</span><span class="col grow"><span class="t">${t}</span>${s ? `<span class="s">${s}</span>` : ''}</span>${ICON.next(18)}</a>`;

export function renderCanhan() {
  const st = getState();
  const p = st.profile;
  const by = Number(String(p.dob || '').slice(0, 4));
  const n = st.gios.length;
  return `<div class="screen" data-screen="canhan">
  <header class="top"><h1 tabindex="-1">Cá nhân</h1></header>
  <main class="body">
    <a class="card pad row me-card" href="#/profile">
      <span class="me-av">${mascot('wave', 64)}</span>
      <span class="col grow" style="gap:2px"><b>${p.name ? esc(p.name) : 'Thêm hồ sơ của bạn'}</b>
        <span class="small muted">${by ? `${canChiYear(by)} · con ${giapName(chiOfYear(by))}` : 'Để xem sao hạn, tuổi, mệnh cho đúng'}</span>
        <span class="small muted">${n} ngày đang nhắc · linh vật ${esc(mascotName())}</span></span>
      ${by ? `<span class="me-giap">${giap(chiOfYear(by), 34)}</span>` : ICON.next(18)}</a>

    <section class="col" style="gap:6px"><h2 class="sec-title" style="margin:0">Cài đặt</h2><div class="card list">
      ${row('#/settings', 'compass', 'Cài đặt chung', 'Cỡ chữ, giao diện, linh vật, thông báo, sao lưu')}
      ${row('#/chiase', 'family', 'Chia sẻ cho cả họ', 'Gửi ngày giỗ, gia phả qua Zalo hoặc mã QR')}
      ${row('#/nhap', 'inbox', 'Nhập từ người thân', 'Dán link hoặc quét mã người thân gửi')}
    </div></section>

    <section class="col" style="gap:6px"><h2 class="sec-title" style="margin:0">Ứng dụng</h2><div class="card list">
      ${row('#/moi', 'star', 'Có gì mới', 'Phiên bản ' + APP_VERSION)}
      ${row('#/gopy', 'face', 'Góp ý, báo lỗi', 'Gọi hoặc nhắn Zalo ' + CONTACT_PHONE.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3'))}
      ${row('#/donate', 'cake', CHANNEL === 'direct' ? 'Ủng hộ tác giả' : 'Đánh giá app', CHANNEL === 'direct' ? 'Mời tác giả ly cà phê' : 'Cảm ơn bạn đã dùng app')}
      ${row(WEB_URL + 'privacy.html', 'book', 'Quyền riêng tư', 'Dữ liệu chỉ nằm trên máy của bạn', true)}
    </div></section>
    <p class="small muted center" style="margin:8px 0 0">Lịch Âm & Nhắc Giỗ ${APP_VERSION} · không quảng cáo</p>
  </main>
</div>`;
}
