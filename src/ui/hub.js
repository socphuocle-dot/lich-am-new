// Tab "Tiện ích": danh mục dịch vụ, gom theo nhóm như một "siêu ứng dụng" — dễ tìm, bấm một chạm.
import { getState } from '../store.js';
import { jdFromDate, canChiYear } from '../lib/lunar.js';
import { tetYear, lunarJd } from '../lib/tet.js';
import { ICON } from './common.js';
import { CONTACT_PHONE, ZALO_URL, CHANNEL } from '../config.js';
import { isNative } from '../notify.js';
import { mascot, mascotName, ILL, cloud, lanternString, sparkle } from './art.js';

export const fmtPhone = (p) => p.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');

// Biểu tượng riêng cho dịch vụ (nét 1.9, nền trong ô 3D)
const svg = (d, w = 26) => `<svg width="${w}" height="${w}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const I = {
  incense: svg('<path d="M12 21v-7M8 21h8"/><path d="M6 14h12l-1.5 3h-9z"/><path d="M12 10c-1.5-1.5 0-3 0-4.5S10.5 3 10.5 3M15 10c-1-1 0-2 0-3"/>'),
  cake: svg('<path d="M4 21h16M5 21v-7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v7"/><path d="M5 16c1.5 1 3 1 4.5 0s3-1 4.5 0 3 1 5 0"/><path d="M12 12V8"/><path d="M12 5.5c.8-.7.8-1.7 0-2.5-.8.8-.8 1.8 0 2.5z"/>'),
  rings: svg('<circle cx="9" cy="14" r="5"/><circle cx="15" cy="14" r="5"/><path d="m10 5 2-2 2 2-2 2z"/>'),
  lotus: svg('<path d="M12 20c-4 0-8-2-9-6 3 0 5 1 6 2"/><path d="M12 20c4 0 8-2 9-6-3 0-5 1-6 2"/><path d="M12 20c-2.5-2-3.5-5-3-9 1.5.8 2.6 2 3 3.5.4-1.5 1.5-2.7 3-3.5.5 4-.5 7-3 9z"/>'),
  book: ICON.book(26), tray: ICON.tray(26), card: ICON.card(26), bell: ICON.bell(26), star: ICON.star(26), swap: ICON.swap(26), cal: ICON.cal(26),
  sun: ICON.sun(26), share: ICON.share(26), users: ICON.users(26), sync: ICON.sync(26), cloud: ICON.cloud(26), taiji: ICON.taiji(26), face: ICON.face(26),
  num: svg('<path d="M9 4 7 20M17 4l-2 16M4 9h16M3.5 15h16"/>'),
  coin: svg('<circle cx="12" cy="12" r="8.5"/><rect x="9.5" y="9.5" width="5" height="5" rx=".5"/>')
};

const tile = (href, icon, label, tone) => `<a class="svc ${tone}" href="${href}"><span class="pastel ${PASTEL[tone]}">${icon}</span><span class="lbl">${label}</span></a>`;
const PASTEL = { red: 'rose', gold: 'butter', jade: 'mint', ink: 'sky', violet: 'lilac', peach: 'peach' };

function group(title, sub, tone, tiles) {
  return `<section class="svc-group" aria-label="${title}">
    <div class="svc-head"><span class="svc-dot ${tone}" aria-hidden="true"></span><div class="col"><h2>${title}</h2><span class="svc-sub">${sub}</span></div></div>
    <div class="svc-grid">${tiles.join('')}</div></section>`;
}

export function renderHub() {
  const st = getState();
  const culture = st.settings.culture;
  const firstGio = st.gios.find((g) => (g.type || 'gio') === 'gio');
  const n = new Date();
  const Y = tetYear();
  const daysToTet = lunarJd(1, 1, Y) - jdFromDate(n.getDate(), n.getMonth() + 1, n.getFullYear());
  const tetSoon = daysToTet <= 90; // gần Tết: đưa nhóm Tết lên đầu
  const tetGroup = group(`Tết ${canChiYear(Y)}`, daysToTet > 0 ? `Còn ${daysToTet} ngày · việc cần làm, xông đất, xuất hành` : 'Chúc mừng năm mới!', 'red', [
    tile('#/chuanbitet', ILL.lantern(), 'Chuẩn bị Tết', 'red'),
    tile('#/xongdat', ILL.house(), 'Xông đất', 'red'),
    tile('#/xuathanh', ILL.compass(), 'Xuất hành', 'red'),
    tile('#/vankhan/tet?tab=mam', ILL.tray(), 'Mâm cỗ Tết', 'red')
  ]);
  const count = (t) => st.gios.filter((g) => (g.type || 'gio') === t).length;
  return `<div class="screen" data-screen="hub">
  <header class="top"><div class="grow"><h1 tabindex="-1">Tiện ích</h1><span class="sub">Mọi dịch vụ của app · chạy ngay trên máy</span></div></header>
  <main class="body" style="gap:16px">
    <label class="search hub-search">${ICON.search(18)}<input id="hub-q" class="input" type="search" placeholder="Tìm: xông đất, ăn chay, văn khấn…" aria-label="Tìm tiện ích" autocomplete="off"></label>
    <section id="hub-res" class="card list" hidden aria-live="polite"></section>
    <section class="banner red hub-banner"><span class="bn-lanterns">${lanternString()}</span><span class="bn-cloud a">${cloud(90, '#F6D27A', .45)}</span>
      <div class="col grow" style="gap:4px;position:relative"><b>Tiện ích cho gia đình Việt</b><span>Giỗ chạp, cúng lễ, xem ngày — ${mascotName()} lo hết!</span></div>
      <div class="bn-mascot">${mascot('book', 96)}</div></section>
    ${tetSoon ? tetGroup : ''}
    ${group('Ngày của gia đình', `${count('gio')} giỗ · ${count('sinhnhat')} sinh nhật · ${count('kyniem')} kỷ niệm`, 'red', [
      tile('#/add?type=gio', ILL.incense(), 'Ngày giỗ', 'red'),
      tile('#/add?type=sinhnhat', ILL.cake(), 'Sinh nhật', 'red'),
      tile('#/add?type=kyniem', ILL.rings(), 'Kỷ niệm', 'red'),
      tile('#/add?type=gio&tang=1', ILL.lotus(), 'Tang lễ', 'red')
    ])}
    ${group('Cúng lễ', 'Văn khấn, đồ lễ, đi chùa, ăn chay', 'gold', [
      tile('#/vankhan', ILL.book(), 'Văn khấn', 'gold'),
      tile('#/vankhan?tab=mam', ILL.tray(), 'Mâm cúng', 'gold'),
      tile('#/vankhan?g=chua', ILL.pagoda(), 'Đi lễ chùa', 'gold'),
      tile('#/anchay', ILL.bowl(), 'Ăn chay', 'gold')
    ])}
    ${group('Dòng họ', 'Gia phả, tưởng nhớ, hiếu hỉ, chuẩn bị giỗ', 'peach', [
      tile('#/giapha', ILL.tree(), 'Gia phả', 'peach'),
      tile('#/tuongnho', ILL.frame(), 'Tưởng nhớ', 'peach'),
      tile('#/hieuhi', ILL.hongbao(), 'Hiếu hỉ', 'peach'),
      tile('#/chuanbi', ILL.checklist(), 'Chuẩn bị giỗ', 'peach')
    ])}
    ${group('Xem ngày', 'Tốt xấu, sao hạn, tuổi, mệnh', 'jade', [
      tile('#/ngaytot', ILL.star(), 'Ngày tốt', 'jade'),
      tile('#/saohan', ILL.starlamp(), 'Sao hạn', 'jade'),
      tile('#/xemtuoi', ILL.scroll(), 'Xem tuổi', 'jade'),
      tile('#/menh', ILL.wuxing(), 'Mệnh, màu', 'jade')
    ])}
    ${tetSoon ? '' : tetGroup}
    ${group('Kết nối gia đình', 'Chia sẻ, đồng bộ, sao lưu', 'ink', [
      tile('#/chiase', ILL.family(), 'Chia sẻ', 'ink'),
      tile('#/nhap', ILL.inbox(), 'Nhập vào', 'ink'),
      tile('#/contacts', ILL.contacts(), 'Danh bạ', 'ink'),
      tile('#/settings', ILL.cloud(), 'Sao lưu', 'ink')
    ])}
    ${culture ? group('Văn hóa', 'Tử Vi, Thần số, Kinh Dịch', 'violet', [
      tile('#/tuvi', ILL.taiji(), 'Tử Vi', 'violet'),
      tile('#/numerology', ILL.num(), 'Thần số', 'violet'),
      tile('#/iching', ILL.hexa(), 'Kinh Dịch', 'violet'),
      tile('#/culture', ILL.face(), 'Hồ sơ', 'violet')
    ]) : ''}
    <section class="card pad col contact" style="gap:12px" aria-label="Liên hệ tác giả">
      <div class="row" style="gap:12px"><span class="contact-m">${mascot('phone', 64)}</span>
        <div class="col grow"><b>Liên hệ tác giả · Lê Hữu Phước</b><span class="small muted">Hỏi cách dùng, báo lỗi, đặt làm app theo yêu cầu</span></div></div>
      <div class="row" style="gap:8px">
        <a class="btn" style="flex:1;height:46px" href="tel:${CONTACT_PHONE}" aria-label="Gọi ${fmtPhone(CONTACT_PHONE)}">${ICON.phone(18)} ${fmtPhone(CONTACT_PHONE)}</a>
        <a class="btn ghost" style="flex:.8;height:46px" href="${ZALO_URL}" ${isNative() ? '' : 'target="_blank"'} rel="noopener">Nhắn Zalo</a>
      </div>
      <div class="row" style="gap:8px;justify-content:center">
        <a class="link" href="#/gopy">Góp ý &amp; báo lỗi</a><span class="muted">·</span><a class="link" href="#/donate">${CHANNEL === 'store' ? 'Đánh giá app' : 'Ủng hộ tác giả'}</a></div>
    </section>
  </main>
