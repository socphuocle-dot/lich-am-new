// Hình minh họa riêng của app (tự vẽ bằng SVG, không dùng tài nguyên bên ngoài):
// linh vật "Bé Thỏ Ngọc", mây cát tường, đèn lồng, sao, trăng theo ngày âm, biểu tượng màu cho dịch vụ.
let seq = 0;
// Bộ nhớ đệm hình SVG: dựng một lần thành "khuôn", mỗi lần dùng chỉ thay mã id gradient cho khỏi trùng.
// (Dựng lại hình vẽ phức tạp mỗi lần vẽ màn là phần tốn thời gian nhất khi chuyển màn.)
let tpl = null;
const uid = (p) => (tpl ? `${p}\u0001${tpl.n++}\u0002` : `${p}${++seq}`);
const T = new Map();
/**
 * Hình vẽ nhiều chi tiết → một nút <image> duy nhất (SVG nhúng dạng data URL).
 * Trình duyệt vẽ hình một lần rồi dùng lại; DOM nhẹ hơn hàng trăm nút mỗi màn, chuyển màn và cuộn mượt hơn.
 * Giữ thẻ <svg> bên ngoài để CSS, kích thước, nhãn đọc màn hình như cũ.
 */
const IMG = new Map();
export function svgImage(key, build, vb, outerAttrs) {
  let href = IMG.get(key);
  if (!href) {
    const saved = tpl; tpl = null;
    let raw;
    try { raw = build(); } finally { tpl = saved; }
    raw = raw.replace(/^<svg\b/, '<svg xmlns="http://www.w3.org/2000/svg"');
    href = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(raw);
    if (IMG.size > 400) IMG.clear();
    IMG.set(key, href);
  }
  const [w, h] = vb;
  return `<svg ${outerAttrs} viewBox="0 0 ${w} ${h}"><image href="${href}" width="${w}" height="${h}"/></svg>`;
}

export function cachedSvg(key, build) {
  let t = T.get(key);
  if (t === undefined) {
    const saved = tpl; tpl = { n: 0 };
    try { t = build(); } finally { tpl = saved; }
    if (T.size > 600) T.clear();
    T.set(key, t);
  }
  if (t.indexOf('\u0001') < 0) return t;
  if (tpl) return t; // đang dựng một khuôn lớn hơn: giữ nguyên dấu để khuôn ngoài thay một lượt
  const base = ++seq;
  return t.replace(/\u0001(\d+)\u0002/g, (_, n) => `x${base}_${n}`);
}

/* ================= LINH VẬT (chọn được trong Cài đặt) ================= */
// Các nhân vật đều tự vẽ, dùng chung thân, khăn và đồ cầm tay; khác nhau ở màu lông, tai/sừng và mặt.
export const MASCOTS = {
  chuot: { pick: 'Chuột', chi: 'Tý', name: 'Chuột Nhắt', short: 'Chuột Nhắt', fur: ['#EEF0F3', '#B9BEC7'], line: '#A3A9B3', foot: '#F7D3D9', cheek: '#FF9DB0', wmouth: true },
  nghe: { pick: 'Trâu', chi: 'Sửu', name: 'Nghé Con', short: 'Nghé Con', fur: ['#E6E9EE', '#AEB6C1'], line: '#9AA3AF', foot: '#5C5752', cheek: '#FFB0B8' },
  ho: { pick: 'Hổ', chi: 'Dần', name: 'Hổ Con', short: 'Hổ Con', fur: ['#FFC67A', '#F0892B'], line: '#D6741F', foot: '#FFF3E0', cheek: '#FF9D8A' },
  meo: { pick: 'Mèo', chi: 'Mão', name: 'Mèo Mướp', short: 'Mèo Mướp', fur: ['#FFE2B8', '#F3A95C'], line: '#DE9450', foot: '#FFF1DE', cheek: '#FF9D8A', wmouth: true },
  rong: { pick: 'Rồng', chi: 'Thìn', name: 'Rồng Ngọc', short: 'Rồng Ngọc', fur: ['#9FE3C2', '#2E9E6E'], line: '#23805A', foot: '#F6D27A', cheek: '#FFB37A' },
  ran: { pick: 'Rắn', chi: 'Tỵ', name: 'Rắn Xanh', short: 'Rắn Xanh', fur: ['#C9EF8A', '#6DB33F'], line: '#4E9030', foot: '#E8F7C8', cheek: '#FF9DB0' },
  ngua: { pick: 'Ngựa', chi: 'Ngọ', name: 'Ngựa Nâu', short: 'Ngựa Nâu', fur: ['#E2B58A', '#A86A3D'], line: '#8C5530', foot: '#3A2A22', cheek: '#FF9D8A' },
  de: { pick: 'Dê', chi: 'Mùi', name: 'Dê Bông', short: 'Dê Bông', fur: ['#FFFFFF', '#EFE6D8'], line: '#D9CCB8', foot: '#8C7A66', cheek: '#FFB0B8' },
  khi: { pick: 'Khỉ', chi: 'Thân', name: 'Khỉ Lém', short: 'Khỉ Lém', fur: ['#C69466', '#8A5A33'], line: '#6E4426', foot: '#F3D2B3', cheek: '#FF9D8A' },
  ga: { pick: 'Gà', chi: 'Dậu', name: 'Gà Trống', short: 'Gà Trống', fur: ['#FFF4C2', '#F6C343'], line: '#D9A21E', foot: '#F08A24', cheek: '#FF9D8A' },
  cun: { pick: 'Chó', chi: 'Tuất', name: 'Cún Vàng', short: 'Cún Vàng', fur: ['#FFE6B0', '#E9B565'], line: '#D49E52', foot: '#FFF3DA', cheek: '#FF9D8A' },
  heo: { pick: 'Heo', chi: 'Hợi', name: 'Heo Hồng', short: 'Heo Hồng', fur: ['#FFDCE4', '#F59AB2'], line: '#E07B97', foot: '#FFC2D1', cheek: '#FF7A9C' },
  tho: { pick: 'Thỏ', chi: '', name: 'Bé Thỏ Ngọc', short: 'Bé Thỏ', fur: ['#FFFFFF', '#F3E6D8'], line: '#E9D9C8', foot: '#FFFFFF', cheek: '#FF9DB0', wmouth: true },
  lan: { pick: 'Lân', chi: '', name: 'Lân Con', short: 'Lân Con', fur: ['#FF7A5C', '#C8261A'], line: '#A31B12', foot: '#F6D27A', cheek: '#FFD27A' }
};
let currentMascot = 'tho';
export const setMascot = (k) => { currentMascot = MASCOTS[k] ? k : 'tho'; };
export const mascotKind = () => currentMascot;
export const mascotName = (short = false) => MASCOTS[currentMascot][short ? 'short' : 'name'];

