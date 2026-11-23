// Chế độ đơn giản: hỏi người dùng hay làm việc gì, ghim sẵn tiện ích phù hợp, ẩn bớt các nhóm ít dùng.
import { getState, setState } from '../store.js';
import { done as navDone } from '../nav.js';
import { ICON, backHeader, toast, sw } from './common.js';
import { ILL } from './art.js';
import { MAX_PINS } from './pins.js';

// id, nhãn, mô tả, hình, tiện ích ghim sẵn, nhóm ở màn Tiện ích
export const NEEDS = [
  ['gio', 'Nhắc giỗ, rằm, sinh nhật', 'Không quên ngày của gia đình', 'incense', ['gio', 'sinhnhat', 'lich'], ['giadinh']],
  ['cung', 'Cúng lễ, văn khấn', 'Bài khấn, mâm cúng, đi chùa', 'book', ['vankhan', 'mam', 'chua', 'anchay'], ['cung']],
  ['xem', 'Xem ngày, xem tuổi', 'Ngày tốt xấu, sao hạn, mệnh', 'star', ['ngaytot', 'conv', 'xemtuoi', 'saohan'], ['xem']],
  ['dongho', 'Gia phả, dòng họ', 'Gia phả, tưởng nhớ, tảo mộ, quỹ họ', 'tree', ['giapha', 'tuongnho', 'taomo', 'quyho'], ['dongho']],
  ['tet', 'Lo việc Tết', 'Chuẩn bị Tết, xông đất, xuất hành', 'lantern', ['chuanbitet', 'xongdat', 'xuathanh'], ['tet']]
];
export const DEFAULT_NEEDS = ['gio', 'cung'];

/** Tiện ích ghim theo nhu cầu (giữ thứ tự, không trùng, tối đa 8) */
export function pinsForNeeds(ids) {
  const out = [];
  for (const n of NEEDS) if (ids.includes(n[0])) for (const p of n[4]) if (!out.includes(p)) out.push(p);
  return out.slice(0, MAX_PINS);
}
/** Nhóm tiện ích hiện ở chế độ đơn giản */
export function groupsForNeeds(ids) {
  return new Set(NEEDS.filter((n) => ids.includes(n[0])).flatMap((n) => n[5]));
}

const ui = { picked: null, simple: null };

/** Khối chọn nhu cầu — dùng ở màn chào lần đầu và màn Cài đặt */
export function needsPicker(picked, simple) {
  return `<div class="col" style="gap:10px" role="group" aria-label="Việc bạn hay làm">
    ${NEEDS.map(([id, label, sub, ill]) => `<button type="button" class="need${picked.includes(id) ? ' on' : ''}" role="checkbox" aria-checked="${picked.includes(id)}" data-need="${id}">
      <span class="pastel sm butter">${ILL[ill]()}</span><span class="col grow"><b>${label}</b><span class="small muted">${sub}</span></span><span class="tick ${picked.includes(id) ? 'on' : ''}" aria-hidden="true"></span></button>`).join('')}
  </div>
  <div class="row need-simple"><div class="col grow"><span class="lb">Chế độ đơn giản</span><span class="small muted">Chữ to, chỉ hiện các mục đã chọn ở trên. Đổi lại được trong Cài đặt.</span></div>${sw(simple, 'Chế độ đơn giản', 'data-simple')}</div>`;
}

/** Áp dụng lựa chọn: ghim tiện ích, bật/tắt chế độ đơn giản, chữ to khi bật */
export function applyNeeds(picked, simple) {
  setState((s) => ({ ...s, settings: { ...s.settings, needs: picked, simple, pins: pinsForNeeds(picked), size: simple ? Math.max(1, Number(s.settings.size) || 0) : s.settings.size } }));
}

/** Xử lý bấm trong khối chọn; trả true nếu đã xử lý */
export function onNeedsClick(e, state, rerender) {
  const n = e.target.closest('[data-need]');
  if (n) { const id = n.dataset.need; state.picked = state.picked.includes(id) ? state.picked.filter((x) => x !== id) : [...state.picked, id]; rerender(); return true; }
  if (e.target.closest('[data-simple]')) { state.simple = !state.simple; rerender(); return true; }
  return false;
}

/* ---------- Màn "Việc bạn hay làm" (từ Cài đặt) ---------- */
export function renderNeeds() {
  const s = getState().settings;
  if (!ui.picked) { ui.picked = Array.isArray(s.needs) ? [...s.needs] : [...DEFAULT_NEEDS]; ui.simple = !!s.simple; }
  return `<div class="screen no-nav" data-screen="nhucau">
  ${backHeader('Việc bạn hay làm', '#/settings', 'App ghim sẵn tiện ích phù hợp lên trang chính')}
  <main class="body">
    ${needsPicker(ui.picked, ui.simple)}
    <span class="small muted">Bấm Áp dụng sẽ thay các tiện ích đang ghim ở trang Hôm nay bằng bộ phù hợp (sửa lại được ở "Tùy chỉnh").</span>
  </main>
  <div class="bottom-bar"><button type="button" class="btn" data-act="needs-save" ${ui.picked.length ? '' : 'disabled'}>Áp dụng</button></div>
</div>`;
}

export function mountNeeds(root, rerender) {
  root.addEventListener('click', (e) => {
    if (onNeedsClick(e, ui, rerender)) return;
    if (e.target.closest('[data-act="needs-save"]')) {
      applyNeeds(ui.picked, ui.simple);
      ui.picked = null;
      toast(getState().settings.simple ? 'Đã bật chế độ đơn giản' : 'Đã ghim tiện ích phù hợp');
      navDone('#/settings');
    }
  });
}
export const resetNeeds = () => { ui.picked = null; };