</div>`;
}

/* ===== Tìm nhanh tiện ích (gõ không dấu cũng được) ===== */
const fold = (x) => String(x || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
export const SEARCH = [
  ['Thêm ngày giỗ', '#/add?type=gio', 'gio giỗ cúng giỗ ngày mất nhắc giỗ', 'incense'],
  ['Thêm sinh nhật', '#/add?type=sinhnhat', 'sinh nhật sinh nhat chúc mừng', 'cake'],
  ['Thêm kỷ niệm', '#/add?type=kyniem', 'kỷ niệm ngày cưới', 'rings'],
  ['Tang lễ: 7, 49, 100 ngày', '#/add?type=gio&tang=1', 'người mới mất tang cúng tuần 49 ngày 100 ngày giỗ đầu giỗ hết', 'lotus'],
  ['Văn khấn', '#/vankhan', 'văn khấn bài khấn đọc to cúng', 'book'],
  ['Mâm cúng', '#/vankhan?tab=mam', 'mâm cúng đồ lễ lễ vật mâm cỗ vùng miền bắc trung nam', 'tray'],
  ['Đi lễ chùa, đền, phủ', '#/vankhan?g=chua', 'chùa đền phủ đình đức ông tam bảo thánh mẫu thành hoàng đi lễ', 'pagoda'],
  ['Lịch ăn chay', '#/anchay', 'ăn chay chay ngày chay mùng 1 rằm', 'bowl'],
  ['Thiệp mời giỗ', '#/thiep', 'thiệp mời giỗ mời họ hàng', 'card'],
  ['Thần Tài', '#/vankhan/thantai', 'thần tài thổ địa cúng thần tài', 'coin'],
  ['Gia phả', '#/giapha', 'gia phả cây gia đình dòng họ tổ tiên', 'tree'],
  ['Tưởng nhớ người đã khuất', '#/tuongnho', 'tưởng nhớ ảnh tiểu sử nơi an táng mộ', 'frame'],
  ['Sổ hiếu hỉ', '#/hieuhi', 'hiếu hỉ tiền mừng phúng viếng đám cưới đám ma đáp lễ', 'hongbao'],
  ['Chuẩn bị đám giỗ', '#/chuanbi', 'chuẩn bị giỗ việc cần làm khách mời mâm cỗ phân công', 'checklist'],
  ['Chuẩn bị Tết', '#/chuanbitet', 'tết chuẩn bị tết tất niên giao thừa ông táo hóa vàng', 'lantern'],
  ['Tuổi xông đất', '#/xongdat', 'xông đất xông nhà đầu năm tuổi hợp', 'house'],
  ['Xuất hành đầu năm', '#/xuathanh', 'xuất hành hướng hỷ thần tài thần giờ tốt mùng 1', 'compass'],
  ['Ngày tốt', '#/ngaytot', 'ngày tốt xem ngày cưới khai trương động thổ', 'star'],
  ['Sao hạn, giải hạn', '#/saohan', 'sao hạn giải hạn cúng sao la hầu kế đô thái bạch', 'starlamp'],
  ['Xem tuổi làm nhà, cưới hỏi', '#/xemtuoi', 'xem tuổi kim lâu hoang ốc tam tai làm nhà cưới', 'scroll'],
  ['Mệnh và màu hợp tuổi', '#/menh', 'mệnh ngũ hành màu hợp tuổi nạp âm', 'wuxing'],
  ['Đổi ngày âm dương', '#/doingay', 'đổi ngày âm dương chuyển đổi lịch', 'swap'],
  ['Lịch tháng', '#/calendar', 'lịch tháng âm lịch', 'cal'],
  ['Chia sẻ cho cả họ', '#/chiase', 'chia sẻ gửi zalo qr cả họ người thân', 'family'],
  ['Nhập từ người thân', '#/nhap', 'nhập link mã người thân', 'inbox'],
  ['Sinh nhật từ danh bạ', '#/contacts', 'danh bạ sinh nhật', 'contacts'],
  ['Sao lưu, đồng bộ', '#/settings', 'sao lưu đồng bộ google drive icloud cài đặt', 'cloud'],
  ['Góp ý, báo lỗi', '#/gopy', 'góp ý báo lỗi liên hệ tác giả', 'face'],
  ['Có gì mới', '#/moi', 'có gì mới cập nhật phiên bản', 'star']
].map(([t, href, k, ic]) => ({ t, href, k: fold(t + ' ' + k), ic }));

export function mountHub(root) {
  const q = root.querySelector('#hub-q');
  const res = root.querySelector('#hub-res');
  if (!q) return;
  q.addEventListener('input', () => {
    const k = fold(q.value).trim();
    const words = k.split(/\s+/).filter(Boolean);
    const hits = k ? SEARCH.filter((x) => words.every((w) => x.k.includes(w))) : [];
    root.querySelectorAll('.svc-group, .hub-banner, .contact').forEach((el) => { el.hidden = !!k; });
    res.hidden = !k;
    res.innerHTML = hits.length ? hits.map((x) => `<a class="item" href="${x.href}"><span class="pastel sm butter">${ILL[x.ic] ? ILL[x.ic]() : ''}</span><span class="grow t">${x.t}</span>${ICON.next(18)}</a>`).join('')
      : '<div class="empty">Không tìm thấy. Thử gõ: giỗ, tết, chay, văn khấn, sao hạn…</div>';
  });
}
