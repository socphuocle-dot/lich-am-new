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

import { getState, setState, subscribe } from './store.js';
import { toast, nav as navBar } from './ui/common.js';
import { initNav, go, back, done as navDone, switchTab, openExternal, handleHashChange, activeTab, navDirection, takeRestoreY, canGoBack, onNavigate, TABS, TAB_ROOT, isTabRoot } from './nav.js';
import { renderPins, mountPins } from './ui/pins.js';
import { renderNeeds, mountNeeds, resetNeeds } from './ui/needs.js';
import { onMediaReady, migratePhotos, gcMedia } from './media.js';
import { logEvent, installErrorLog } from './errlog.js';
installErrorLog();
import { coffeeCard } from './ui/coffee.js';
const NO_COFFEE = new Set(['donate', 'welcome', 'gopy']);
import { renderCanhan } from './ui/canhan.js';
import { setMascot } from './ui/art.js';
import { reschedule } from './notify.js';
import { pushWidgetData } from './widgets.js';
import { renderWelcome, mountWelcome } from './ui/welcome.js';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { renderToday, mountToday, stopTodaySpeech } from './ui/today.js';
import { renderCalendar, mountCalendar, resetCalendar } from './ui/calendar.js';
import { renderReminders, mountReminders, renderGioForm, mountGioForm, clearGioForm } from './ui/reminders.js';
import { renderDonate, mountDonate, renderSettings, mountSettings } from './ui/more.js';
import { renderVankhanList, renderVankhan, mountVankhan, renderGoodDays, mountGoodDays, renderInvite, mountInvite } from './ui/tools.js';
import { listenNotificationActions } from './notify.js';
import { checkUpdate } from './update.js';
import { App as CapApp } from '@capacitor/app';
import { renderHub, mountHub } from './ui/hub.js';
import { renderConvert, mountConvert } from './ui/tools.js';
import { renderWhatsNew } from './whatsnew.js';
import { restoreFromSystemIfEmpty, mirrorToSystem, autoSyncCalendar } from './sync.js';

const app = document.getElementById('app');
const needsProfile = new Set(['tuvi', 'numerology']);

// Màn ít dùng: tách thành gói riêng, nạp khi cần (và nạp sẵn lúc rảnh sau khi mở app)
const L = {
  culture: () => import('./ui/culture.js'), contacts: () => import('./ui/contacts.js'), feedback: () => import('./ui/feedback.js'),
  family: () => import('./ui/family.js'), giadinh: () => import('./ui/giadinh.js'), saohan: () => import('./ui/saohan.js'), tet: () => import('./ui/tet.js'),
  giaphain: () => import('./ui/giaphain.js'), dongho: () => import('./ui/dongho.js')
};
const lazy = (mod, r, m, extra = {}) => ({ ...extra, lazy: () => L[mod]().then((x) => ({ render: x[r], mount: m ? x[m] : undefined, mod: x })) });

