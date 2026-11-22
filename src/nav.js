// Điều hướng kiểu ứng dụng điện thoại (theo nguyên tắc tab bar của iOS / Material):
// • 5 tab ngang hàng, mỗi tab có ngăn xếp màn hình riêng; đổi tab rồi quay lại vẫn ở đúng chỗ cũ.
// • Bấm lại tab đang mở: về màn gốc của tab (đang ở gốc thì cuộn lên đầu).
// • "Quay lại" (nút trên màn và nút cứng Android) lùi đúng một bước trong tab đang mở,
//   khôi phục vị trí cuộn; màn gốc của tab không có nút quay lại.
// • Lưu xong một biểu mẫu thì đóng biểu mẫu (lùi), không chồng thêm màn mới.
// • Mở từ thông báo, widget, link: dựng sẵn [màn gốc của tab → màn đích] để Quay lại hợp lý.
// Lịch sử trình duyệt chỉ giữ một mục (luôn location.replace) — ngăn xếp do app tự quản.

export const TABS = ['today', 'calendar', 'reminders', 'tienich', 'canhan'];
export const TAB_ROOT = { today: '#/today', calendar: '#/calendar', reminders: '#/reminders', tienich: '#/tienich', canhan: '#/canhan' };

/** Tab "nhà" của từng màn — dùng khi mở thẳng (thông báo, widget, link) */
const TAB_OF = {
  today: 'today', ngaytot: 'today', moi: 'today',
  calendar: 'calendar', doingay: 'calendar',
  reminders: 'reminders', add: 'reminders', edit: 'reminders', chiase: 'reminders', nhap: 'reminders', contacts: 'reminders',
  canhan: 'canhan', settings: 'canhan', donate: 'canhan', gopy: 'canhan', profile: 'canhan'
};
export const tabOf = (name) => TAB_OF[name] || 'tienich';

