import '@fontsource/be-vietnam-pro/vietnamese-400.css';
import '@fontsource/be-vietnam-pro/vietnamese-500.css';
import '@fontsource/be-vietnam-pro/latin-500.css';
import '@fontsource/be-vietnam-pro/vietnamese-600.css';
import '@fontsource/be-vietnam-pro/vietnamese-700.css';
import '@fontsource/be-vietnam-pro/latin-400.css';
import '@fontsource/be-vietnam-pro/latin-600.css';
import '@fontsource/be-vietnam-pro/latin-700.css';
import '@fontsource/noto-serif/vietnamese-400.css';
import '@fontsource/noto-serif/latin-400.css';
import '@fontsource/noto-serif/vietnamese-700.css';
import '@fontsource/noto-serif/latin-700.css';
import './styles.css';

import { getState, subscribe } from './store.js';
import { toast } from './ui/common.js';
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
import { renderContacts, mountContacts, resetContacts } from './ui/contacts.js';
import { renderVankhanList, renderVankhan, mountVankhan, renderGoodDays, mountGoodDays, renderInvite, mountInvite } from './ui/tools.js';
import { listenNotificationActions } from './notify.js';
import { checkUpdate } from './update.js';
import { App as CapApp } from '@capacitor/app';
import { renderFeedback, mountFeedback } from './ui/feedback.js';
import { renderHub } from './ui/hub.js';
import { renderConvert, mountConvert } from './ui/tools.js';
import { renderShare, mountShare, resetShare, renderImport, mountImport, resetImport } from './ui/family.js';
import { restoreFromSystemIfEmpty, mirrorToSystem, autoSyncCalendar } from './sync.js';

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
  settings: { render: renderSettings, mount: mountSettings },
  contacts: { render: renderContacts, mount: mountContacts },
  vankhan: { render: (p) => (p.id ? renderVankhan(p) : renderVankhanList(p)), mount: (r, rr, p) => (p.id ? mountVankhan(r, rr, p) : null) },
  ngaytot: { render: renderGoodDays, mount: mountGoodDays },
  thiep: { render: renderInvite, mount: mountInvite },
  chiase: { render: renderShare, mount: mountShare },
  nhap: { render: renderImport, mount: mountImport },
  gopy: { render: renderFeedback, mount: mountFeedback },
  tienich: { render: renderHub },
  doingay: { render: renderConvert, mount: mountConvert }
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
  try { renderInner(scrollTop); } catch (e) {
    console.error(e);
    (window.__showBootError || ((m) => { app.textContent = m; }))(`${e && e.message}\n${(e && e.stack) || ''}\nTrang: ${location.hash}\n\n${navigator.userAgent}`);
  }
}

function renderInner(scrollTop = false) {
  let { name, params } = parseHash();
  let route = ROUTES[name];
  if (getState().onboarded && name === 'welcome') { replacing = true; location.replace('#/today'); return; }
  if (!getState().onboarded && name !== 'welcome' && name !== 'nhap') { replacing = true; location.replace('#/welcome'); return; }
  if (!route || (route.culture && !getState().settings.culture)) { replacing = true; location.replace('#/today'); return; }
  if (needsProfile.has(name) && !(getState().profile.dob && getState().profile.name)) { replacing = true; location.replace('#/profile'); return; }
  const y = window.scrollY;
  if (name !== current?.name) { if (current?.name === 'add' || current?.name === 'edit') clearGioForm(); if (current?.name === 'contacts') resetContacts(); if (current?.name === 'chiase') resetShare(); if (current?.name === 'nhap') resetImport(); }
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
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#0E0B09' : '#F3ECE0');
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

// Nút "Thêm" thu gọn thành tròn khi cuộn xuống, để không che nội dung
let lastY = 0;
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  const fab = document.querySelector('.fab');
  if (fab) fab.classList.toggle('mini', y > 60 && y >= lastY);
  lastY = y;
}, { passive: true });

// Rung nhẹ khi bấm (chỉ trên điện thoại)
if (Capacitor.isNativePlatform()) {
  document.addEventListener('click', (e) => {
    const el = e.target.closest('.switch, .btn, .chip, .tip, .cell, .palace, .num-btn, .fab, [data-act="one"], [data-act="all"]');
    if (el) Haptics.impact({ style: el.matches('.btn, .fab') ? ImpactStyle.Medium : ImpactStyle.Light }).catch(() => {});
  });
}
subscribe((s) => {
  applyLook(); reschedule(s); pushWidgetData(s); render(false);
  mirrorToSystem(s);
  if (s.calSync?.enabled) autoSyncCalendar();
});
window.matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', applyLook);
// Mở lại app sau nhiều giờ: cập nhật ngày hôm nay và lịch nhắc
let lastDay = new Date().toDateString();
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible') return;
  if (new Date().toDateString() !== lastDay) { lastDay = new Date().toDateString(); resetCalendar(); render(false); }
  reschedule(getState());
  pushWidgetData(getState());
  if (getState().calSync?.enabled) autoSyncCalendar();
});

// Bản web (GitHub Pages): cho phép cài lên màn hình chính và mở khi không có mạng
if (!Capacitor.isNativePlatform() && 'serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}

listenNotificationActions((h) => { if (location.hash !== h) location.hash = h; });

// Link từ widget: lichamnhacgio://open/vankhan/ram?jd=… → mở đúng màn
export function routeFromUrl(url) {
  const m = String(url || '').match(/^lichamnhacgio:\/\/open\/([\w/?=&%.-]*)$/);
  return m ? '#/' + (m[1] || 'today') : null;
}
if (Capacitor.isNativePlatform()) {
  CapApp.addListener('appUrlOpen', ({ url }) => { const h = routeFromUrl(url); if (h && location.hash !== h) location.hash = h; }).catch(() => {});
}

// Không để lời gọi plugin của máy chặn việc hiện giao diện: chờ tối đa vài giây rồi đi tiếp
const withTimeout = (p, ms) => Promise.race([Promise.resolve(p).catch(() => null), new Promise((r) => setTimeout(() => r(null), ms))]);

async function start() {
  if (Capacitor.isNativePlatform()) {
    const l = await withTimeout(CapApp.getLaunchUrl(), 1200);
    const h = routeFromUrl(l?.url);
    if (h) { replacing = true; location.replace(h); }
  }
  applyLook();
  render(true);
  reschedule(getState(), 50);
  pushWidgetData(getState(), 100);
  // Máy mới / cài lại: lấy lại dữ liệu từ bản sao lưu của hệ thống (Google / iCloud) — chạy nền
  withTimeout(restoreFromSystemIfEmpty(), 4000).then((ok) => {
    if (ok) { applyLook(); render(true); setTimeout(() => toast('Đã khôi phục dữ liệu từ bản sao lưu của máy'), 400); }
    mirrorToSystem(getState());
  });
  if (getState().calSync?.enabled) autoSyncCalendar();
  setTimeout(() => checkUpdate(), 3000);
}
start();