const ROUTES = {
  welcome: { render: renderWelcome, mount: mountWelcome },
  today: { render: renderToday, mount: mountToday },
  calendar: { render: renderCalendar, mount: mountCalendar },
  reminders: { render: renderReminders, mount: mountReminders },
  add: { render: (p) => renderGioForm(p), mount: mountGioForm },
  edit: { render: (p) => renderGioForm(p), mount: mountGioForm },
  culture: lazy('culture', 'renderCulture', null, { culture: true }),
  profile: lazy('culture', 'renderProfile', 'mountProfile'),
  tuvi: lazy('culture', 'renderTuvi', 'mountTuvi', { culture: true }),
  numerology: lazy('culture', 'renderNumerology', 'mountNumerology', { culture: true }),
  iching: lazy('culture', 'renderIching', 'mountIching', { culture: true }),
  donate: { render: renderDonate, mount: mountDonate },
  settings: { render: renderSettings, mount: mountSettings },
  contacts: lazy('contacts', 'renderContacts', 'mountContacts'),
  vankhan: { render: (p) => (p.id ? renderVankhan(p) : renderVankhanList(p)), mount: (r, rr, p) => (p.id ? mountVankhan(r, rr, p) : null) },
  ngaytot: { render: renderGoodDays, mount: mountGoodDays },
  thiep: { render: renderInvite, mount: mountInvite },
  chiase: lazy('family', 'renderShare', 'mountShare'),
  nhap: lazy('family', 'renderImport', 'mountImport'),
  gopy: lazy('feedback', 'renderFeedback', 'mountFeedback'),
  tienich: { render: renderHub, mount: mountHub },
  doingay: { render: renderConvert, mount: mountConvert },
  hieuhi: lazy('giadinh', 'renderHieuhi', 'mountHieuhi'),
  chuanbi: lazy('giadinh', 'renderPrep', 'mountPrep'),
  tuongnho: lazy('giadinh', 'renderMemorial', 'mountMemorial'),
  giapha: lazy('giadinh', 'renderGiapha', 'mountGiapha'),
  ingiapha: lazy('giaphain', 'renderGiaphaIn', 'mountGiaphaIn'),
  taomo: lazy('dongho', 'renderTaomo', 'mountTaomo'),
  quyho: lazy('dongho', 'renderQuyho', 'mountQuyho'),
  xemtuoi: lazy('giadinh', 'renderXemtuoi', 'mountXemtuoi'),
  saohan: lazy('saohan', 'renderSaohan', 'mountSaohan'),
  chuanbitet: lazy('tet', 'renderTetPrep', 'mountTetPrep'),
  xongdat: lazy('tet', 'renderXongdat', 'mountXongdat'),
  xuathanh: lazy('tet', 'renderXuathanh'),
  anchay: lazy('tet', 'renderAnchay', 'mountAnchay'),
  menh: lazy('tet', 'renderMenh', 'mountMenh'),
  moi: { render: renderWhatsNew },
  ghim: { render: renderPins, mount: mountPins },
  nhucau: { render: renderNeeds, mount: mountNeeds },
  canhan: { render: renderCanhan }
};
// Màn "nhiệm vụ" (biểu mẫu, màn chào): ẩn thanh tab để người dùng tập trung, có nút Lưu ở dưới
const TASK = new Set(['welcome', 'add', 'edit', 'profile', 'nhap']);

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
    logEvent('error', 'Vẽ màn lỗi: ' + (e && e.message), e && e.stack);
    (window.__showBootError || ((m) => { app.textContent = m; }))(`${e && e.message}\n${(e && e.stack) || ''}\nTrang: ${location.hash}\n\n${navigator.userAgent}`);
  }
}

