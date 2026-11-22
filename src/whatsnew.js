// "Có gì mới" — hiện một lần trên màn Hôm nay sau khi cập nhật bản mới.
import { APP_VERSION } from './config.js';
import { getState, updateSettings } from './store.js';
import { esc, ICON, backHeader } from './ui/common.js';
import { ILL, mascot } from './ui/art.js';

export const WHATS_NEW = [
  { v: '1.10.1', items: [
    ['Nhanh và mượt hơn', 'Mở app nhanh gần gấp đôi, chuyển màn và cuộn nhẹ hơn trên máy cấu hình thấp', '#/today', 'star']
  ] },
  { v: '1.10.0', items: [
    ['Điều hướng mới, gọn và đúng chuẩn', 'Thanh tab luôn có ở mọi màn; mỗi tab nhớ chỗ đang xem; Quay lại đi lùi đúng một bước', '#/tienich', 'compass'],
    ['Tab Cá nhân', 'Hồ sơ, cài đặt, chia sẻ cả họ, góp ý, ủng hộ — gom về một chỗ', '#/canhan', 'face']
  ] },
  { v: '1.9.4', items: [
    ['Chọn linh vật 12 con giáp', 'Chuột, Trâu, Hổ, Mèo, Rồng, Rắn, Ngựa, Dê, Khỉ, Gà, Chó, Heo, thêm Thỏ Ngọc và Lân — đổi cả widget', '#/settings', 'face']
  ] },
  { v: '1.9.2', items: [
    ['Đọc văn khấn kiểu tụng', 'Giọng trầm, chậm, ngắt theo vế; chuông mở đầu, mõ gõ nhịp', '#/vankhan/ram', 'lotus'],
    ['Ghi âm giọng người nhà', 'Ông bà, cha mẹ hay thầy ở chùa đọc một lần, con cháu nghe lại mãi', '#/vankhan/gio', 'face']
  ] },
  { v: '1.9.1', items: [
    ['Tìm nhanh tiện ích', 'Gõ "xông đất", "chay"… ở đầu trang Tiện ích, không dấu cũng được', '#/tienich', 'star'],
    ['Gửi gia phả cho cả họ', 'Chia sẻ kèm gia phả và trang tưởng nhớ, người thân nhập một chạm', '#/chiase', 'family'],
    ['Ngày chay trên lịch và widget', 'Chấm xanh trên lịch tháng, chọn giờ nhắc', '#/anchay', 'bowl']
  ] },
  { v: '1.9.0', items: [
    ['Chuẩn bị Tết Đinh Mùi', 'Việc cần làm từ ông Táo đến hóa vàng, có phân công', '#/chuanbitet', 'lantern'],
    ['Tuổi xông đất, xuất hành', 'Tuổi hợp xông nhà, giờ và hướng tốt mùng 1–3', '#/xongdat', 'house'],
    ['Lịch ăn chay, văn khấn đi lễ', 'Nhắc ngày chay; khấn chùa, đền, phủ', '#/anchay', 'bowl'],
    ['Mệnh và màu hợp tuổi', 'Màu hợp, màu nên tránh, tuổi hợp', '#/menh', 'wuxing']
  ] },
  { v: '1.8.0', items: [['Sao hạn và giải hạn', 'Sao chiếu mệnh, hạn trong năm, văn khấn dâng sao', '#/saohan', 'starlamp']] },
  { v: '1.7.0', items: [
    ['Gia phả, tưởng nhớ', 'Cây gia đình nhiều đời; ảnh, tiểu sử người đã khuất', '#/giapha', 'tree'],
    ['Sổ hiếu hỉ, chuẩn bị giỗ', 'Ghi mừng phúng để đáp lễ; việc cần làm, khách mời', '#/hieuhi', 'hongbao'],
    ['Xem tuổi, mâm cúng theo vùng', 'Kim Lâu, Hoang Ốc, Tam Tai; mâm Bắc, Trung, Nam', '#/xemtuoi', 'scroll']
  ] }
];

/** Thẻ nhỏ trên màn Hôm nay — ẩn khi đã xem bản này */
export function whatsNewCard() {
  const st = getState();
  if (!st.onboarded || st.settings.seenNew === APP_VERSION) return '';
  const top = WHATS_NEW.slice(0, 2).flatMap((x) => x.items).slice(0, 3);
  return `<section class="card pad col whatsnew" style="gap:10px" aria-label="Có gì mới">
    <div class="row" style="gap:10px"><span class="col grow"><b>Có gì mới ở bản ${APP_VERSION}</b><span class="small muted">Bấm để thử ngay</span></span>
      <button type="button" class="icon-btn plain" style="width:40px;height:40px" data-act="new-hide" aria-label="Ẩn">${ICON.close()}</button></div>
    ${top.map(([t, d, href, ic]) => `<a class="row wn-row" href="${href}"><span class="pastel sm butter">${ILL[ic]()}</span><span class="col grow"><b class="small">${esc(t)}</b><span class="small muted">${esc(d)}</span></span></a>`).join('')}
    <a class="link" href="#/moi" style="align-self:flex-start">Xem tất cả điểm mới</a></section>`;
}
export const hideWhatsNew = () => updateSettings({ seenNew: APP_VERSION });

export function renderWhatsNew() {
  if (getState().settings.seenNew !== APP_VERSION) setTimeout(hideWhatsNew, 0);
  return `<div class="screen no-nav" data-screen="moi">
  ${backHeader('Có gì mới', '#/today', 'Phiên bản ' + APP_VERSION)}
  <main class="body">
    <section class="banner red"><div class="col grow" style="gap:4px"><b>Cảm ơn bạn đã cập nhật!</b><span>Mọi tính năng chạy ngay trên máy, không quảng cáo.</span></div><div class="bn-mascot">${mascot('star', 88)}</div></section>
    ${WHATS_NEW.map((x) => `<section class="col" style="gap:6px"><h2 class="sec-title" style="margin:0">Bản ${x.v}</h2><div class="card list">${x.items.map(([t, d, href, ic]) => `<a class="item" href="${href}">
      <span class="pastel sm butter">${ILL[ic]()}</span><span class="col grow"><span class="t">${esc(t)}</span><span class="s">${esc(d)}</span></span>${ICON.next(18)}</a>`).join('')}</div></section>`).join('')}
  </main>
</div>`;
}
