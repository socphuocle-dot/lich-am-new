import { resetTo } from '../nav.js';
import { APP_VERSION } from '../config.js';
// Màn chào lần đầu: giới thiệu ngắn + giải thích trước khi xin quyền thông báo.
import { setState } from '../store.js';
import { ensurePermission, isNative } from '../notify.js';
import { ICON } from './common.js';
import { enableCalendar } from './more.js';
import { mascot, moonPhase, cloud, lanternString, sparkle } from './art.js';
import { needsPicker, onNeedsClick, applyNeeds, DEFAULT_NEEDS } from './needs.js';

const ui = { step: 0, picked: [...DEFAULT_NEEDS], simple: false };

const art = `<svg viewBox="0 0 200 200" width="240" height="240" role="img" aria-label="Tờ lịch ngày rằm">
  <rect x="38" y="44" width="124" height="132" rx="18" fill="var(--card)" stroke="var(--line)" stroke-width="2"/>
  <path d="M38 62a18 18 0 0 1 18-18h88a18 18 0 0 1 18 18v14H38z" fill="var(--accent)"/>
  <rect x="66" y="30" width="10" height="28" rx="5" fill="var(--ink)"/><rect x="124" y="30" width="10" height="28" rx="5" fill="var(--ink)"/>
  <circle cx="100" cy="60" r="7" fill="var(--gold)"/>
  <text x="100" y="140" text-anchor="middle" font-family="Noto Serif, Georgia, serif" font-weight="700" font-size="58" fill="var(--accent)">15</text>
  <text x="100" y="164" text-anchor="middle" font-family="Be Vietnam Pro, sans-serif" font-weight="600" font-size="13" fill="var(--gold-ink)">RẰM THÁNG GIÊNG</text>
</svg>`;

const STEPS = [
  () => `<div class="art welcome-art"><span class="w-lanterns">${lanternString()}</span><span class="w-moon">${moonPhase(15, 96)}</span><span class="w-cloud a">${cloud(110)}</span><span class="w-cloud b">${cloud(80, '#E9C46A', .6)}</span>${mascot('wave', 190, 'Bé Thỏ Ngọc chào bạn')}</div>
    <h1 tabindex="-1">Lịch Âm &amp; Nhắc Giỗ</h1>
    <p>Xem ngày âm, giờ hoàng đạo và không bao giờ quên ngày giỗ, ngày rằm của gia đình.</p>`,
  () => `<div class="art col" style="gap:18px;align-items:stretch;justify-content:center">
      <div class="feature"><span class="ic">${ICON.cal(22)}</span><div><b>Tự đổi ngày âm sang dương</b><span class="muted">Nhập ngày giỗ theo âm lịch, app tính đúng ngày dương mỗi năm, kể cả năm nhuận.</span></div></div>
      <div class="feature"><span class="ic">${ICON.bell(22)}</span><div><b>Nhắc trước cho kịp chuẩn bị</b><span class="muted">Nhắc tối hôm trước ngày rằm, trước 3–7 ngày cho ngày giỗ.</span></div></div>
      <div class="feature"><span class="ic">${ICON.shield(22)}</span><div><b>Riêng tư, không cần mạng</b><span class="muted">Mọi thứ nằm trên máy bạn. Không tài khoản, không quảng cáo.</span></div></div>
    </div>
    <h1 tabindex="-1">Mọi thứ chạy ngay trên máy</h1>`,
  () => `<div class="col need-wrap" style="gap:12px;align-items:stretch;width:100%">
      <h1 tabindex="-1" style="margin:0">Bạn hay dùng app để làm gì?</h1>
      <p style="margin:0">Chọn một hoặc vài việc — app ghim sẵn những mục đó lên trang chính cho dễ tìm.</p>
      ${needsPicker(ui.picked, ui.simple)}</div>`,
  () => `<div class="art welcome-art"><span class="w-cloud a">${cloud(110)}</span><span class="w-spark">${sparkle(22)}</span>${mascot('lantern', 190, 'Bé Thỏ Ngọc cầm đèn lồng')}</div>
    <h1 tabindex="-1">Bật thông báo để được nhắc</h1>
    <p>App chỉ gửi nhắc ngày giỗ, rằm, mùng 1 và lễ Tết theo cài đặt của bạn. Có thể tắt bất cứ lúc nào.</p>`,
  () => `<div class="art welcome-art"><span class="w-cloud a">${cloud(110)}</span>${mascot('letter', 190, 'Bé Thỏ Ngọc cầm phong thư')}</div>
    <h1 tabindex="-1">Hiện ngày giỗ trên Google Calendar</h1>
    <p>Ghi ngày giỗ, sinh nhật, lễ Tết vào lịch của máy (Google Calendar / Lịch iPhone). Xem được trên mọi thiết bị cùng tài khoản. Bật hay tắt lại trong Cài đặt.</p>`
];
const steps = () => (isNative() ? STEPS : STEPS.slice(0, 4));
const NEEDS_STEP = 2; const NOTI_STEP = 3; const CAL_STEP = 4;

export function renderWelcome() {
  const S = steps();
  const actions = ui.step === NOTI_STEP
    ? `<button type="button" class="btn" data-act="allow">Bật thông báo</button><button type="button" class="btn text" data-act="later">Để sau</button>`
    : ui.step === NEEDS_STEP
      ? `<button type="button" class="btn" data-act="needs" ${ui.picked.length ? '' : 'disabled'}>Tiếp tục</button>`
    : ui.step === CAL_STEP
      ? `<button type="button" class="btn" data-act="cal">Bật đồng bộ lịch</button><button type="button" class="btn text" data-act="done">Để sau</button>`
      : '<button type="button" class="btn" data-act="next">Tiếp tục</button>';
  return `<main class="welcome" data-screen="welcome">
    <div class="row" style="justify-content:flex-end;min-height:44px">${ui.step >= NOTI_STEP ? "" : '<button type="button" class="link" data-act="skip" style="color:var(--muted)">Bỏ qua</button>'}</div>
    ${S[ui.step]()}
    <div class="steps" aria-hidden="true">${S.map((_, i) => `<i class="${i === ui.step ? 'on' : ''}"></i>`).join('')}</div>
    <span class="sr">Bước ${ui.step + 1} trên ${S.length}</span>
    ${actions}
  </main>`;
}

function finish() {
  ui.step = 0;
  setState((s) => ({ ...s, onboarded: true, settings: { ...s.settings, seenNew: APP_VERSION } }));
  resetTo('#/today');
}

export function mountWelcome(root, rerender) {
  root.addEventListener('click', async (e) => {
    if (onNeedsClick(e, ui, rerender)) return;
    const a = e.target.closest('[data-act]')?.dataset.act;
    if (!a) return;
    if (a === 'needs') { applyNeeds(ui.picked, ui.simple); ui.step = NOTI_STEP; rerender(); root.ownerDocument.querySelector('.welcome h1')?.focus(); return; }
    if (a === 'next') { ui.step++; rerender(); root.ownerDocument.querySelector('.welcome h1')?.focus(); }
    if (a === 'skip') { ui.step = NOTI_STEP; rerender(); }
    const after = () => { if (steps().length > CAL_STEP) { ui.step = CAL_STEP; rerender(); } else finish(); };
    if (a === 'later') after();
    if (a === 'allow') { if (isNative()) await ensurePermission(); after(); }
    if (a === 'cal') { await enableCalendar(); finish(); }
    if (a === 'done') finish();
  });
}
