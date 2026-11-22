import { getState } from '../store.js';

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const svg = (d, w = 24, extra = '') => `<svg width="${w}" height="${w}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${d}</svg>`;
export const ICON = {
  sun: (w) => svg('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>', w),
  cal: (w) => svg('<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>', w),
  bell: (w) => svg('<path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>', w),
  taiji: (w) => svg('<circle cx="12" cy="12" r="9"/><path d="M12 3a4.5 4.5 0 0 1 0 9 4.5 4.5 0 0 0 0 9"/><circle cx="12" cy="7.5" r="0.8"/><circle cx="12" cy="16.5" r="0.8"/>', w),
  heart: (w) => svg('<path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7Z"/>', w),
  gear: (w) => svg('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>', w),
  back: (w = 22) => svg('<path d="m15 18-6-6 6-6"/>', w),
  next: (w = 20) => svg('<path d="m9 18 6-6-6-6"/>', w),
  plus: (w = 20) => svg('<path d="M12 5v14M5 12h14"/>', w, 'stroke-width="2.2"'),
  check: (w = 18) => svg('<path d="M20 6 9 17l-5-5"/>', w, 'stroke-width="2.2"'),
  shield: (w = 16) => svg('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>', w),
  trash: (w = 20) => svg('<path d="M3 6h18M8 6V4h8v2M6 6l1 15h10l1-15"/>', w),
  down: (w = 20) => svg('<path d="M12 3v12M7 10l5 5 5-5"/><path d="M5 21h14"/>', w),
  users: (w = 20) => svg('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.8c1.9.7 3.1 2.4 3.5 5.2"/>', w),
  cloud: (w = 20) => svg('<path d="M7 18h10.5a4 4 0 0 0 .6-7.95A6 6 0 0 0 6.6 9.2 4.5 4.5 0 0 0 7 18Z"/><path d="M12 15V10M9.8 12.2 12 10l2.2 2.2"/>', w),
  sync: (w = 20) => svg('<path d="M20 11a8 8 0 0 0-14.3-4.9L4 8"/><path d="M4 3v5h5"/><path d="M4 13a8 8 0 0 0 14.3 4.9L20 16"/><path d="M20 21v-5h-5"/>', w),
  grid: (w = 20) => svg('<rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><circle cx="17" cy="17" r="3.5"/>', w),
  phone: (w = 20) => svg('<path d="M5 4h3.5l1.8 4.5-2.3 1.4a11 11 0 0 0 6.1 6.1l1.4-2.3L20 15.5V19a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>', w),
  book: (w = 20) => svg('<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5"/><path d="M9 7h7M9 11h5"/>', w),
  star: (w = 20) => svg('<path d="m12 3 2.7 5.6 6.1.8-4.5 4.2 1.1 6-5.4-2.9-5.4 2.9 1.1-6-4.5-4.2 6.1-.8z"/>', w),
  swap: (w = 20) => svg('<path d="M7 4 3 8l4 4"/><path d="M3 8h14"/><path d="m17 20 4-4-4-4"/><path d="M21 16H7"/>', w),
  tray: (w = 20) => svg('<path d="M3 13h18"/><path d="M5 13c0 4 3 7 7 7s7-3 7-7"/><path d="M8 9c0-1 .5-2 1.5-2.5M12 9V5M16 9c0-1-.5-2-1.5-2.5"/>', w),
  card: (w = 20) => svg('<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M3 9h18"/><path d="M8 14h4"/>', w),
  share: (w = 20) => svg('<circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="m8.2 10.8 7.6-4.4M8.2 13.2l7.6 4.4"/>', w),
  search: (w = 20) => svg('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>', w),
  up: (w = 20) => svg('<path d="M12 21V9M7 14l5-5 5 5"/><path d="M5 3h14"/>', w),
  copy: (w = 18) => svg('<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>', w),
  close: (w = 18) => svg('<path d="M18 6 6 18M6 6l12 12"/>', w, 'stroke-width="2.2"'),
  user: (w = 24) => svg('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>', w),
  face: (w = 24) => svg('<circle cx="12" cy="12" r="9"/><path d="M9 10h.01M15 10h.01M9.5 15a3.5 3.5 0 0 0 5 0"/>', w)
};

export function nav(active) {
  const tabs = [
    ['today', 'Hôm nay', ICON.sun], ['calendar', 'Lịch', ICON.cal], ['reminders', 'Nhắc việc', ICON.bell],
    ['tienich', 'Tiện ích', ICON.grid], ['canhan', 'Cá nhân', ICON.user]
  ];
  return `<nav class="nav" aria-label="Điều hướng chính">${tabs.map(([id, label, ic]) =>
    `<a href="#/${id}" ${id === active ? 'aria-current="page"' : ''}>${ic(24)}${label}</a>`).join('')}</nav>`;
}

/** fallback: trang về khi không có lịch sử (mở thẳng link) */
export const backHeader = (title, fallback, sub = '', right = '') => `
  <header class="top back">
    <button type="button" class="icon-btn plain" data-back="${fallback}" aria-label="Quay lại">${ICON.back()}</button>
    <div class="grow"><h1 tabindex="-1">${esc(title)}</h1>${sub ? `<span class="sub">${esc(sub)}</span>` : ''}</div>${right}
  </header>`;

export const sw = (on, label, attrs = '') => `<button type="button" class="switch" role="switch" aria-checked="${on ? 'true' : 'false'}" aria-label="${esc(label)}" ${attrs}></button>`;

let toastTimer;
/** Thông báo ngắn; action = { label, run } để có nút (ví dụ Hoàn tác) */
export function toast(msg, action = null, ms = 2600) {
  let el = document.querySelector('.toast');
  if (!el) {
    el = document.createElement('div');
    el.className = 'toast';
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    document.body.appendChild(el);
  }
  el.replaceChildren();
  const t = document.createElement('span');
  t.textContent = msg;
  el.appendChild(t);
  if (action) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = action.label;
    b.addEventListener('click', () => { el.classList.remove('show'); action.run(); });
    el.appendChild(b);
  }
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), action ? 5000 : ms);
}

export const MONTH_SHORT = (m) => 'TH ' + m;

/** Ô chọn giờ kiểu 24 giờ (thay input type=time vì máy có thể hiện SA/CH hoặc AM/PM) */
export function timeSelect(value, attrs = '', style = '') {
  const v = /^\d{2}:\d{2}$/.test(value || '') ? value : '07:00';
  const opts = [];
  for (let h = 0; h < 24; h++) for (let m = 0; m < 60; m += 15) opts.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  if (!opts.includes(v)) { opts.push(v); opts.sort(); }
  return `<select class="input time-sel" ${attrs} ${style ? `style="${style}"` : ''}>${opts.map((o) => `<option value="${o}" ${o === v ? 'selected' : ''}>${o}</option>`).join('')}</select>`;
}
