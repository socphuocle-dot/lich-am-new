// Tiện ích ghim ra trang Hôm nay: người dùng tự chọn, tự sắp thứ tự (tối đa 8 ô, 2 hàng).
import { getState, updateSettings } from '../store.js';
import { ILL } from './art.js';
import { ICON, backHeader, toast } from './common.js';

export const MAX_PINS = 8;
const chev = (d) => `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`;
const UP = chev('m6 15 6-6 6 6'), DOWN = chev('m6 9 6 6 6-6');
export const DEFAULT_PINS = ['vankhan', 'ngaytot', 'conv', 'mam'];

// id → [nhãn ngắn, đường dẫn (hoặc 'conv' = mở khung đổi ngày ngay tại chỗ), hình, màu nền, nhóm, chỉ hiện khi bật Văn hóa]
const C = [
  ['gio', 'Thêm giỗ', '#/add?type=gio', 'incense', 'rose', 'Ngày của gia đình'],
  ['sinhnhat', 'Sinh nhật', '#/add?type=sinhnhat', 'cake', 'rose', 'Ngày của gia đình'],
  ['kyniem', 'Kỷ niệm', '#/add?type=kyniem', 'rings', 'rose', 'Ngày của gia đình'],
  ['tang', 'Tang lễ', '#/add?type=gio&tang=1', 'lotus', 'rose', 'Ngày của gia đình'],
  ['vankhan', 'Văn khấn', '#/vankhan', 'book', 'rose', 'Cúng lễ'],
  ['mam', 'Mâm cúng', '#/vankhan?tab=mam', 'tray', 'peach', 'Cúng lễ'],
  ['chua', 'Đi lễ chùa', '#/vankhan?g=chua', 'pagoda', 'butter', 'Cúng lễ'],
  ['anchay', 'Ăn chay', '#/anchay', 'bowl', 'mint', 'Cúng lễ'],
  ['thantai', 'Thần Tài', '#/vankhan/thantai', 'coin', 'butter', 'Cúng lễ'],
  ['giapha', 'Gia phả', '#/giapha', 'tree', 'peach', 'Dòng họ'],
  ['tuongnho', 'Tưởng nhớ', '#/tuongnho', 'frame', 'peach', 'Dòng họ'],
  ['taomo', 'Tảo mộ', '#/taomo', 'incense', 'mint', 'Dòng họ'],
  ['quyho', 'Quỹ họ', '#/quyho', 'coin', 'butter', 'Dòng họ'],
  ['ingiapha', 'In gia phả', '#/ingiapha', 'scroll', 'peach', 'Dòng họ'],
  ['hieuhi', 'Hiếu hỉ', '#/hieuhi', 'hongbao', 'rose', 'Dòng họ'],
  ['chuanbi', 'Chuẩn bị giỗ', '#/chuanbi', 'checklist', 'mint', 'Dòng họ'],
  ['thiep', 'Thiệp mời', '#/thiep', 'card', 'sky', 'Dòng họ'],
  ['ngaytot', 'Ngày tốt', '#/ngaytot', 'star', 'butter', 'Xem ngày'],
  ['conv', 'Đổi ngày', 'conv', 'swap', 'mint', 'Xem ngày'],
  ['saohan', 'Sao hạn', '#/saohan', 'starlamp', 'lilac', 'Xem ngày'],
  ['xemtuoi', 'Xem tuổi', '#/xemtuoi', 'scroll', 'butter', 'Xem ngày'],
  ['menh', 'Mệnh, màu', '#/menh', 'wuxing', 'mint', 'Xem ngày'],
  ['lich', 'Lịch tháng', '#/calendar', 'cal', 'sky', 'Xem ngày'],
  ['chuanbitet', 'Chuẩn bị Tết', '#/chuanbitet', 'lantern', 'rose', 'Tết'],
  ['xongdat', 'Xông đất', '#/xongdat', 'house', 'rose', 'Tết'],
  ['xuathanh', 'Xuất hành', '#/xuathanh', 'compass', 'rose', 'Tết'],
  ['chiase', 'Chia sẻ', '#/chiase', 'family', 'sky', 'Kết nối gia đình'],
  ['nhap', 'Nhập vào', '#/nhap', 'inbox', 'sky', 'Kết nối gia đình'],
  ['contacts', 'Danh bạ', '#/contacts', 'contacts', 'sky', 'Kết nối gia đình'],
  ['tuvi', 'Tử Vi', '#/tuvi', 'taiji', 'lilac', 'Văn hóa', 1],
  ['numerology', 'Thần số', '#/numerology', 'num', 'lilac', 'Văn hóa', 1],
  ['iching', 'Kinh Dịch', '#/iching', 'hexa', 'lilac', 'Văn hóa', 1]
];
export const CATALOG = Object.fromEntries(C.map(([id, label, href, ill, tone, group, culture]) => [id, { id, label, href, ill, tone, group, culture: !!culture }]));

const available = (it, st) => it && (!it.culture || st.settings.culture);

