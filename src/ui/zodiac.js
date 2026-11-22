// 12 con giáp theo cách gọi Việt Nam (Mão là Mèo, Sửu là Trâu) — tự vẽ bằng SVG.
let n = 0;
const id = () => `z${++n}`;

export const GIAP = ['Chuột', 'Trâu', 'Hổ', 'Mèo', 'Rồng', 'Rắn', 'Ngựa', 'Dê', 'Khỉ', 'Gà', 'Chó', 'Lợn'];
const CHI = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];

const eyes = (y = 26, dx = 6, c = '#2B1B17') => `<ellipse cx="${24 - dx}" cy="${y}" rx="2.1" ry="2.6" fill="${c}"/><ellipse cx="${24 + dx}" cy="${y}" rx="2.1" ry="2.6" fill="${c}"/>
  <circle cx="${24 - dx + .8}" cy="${y - 1}" r=".8" fill="#fff"/><circle cx="${24 + dx + .8}" cy="${y - 1}" r=".8" fill="#fff"/>`;
const blush = (y = 31, dx = 10) => `<ellipse cx="${24 - dx}" cy="${y}" rx="3" ry="1.8" fill="#FF8FA6" opacity=".55"/><ellipse cx="${24 + dx}" cy="${y}" rx="3" ry="1.8" fill="#FF8FA6" opacity=".55"/>`;
const grad = (g, a, b) => `<radialGradient id="${g}" cx=".4" cy=".32" r=".8"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></radialGradient>`;