/** Tai, sừng, bờm — vẽ sau lưng đầu */
function headBack(kind, g, fur, line) {
  if (kind === 'meo') return `<path d="M33 46 L36 18 L56 34 z" fill="${fur}" stroke="${line}" stroke-width="1.2" stroke-linejoin="round"/><path d="M38 40 L39 25 L50 34 z" fill="#FFB4A8"/>
    <path d="M87 46 L84 18 L64 34 z" fill="${fur}" stroke="${line}" stroke-width="1.2" stroke-linejoin="round"/><path d="M82 40 L81 25 L70 34 z" fill="#FFB4A8"/>`;
  if (kind === 'lan') return `${[[24, 40], [22, 58], [28, 74], [96, 40], [98, 58], [92, 74], [36, 28], [84, 28], [60, 22]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="12" fill="url(#${g}g)"/>`).join('')}
    <path d="M60 4 l6 20 h-12z" fill="url(#${g}g)" stroke="#B07A1C" stroke-width="1"/><circle cx="60" cy="6" r="3.4" fill="#C8392C"/>`;
  if (kind === 'nghe') return `<path d="M36 36 q-18 -6 -18 -22 q10 10 24 12z" fill="#F4EBDD" stroke="#C9B49F" stroke-width="1.2"/><path d="M84 36 q18 -6 18 -22 q-10 10 -24 12z" fill="#F4EBDD" stroke="#C9B49F" stroke-width="1.2"/>
    <ellipse cx="26" cy="50" rx="11" ry="6" transform="rotate(-20 26 50)" fill="${fur}" stroke="${line}"/><ellipse cx="94" cy="50" rx="11" ry="6" transform="rotate(20 94 50)" fill="${fur}" stroke="${line}"/>`;
  if (kind === 'cun') return '';
  if (kind === 'chuot') return `<circle cx="34" cy="34" r="15" fill="${fur}" stroke="${line}" stroke-width="1.2"/><circle cx="34" cy="34" r="9" fill="#F7B6C2"/>
    <circle cx="86" cy="34" r="15" fill="${fur}" stroke="${line}" stroke-width="1.2"/><circle cx="86" cy="34" r="9" fill="#F7B6C2"/>`;
  if (kind === 'ho') return `<circle cx="37" cy="35" r="9" fill="${fur}" stroke="${line}" stroke-width="1.2"/><circle cx="37" cy="35" r="4.5" fill="#3A2A22"/>
    <circle cx="83" cy="35" r="9" fill="${fur}" stroke="${line}" stroke-width="1.2"/><circle cx="83" cy="35" r="4.5" fill="#3A2A22"/>`;
  if (kind === 'rong') return `<path d="M44 34 q-6 -14 -2 -26 q3 8 8 10 q-2 -8 2 -14 q4 10 0 30z" fill="url(#${g}g)" stroke="#B07A1C" stroke-width="1"/>
    <path d="M76 34 q6 -14 2 -26 q-3 8 -8 10 q2 -8 -2 -14 q-4 10 0 30z" fill="url(#${g}g)" stroke="#B07A1C" stroke-width="1"/>
    <path d="M30 46 l-8 -4 6 9 -9 1 10 5z M90 46 l8 -4 -6 9 9 1 -10 5z" fill="#F6D27A" stroke="#C08A2A" stroke-width=".8"/>`;
  if (kind === 'ran') return '';
  if (kind === 'ngua') return `<path d="M38 40 L40 16 L54 32 z" fill="${fur}" stroke="${line}" stroke-width="1.2" stroke-linejoin="round"/><path d="M82 40 L80 16 L66 32 z" fill="${fur}" stroke="${line}" stroke-width="1.2" stroke-linejoin="round"/>
    <path d="M50 30 q4 -14 10 -16 q-1 8 4 10 q2 -8 8 -8 q-3 8 0 14z" fill="#3A2A22"/>`;
  if (kind === 'de') return `<path d="M44 34 q-16 -6 -14 -20 q8 -4 14 6 q-8 -2 -8 6 q2 4 8 2z" fill="#E9D7B8" stroke="#BFA57E" stroke-width="1.2"/><path d="M76 34 q16 -6 14 -20 q-8 -4 -14 6 q8 -2 8 6 q-2 4 -8 2z" fill="#E9D7B8" stroke="#BFA57E" stroke-width="1.2"/>
    <ellipse cx="27" cy="54" rx="10" ry="5" transform="rotate(25 27 54)" fill="${fur}" stroke="${line}"/><ellipse cx="93" cy="54" rx="10" ry="5" transform="rotate(-25 93 54)" fill="${fur}" stroke="${line}"/>`;
  if (kind === 'khi') return `<circle cx="27" cy="56" r="11" fill="${fur}" stroke="${line}" stroke-width="1.2"/><circle cx="27" cy="56" r="6" fill="#F3D2B3"/>
    <circle cx="93" cy="56" r="11" fill="${fur}" stroke="${line}" stroke-width="1.2"/><circle cx="93" cy="56" r="6" fill="#F3D2B3"/>`;
  if (kind === 'ga') return `<path d="M50 32 q-2 -12 6 -12 q0 -8 8 -6 q6 -6 10 2 q6 2 2 10 q-6 4 -26 6z" fill="#E5322B" stroke="#B5261A" stroke-width="1"/>`;
  if (kind === 'heo') return `<path d="M36 40 L34 20 L52 32 z" fill="${fur}" stroke="${line}" stroke-width="1.2" stroke-linejoin="round"/><path d="M84 40 L86 20 L68 32 z" fill="${fur}" stroke="${line}" stroke-width="1.2" stroke-linejoin="round"/>`;
  return `<g class="ears">
    <ellipse cx="45" cy="24" rx="9.5" ry="22" transform="rotate(-12 45 24)" fill="${fur}" stroke="${line}" stroke-width="1.2"/>
    <ellipse cx="45" cy="26" rx="4.6" ry="15" transform="rotate(-12 45 26)" fill="url(#${g}ear)"/>
    <ellipse cx="76" cy="22" rx="9.5" ry="22" transform="rotate(14 76 22)" fill="${fur}" stroke="${line}" stroke-width="1.2"/>
    <ellipse cx="76" cy="24" rx="4.6" ry="15" transform="rotate(14 76 24)" fill="url(#${g}ear)"/></g>`;
}

/** Chi tiết trên mặt (vẽ sau mặt): sọc, mõm, tai cụp, lông mày lân… */
function headFront(kind, g, fur, line) {
  if (kind === 'meo') return `<path d="M54 33 v7 M60 31 v8 M66 33 v7" stroke="#D9843A" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M30 62 l-12 -2 M30 66 l-12 2 M90 62 l12 -2 M90 66 l12 2" stroke="#B9835A" stroke-width="1.2" stroke-linecap="round"/>`;
  if (kind === 'lan') return `<path d="M40 48 q8 -8 16 -2 M64 46 q8 -6 16 2" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" fill="none"/>
    <path d="M40 48 q8 -8 16 -2 M64 46 q8 -6 16 2" stroke="#F6D27A" stroke-width="2" stroke-linecap="round" fill="none"/>
    <ellipse cx="60" cy="72" rx="15" ry="6" fill="#FFF6EA" opacity=".9"/><path d="M48 72 h24" stroke="#C8392C" stroke-width="1.4"/>`;
  if (kind === 'nghe') return `<ellipse cx="60" cy="68" rx="16" ry="10" fill="#F3D8CF" stroke="${line}" stroke-width="1"/><ellipse cx="54" cy="67" rx="2" ry="2.6" fill="#7A4A3E"/><ellipse cx="66" cy="67" rx="2" ry="2.6" fill="#7A4A3E"/>`;
  if (kind === 'cun') return `<ellipse cx="31" cy="58" rx="9" ry="19" transform="rotate(18 31 58)" fill="#B9773A" stroke="${line}"/><ellipse cx="89" cy="58" rx="9" ry="19" transform="rotate(-18 89 58)" fill="#B9773A" stroke="${line}"/>
    <ellipse cx="60" cy="68" rx="12" ry="8" fill="#FFF6EA"/><ellipse cx="60" cy="63.5" rx="4.2" ry="3" fill="#3A2A22"/>`;
  if (kind === 'chuot') return `<path d="M30 63 l-12 -3 M30 67 l-12 1 M90 63 l12 -3 M90 67 l12 1" stroke="#8E949E" stroke-width="1.1" stroke-linecap="round"/>`;
  if (kind === 'ho') return `<path d="M54 32 v6 M60 30 v9 M66 32 v6 M31 52 h7 M31 58 h6 M89 52 h-7 M89 58 h-6" stroke="#3A2A22" stroke-width="2.6" stroke-linecap="round"/>
    <ellipse cx="60" cy="68" rx="13" ry="8" fill="#FFF6EA"/><path d="M57 63 h6 l-3 3z" fill="#3A2A22"/><path d="M55.5 68 q2.2 2.6 4.5 0 q2.3 2.6 4.5 0" stroke="#7A4A3E" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    <path d="M44 68 l-14 -2 M44 71 l-14 3 M76 68 l14 -2 M76 71 l14 3" stroke="#B9835A" stroke-width="1" stroke-linecap="round"/>`;
  if (kind === 'rong') return `<ellipse cx="60" cy="68" rx="14" ry="8" fill="#D8F5E5" stroke="${line}" stroke-width="1"/><circle cx="55" cy="66" r="1.8" fill="#23805A"/><circle cx="65" cy="66" r="1.8" fill="#23805A"/>
    <path d="M47 70 q-14 4 -18 16 M73 70 q14 4 18 16" stroke="#F6D27A" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
  if (kind === 'ran') return `<circle cx="46" cy="40" r="3" fill="#4E9030" opacity=".5"/><circle cx="60" cy="35" r="3.4" fill="#4E9030" opacity=".5"/><circle cx="74" cy="40" r="3" fill="#4E9030" opacity=".5"/>
    <path d="M54 68 q6 5 12 0" stroke="#2F5C1E" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M60 71 v5 l-2 3 M60 76 l2 3" stroke="#E5322B" stroke-width="1.4" fill="none" stroke-linecap="round"/>`;
  if (kind === 'ngua') return `<ellipse cx="60" cy="69" rx="14" ry="9" fill="#F0D2B4" stroke="${line}" stroke-width="1"/><ellipse cx="55" cy="68" rx="1.8" ry="2.4" fill="#5C3A22"/><ellipse cx="65" cy="68" rx="1.8" ry="2.4" fill="#5C3A22"/>`;
  if (kind === 'de') return `<path d="M57.6 64 h4.8 l-2.4 2.4z" fill="#C9A68A"/><path d="M56 68 q4 3 8 0" stroke="#8C6A52" stroke-width="1.4" fill="none" stroke-linecap="round"/>
    <path d="M56 80 q4 10 8 0" fill="#F4EBDD" stroke="#D9CCB8"/>`;
  if (kind === 'khi') return `<path d="M60 44 c-6 -6 -18 -4 -18 8 c0 6 2 10 6 14 c-2 6 4 12 12 12 c8 0 14 -6 12 -12 c4 -4 6 -8 6 -14 c0 -12 -12 -14 -18 -8z" fill="#F3D2B3"/>
    <ellipse cx="56" cy="66" rx="1.4" ry="1.8" fill="#5C3A22"/><ellipse cx="64" cy="66" rx="1.4" ry="1.8" fill="#5C3A22"/><path d="M54 71 q6 5 12 0" stroke="#7A4A3E" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
  if (kind === 'ga') return `<path d="M54 64 l6 -4 6 4 -6 6z" fill="#F08A24" stroke="#C86A10" stroke-width="1"/><path d="M57 70 q3 10 6 0z" fill="#E5322B"/>`;
  if (kind === 'heo') return `<ellipse cx="60" cy="67" rx="11" ry="8" fill="#FFB8CA" stroke="${line}" stroke-width="1.2"/><ellipse cx="56" cy="67" rx="2" ry="3" fill="#C2557A"/><ellipse cx="64" cy="67" rx="2" ry="3" fill="#C2557A"/>`;
  return '';
}

/**
 * pose: 'wave' | 'lantern' | 'pray' | 'star' | 'cake' | 'letter' | 'moon' | 'phone' | 'book'
 * kind: nhân vật (mặc định theo lựa chọn trong Cài đặt)
 */
export function mascot(pose = 'wave', size = 120, label = '', kind = currentMascot) {
  label = label || (MASCOTS[kind] || MASCOTS.tho).name;
  return svgImage(`m|${pose}|${kind}`, () => mascotRaw(pose, 120, label, kind), [120, 122],
    `class="mascot mascot-${kind}" width="${size}" height="${size}" role="img" aria-label="${label}"`);
}
function mascotRaw(pose, size, label, kind) {
  const C = MASCOTS[kind] || MASCOTS.tho;
  label = label || C.name;
  const g = uid('m');
  const fur = `url(#${g}f)`, scarf = `url(#${g}s)`, gold = `url(#${g}g)`;
  const line = C.line;
  const arm = (cx, cy, rot) => `<ellipse cx="${cx}" cy="${cy}" rx="7" ry="11" transform="rotate(${rot} ${cx} ${cy})" fill="${fur}" stroke="${line}" stroke-width="1"/>`;
  const props = {
    wave: `${arm(36, 88, 25)}${arm(90, 66, -150)}
      <path d="M100 50 l3 -6 M106 56 l6 -3 M104 62 l6 1" stroke="#E9A23B" stroke-width="2.4" stroke-linecap="round"/>`,
    lantern: `${arm(36, 88, 25)}${arm(86, 84, -40)}
      <path d="M92 76 Q100 60 104 56" stroke="#8C5F12" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      <circle cx="106" cy="84" r="20" fill="url(#${g}glow)"/>
      <rect x="101" y="63" width="10" height="5" rx="2" fill="${gold}"/>
      <ellipse cx="106" cy="82" rx="13" ry="15" fill="url(#${g}lan)"/>
      <path d="M96 82 h20 M97 75 q9 -3 18 0 M97 89 q9 3 18 0" stroke="#F6D27A" stroke-width="1.2" fill="none" opacity=".9"/>
      <rect x="101" y="96" width="10" height="4" rx="1.5" fill="${gold}"/>
      <path d="M104 100 v9 M106 100 v11 M108 100 v9" stroke="#C8392C" stroke-width="1.6" stroke-linecap="round"/>`,
    pray: `<ellipse cx="55" cy="84" rx="7" ry="11" transform="rotate(28 55 84)" fill="${fur}" stroke="${line}"/>
      <ellipse cx="65" cy="84" rx="7" ry="11" transform="rotate(-28 65 84)" fill="${fur}" stroke="${line}"/>
      <path d="M60 104 c-8-3-11-9-10-15 4 1 7 4 8 7 1-5 1-9 2-12 1 3 1 7 2 12 1-3 4-6 8-7 1 6-2 12-10 15z" fill="url(#${g}lotus)"/>`,
    star: `${arm(36, 88, 25)}${arm(88, 68, -145)}
      <path d="M100 38 l4.2 8.6 9.4 1.4-6.8 6.6 1.6 9.4-8.4-4.4-8.4 4.4 1.6-9.4-6.8-6.6 9.4-1.4z" fill="${gold}" stroke="#B9831F" stroke-width="1"/>
      <path d="M116 30 v8 M112 34 h8 M86 32 v5 M83.5 34.5 h5" stroke="#F1C14E" stroke-width="2" stroke-linecap="round"/>`,
    cake: `${arm(42, 92, 50)}${arm(78, 92, -50)}
      <rect x="44" y="92" width="32" height="16" rx="4" fill="#F7A3B5"/>
      <path d="M44 97 q4 4 8 0 t8 0 t8 0 t8 0 v-1 a4 4 0 0 0 -4 -4 h-24 a4 4 0 0 0 -4 4z" fill="#FFF6EA"/>
      <rect x="58.5" y="82" width="3" height="10" rx="1.2" fill="#6FA8DC"/>
      <path d="M60 74 c3 3 3 6 0 8 -3-2-3-5 0-8z" fill="#F6B53C"/>`,
    letter: `${arm(42, 92, 50)}${arm(78, 92, -50)}
      <rect x="42" y="88" width="36" height="22" rx="3" fill="url(#${g}lan)"/>
      <path d="M42 90 l18 12 18-12" stroke="#F6D27A" stroke-width="1.6" fill="none"/>
      <circle cx="60" cy="101" r="4" fill="${gold}"/>`,
    phone: `${arm(36, 88, 25)}${arm(84, 76, -120)}
      <rect x="86" y="54" width="16" height="26" rx="4" fill="#2A201B"/><rect x="88" y="57" width="12" height="18" rx="2" fill="#8FD3B6"/>
      <path d="M106 50 q5 4 2 10 M110 46 q9 8 3 18" stroke="#C8392C" stroke-width="2" fill="none" stroke-linecap="round"/>`,
    book: `${arm(42, 92, 50)}${arm(78, 92, -50)}
      <path d="M38 90 q11-4 22 2 q11-6 22-2 v20 q-11-4-22 2 q-11-6-22-2z" fill="#FFF6EA" stroke="#C8392C" stroke-width="2"/>
      <path d="M60 92 v20" stroke="#C8392C" stroke-width="1.6"/><path d="M44 97 h10 M44 102 h10 M66 97 h10 M66 102 h10" stroke="#C9B49F" stroke-width="1.4" stroke-linecap="round"/>`,
    moon: `${arm(40, 90, 40)}${arm(80, 90, -40)}`
  };
  const seat = pose === 'moon'
    ? `<path d="M14 100 a52 30 0 0 0 92 0 a46 22 0 0 1 -92 0z" fill="${gold}"/><circle cx="34" cy="112" r="2" fill="#B9831F" opacity=".5"/><circle cx="80" cy="116" r="2.6" fill="#B9831F" opacity=".5"/>`
    : `<ellipse cx="60" cy="116" rx="30" ry="4" fill="#5B2A1F" opacity=".16"/>`;
  const lan = kind === 'lan';
  const eyeR = lan ? [5, 6] : [3.8, 4.6];
  const scarfDef = lan
    ? `<linearGradient id="${g}s" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FBE3A2"/><stop offset="1" stop-color="#C08A2A"/></linearGradient>`
    : `<linearGradient id="${g}s" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E25A47"/><stop offset="1" stop-color="#8E140C"/></linearGradient>`;
  return `<svg class="mascot mascot-${kind}" viewBox="0 0 120 122" width="${size}" height="${size}" role="img" aria-label="${label}">
  <defs>
    <linearGradient id="${g}f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.fur[0]}"/><stop offset="1" stop-color="${C.fur[1]}"/></linearGradient>
    ${scarfDef}
    <linearGradient id="${g}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FBE3A2"/><stop offset=".6" stop-color="#E0A93F"/><stop offset="1" stop-color="#B07A1C"/></linearGradient>
    <radialGradient id="${g}lan" cx=".4" cy=".35" r=".75"><stop offset="0" stop-color="#FF8A6E"/><stop offset=".55" stop-color="#D2301F"/><stop offset="1" stop-color="#8E140C"/></radialGradient>
    <radialGradient id="${g}glow"><stop offset="0" stop-color="#FFD27A" stop-opacity=".55"/><stop offset="1" stop-color="#FFD27A" stop-opacity="0"/></radialGradient>
    <linearGradient id="${g}lotus" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFD1DC"/><stop offset="1" stop-color="#E86A8A"/></linearGradient>
    <radialGradient id="${g}ear" cx=".5" cy=".6" r=".6"><stop offset="0" stop-color="#FFB4C2"/><stop offset="1" stop-color="#F48BA2"/></radialGradient>
  </defs>
  ${seat}
  ${headBack(kind, g, fur, line)}
  <ellipse cx="60" cy="${pose === 'moon' ? 92 : 94}" rx="25" ry="21" fill="${fur}" stroke="${line}" stroke-width="1.2"/>
  ${lan ? `<ellipse cx="60" cy="${pose === 'moon' ? 96 : 98}" rx="14" ry="12" fill="#F6D27A" opacity=".85"/>` : ''}
  ${pose === 'moon' ? '' : `<ellipse cx="48" cy="112" rx="9" ry="5.5" fill="${C.foot}" stroke="${line}"/><ellipse cx="72" cy="112" rx="9" ry="5.5" fill="${C.foot}" stroke="${line}"/>`}
  <ellipse cx="60" cy="56" rx="31" ry="27" fill="${fur}" stroke="${line}" stroke-width="1.2"/>
  <path d="M38 47 q6-8 14-7" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" opacity=".7"/>
  ${headFront(kind, g, fur, line)}
  ${kind === 'khi' ? '' : ''}<ellipse cx="48.5" cy="${lan ? 56 : 58}" rx="${eyeR[0]}" ry="${eyeR[1]}" fill="#2B1B17"/><circle cx="50" cy="${lan ? 54 : 56.3}" r="${lan ? 1.8 : 1.4}" fill="#fff"/>
  <ellipse cx="71.5" cy="${lan ? 56 : 58}" rx="${eyeR[0]}" ry="${eyeR[1]}" fill="#2B1B17"/><circle cx="73" cy="${lan ? 54 : 56.3}" r="${lan ? 1.8 : 1.4}" fill="#fff"/>
  <ellipse cx="41" cy="67" rx="5.5" ry="3.3" fill="${C.cheek}" opacity=".6"/><ellipse cx="79" cy="67" rx="5.5" ry="3.3" fill="${C.cheek}" opacity=".6"/>
  ${C.wmouth ? `<path d="M57.6 63.4 h4.8 l-2.4 2.6z" fill="#F07D95"/>
  <path d="M55.5 67.5 q2.2 2.6 4.5 0 q2.3 2.6 4.5 0" stroke="#7A4A3E" stroke-width="1.5" fill="none" stroke-linecap="round"/>` : kind === 'cun' ? '<path d="M56 68 q4 3 8 0" stroke="#7A4A3E" stroke-width="1.5" fill="none" stroke-linecap="round"/>' : ''}
  <path d="M36 76 q24 12 48 0 l-2 7 q-22 10 -44 0z" fill="${scarf}"/>
  <path d="M36.6 78 q23.4 11.6 46.8 0" stroke="${lan ? '#C8392C' : '#F6D27A'}" stroke-width="1.2" fill="none" opacity=".9"/>
  <path d="M62 82 l8 14 -9 -3 -4 7 -2 -15z" fill="${scarf}"/>
  <circle cx="60" cy="82" r="3.6" fill="${lan ? '#C8392C' : gold}"/>
  <g class="m-${pose}">${props[pose] || props.wave}</g>
</svg>`;
}

