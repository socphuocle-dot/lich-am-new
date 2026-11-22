import { describe, it, expect, beforeEach, vi } from 'vitest';

// Giả lập trình duyệt tối thiểu cho nav.js
function fakeBrowser(start = '#/today') {
  globalThis.location = { hash: start, replace(h) { this.hash = h; } };
  globalThis.window = { scrollY: 0, scrollTo(x, y) { this.scrollY = typeof x === 'object' ? x.top : y; } };
}

let nav;
beforeEach(async () => {
  fakeBrowser();
  vi.resetModules();
  nav = await import('../src/nav.js');
  nav.initNav();
});
const here = () => location.hash;

describe('điều hướng theo tab', () => {
  it('đi tới rồi lùi đúng một bước, khôi phục vị trí cuộn', () => {
    window.scrollY = 300;
    nav.go('#/ngaytot');
    expect(here()).toBe('#/ngaytot');
    expect(nav.canGoBack()).toBe(true);
    nav.back();
    expect(here()).toBe('#/today');
    expect(nav.takeRestoreY()).toBe(300);
  });
  it('mỗi tab giữ chỗ cũ; bấm lại tab đang mở thì về gốc', () => {
    nav.switchTab('canhan'); nav.go('#/settings');
    nav.switchTab('calendar'); expect(here()).toBe('#/calendar');
    nav.switchTab('canhan'); expect(here()).toBe('#/settings');
    nav.switchTab('canhan'); expect(here()).toBe('#/canhan');
    expect(nav.canGoBack()).toBe(false);
  });
  it('lưu biểu mẫu: đóng biểu mẫu, không chồng màn mới', () => {
    nav.switchTab('tienich'); nav.go('#/hieuhi'); nav.go('#/hieuhi/new');
    nav.done('#/hieuhi');
    expect(here()).toBe('#/hieuhi');
    nav.back();
    expect(here()).toBe('#/tienich');
  });
  it('done có đích mới thì thay màn trước bằng đích đó', () => {
    nav.switchTab('tienich'); nav.go('#/giapha'); nav.go('#/giapha/new');
    nav.done('#/giapha', { to: '#/giapha?focus=p1' });
    expect(here()).toBe('#/giapha?focus=p1');
    nav.back(); expect(here()).toBe('#/tienich');
  });
  it('mở thẳng từ thông báo/widget: Quay lại về màn gốc của tab', () => {
    nav.openExternal('#/vankhan/ram?jd=1');
    expect(nav.activeTab()).toBe('tienich');
    nav.back(); expect(here()).toBe('#/vankhan');
    nav.back(); expect(here()).toBe('#/tienich');
    nav.openExternal('#/edit/abc');
    expect(nav.activeTab()).toBe('reminders');
    nav.back(); expect(here()).toBe('#/reminders');
  });
  it('mở thẳng không có lịch sử: Quay lại về màn cha theo logic', () => {
    fakeBrowser('#/settings'); 
    nav.initNav();
    expect(nav.activeTab()).toBe('canhan');
    nav.back(); expect(here()).toBe('#/canhan');
  });
  it('đổi tab trong cùng màn (thay thế) không tạo thêm bước lùi', () => {
    nav.switchTab('tienich'); nav.go('#/vankhan/ram');
    nav.go('#/vankhan/ram?tab=mam', { replace: true });
    nav.back(); expect(here()).toBe('#/tienich');
  });
  it('màn gốc tab nhận biết đúng', () => {
    expect(nav.isTabRoot('#/today')).toBe(true);
    expect(nav.isTabRoot('#/settings')).toBe(false);
    expect(nav.parentOf('#/hieuhi/abc')).toBe('#/hieuhi');
    expect(nav.parentOf('#/donate')).toBe('#/canhan');
  });
});
