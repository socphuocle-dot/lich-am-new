import '@fontsource/be-vietnam-pro/vietnamese-400.css';
import '@fontsource/be-vietnam-pro/vietnamese-500.css';
import '@fontsource/be-vietnam-pro/latin-500.css';
import '@fontsource/be-vietnam-pro/vietnamese-600.css';
import '@fontsource/be-vietnam-pro/vietnamese-700.css';
import '@fontsource/be-vietnam-pro/latin-400.css';
import '@fontsource/be-vietnam-pro/latin-600.css';
import '@fontsource/be-vietnam-pro/latin-700.css';
import '@fontsource/noto-serif/vietnamese-700.css';
import '@fontsource/noto-serif/latin-700.css';
import './styles.css';

import { getState, subscribe } from './store.js';
import { reschedule } from './notify.js';
import { pushWidgetData } from './widgets.js';
import { renderWelcome, mountWelcome } from './ui/welcome.js';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { renderToday, mountToday } from './ui/today.js';
import { renderCalendar, mountCalendar, resetCalendar } from './ui/calendar.js';
import { renderReminders, mountReminders, renderGioForm, mountGioForm, clearGioForm } from './ui/reminders.js';
import { renderCulture, renderProfile, mountProfile, renderTuvi, mountTuvi, renderNumerology, mountNumerology, renderIching, mountIching } from './ui/culture.js';
import { renderDonate, mountDonate, renderSettings, mountSettings } from './ui/more.js';

const app = document.getElementById('app');
const needsProfile = new Set(['tuvi', 'numerology']);

const ROUTES = {
  welcome: { render: renderWelcome, mount: mountWelcome },
  today: { render: renderToday, mount: mountToday },
  calendar: { render: renderCalendar, mount: mountCalendar },
  reminders: { render: renderReminders, mount: mountReminders },
  add: { render: (p) => renderGioForm(p), mount: mountGioForm },
  edit: { render: (p) => renderGioForm(p), mount: mountGioForm },
  culture: { render: renderCulture, culture: true },
  profile: { render: renderProfile, mount: mountProfile, culture: true },
  tuvi: { render: renderTuvi, mount: mountTuvi, culture: true },
  numerology: { render: renderNumerology, mount: mountNumerology, culture: true },
  iching: { render: renderIching, mount: mountIching, culture: true },
  donate: { render: renderDonate, mount: mountDonate },
  settings: { render: renderSettings, mount: mountSettings }
};

function parseHash() {
  const h = location.hash.replace(/^#\/?/, '');
  const [path, qs] = h.split('?');
  const [name, id] = path.split('/');
  const params = Object.fromEntries(new URLSearchParams(qs || ''));
  if (id) params.id = decodeURIComponent(id);
  return { name: name || 'today', params };
}

let current = null;
function render(scrollTop = false) {
  let { name, params } = parseHash();
  let route = ROUTES[name];
  if (getState().onboarded && name === 'welcome') { replacing = true; location.replace('#/today'); return; }
  if (!getState().onboarded && name !== 'welcome') { replacing = true; location.replace('#/welcome'); return; }
  if (!route || (route.culture && !getState().settings.culture)) { replacing = true; location.replace('#/today'); return; }
  if (needsProfile.has(name) && !(getState().profile.dob && getState().profile.name)) { replacing = true; location.replace('#/profile'); return; }
  const y = window.scrollY;
  if (name !== current?.name) { if (current?.name === 'add' || current?.name === 'edit') clearGioForm(); }
  // Thay root để gỡ toàn bộ event listener cũ
  const root = document.createElement('div');
  root.innerHTML = route.render(params);
  app.replaceChildren(root);
  const rerender = () => render(false);
  route.mount?.(root, rerender, params);
  const changed = current?.name !== name || current?.id !== params.id;
  const first = !current;
  current = { name, id: params.id };
  window.scrollTo(0, changed || scrollTop ? 0 : y);
  if (changed) {
    document.title = (root.querySelector('h1')?.textContent || 'Lịch Âm') + ' · Lịch Âm & Nhắc Giỗ';
    root.querySelector('.screen')?.classList.add('enter');
    // Đưa tiêu điểm tới tiêu đề để trình đọc màn hình đọc tên trang mới
    if (!first) root.querySelector('h1')?.focus({ preventScroll: true });
  }
}

function applyLook() {
  const s = getState().settings;
  const dark = s.theme === 'dark' || (s.theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  document.documentElement.dataset.size = String(s.size);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#141210' : '#F8F4EC');
}

// Ngăn xếp trang đã đi trong app — để nút "Quay lại" luôn hoạt động (kể cả khi mở thẳng một trang)
const stack = [location.hash || '#/today'];
let replacing = false;
window.addEventListener('hashchange', () => {
  const h = location.hash;
  if (replacing) { stack[stack.length - 1] = h; replacing = false; }
  else if (stack.length > 1 && stack[stack.length - 2] === h) stack.pop();
  else stack.push(h);
  render(true);
});
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-back]');
  if (!b) return;
  if (stack.length > 1) history.back();
  else { replacing = true; location.replace(b.dataset.back); }
});

// Rung nhẹ khi bấm (chỉ trên điện thoại)
if (Capacitor.isNativePlatform()) {
  document.addEventListener('click', (e) => {
    const el = e.target.closest('.switch, .btn, .chip, .tip, .cell, .palace, .num-btn, .fab, [data-act="one"], [data-act="all"]');
    if (el) Haptics.impact({ style: el.matches('.btn, .fab') ? ImpactStyle.Medium : ImpactStyle.Light }).catch(() => {});
  });
}
subscribe((s) => { applyLook(); reschedule(s); pushWidgetData(s); render(false); });
window.matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', applyLook);
// Mở lại app sau nhiều giờ: cập nhật ngày hôm nay và lịch nhắc
let lastDay = new Date().toDateString();
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible') return;
  if (new Date().toDateString() !== lastDay) { lastDay = new Date().toDateString(); resetCalendar(); render(false); }
  reschedule(getState());
  pushWidgetData(getState());
});

// Bản web (GitHub Pages): cho phép cài lên màn hình chính và mở khi không có mạng
if (!Capacitor.isNativePlatform() && 'serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}

applyLook();
render(true);
reschedule(getState(), 50);
pushWidgetData(getState(), 100);