function renderInner(scrollTop = false) {
  let { name, params } = parseHash();
  let route = ROUTES[name];
  if (getState().onboarded && name === 'welcome') { go('#/today', { replace: true }); return; }
  if (!getState().onboarded && name !== 'welcome' && name !== 'nhap') { go('#/welcome', { replace: true }); return; }
  if (!route || (route.culture && !getState().settings.culture)) { go('#/today', { replace: true }); return; }
  if (needsProfile.has(name) && !(getState().profile.dob && getState().profile.name)) { go('#/profile', { replace: true }); return; }
  if (route.lazy && !route.render) {
    // Giữ màn cũ trong tích tắc nạp gói màn mới, rồi vẽ (không nháy trắng)
    route.loading = route.loading || route.lazy().then((x) => Object.assign(route, x)).catch((e) => { route.loading = null; throw e; });
    route.loading.then(() => render(true)).catch((e) => { logEvent('error', 'Không nạp được màn ' + name, String(e)); (window.__showBootError || console.error)(String(e)); });
    return;
  }
  const y = window.scrollY;
  if (name !== current?.name) {
    const prev = ROUTES[current?.name]?.mod;
    if (current?.name === 'add' || current?.name === 'edit') clearGioForm();
    if (current?.name === 'contacts') prev?.resetContacts?.();
    prev?.stopStories?.(); // dừng ghi âm / nghe lời kể khi rời màn
    if (current?.name === 'today') stopTodaySpeech();
    if (current?.name === 'nhucau') resetNeeds();
    if (current?.name === 'chiase') prev?.resetShare?.();
    if (current?.name === 'nhap') prev?.resetImport?.();
  }
  // Thay root để gỡ toàn bộ event listener cũ
  const root = document.createElement('div');
  const t0 = performance.now();
  root.innerHTML = route.render(params);
  const t1 = performance.now();
  // Thanh tab do router gắn: có trên mọi màn trừ màn nhiệm vụ; tab sáng là tab đang mở
  const screen = root.querySelector('.screen');
  root.querySelectorAll('.nav').forEach((n) => n.remove());
  const task = TASK.has(name) || !!(screen && (screen.hasAttribute('data-task') || screen.querySelector('.bottom-bar')));
  if (screen) {
    screen.classList.toggle('no-nav', task);
    screen.classList.toggle('tab-root', isTabRoot());
    if (!task) screen.insertAdjacentHTML('beforeend', navBar(activeTab()));
    // Lời mời ủng hộ ở cuối mọi màn thường (trừ chính màn ủng hộ)
    if (!task && !NO_COFFEE.has(name)) { const m = screen.querySelector(':scope > main'); if (m) m.insertAdjacentHTML('beforeend', coffeeCard()); }
    // Màn gốc của tab không có nút Quay lại
    if (isTabRoot()) screen.querySelector('header.top.back [data-back]')?.remove();
  }
  app.replaceChildren(root);
  const t2 = performance.now();
  const rerender = () => render(false);
  route.mount?.(root, rerender, params);
  if (window.__perf) window.__perf.push({ name, html: t1 - t0, dom: t2 - t1, mount: performance.now() - t2 });
  const changed = current?.name !== name || current?.id !== params.id;
  const first = !current;
  current = { name, id: params.id };
  const ry = takeRestoreY();
  window.scrollTo(0, ry !== null ? ry : changed || scrollTop ? 0 : y);
  if (changed) {
    document.title = (root.querySelector('h1')?.textContent || 'Lịch Âm') + ' · Lịch Âm & Nhắc Giỗ';
    document.documentElement.dataset.nav = navDirection();
    root.querySelector('.screen')?.classList.add('enter');
    // Đưa tiêu điểm tới tiêu đề để trình đọc màn hình đọc tên trang mới
    // Đưa tiêu điểm sau khi màn đã vẽ xong (focus ép trình duyệt tính lại bố cục ngay lập tức)
    if (!first) { const h1 = root.querySelector('h1'); requestAnimationFrame(() => setTimeout(() => { if (h1?.isConnected) h1.focus({ preventScroll: true }); }, 0)); }
  }
}