/** Danh sách đang ghim (đã lọc mục không còn dùng được) */
export function pinned(st = getState()) {
  const raw = Array.isArray(st.settings.pins) ? st.settings.pins : DEFAULT_PINS;
  return raw.filter((id, i) => available(CATALOG[id], st) && raw.indexOf(id) === i).slice(0, MAX_PINS);
}

/** Một ô tiện ích trên trang Hôm nay */
export function pinTile(id, convOpen = false) {
  const it = CATALOG[id];
  const icon = `<span class="pastel ${it.tone}">${ILL[it.ill]()}</span>`;
  return it.href === 'conv'
    ? `<button type="button" class="tool" data-act="conv" aria-expanded="${convOpen}">${icon}${it.label}</button>`
    : `<a class="tool" href="${it.href}">${icon}${it.label}</a>`;
}

/* ============ Màn "Tùy chỉnh trang chính" ============ */
export function renderPins() {
  const st = getState();
  const on = pinned(st);
  const groups = {};
  for (const it of Object.values(CATALOG)) if (available(it, st)) (groups[it.group] = groups[it.group] || []).push(it);
  const full = on.length >= MAX_PINS;
  const row = (id, i) => {
    const it = CATALOG[id];
    return `<div class="item pin-on" data-pin-row="${id}">
      <span class="pastel sm ${it.tone}">${ILL[it.ill]()}</span><span class="grow t">${it.label}</span>
      <button type="button" class="icon-btn plain" data-up="${id}" aria-label="Đưa ${it.label} lên trước" ${i === 0 ? 'disabled' : ''}>${UP}</button>
      <button type="button" class="icon-btn plain" data-down="${id}" aria-label="Đưa ${it.label} ra sau" ${i === on.length - 1 ? 'disabled' : ''}>${DOWN}</button>
      <button type="button" class="icon-btn plain" data-unpin="${id}" aria-label="Bỏ ghim ${it.label}">${ICON.close(18)}</button></div>`;
  };
  return `<div class="screen" data-screen="ghim">
  ${backHeader('Tiện ích trên trang chính', '#/today', `Đã chọn ${on.length}/${MAX_PINS} · hiện ở màn Hôm nay`)}
  <main class="body">
    <section class="card pad col" style="gap:10px" aria-label="Xem trước">
      <span class="small muted">Xem trước</span>
      <div class="tools">${on.map((id) => pinTile(id)).join('') || '<span class="small muted" style="grid-column:1/-1">Chưa ghim tiện ích nào — trang chính sẽ ẩn mục này.</span>'}</div>
    </section>
    ${on.length ? `<section class="col" style="gap:8px"><h2 class="h">Đang ghim · sắp thứ tự</h2><div class="card list">${on.map(row).join('')}</div></section>` : ''}
    <section class="col" style="gap:8px"><div class="h2row"><h2 class="h">Thêm tiện ích</h2>${full ? `<span class="small muted">Đã đủ ${MAX_PINS} ô</span>` : ''}</div>
      ${Object.entries(groups).map(([g, items]) => `<div class="pin-group"><span class="small muted pin-gh">${g}</span><div class="pin-chips">${items.map((it) => {
        const isOn = on.includes(it.id);
        return `<button type="button" class="pin-chip${isOn ? ' on' : ''}" data-toggle="${it.id}" aria-pressed="${isOn}" ${!isOn && full ? 'disabled' : ''}><span class="pastel xs ${it.tone}">${ILL[it.ill]()}</span>${it.label}${isOn ? ICON.check(16) : ICON.plus(16)}</button>`;
      }).join('')}</div></div>`).join('')}
    </section>
    <button type="button" class="btn ghost" data-reset-pins>Về mặc định</button>
  </main>
</div>`;
}

export function mountPins(root) {
  const save = (list) => updateSettings({ pins: list });
  root.addEventListener('click', (e) => {
    const t = e.target.closest('[data-toggle],[data-up],[data-down],[data-unpin],[data-reset-pins]');
    if (!t) return;
    const list = pinned();
    if (t.dataset.toggle) {
      const id = t.dataset.toggle;
      if (list.includes(id)) save(list.filter((x) => x !== id));
      else if (list.length < MAX_PINS) { save([...list, id]); toast(`Đã ghim “${CATALOG[id].label}” ra trang chính`); }
      return;
    }
    if (t.dataset.unpin) { save(list.filter((x) => x !== t.dataset.unpin)); return; }
    const id = t.dataset.up || t.dataset.down;
    if (id) {
      const i = list.indexOf(id); const j = t.dataset.up ? i - 1 : i + 1;
      if (i < 0 || j < 0 || j >= list.length) return;
      [list[i], list[j]] = [list[j], list[i]];
      save(list);
      requestAnimationFrame(() => document.querySelector(`[data-${t.dataset.up ? 'up' : 'down'}="${id}"]:not([disabled])`)?.focus());
      return;
    }
    if (t.hasAttribute('data-reset-pins')) { save([...DEFAULT_PINS]); toast('Đã về bộ tiện ích mặc định'); }
  });
}