/* ================= HỌA TIẾT ================= */
export const cloud = (w = 90, color = '#E9C46A', op = 0.9) => `<svg class="deco-cloud" viewBox="0 0 90 40" width="${w}" height="${w * 0.44}" aria-hidden="true">
  <path d="M8 32 h62 a10 10 0 0 0 0-20 a9 9 0 0 0-14-7 a12 12 0 0 0-22 2 a9 9 0 0 0-14 9 a8 8 0 0 0-12 8 a8 8 0 0 0 0 8z" fill="none" stroke="${color}" stroke-width="2.2" stroke-linejoin="round" opacity="${op}"/>
  <path d="M30 22 a5 5 0 1 1 6 5 M52 18 a4 4 0 1 1 5 4 M66 22 a3.5 3.5 0 1 1 4 3.5" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" opacity="${op}"/></svg>`;

export const sparkle = (s = 14, c = '#F1C14E') => `<svg viewBox="0 0 20 20" width="${s}" height="${s}" aria-hidden="true"><path d="M10 0 C11 7 13 9 20 10 C13 11 11 13 10 20 C9 13 7 11 0 10 C7 9 9 7 10 0z" fill="${c}"/></svg>`;

export const lanternString = () => {
  const g = uid('ls');
  const one = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 -14 v6" stroke="#8C5F12" stroke-width="1.4"/><rect x="-4" y="-9" width="8" height="3" rx="1" fill="#E0A93F"/>
    <ellipse cx="0" cy="2" rx="9" ry="11" fill="url(#${g})"/><path d="M-7 2 h14 M-6 -3 q6-2 12 0 M-6 7 q6 2 12 0" stroke="#F6D27A" stroke-width=".9" fill="none"/>
    <rect x="-4" y="12" width="8" height="3" rx="1" fill="#E0A93F"/><path d="M-1 15 v7 M1 15 v8" stroke="#C8392C" stroke-width="1.2"/></g>`;
  return `<svg class="deco-lanterns" viewBox="0 0 160 60" width="160" height="60" aria-hidden="true">
  <defs><radialGradient id="${g}" cx=".4" cy=".35" r=".75"><stop offset="0" stop-color="#FF8A6E"/><stop offset=".6" stop-color="#D2301F"/><stop offset="1" stop-color="#8E140C"/></radialGradient></defs>
  <path d="M0 4 Q80 26 160 4" stroke="#8C5F12" stroke-width="1.2" fill="none" opacity=".7"/>
  ${one(28, 24, 1)}${one(80, 30, 1.25)}${one(132, 24, 1)}</svg>`;
};

/** Trăng đúng pha theo ngày âm (1 = trăng non, 15 = trăng tròn) */
export function moonPhase(lday, size = 64) {
  return cachedSvg(`moon|${lday}|${size}`, () => moonPhaseRaw(lday, size));
}
function moonPhaseRaw(lday, size) {
  const g = uid('mp');
  const p = ((lday - 1) % 30) / 29.5; // 0 → 1
  const lit = p <= 0.5 ? p * 2 : (1 - p) * 2; // 0..1..0
  const waxing = p <= 0.5;
  const r = 28;
  const k = Math.cos(lit * Math.PI) * r; // >0: trăng khuyết (lưỡi liềm), <0: trăng gần tròn
  const outer = waxing ? 1 : 0; // nửa sáng: bên phải khi trăng lên, bên trái khi trăng xuống
  const term = waxing ? (k > 0 ? 0 : 1) : (k > 0 ? 1 : 0);
  const litPath = lit < 0.02 ? '' : lit > 0.98 ? `M32 4 A${r} ${r} 0 1 1 32 60 A${r} ${r} 0 1 1 32 4z` : `M32 4 A${r} ${r} 0 0 ${outer} 32 60 A${Math.max(0.01, Math.abs(k)).toFixed(2)} ${r} 0 0 ${term} 32 4z`;
  return `<svg class="moon-phase" viewBox="0 0 64 64" width="${size}" height="${size}" role="img" aria-label="Trăng ngày ${lday} âm lịch">
  <defs><radialGradient id="${g}" cx=".38" cy=".35" r=".75"><stop offset="0" stop-color="#FFF6D6"/><stop offset=".7" stop-color="#F6D27A"/><stop offset="1" stop-color="#D9A441"/></radialGradient>
  <radialGradient id="${g}h"><stop offset=".55" stop-color="#FFE7A8" stop-opacity=".45"/><stop offset="1" stop-color="#FFE7A8" stop-opacity="0"/></radialGradient></defs>
  <circle cx="32" cy="32" r="32" fill="url(#${g}h)" opacity="${(0.25 + lit * 0.75).toFixed(2)}"/>
  <clipPath id="${g}c"><path d="${litPath || 'M0 0'}"/></clipPath>
  <circle cx="32" cy="32" r="${r}" fill="#3A2E27" opacity="${lit < 0.08 ? '.12' : '.55'}"/>${lit < 0.08 ? `<circle cx="32" cy="32" r="${r - 0.9}" fill="none" stroke="#D9A441" stroke-width="1.8" stroke-dasharray="3 2.4" opacity=".85"/>` : ''}
  <g clip-path="url(#${g}c)"><circle cx="32" cy="32" r="${r}" fill="url(#${g})"/>
  <circle cx="24" cy="26" r="4" fill="#E2B456" opacity=".45"/><circle cx="40" cy="38" r="5.5" fill="#E2B456" opacity=".35"/><circle cx="37" cy="22" r="2.4" fill="#E2B456" opacity=".4"/></g>
</svg>`;
}

/* ================= BIỂU TƯỢNG MÀU CHO DỊCH VỤ (48×48) ================= */
const G = () => uid('i');
const wrap = (inner, defs = '') => `<svg viewBox="0 0 48 48" width="34" height="34" aria-hidden="true"><defs>${defs}</defs>${inner}</svg>`;
const lg = (id, a, b, c) => `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/>${c ? `<stop offset=".6" stop-color="${b}"/><stop offset="1" stop-color="${c}"/>` : `<stop offset="1" stop-color="${b}"/>`}</linearGradient>`;
const GOLD = ['#FBE3A2', '#E0A93F', '#A8721A'];
const RED = ['#FF8A6E', '#D2301F', '#8E140C'];

const ILL_RAW = {
  incense() { const a = G(), b = G(); return wrap(`
    <path d="M17 6 q-3 4 0 8 t0 8" stroke="#BFB1A6" stroke-width="1.8" fill="none" stroke-linecap="round" opacity=".8"/>
    <path d="M31 4 q3 4 0 8 t0 8" stroke="#BFB1A6" stroke-width="1.8" fill="none" stroke-linecap="round" opacity=".8"/>
    <path d="M18 24 v-9 M24 24 v-12 M30 24 v-9" stroke="#C8392C" stroke-width="2.2" stroke-linecap="round"/>
    <circle cx="18" cy="14.5" r="1.6" fill="#FF9D3C"/><circle cx="24" cy="11.5" r="1.6" fill="#FF9D3C"/><circle cx="30" cy="14.5" r="1.6" fill="#FF9D3C"/>
    <ellipse cx="24" cy="25" rx="15" ry="4" fill="url(#${b})"/>
    <path d="M9 25 q1 13 15 13 q14 0 15-13z" fill="url(#${a})"/>
    <path d="M14 30 h20" stroke="#FFF1C4" stroke-width="1.4" opacity=".8"/><rect x="17" y="38" width="14" height="4" rx="2" fill="#A8721A"/>`,
    lg(a, ...GOLD) + lg(b, '#8A6A4A', '#5C4330')); },
  cake() { const a = G(); return wrap(`
    <rect x="9" y="24" width="30" height="16" rx="4" fill="url(#${a})"/>
    <path d="M9 28 q3.75 4 7.5 0 t7.5 0 t7.5 0 t7.5 0 v-1 a4 4 0 0 0-4-4 h-22 a4 4 0 0 0-4 4z" fill="#FFF6EA"/>
    <circle cx="16" cy="34" r="1.6" fill="#FFE07A"/><circle cx="24" cy="35" r="1.6" fill="#8FD3B6"/><circle cx="32" cy="34" r="1.6" fill="#9CC3F0"/>
    <rect x="22.5" y="12" width="3" height="11" rx="1.2" fill="#6FA8DC"/><path d="M24 3 c4 4 4 8 0 10 -4-2-4-6 0-10z" fill="#F6B53C"/><path d="M24 7 c1.6 2 1.6 4 0 5 -1.6-1-1.6-3 0-5z" fill="#FFF1B8"/>`,
    lg(a, '#FFB8C8', '#E3577D')); },
  rings() { const a = G(); return wrap(`
    <circle cx="18" cy="28" r="10" fill="none" stroke="url(#${a})" stroke-width="4"/><circle cx="30" cy="28" r="10" fill="none" stroke="url(#${a})" stroke-width="4"/>
    <path d="M24 16 l-4-4 2-3 h4 l2 3z" fill="#BFE6FF" stroke="#7FB8E0"/>
    <path d="M36 10 c2-3 6-1 4 2 l-4 4 -4-4 c-2-3 2-5 4-2z" fill="#F0637F"/>`, lg(a, ...GOLD)); },
  lotus() { const a = G(), b = G(); return wrap(`
    <ellipse cx="24" cy="40" rx="18" ry="4" fill="#5FB48C" opacity=".85"/>
    <path d="M24 38 c-12 0-18-6-19-12 6 0 11 3 13 6z" fill="url(#${b})"/><path d="M24 38 c12 0 18-6 19-12 -6 0-11 3-13 6z" fill="url(#${b})"/>
    <path d="M24 38 c-7-4-9-12-7-20 4 2 6 6 7 10 1-4 3-8 7-10 2 8 0 16-7 20z" fill="url(#${a})"/>
    <path d="M24 38 c-3-5-3-14 0-24 3 10 3 19 0 24z" fill="#FFF0F4"/>`, lg(a, '#FFD1DC', '#E86A8A') + lg(b, '#FFE3EA', '#F29AB0')); },
  book() { const a = G(); return wrap(`
    <path d="M5 12 q9-4 19 1 q10-5 19-1 v26 q-9-4-19 1 q-10-5-19-1z" fill="#FFF6EA" stroke="url(#${a})" stroke-width="2.6" stroke-linejoin="round"/>
    <path d="M24 13 v26" stroke="#B5261A" stroke-width="2"/>
    <path d="M10 19 h9 M10 24 h9 M10 29 h7 M29 19 h9 M29 24 h9 M29 29 h7" stroke="#C9B49F" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M33 8 v14 l3-2.5 3 2.5 v-14z" fill="#E0A93F"/>`, lg(a, ...RED)); },
  tray() { const a = G(); return wrap(`
    <circle cx="17" cy="24" r="6" fill="#FF9D3C"/><circle cx="29" cy="22" r="7" fill="#E5463A"/><circle cx="24" cy="15" r="5.5" fill="#F6C343"/>
    <path d="M27 9 q3-3 6-1" stroke="#4E9B6E" stroke-width="2" fill="none" stroke-linecap="round"/><circle cx="35" cy="27" r="4" fill="#7CC36E"/><circle cx="12" cy="28" r="3.5" fill="#B05BD0"/>
    <ellipse cx="24" cy="31" rx="20" ry="6" fill="url(#${a})"/><path d="M8 33 q16 8 32 0 l-3 8 h-26z" fill="#A8721A"/>`, lg(a, ...GOLD)); },
  card() { const a = G(), b = G(); return wrap(`
    <rect x="5" y="11" width="38" height="28" rx="4" fill="url(#${a})"/><path d="M5 14 l19 13 19-13" stroke="#F6D27A" stroke-width="1.8" fill="none"/>
    <circle cx="24" cy="27" r="6" fill="url(#${b})"/><path d="M24 23.5 v7 M20.5 27 h7" stroke="#8E140C" stroke-width="1.6"/>`, lg(a, ...RED) + lg(b, ...GOLD)); },
  coin() { const a = G(); return wrap(`
    <circle cx="22" cy="26" r="15" fill="url(#${a})" stroke="#A8721A" stroke-width="1.5"/><circle cx="22" cy="26" r="11" fill="none" stroke="#FFF1C4" stroke-width="1" opacity=".8"/>
    <rect x="18" y="22" width="8" height="8" rx="1" fill="#FFF6EA" stroke="#A8721A"/>
    <path d="M38 6 C38.6 10 40 11.4 44 12 C40 12.6 38.6 14 38 18 C37.4 14 36 12.6 32 12 C36 11.4 37.4 10 38 6z" fill="#F6C343"/>`, lg(a, ...GOLD)); },
  star() { const a = G(); return wrap(`
    <path d="M24 5 l5.6 11.4 12.6 1.8-9.1 8.9 2.1 12.5L24 33.7l-11.2 5.9 2.1-12.5-9.1-8.9 12.6-1.8z" fill="url(#${a})" stroke="#B9831F" stroke-width="1.2" stroke-linejoin="round"/>
    <ellipse cx="20.5" cy="23" rx="1.6" ry="2.2" fill="#5B3A10"/><ellipse cx="27.5" cy="23" rx="1.6" ry="2.2" fill="#5B3A10"/><path d="M21 28 q3 2.6 6 0" stroke="#5B3A10" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    <path d="M41 32 v6 M38 35 h6" stroke="#F6C343" stroke-width="2" stroke-linecap="round"/>`, lg(a, '#FFF1B8', '#F6C343', '#E0A02A')); },
  swap() { const a = G(); return wrap(`
    <circle cx="16" cy="18" r="9" fill="url(#${a})"/><path d="M16 4 v3 M16 29 v3 M2 18 h3 M27 18 h3 M6 8 l2 2 M24 26 l2 2 M6 28 l2-2 M24 10 l2-2" stroke="#F6A93C" stroke-width="2" stroke-linecap="round"/>
    <path d="M38 22 a10 10 0 1 0 6 16 a8 8 0 0 1-6-16z" fill="#F6D27A" stroke="#C8962E" stroke-width="1.2"/>
    <path d="M20 40 h10 l-3-3 M30 40 l-3 3" stroke="#2F7D5A" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`, lg(a, '#FFD36E', '#F59A2C')); },
  cal() { const a = G(); return wrap(`
    <rect x="6" y="9" width="36" height="33" rx="5" fill="#FFF6EA" stroke="#E6D6C4"/><path d="M6 14 a5 5 0 0 1 5-5 h26 a5 5 0 0 1 5 5 v5 h-36z" fill="url(#${a})"/>
    <rect x="14" y="5" width="3" height="8" rx="1.5" fill="#7A4A3E"/><rect x="31" y="5" width="3" height="8" rx="1.5" fill="#7A4A3E"/>
    <text x="24" y="37" text-anchor="middle" font-family="Noto Serif, serif" font-weight="700" font-size="15" fill="#9B1A12">15</text>
    <circle cx="36" cy="25" r="3" fill="#F6C343"/>`, lg(a, ...RED)); },
  sun() { const a = G(); return wrap(`
    <circle cx="24" cy="25" r="15" fill="#FFF6EA" stroke="url(#${a})" stroke-width="3.5"/>
    <path d="M24 25 v-9 M24 25 l6 4" stroke="#7A4A3E" stroke-width="2.4" stroke-linecap="round"/><circle cx="24" cy="25" r="2" fill="#C8392C"/>
    <path d="M24 3 v4 M41 8 l-3 3 M7 8 l3 3" stroke="#F6A93C" stroke-width="2.4" stroke-linecap="round"/>`, lg(a, '#FFD36E', '#F59A2C')); },
  family() { return wrap(`
    <circle cx="14" cy="17" r="6" fill="#F7C9A8"/><path d="M5 36 a9 9 0 0 1 18 0z" fill="#5C8FD6"/>
    <circle cx="34" cy="17" r="6" fill="#F7C9A8"/><path d="M25 36 a9 9 0 0 1 18 0z" fill="#E3577D"/>
    <circle cx="24" cy="26" r="5" fill="#FBD9BF"/><path d="M16.5 42 a7.5 7.5 0 0 1 15 0z" fill="#F6B53C"/>
    <path d="M24 4 c1.2-2 4-1 3 1.2 l-3 3 -3-3 c-1-2.2 1.8-3.2 3-1.2z" fill="#F0637F"/>`); },
  inbox() { const a = G(); return wrap(`
    <rect x="12" y="4" width="24" height="18" rx="3" fill="#FFF6EA" stroke="#E6D6C4"/><path d="M17 10 h14 M17 15 h9" stroke="#C9B49F" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M24 18 v10 m-5-5 5 5 5-5" stroke="#2F7D5A" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M5 28 h11 l3 5 h10 l3-5 h11 v10 a4 4 0 0 1-4 4 h-30 a4 4 0 0 1-4-4z" fill="url(#${a})"/>`, lg(a, '#5FC29A', '#1F7D5A')); },
  contacts() { return wrap(`
    <rect x="8" y="6" width="28" height="36" rx="4" fill="#5C8FD6"/><rect x="5" y="12" width="5" height="4" rx="1" fill="#2F5FA8"/><rect x="5" y="22" width="5" height="4" rx="1" fill="#2F5FA8"/><rect x="5" y="32" width="5" height="4" rx="1" fill="#2F5FA8"/>
    <circle cx="22" cy="19" r="5" fill="#FBD9BF"/><path d="M14 33 a8 8 0 0 1 16 0z" fill="#FFF6EA"/>
    <ellipse cx="39" cy="15" rx="5" ry="6" fill="#F0637F"/><path d="M39 21 q-2 6 1 12" stroke="#9A6A5A" stroke-width="1.2" fill="none"/>`); },
  cloud() { const a = G(); return wrap(`
    <path d="M12 36 h25 a8 8 0 0 0 1-16 a11 11 0 0 0-21-3 a8 8 0 0 0-5 19z" fill="url(#${a})"/>
    <path d="M18 27 l4 4 8-8" stroke="#1F7D5A" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`, lg(a, '#FFFFFF', '#D9ECFF')); },
  taiji() { const a = G(); return wrap(`
    <circle cx="24" cy="24" r="16" fill="#FFF6EA" stroke="url(#${a})" stroke-width="2"/>
    <path d="M24 8 a16 16 0 0 1 0 32 a8 8 0 0 1 0-16 a8 8 0 0 0 0-16z" fill="#2A201B"/>
    <circle cx="24" cy="16" r="2.6" fill="#2A201B"/><circle cx="24" cy="32" r="2.6" fill="#FFF6EA"/>
    <path d="M42 6 C42.5 9 43.5 10 46 10.5 C43.5 11 42.5 12 42 15 C41.5 12 40.5 11 38 10.5 C40.5 10 41.5 9 42 6z" fill="#B48BEB"/>`, lg(a, '#B48BEB', '#6A45B0')); },
  num() { const a = G(); return wrap(`
    <circle cx="24" cy="24" r="17" fill="url(#${a})"/><circle cx="24" cy="24" r="13" fill="none" stroke="#FFFFFF" stroke-width="1.2" opacity=".5"/>
    <text x="24" y="31" text-anchor="middle" font-family="Noto Serif, serif" font-weight="700" font-size="20" fill="#FFFFFF">9</text>`, lg(a, '#C3A6F2', '#6A45B0')); },
  hexa() { const a = G(); return wrap(`
    <rect x="10" y="8" width="28" height="4" rx="2" fill="#4A3570"/><rect x="10" y="16" width="12" height="4" rx="2" fill="#4A3570"/><rect x="26" y="16" width="12" height="4" rx="2" fill="#4A3570"/>
    <rect x="10" y="24" width="28" height="4" rx="2" fill="#4A3570"/>
    <circle cx="16" cy="38" r="6" fill="url(#${a})"/><circle cx="32" cy="38" r="6" fill="url(#${a})"/><rect x="14" y="36" width="4" height="4" fill="#FFF6EA"/><rect x="30" y="36" width="4" height="4" fill="#FFF6EA"/>`, lg(a, ...GOLD)); },
  lantern() { const a = G(), b = G(); return wrap(`
    <path d="M24 2 v6" stroke="#8C5F12" stroke-width="1.8"/><rect x="17" y="7" width="14" height="4" rx="1.5" fill="url(#${b})"/>
    <ellipse cx="24" cy="24" rx="15" ry="14" fill="url(#${a})"/>
    <path d="M10 24 h28 M11.5 17 q12.5-4 25 0 M11.5 31 q12.5 4 25 0" stroke="#F6D27A" stroke-width="1.3" fill="none"/>
    <rect x="17" y="37" width="14" height="4" rx="1.5" fill="url(#${b})"/><path d="M21 41 v6 M24 41 v7 M27 41 v6" stroke="#C8392C" stroke-width="1.6" stroke-linecap="round"/>`,
    `<radialGradient id="${a}" cx=".4" cy=".35" r=".75"><stop offset="0" stop-color="#FF8A6E"/><stop offset=".6" stop-color="#D2301F"/><stop offset="1" stop-color="#8E140C"/></radialGradient>` + lg(b, ...GOLD)); },
  house() { const a = G(); return wrap(`
    <path d="M5 22 L24 7 43 22" stroke="#9B1A12" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M10 20 v20 h28 v-20 L24 9z" fill="#FFF6EA"/><path d="M3 23 q21-20 42 0 l-2 2 q-19-16-38 0z" fill="url(#${a})"/>
    <rect x="20" y="28" width="8" height="12" rx="1.5" fill="#C98E25"/><rect x="13" y="26" width="5" height="5" rx="1" fill="#9CC3F0"/><rect x="30" y="26" width="5" height="5" rx="1" fill="#9CC3F0"/>
    <path d="M40 8 C40.5 11 41.5 12 44 12.5 C41.5 13 40.5 14 40 17 C39.5 14 38.5 13 36 12.5 C38.5 12 39.5 11 40 8z" fill="#F6C343"/>`, lg(a, ...RED)); },
  fish() { const a = G(); return wrap(`
    <path d="M6 24 q12-14 28-4 l8-8 v24 l-8-8 q-16 10-28-4z" fill="url(#${a})"/>
    <path d="M14 18 q4 6 0 12 M20 16 q4 8 0 16" stroke="#FFE3B0" stroke-width="1.4" fill="none" opacity=".8"/>
    <circle cx="11" cy="22" r="1.8" fill="#3A1A10"/><path d="M8 28 q2 2 5 1" stroke="#8E140C" stroke-width="1.2" fill="none"/>`, lg(a, '#FFB35C', '#E5463A', '#B5261A')); },
  tree() { const a = G(); return wrap(`
    <path d="M24 44 v-14 M24 34 l-8-6 M24 31 l8-6" stroke="#8A5A36" stroke-width="3" stroke-linecap="round" fill="none"/>
    <circle cx="24" cy="16" r="11" fill="url(#${a})"/><circle cx="13" cy="24" r="7.5" fill="url(#${a})"/><circle cx="35" cy="24" r="7.5" fill="url(#${a})"/>
    <circle cx="24" cy="13" r="3" fill="#FBD9BF" stroke="#fff" stroke-width="1.2"/><circle cx="13" cy="23" r="2.6" fill="#FBD9BF" stroke="#fff" stroke-width="1.2"/><circle cx="35" cy="23" r="2.6" fill="#FBD9BF" stroke="#fff" stroke-width="1.2"/>
    <ellipse cx="24" cy="44" rx="12" ry="2.4" fill="#5FB48C" opacity=".6"/>`, lg(a, '#8FD3A6', '#3F9B6A')); },
  frame() { const a = G(); return wrap(`
    <rect x="9" y="5" width="30" height="36" rx="3" fill="url(#${a})"/><rect x="13" y="9" width="22" height="28" rx="2" fill="#FFF6EA"/>
    <circle cx="24" cy="19" r="5" fill="#C9B49F"/><path d="M15.5 35 a8.5 8 0 0 1 17 0z" fill="#C9B49F"/>
    <path d="M19 41 l-3 5 M29 41 l3 5" stroke="#A8721A" stroke-width="2" stroke-linecap="round"/>
    <path d="M38 6 c2-3 6-1 4 2 l-4 4 -4-4 c-2-3 2-5 4-2z" fill="#F0637F"/>`, lg(a, ...GOLD)); },
  hongbao() { const a = G(), b = G(); return wrap(`
    <rect x="10" y="5" width="28" height="38" rx="4" fill="url(#${a})"/><path d="M10 13 q14 10 28 0" fill="#B5261A"/>
    <circle cx="24" cy="18" r="6" fill="url(#${b})"/><path d="M21 18 h6 M24 15 v6" stroke="#8E140C" stroke-width="1.6"/>
    <path d="M16 30 h16 M18 35 h12" stroke="#F6D27A" stroke-width="1.8" stroke-linecap="round" opacity=".9"/>`, lg(a, ...RED) + lg(b, ...GOLD)); },
  checklist() { const a = G(); return wrap(`
    <rect x="8" y="7" width="32" height="37" rx="4" fill="#FFF6EA" stroke="url(#${a})" stroke-width="2.4"/><rect x="17" y="3" width="14" height="7" rx="2.5" fill="url(#${a})"/>
    <path d="M13 19 l2.5 2.5 4.5-5 M13 28 l2.5 2.5 4.5-5" stroke="#2F9E6A" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="13.5" y="34" width="5" height="5" rx="1.2" fill="none" stroke="#C9B49F" stroke-width="1.6"/>
    <path d="M23 20 h12 M23 29 h12 M23 37 h9" stroke="#C9B49F" stroke-width="1.8" stroke-linecap="round"/>`, lg(a, ...GOLD)); },
  scroll() { const a = G(); return wrap(`
    <rect x="11" y="8" width="26" height="32" fill="#FFF6EA"/><rect x="7" y="5" width="34" height="6" rx="3" fill="url(#${a})"/><rect x="7" y="37" width="34" height="6" rx="3" fill="url(#${a})"/>
    <circle cx="24" cy="22" r="7" fill="none" stroke="#C8392C" stroke-width="1.8"/><path d="M24 15 v14 M17 22 h14" stroke="#C8392C" stroke-width="1.2" opacity=".7"/>
    <path d="M16 33 h16" stroke="#C9B49F" stroke-width="1.8" stroke-linecap="round"/>`, lg(a, ...RED)); },
  starlamp() { const a = G(); return wrap(`
    <circle cx="24" cy="24" r="17" fill="#2A2350"/><circle cx="24" cy="24" r="17" fill="none" stroke="url(#${a})" stroke-width="2"/>
    ${[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => { const t = (i / 9) * Math.PI * 2 - Math.PI / 2; return `<circle cx="${(24 + 12 * Math.cos(t)).toFixed(1)}" cy="${(24 + 12 * Math.sin(t)).toFixed(1)}" r="2" fill="#FFD46B"/>`; }).join('')}
    <path d="M24 16 l2.2 4.6 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5-3.6-3.5 5-.7z" fill="url(#${a})"/>`, lg(a, ...GOLD)); },
  pagoda() { const a = G(); return wrap(`
    <path d="M24 3 v5" stroke="#A8721A" stroke-width="2" stroke-linecap="round"/>
    <path d="M10 15 q14-9 28 0 l-3 2 h-22z" fill="url(#${a})"/><rect x="15" y="17" width="18" height="7" fill="#FFF6EA"/>
    <path d="M7 27 q17-9 34 0 l-3 2 h-28z" fill="url(#${a})"/><rect x="12" y="29" width="24" height="12" fill="#FFF6EA"/>
    <rect x="21" y="32" width="6" height="9" rx="3" fill="#C98E25"/><rect x="6" y="41" width="36" height="3" rx="1.5" fill="#8A5A36"/>`, lg(a, ...RED)); },
  bowl() { const a = G(); return wrap(`
    <path d="M20 14 c-6-4-4-10 2-11 2 5 0 9-2 11z" fill="#5FB48C"/><path d="M27 13 c4-6 10-5 11-1 -4 3-8 3-11 1z" fill="#7CC36E"/>
    <ellipse cx="24" cy="22" rx="17" ry="4" fill="#F7E3B8"/><circle cx="18" cy="20" r="3" fill="#F2C230"/><circle cx="26" cy="19" r="3.4" fill="#E5463A"/><circle cx="32" cy="21" r="2.6" fill="#7CC36E"/>
    <path d="M7 22 q17 26 34 0z" fill="url(#${a})"/><rect x="17" y="38" width="14" height="4" rx="2" fill="#A8721A"/>`, lg(a, '#9CC3F0', '#3E78C8')); },
  wuxing() { return wrap(`
    <circle cx="24" cy="24" r="17" fill="none" stroke="#E2D6C3" stroke-width="2"/>
    <circle cx="24" cy="8" r="6" fill="#E5463A"/><circle cx="39" cy="19" r="6" fill="#F2C230"/><circle cx="33" cy="37" r="6" fill="#D9DEE6" stroke="#9AA3AF"/>
    <circle cx="15" cy="37" r="6" fill="#2F6FD6"/><circle cx="9" cy="19" r="6" fill="#2E9E5B"/>`); },
  compass() { const a = G(); return wrap(`
    <circle cx="24" cy="24" r="18" fill="#FFF6EA" stroke="url(#${a})" stroke-width="3.2"/>
    <path d="M24 9 l4.5 15 -4.5 15 -4.5-15z" fill="#C8392C"/><path d="M24 24 l4.5 0 -4.5 15 -4.5-15z" fill="#3A2E28"/>
    <circle cx="24" cy="24" r="2.6" fill="#F6C343"/><text x="24" y="8" font-size="0">B</text>`, lg(a, ...GOLD)); },
  face() { return wrap(`
    <circle cx="24" cy="22" r="13" fill="#FBD9BF"/><path d="M11 20 a13 13 0 0 1 26 0 q-6-6-13-4 q-7-2-13 4z" fill="#3A2A22"/>
    <circle cx="19" cy="23" r="1.6" fill="#3A2A22"/><circle cx="29" cy="23" r="1.6" fill="#3A2A22"/><path d="M20 28 q4 3 8 0" stroke="#C8392C" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    <path d="M10 44 a14 10 0 0 1 28 0z" fill="#9B6BD6"/>`); }
};/** Biểu tượng màu (đã qua bộ nhớ đệm) */
export const ILL = Object.fromEntries(Object.entries(ILL_RAW).map(([k, f]) => [k, (...a) => svgImage(`I|${k}|${a.join(',')}`, () => f(...a), [48, 48], 'width="34" height="34" aria-hidden="true"')]));