/** Màn cha theo logic — chỉ dùng khi ngăn xếp rỗng (mở thẳng) */
const PARENT = {
  add: '#/reminders', edit: '#/reminders', chiase: '#/reminders', nhap: '#/reminders', contacts: '#/reminders',
  settings: '#/canhan', donate: '#/canhan', gopy: '#/canhan', moi: '#/canhan', profile: '#/canhan',
  ngaytot: '#/today', doingay: '#/calendar',
  tuvi: '#/culture', numerology: '#/culture', iching: '#/culture', culture: '#/tienich'
};
const routeName = (h) => String(h || '').replace(/^#\/?/, '').split(/[/?]/)[0] || 'today';
const routeId = (h) => String(h || '').replace(/^#\/?/, '').split('?')[0].split('/')[1] || '';
export function parentOf(hash) {
  const n = routeName(hash);
  if (PARENT[n]) return PARENT[n];
  // Màn con có mã (ví dụ #/hieuhi/abc, #/giapha/new) → về danh sách của nó
  if (routeId(hash) && !['vankhan', 'tuongnho', 'chuanbi', 'thiep'].includes(n)) return '#/' + n;
  if (n === 'vankhan' && routeId(hash)) return '#/vankhan';
  return TAB_ROOT[tabOf(n)];
}

const stacks = Object.fromEntries(TABS.map((t) => [t, []])); // mỗi mục: { h: hash, y: vị trí cuộn }
let active = 'today';
let internal = false; // hashchange do chính app gây ra
let direction = 'tab'; // 'fwd' | 'back' | 'tab' — để chọn hiệu ứng chuyển màn
const listeners = [];

export const activeTab = () => active;
export const navDirection = () => direction;
export const depth = () => stacks[active].length;
export const canGoBack = () => stacks[active].length > 1;
export const isTabRoot = (h = location.hash) => Object.values(TAB_ROOT).includes(normalize(h));
export const onNavigate = (fn) => listeners.push(fn);
const normalize = (h) => (h && h !== '#' && h !== '#/' ? h : '#/today');
const top = () => stacks[active][stacks[active].length - 1];

function show(h, dir) {
  direction = dir;
  internal = true;
  if (normalize(location.hash) === normalize(h)) { internal = false; listeners.forEach((fn) => fn()); return; }
  location.replace(h);
}

/** Khởi tạo khi mở app: dựng ngăn xếp cho màn đang mở */
export function initNav() {
  openExternal(normalize(location.hash), true);
}

/** Đi tới màn mới (đẩy lên ngăn xếp của tab đang mở). Đích là màn gốc của một tab → chuyển tab. */
export function go(h, { replace = false } = {}) {
  h = normalize(h);
  const rootTab = TABS.find((t) => TAB_ROOT[t] === h);
  if (rootTab && !replace) { switchTab(rootTab, { toRoot: true }); return; }
  const s = stacks[active];
  if (top()) top().y = window.scrollY;
  if (replace && s.length) s[s.length - 1] = { h, y: 0 };
  else if (!top() || top().h !== h) s.push({ h, y: 0 });
  show(h, replace ? 'none' : 'fwd');
}

/** Lùi một bước; không còn gì để lùi thì về màn cha theo logic */
export function back() {
  const s = stacks[active];
  if (s.length > 1) { s.pop(); restoreY = top().y; show(top().h, 'back'); return true; }
  const p = parentOf(top()?.h || location.hash);
  if (p && normalize(p) !== normalize(top()?.h)) {
    const t = tabOf(routeName(p));
    if (TAB_ROOT[t] === p) { active = t; stacks[t] = [{ h: p, y: 0 }]; }
    else { stacks[active] = [{ h: TAB_ROOT[active], y: 0 }, { h: p, y: 0 }]; }
    show(p, 'back');
    return true;
  }
  return false;
}

/** Xong một biểu mẫu (đã lưu / đã xóa): đóng nó. Không có màn trước thì thay bằng fallback. */
export function done(fallback, { to = '' } = {}) {
  const s = stacks[active];
  if (s.length > 1) {
    s.pop();
    if (to) top().h = normalize(to);
    restoreY = to ? null : top().y;
    show(top().h, 'back');
    return;
  }
  go(to || fallback, { replace: true });
}

/** Về hẳn một màn gốc, xóa ngăn xếp (ví dụ sau khi xóa toàn bộ dữ liệu, xong màn chào) */
export function resetTo(h) {
  TABS.forEach((t) => { stacks[t] = []; });
  openExternal(normalize(h));
}

let restoreY = null;
/** Vị trí cuộn cần khôi phục sau khi lùi (router gọi một lần) */
export function takeRestoreY() { const y = restoreY; restoreY = null; return y; }

/** Đổi tab: giữ nguyên chỗ đang xem của tab đó. Bấm lại tab đang mở → về gốc / cuộn lên đầu. */
export function switchTab(t, { toRoot = false } = {}) {
  if (top()) top().y = window.scrollY;
  if (t === active) {
    if (stacks[t].length > 1) { stacks[t] = [stacks[t][0]]; restoreY = 0; show(stacks[t][0].h, 'back'); }
    else window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  active = t;
  if (!stacks[t].length || toRoot) stacks[t] = [{ h: TAB_ROOT[t], y: 0 }];
  restoreY = top().y;
  show(top().h, 'tab');
}

/** Mở thẳng một màn (thông báo, widget, link, gõ địa chỉ): dựng [gốc tab → đích] */
export function openExternal(h, initial = false) {
  h = normalize(h);
  const n = routeName(h);
  const t = tabOf(n);
  if (!initial && top()) top().y = window.scrollY;
  active = t;
  const root = TAB_ROOT[t];
  const p = parentOf(h);
  const chain = [{ h: root, y: 0 }];
  if (p !== root && normalize(p) !== h && routeName(p) !== routeName(root)) chain.push({ h: p, y: 0 });
  if (h !== root) chain.push({ h, y: 0 });
  stacks[t] = chain;
  if (initial) { direction = 'none'; return; }
  show(h, 'fwd');
}

/**
 * Gọi từ trình nghe hashchange. Trả true nếu đây là thay đổi do app gây ra.
 * Thay đổi từ bên ngoài (code cũ còn đặt location.hash, link ngoài) được coi là "đi tới".
 */
export function handleHashChange() {
  if (internal) { internal = false; return true; }
  const h = normalize(location.hash);
  if (top()?.h === h) return true;
  // Mọi điều hướng trong app đều đi qua go()/back(); thay đổi còn lại là từ bên ngoài
  // (gõ địa chỉ, link ngoài, trình duyệt) → mở như link: dựng [gốc tab → đích]
  const s = stacks[active];
  if (s.length > 1 && s[s.length - 2].h === h) { s.pop(); restoreY = top().y; direction = 'back'; return false; }
  if (top()) top().y = window.scrollY;
  const rootTab = TABS.find((t) => TAB_ROOT[t] === h);
  if (rootTab) { active = rootTab; if (!stacks[rootTab].length || stacks[rootTab][0].h !== h) stacks[rootTab] = [{ h, y: 0 }]; else stacks[rootTab] = [stacks[rootTab][0]]; direction = 'tab'; return false; }
  openExternal(h, true);
  direction = 'fwd';
  return false;
}