const DRAW = [
  // Tý — Chuột
  (g) => `<defs>${grad(g, '#E4E2E6', '#A9A4AE')}</defs>
    <circle cx="11" cy="14" r="8.5" fill="url(#${g})"/><circle cx="37" cy="14" r="8.5" fill="url(#${g})"/><circle cx="11" cy="14" r="5" fill="#F6B3C2"/><circle cx="37" cy="14" r="5" fill="#F6B3C2"/>
    <ellipse cx="24" cy="28" rx="15" ry="14" fill="url(#${g})"/>${eyes(26, 5.5)}${blush(32, 9)}
    <ellipse cx="24" cy="32" rx="2.4" ry="1.8" fill="#F07D95"/>
    <path d="M14 33 h-7 M14 35.5 l-6 2 M34 33 h7 M34 35.5 l6 2" stroke="#7D7682" stroke-width="1" stroke-linecap="round"/>`,
  // Sửu — Trâu
  (g) => `<defs>${grad(g, '#A97A5A', '#6E4630')}</defs>
    <path d="M10 15 q-6-4-6-11 q4 6 11 6z" fill="#F2E3C6" stroke="#CDB38A" stroke-width=".8"/><path d="M38 15 q6-4 6-11 q-4 6-11 6z" fill="#F2E3C6" stroke="#CDB38A" stroke-width=".8"/>
    <ellipse cx="7" cy="21" rx="5" ry="3" fill="#8B5E43" transform="rotate(-20 7 21)"/><ellipse cx="41" cy="21" rx="5" ry="3" fill="#8B5E43" transform="rotate(20 41 21)"/>
    <ellipse cx="24" cy="25" rx="14" ry="15" fill="url(#${g})"/>${eyes(22, 6)}
    <ellipse cx="24" cy="34" rx="11" ry="7" fill="#F3C9A9"/><ellipse cx="20" cy="34" rx="1.8" ry="2.2" fill="#6E4630"/><ellipse cx="28" cy="34" rx="1.8" ry="2.2" fill="#6E4630"/>
    <path d="M21 15 q3-3 6 0" stroke="#5A3826" stroke-width="2" fill="none" stroke-linecap="round"/>`,
  // Dần — Hổ
  (g) => `<defs>${grad(g, '#FFB04A', '#E0781C')}</defs>
    <circle cx="11" cy="13" r="6" fill="url(#${g})"/><circle cx="37" cy="13" r="6" fill="url(#${g})"/><circle cx="11" cy="13" r="3" fill="#3A2416"/><circle cx="37" cy="13" r="3" fill="#3A2416"/>
    <ellipse cx="24" cy="27" rx="16" ry="15" fill="url(#${g})"/>
    <path d="M19 15 h10 M20 18.5 h8 M24 13 v8" stroke="#3A2416" stroke-width="2" stroke-linecap="round"/>
    <path d="M8 26 h5 M8.5 30 h4.5 M40 26 h-5 M39.5 30 h-4.5" stroke="#3A2416" stroke-width="2" stroke-linecap="round"/>
    <ellipse cx="18" cy="34" rx="6" ry="5" fill="#FFF6EA"/><ellipse cx="30" cy="34" rx="6" ry="5" fill="#FFF6EA"/>${eyes(25, 6)}
    <path d="M22 31 h4 l-2 2.4z" fill="#F07D95"/>`,
  // Mão — Mèo
  (g) => `<defs>${grad(g, '#FCE9D2', '#E8B98A')}</defs>
    <path d="M8 22 L9 5 L20 14z" fill="url(#${g})"/><path d="M40 22 L39 5 L28 14z" fill="url(#${g})"/><path d="M10.5 18 L11 9 L17 14z" fill="#F6B3C2"/><path d="M37.5 18 L37 9 L31 14z" fill="#F6B3C2"/>
    <ellipse cx="24" cy="27" rx="16" ry="14" fill="url(#${g})"/>
    <path d="M20 15 q4 3 8 0 M24 13 v4" stroke="#D08F52" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    <path d="M24 28 q-3 1-7-1" fill="none"/>${eyes(26, 6)}${blush(31, 10)}
    <path d="M22.6 30 h2.8 l-1.4 1.6z" fill="#F07D95"/><path d="M21.5 33 q1.3 1.4 2.5 0 q1.2 1.4 2.5 0" stroke="#7A4A3E" stroke-width="1.1" fill="none" stroke-linecap="round"/>
    <path d="M12 31 h-6 M12 33.5 l-5 1.6 M36 31 h6 M36 33.5 l5 1.6" stroke="#B9875A" stroke-width="1" stroke-linecap="round"/>`,
  // Thìn — Rồng
  (g) => `<defs>${grad(g, '#7FD3B0', '#2E8F6C')}</defs>
    <path d="M14 14 q-3-7 1-11 q0 5 4 8z M34 14 q3-7-1-11 q0 5-4 8z" fill="#F1C14E" stroke="#B9831F" stroke-width=".8"/>
    <path d="M9 16 l-4-4 1 6z M39 16 l4-4-1 6z" fill="#E5463A"/>
    <ellipse cx="24" cy="25" rx="15" ry="14" fill="url(#${g})"/>
    <path d="M17 15 l2-3 2 3 2-3 2 3 2-3 2 3 2-3" stroke="#E5463A" stroke-width="1.6" fill="none" stroke-linejoin="round"/>
    ${eyes(23, 6)}<ellipse cx="24" cy="33" rx="10" ry="6.5" fill="#BDEBD7"/><circle cx="20.5" cy="32" r="1.4" fill="#1F6B50"/><circle cx="27.5" cy="32" r="1.4" fill="#1F6B50"/>
    <path d="M14 34 q-8 0-10 6 M34 34 q8 0 10 6" stroke="#F1C14E" stroke-width="1.8" fill="none" stroke-linecap="round"/>`,
  // Tỵ — Rắn
  (g) => `<defs>${grad(g, '#A6E07A', '#4F9F3A')}</defs>
    <path d="M6 42 q0-8 10-8 h16 q10 0 10 6 q0 4-6 4 h-24 q-6 0-6-2z" fill="url(#${g})"/>
    <path d="M12 40 h4 M22 40 h4 M32 40 h4" stroke="#F6E27A" stroke-width="1.6" stroke-linecap="round"/>
    <ellipse cx="24" cy="22" rx="14" ry="12.5" fill="url(#${g})"/>
    <path d="M18 13 q6-3 12 0" stroke="#F6E27A" stroke-width="1.6" fill="none" stroke-linecap="round"/>${eyes(21, 6)}${blush(26, 9)}
    <path d="M24 29 v5 l-2 2.5 M24 34 l2 2.5" stroke="#E5463A" stroke-width="1.4" fill="none" stroke-linecap="round"/>`,
  // Ngọ — Ngựa
  (g) => `<defs>${grad(g, '#C98B5A', '#8E5632')}</defs>
    <path d="M14 13 L13 3 L20 10z M34 13 L35 3 L28 10z" fill="#8E5632"/>
    <ellipse cx="24" cy="24" rx="13" ry="16" fill="url(#${g})"/>
    <path d="M17 9 q4-6 9-3 q5-3 7 2 q-2 2-3 6 q-3-4-7-3 q-3-1-6 1z" fill="#4A2A1A"/>
    <path d="M30 10 q6 4 6 12" stroke="#4A2A1A" stroke-width="3" fill="none" stroke-linecap="round"/>
    ${eyes(22, 6)}<ellipse cx="24" cy="35" rx="9" ry="6.5" fill="#F0C9A4"/><ellipse cx="21" cy="35" rx="1.5" ry="2" fill="#6E4630"/><ellipse cx="27" cy="35" rx="1.5" ry="2" fill="#6E4630"/>
    <path d="M22 16 l2 2.4 2-2.4" fill="#FFF6EA"/>`,
  // Mùi — Dê
  (g) => `<defs>${grad(g, '#FFFDF8', '#E8DCCB')}</defs>
    <path d="M13 16 q-9 0-8-8 q4 0 5 4 q2-3 5-1" stroke="#C9A36A" stroke-width="3.4" fill="none" stroke-linecap="round"/>
    <path d="M35 16 q9 0 8-8 q-4 0-5 4 q-2-3-5-1" stroke="#C9A36A" stroke-width="3.4" fill="none" stroke-linecap="round"/>
    <circle cx="16" cy="13" r="5" fill="url(#${g})"/><circle cx="24" cy="11" r="5.5" fill="url(#${g})"/><circle cx="32" cy="13" r="5" fill="url(#${g})"/>
    <ellipse cx="24" cy="26" rx="12" ry="13" fill="url(#${g})" stroke="#E3D3BE" stroke-width=".8"/>${eyes(24, 5)}${blush(29, 8)}
    <ellipse cx="24" cy="31" rx="2" ry="1.4" fill="#C98B8B"/><path d="M22 38 l2 6 2-6z" fill="#E3D3BE"/>`,
  // Thân — Khỉ
  (g) => `<defs>${grad(g, '#B07C55', '#6E4630')}</defs>
    <circle cx="8" cy="25" r="6" fill="#8E5E3C"/><circle cx="40" cy="25" r="6" fill="#8E5E3C"/><circle cx="8" cy="25" r="3.4" fill="#F3C9A9"/><circle cx="40" cy="25" r="3.4" fill="#F3C9A9"/>
    <circle cx="24" cy="24" r="15" fill="url(#${g})"/>
    <path d="M24 16 c-6-5-14 0-12 8 c1 8 6 12 12 12 c6 0 11-4 12-12 c2-8-6-13-12-8z" fill="#F7D2B4"/>
    ${eyes(24, 5)}<ellipse cx="22.4" cy="30" rx=".9" ry="1.1" fill="#6E4630"/><ellipse cx="25.6" cy="30" rx=".9" ry="1.1" fill="#6E4630"/>
    <path d="M20 33 q4 3 8 0" stroke="#7A4A3E" stroke-width="1.3" fill="none" stroke-linecap="round"/>`,
  // Dậu — Gà
  (g) => `<defs>${grad(g, '#FFFDF5', '#F4E3B8')}</defs>
    <path d="M17 11 q-1-7 4-6 q1-4 5-1 q4-2 5 3 q4 1 2 6z" fill="#E5463A"/>
    <circle cx="24" cy="26" r="15" fill="url(#${g})"/>${eyes(24, 6)}${blush(29, 10)}
    <path d="M20 28 l4 5 4-5z" fill="#F6A93C" stroke="#D9861E" stroke-width=".8" stroke-linejoin="round"/>
    <path d="M22 33 q2 6 2 6 q0 0 2-6" fill="#E5463A"/>`,
  // Tuất — Chó
  (g) => `<defs>${grad(g, '#F3C98E', '#D29A58')}</defs>
    <path d="M10 11 q-6 3-5 14 q1 5 6 2 l3-12z" fill="#8E5632"/><path d="M38 11 q6 3 5 14 q-1 5-6 2 l-3-12z" fill="#8E5632"/>
    <ellipse cx="24" cy="25" rx="14" ry="15" fill="url(#${g})"/>
    <ellipse cx="30" cy="20" rx="5" ry="4.5" fill="#B4763F" opacity=".7"/>${eyes(23, 6)}
    <ellipse cx="24" cy="33" rx="8" ry="6" fill="#FFF6EA"/><ellipse cx="24" cy="30.5" rx="2.8" ry="2" fill="#3A2416"/>
    <path d="M24 32.5 v2 M21 35 q3 2 6 0" stroke="#3A2416" stroke-width="1.1" fill="none" stroke-linecap="round"/><path d="M23 36 q1 3 2 0" fill="#F07D95"/>`,
  // Hợi — Lợn
  (g) => `<defs>${grad(g, '#FFD3DD', '#F29AB0')}</defs>
    <path d="M10 17 L8 6 L18 12z M38 17 L40 6 L30 12z" fill="#F29AB0"/>
    <ellipse cx="24" cy="26" rx="16" ry="14.5" fill="url(#${g})"/>${eyes(22, 7)}${blush(29, 11)}
    <ellipse cx="24" cy="31" rx="7.5" ry="5.5" fill="#F7B5C5" stroke="#E2869E" stroke-width="1"/><ellipse cx="21.4" cy="31" rx="1.4" ry="2" fill="#B8566F"/><ellipse cx="26.6" cy="31" rx="1.4" ry="2" fill="#B8566F"/>`
];

/** Biểu tượng con giáp theo chỉ số chi (0 = Tý) hoặc tên chi ('Ngọ') */
export function giap(chi, size = 28) {
  const i = typeof chi === 'number' ? chi : CHI.indexOf(String(chi).trim().split(' ').pop());
  if (i < 0) return '';
  return `<svg class="giap" viewBox="0 0 48 48" width="${size}" height="${size}" role="img" aria-label="${CHI[i]} — ${GIAP[i]}">${DRAW[i](id())}</svg>`;
}

/** Tên con giáp: 'Ngọ' → 'Ngựa' */
export const giapName = (chi) => GIAP[CHI.indexOf(String(chi).trim().split(' ').pop())] || '';