/* ===== Giao diện theo mùa lễ (tính theo âm lịch) ===== */
const flower = (x, y, r, c1, c2) => {
  const p = [0, 72, 144, 216, 288].map((a) => `<ellipse cx="${x}" cy="${y - r * 0.55}" rx="${r * 0.42}" ry="${r * 0.6}" transform="rotate(${a} ${x} ${y})"/>`).join('');
  return `<g fill="${c1}" stroke="${c2}" stroke-width=".6">${p}</g><circle cx="${x}" cy="${y}" r="${r * 0.28}" fill="#C0561B"/>`;
};
/** Cành mai (vàng) hoặc đào (hồng) cho dịp Tết */
export function blossomBranch(w = 120, kind = 'mai') {
  const [c1, c2] = kind === 'dao' ? ['#FFB3C7', '#E06A8C'] : ['#FFD95A', '#E0A21B'];
  return `<svg class="deco-branch" viewBox="0 0 120 70" width="${w}" height="${w * 0.58}" aria-hidden="true">
    <path d="M-2 8 C30 14 48 22 70 40 C84 52 98 58 120 62" class="br" fill="none" stroke="#6B3E22" stroke-width="3.2" stroke-linecap="round"/>
    <path d="M40 20 C46 8 56 4 66 4 M70 40 C74 30 82 26 92 26 M24 12 C26 22 22 32 14 38" class="br" fill="none" stroke="#6B3E22" stroke-width="2" stroke-linecap="round"/>
    ${flower(66, 6, 8, c1, c2)}${flower(92, 26, 9, c1, c2)}${flower(14, 38, 7, c1, c2)}${flower(52, 26, 6, c1, c2)}${flower(108, 58, 7, c1, c2)}
    <circle cx="80" cy="46" r="2.4" fill="${c2}"/><circle cx="32" cy="16" r="2" fill="${c2}"/><circle cx="58" cy="32" r="2.2" fill="#7FA650"/></svg>`;
}

