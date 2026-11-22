// Hình minh họa riêng của app (tự vẽ bằng SVG, không dùng tài nguyên bên ngoài):
// linh vật "Bé Thỏ Ngọc", mây cát tường, đèn lồng, sao, trăng theo ngày âm, biểu tượng màu cho dịch vụ.
let seq = 0;
const uid = (p) => `${p}${++seq}`;

/* ================= LINH VẬT: BÉ THỎ NGỌC ================= */
/**
 * pose: 'wave' | 'lantern' | 'pray' | 'star' | 'cake' | 'letter' | 'moon' | 'phone' | 'book'
 */
export function mascot(pose = 'wave', size = 120, label = 'Bé Thỏ Ngọc') {
  const g = uid('m');
  const fur = `url(#${g}f)`, scarf = `url(#${g}s)`, gold = `url(#${g}g)`;
  const arm = (cx, cy, rot) => `<ellipse cx="${cx}" cy="${cy}" rx="7" ry="11" transform="rotate(${rot} ${cx} ${cy})" fill="${fur}" stroke="#E9D9C8" stroke-width="1"/>`;
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
    pray: `<ellipse cx="55" cy="84" rx="7" ry="11" transform="rotate(28 55 84)" fill="${fur}" stroke="#E9D9C8"/>
      <ellipse cx="65" cy="84" rx="7" ry="11" transform="rotate(-28 65 84)" fill="${fur}" stroke="#E9D9C8"/>
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
  return `<svg class="mascot" viewBox="0 0 120 122" width="${size}" height="${size}" role="img" aria-label="${label}">
  <defs>
    <linearGradient id="${g}f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#F3E6D8"/></linearGradient>
    <linearGradient id="${g}s" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E25A47"/><stop offset="1" stop-color="#8E140C"/></linearGradient>
    <linearGradient id="${g}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FBE3A2"/><stop offset=".6" stop-color="#E0A93F"/><stop offset="1" stop-color="#B07A1C"/></linearGradient>
    <radialGradient id="${g}lan" cx=".4" cy=".35" r=".75"><stop offset="0" stop-color="#FF8A6E"/><stop offset=".55" stop-color="#D2301F"/><stop offset="1" stop-color="#8E140C"/></radialGradient>
    <radialGradient id="${g}glow"><stop offset="0" stop-color="#FFD27A" stop-opacity=".55"/><stop offset="1" stop-color="#FFD27A" stop-opacity="0"/></radialGradient>
    <linearGradient id="${g}lotus" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFD1DC"/><stop offset="1" stop-color="#E86A8A"/></linearGradient>
    <radialGradient id="${g}ear" cx=".5" cy=".6" r=".6"><stop offset="0" stop-color="#FFB4C2"/><stop offset="1" stop-color="#F48BA2"/></radialGradient>
  </defs>
  ${seat}
  <g class="ears">
    <ellipse cx="45" cy="24" rx="9.5" ry="22" transform="rotate(-12 45 24)" fill="${fur}" stroke="#E9D9C8" stroke-width="1.2"/>
    <ellipse cx="45" cy="26" rx="4.6" ry="15" transform="rotate(-12 45 26)" fill="url(#${g}ear)"/>
    <ellipse cx="76" cy="22" rx="9.5" ry="22" transform="rotate(14 76 22)" fill="${fur}" stroke="#E9D9C8" stroke-width="1.2"/>
    <ellipse cx="76" cy="24" rx="4.6" ry="15" transform="rotate(14 76 24)" fill="url(#${g}ear)"/>
  </g>
  <ellipse cx="60" cy="${pose === 'moon' ? 92 : 94}" rx="25" ry="21" fill="${fur}" stroke="#E9D9C8" stroke-width="1.2"/>
  ${pose === 'moon' ? '' : '<ellipse cx="48" cy="112" rx="9" ry="5.5" fill="#FFFFFF" stroke="#E9D9C8"/><ellipse cx="72" cy="112" rx="9" ry="5.5" fill="#FFFFFF" stroke="#E9D9C8"/>'}
  <ellipse cx="60" cy="56" rx="31" ry="27" fill="${fur}" stroke="#E9D9C8" stroke-width="1.2"/>
  <path d="M38 47 q6-8 14-7" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" opacity=".9"/>
  <ellipse cx="48.5" cy="58" rx="3.8" ry="4.6" fill="#2B1B17"/><circle cx="49.8" cy="56.3" r="1.4" fill="#fff"/>
  <ellipse cx="71.5" cy="58" rx="3.8" ry="4.6" fill="#2B1B17"/><circle cx="72.8" cy="56.3" r="1.4" fill="#fff"/>
  <ellipse cx="41" cy="67" rx="5.5" ry="3.3" fill="#FF9DB0" opacity=".6"/><ellipse cx="79" cy="67" rx="5.5" ry="3.3" fill="#FF9DB0" opacity=".6"/>
  <path d="M57.6 63.4 h4.8 l-2.4 2.6z" fill="#F07D95"/>
  <path d="M55.5 67.5 q2.2 2.6 4.5 0 q2.3 2.6 4.5 0" stroke="#7A4A3E" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  <path d="M36 76 q24 12 48 0 l-2 7 q-22 10 -44 0z" fill="${scarf}"/>
  <path d="M36.6 78 q23.4 11.6 46.8 0" stroke="#F6D27A" stroke-width="1.2" fill="none" opacity=".9"/>
  <path d="M62 82 l8 14 -9 -3 -4 7 -2 -15z" fill="${scarf}"/>
  <circle cx="60" cy="82" r="3.6" fill="${gold}"/>
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
  <circle cx="32" cy="32" r="${r}" fill="#3A2E27" opacity=".55"/>
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

export const ILL = {
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
  face() { return wrap(`
    <circle cx="24" cy="22" r="13" fill="#FBD9BF"/><path d="M11 20 a13 13 0 0 1 26 0 q-6-6-13-4 q-7-2-13 4z" fill="#3A2A22"/>
    <circle cx="19" cy="23" r="1.6" fill="#3A2A22"/><circle cx="29" cy="23" r="1.6" fill="#3A2A22"/><path d="M20 28 q4 3 8 0" stroke="#C8392C" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    <path d="M10 44 a14 10 0 0 1 28 0z" fill="#9B6BD6"/>`); }
};