function applyLook() {
  const s = getState().settings;
  const dark = s.theme === 'dark' || (s.theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  document.documentElement.dataset.size = String(s.size);
  setMascot(s.mascot);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#0E0B09' : '#F3ECE0');
}

// Điều hướng: ngăn xếp theo từng tab (xem nav.js)
initNav();
onNavigate(() => render(true));
window.addEventListener('hashchange', () => { handleHashChange(); render(true); });
document.addEventListener('click', (e) => {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
  const b = e.target.closest('[data-back]');
  if (b) { e.preventDefault(); if (!back()) go(b.dataset.back || '#/today', { replace: true }); return; }
  const a = e.target.closest('a[href^="#/"]');
  if (!a || a.target) return;
  e.preventDefault();
  const h = a.getAttribute('href');
  const tab = a.closest('.nav') && TABS.find((t) => TAB_ROOT[t] === h);
  if (tab) switchTab(tab); else go(h);
});

// Nút Quay lại của Android: đóng hộp thoại → lùi một bước → về tab Hôm nay → bấm lần nữa để thoát
let exitArmed = 0;
if (Capacitor.isNativePlatform()) {
  CapApp.addListener('backButton', () => {
    const scrim = document.querySelector('.scrim');
    if (scrim) { scrim.click(); return; }
    const openDetails = document.activeElement?.closest?.('details[open]');
    if (openDetails && openDetails.matches('.voice-card')) { openDetails.open = false; return; }
    if (canGoBack()) { back(); return; }
    if (!isTabRoot()) { back(); return; }
    if (activeTab() !== 'today') { switchTab('today'); return; }
    if (Date.now() - exitArmed < 2000) { CapApp.exitApp(); return; }
    exitArmed = Date.now();
    toast('Bấm Quay lại lần nữa để thoát');
  }).catch(() => {});
}

// Nút "Thêm" thu gọn thành tròn khi cuộn xuống, để không che nội dung
let lastY = 0;
let scrollQueued = false;
window.addEventListener('scroll', () => {
  if (scrollQueued) return;
  scrollQueued = true;
  requestAnimationFrame(() => {
    scrollQueued = false;
    const y = window.scrollY;
    const fab = document.querySelector('.fab');
    if (fab) {
      fab.classList.toggle('mini', y > 60);
      // Cuộn xuống: ẩn hẳn để đọc trọn nội dung; cuộn lên: hiện lại
      if (Math.abs(y - lastY) > 4) fab.classList.toggle('hide', y > 120 && y > lastY);
    }
    lastY = y;
  });
}, { passive: true });

// Rung nhẹ khi bấm (chỉ trên điện thoại)
if (Capacitor.isNativePlatform()) {
  document.addEventListener('click', (e) => {
    const el = e.target.closest('.switch, .btn, .chip, .tip, .cell, .palace, .num-btn, .fab, .svc, .tool, .nav a, a.item, [data-act="one"], [data-act="all"]');
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

listenNotificationActions((h) => { if (location.hash !== h) openExternal(h); });

// Link từ widget: lichamnhacgio://open/vankhan/ram?jd=… → mở đúng màn
export function routeFromUrl(url) {
  const m = String(url || '').match(/^lichamnhacgio:\/\/open\/([\w/?=&%.-]*)$/);
  return m ? '#/' + (m[1] || 'today') : null;
}
if (Capacitor.isNativePlatform()) {
  CapApp.addListener('appUrlOpen', ({ url }) => { const h = routeFromUrl(url); if (h && location.hash !== h) openExternal(h); }).catch(() => {});
}

// Không để lời gọi plugin của máy chặn việc hiện giao diện: chờ tối đa vài giây rồi đi tiếp
const withTimeout = (p, ms) => Promise.race([Promise.resolve(p).catch(() => null), new Promise((r) => setTimeout(() => r(null), ms))]);

// Ảnh lưu thành tệp riêng: nạp xong thì vẽ lại màn (gộp nhiều ảnh vào một lần vẽ)
let mediaTick = 0;
onMediaReady(() => { cancelAnimationFrame(mediaTick); mediaTick = requestAnimationFrame(() => render(false)); });
// Lưu thất bại vì đầy bộ nhớ: báo rõ, không để người dùng tưởng đã lưu
let fullWarned = 0;
window.addEventListener('lamng:save-failed', () => {
  logEvent('warn', 'Lưu dữ liệu thất bại: bộ nhớ đầy');
  if (Date.now() - fullWarned < 8000) return;
  fullWarned = Date.now();
  toast('Bộ nhớ của app đã đầy — thay đổi vừa rồi CHƯA được lưu.', { label: 'Xem cách xử lý', run: () => go('#/settings?muc=dulieu') });
});

async function start() {
  if (Capacitor.isNativePlatform()) {
    const l = await withTimeout(CapApp.getLaunchUrl(), 1200);
    const h = routeFromUrl(l?.url);
    if (h) { location.replace(h); initNav(); }
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
  // Nạp sẵn các màn tách gói khi máy rảnh, để lần đầu mở màn đó vẫn tức thì
  const idle = window.requestIdleCallback || ((f) => setTimeout(f, 1500));
  // Chuyển ảnh cũ (nằm trong dữ liệu chữ) ra tệp riêng, dọn tệp ảnh không còn dùng
  idle(() => migratePhotos(getState, setState).then((n) => { if (n) logEvent('info', `Đã chuyển ${n} ảnh ra bộ nhớ riêng`); return gcMedia(getState()); }).catch(() => {}), { timeout: 5000 });
  idle(() => Object.values(ROUTES).forEach((r) => { if (r.lazy && !r.loading) r.loading = r.lazy().then((x) => Object.assign(r, x)).catch(() => { r.loading = null; }); }), { timeout: 3000 });
}
start();