/** Mùa lễ theo ngày âm: Tết (23 tháng Chạp → Rằm tháng Giêng), Vu Lan (1–15/7), Trung thu (1–16/8) */
export function seasonOf(l) {
  if ((l.month === 12 && l.day >= 23) || (l.month === 1 && l.day <= 15)) return { id: 'tet', pose: 'star', greet: l.month === 12 ? 'Sắp Tết rồi' : 'Chúc mừng năm mới' };
  if (l.month === 7 && l.day <= 15) return { id: 'vulan', pose: 'pray', greet: 'Mùa Vu Lan báo hiếu' };
  if (l.month === 8 && l.day <= 16) return { id: 'trungthu', pose: 'lantern', greet: 'Mùa Trung thu' };
  return null;
}

/** Trang trí đặt trên tờ lịch theo mùa */
export function seasonDecor(s) {
  if (!s) return '';
  if (s.id === 'tet') return `<span class="season-deco tl">${blossomBranch(118, 'mai')}</span>`;
  if (s.id === 'trungthu') return `<span class="season-deco lan">${lanternString()}</span>`;
  if (s.id === 'vulan') return `<span class="season-deco lotus">${ILL.lotus()}</span><span class="season-deco lotus r">${ILL.lotus()}</span>`;
  return '';
}
