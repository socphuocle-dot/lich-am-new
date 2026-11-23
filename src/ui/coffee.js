// Lời mời ủng hộ tác giả: thẻ cuối mọi màn (router tự gắn) + nút nhỏ trên đầu các tab chính.
// Bản phát hành qua cửa hàng (CHANNEL = 'store') đổi thành lời mời đánh giá 5 sao.
import { CHANNEL } from '../config.js';

const direct = () => CHANNEL === 'direct';

/** Ly cà phê bốc khói (khói chuyển động nhẹ, tắt khi máy bật Giảm chuyển động) */
export function cupArt(size = 56) {
  return `<svg class="cup" width="${size}" height="${size}" viewBox="0 0 64 64" aria-hidden="true">
    <path class="stm s1" d="M24 22c-3-4 3-6 0-11" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" opacity=".85"/>
    <path class="stm s2" d="M32 21c-3-4 3-6 0-12" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" opacity=".85"/>
    <path class="stm s3" d="M40 22c-3-4 3-6 0-11" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" opacity=".85"/>
    <ellipse cx="32" cy="55" rx="22" ry="4.5" fill="#000" opacity=".12"/>
    <path d="M47 33h4a7 7 0 0 1 0 14h-5" fill="none" stroke="#FFF4E6" stroke-width="4.5"/>
    <path d="M13 28h36v10c0 10-8 16-18 16S13 48 13 38z" fill="#FFF4E6"/>
    <path d="M13 28h36v4H13z" fill="#F3DFC6"/>
    <ellipse cx="31" cy="28" rx="18" ry="4" fill="#7A4A2A"/>
    <ellipse cx="27" cy="27.4" rx="6" ry="1.4" fill="#A8714A" opacity=".8"/>
    <path d="M27 41c1.6-2.6 6.4-2.6 4 1.8-1 1.8-4 3.6-4 3.6s-3-1.8-4-3.6c-2.4-4.4 2.4-4.4 4-1.8z" transform="translate(4 -1)" fill="#E2453A"/>
  </svg>`;
}

const star = (w = 18) => `<svg width="${w}" height="${w}" viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" fill="#FFD25E" stroke="#E9A23B" stroke-width="1" stroke-linejoin="round"/></svg>`;

/** Thẻ lớn ở cuối màn hình */
export function coffeeCard() {
  return direct()
    ? `<a class="coffee" href="#/donate" aria-label="Miễn phí, không quảng cáo. Mời tác giả một ly cà phê">
        <span class="cf-art">${cupArt(58)}</span>
        <span class="col grow cf-txt"><span class="cf-k">Miễn phí · không quảng cáo</span><b>Mời tác giả ly cà phê</b><span class="cf-s">Giúp app luôn được cập nhật cho mọi nhà</span></span>
        <span class="cf-btn">Mời ☕</span></a>`
    : `<a class="coffee" href="#/donate" aria-label="Thích app? Đánh giá 5 sao">
        <span class="cf-art">${cupArt(58)}</span>
        <span class="col grow cf-txt"><span class="cf-k">Miễn phí · không quảng cáo</span><b>Thích app? Đánh giá 5 sao</b><span class="cf-s">Giới thiệu cho người thân, bạn bè</span></span>
        <span class="cf-btn">${star(16)} 5 sao</span></a>`;
}

/** Nút nhỏ trên đầu màn (cạnh tiêu đề) */
export function coffeePill() {
  return `<a class="coffee-pill" href="#/donate" aria-label="${direct() ? 'Mời tác giả ly cà phê' : 'Đánh giá app 5 sao'}">${direct() ? `${cupArt(22)}<span>Mời cà phê</span>` : `${star(16)}<span>Đánh giá</span>`}</a>`;
}
