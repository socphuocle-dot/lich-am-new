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
  up: (w = 20) => svg('<path d="M12 21V9M7 14l5-5 5 5"/><path d="M5 3h14"/>', w),
  copy: (w = 18) => svg('<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>', w),
  close: (w = 18) => svg('<path d="M18 6 6 18M6 6l12 12"/>', w, 'stroke-width="2.2"'),
  face: (w = 24) => svg('<circle cx="12" cy="12" r="9"/><path d="M9 10h.01M15 10h.01M9.5 15a3.5 3.5 0 0 0 5 0"/>', w)
};

export function nav(active) {
  const culture = getState().settings.culture;
  const tabs = [
    ['today', 'Hôm nay', ICON.sun], ['calendar', 'Lịch', ICON.cal], ['reminders', 'Nhắc việc', ICON.bell],
    ...(culture ? [['culture', 'Văn hóa', ICON.taiji]] : []), ['donate', 'Ủng hộ', ICON.heart]
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
