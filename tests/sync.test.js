import { describe, it, expect, vi } from 'vitest';
vi.mock('@capacitor/core', () => ({ Capacitor: { isNativePlatform: () => false, getPlatform: () => 'web' } }));
const mem = {};
globalThis.localStorage = { getItem: (k) => mem[k] ?? null, setItem: (k, v) => { mem[k] = String(v); }, removeItem: (k) => { delete mem[k]; } };
const { calendarEventsToWrite, birthdaysFrom, daysSinceBackup } = await import('../src/sync.js');
const { titleOf, listEvents, jdOfDate } = await import('../src/lib/events.js');
const { importData, getState } = await import('../src/store.js');

const gio = { id: 'a', name: 'Ông nội', cal: 'am', day: 10, month: 3, remind: [0], enabled: true };
const sn = { id: 'b', type: 'sinhnhat', name: 'Bé Na', cal: 'duong', day: 5, month: 6, remind: [0], enabled: true };
const kn = { id: 'c', type: 'kyniem', name: 'Kỷ niệm ngày cưới', cal: 'duong', day: 1, month: 12, remind: [0], enabled: true };

describe('Loại sự kiện', () => {
  it('titleOf theo loại', () => {
    expect(titleOf(gio)).toBe('Giỗ Ông nội');
    expect(titleOf(sn)).toBe('Sinh nhật Bé Na');
    expect(titleOf(kn)).toBe('Kỷ niệm ngày cưới');
  });
  it('listEvents dùng tiêu đề theo loại', () => {
    const evs = listEvents(jdOfDate(new Date(2026, 0, 1)), 366, [gio, sn, kn], { moon: false, lunarHolidays: false, solarHolidays: false });
    const titles = evs.map((e) => e.title);
    expect(titles).toContain('Giỗ Ông nội');
    expect(titles).toContain('Sinh nhật Bé Na');
    expect(titles).toContain('Kỷ niệm ngày cưới');
  });
});

describe('Ghi vào lịch máy', () => {
  const now = new Date(2026, 10, 22);
  it('2 năm giỗ + sinh nhật, kèm lễ mặc định, không kèm rằm', () => {
    const items = calendarEventsToWrite(now, { gios: [gio, sn], calSync: { holidays: true, moon: false } });
    expect(items.filter((i) => i.title === 'Giỗ Ông nội').length).toBe(2);
    expect(items.filter((i) => i.title === 'Sinh nhật Bé Na').length).toBe(2);
    expect(items.some((i) => /Tết Nguyên Đán|Mùng 1 Tết/i.test(i.title))).toBe(true);
    expect(items.some((i) => /Rằm tháng|Mùng 1 tháng/.test(i.title) && !/Tết|Vu Lan|Trung Thu|Thượng Nguyên|Hạ Nguyên/i.test(i.title))).toBe(false);
  });
  it('sinh nhật dương lịch rơi đúng 5/6 nửa đêm giờ máy, mô tả có ngày âm', () => {
    const items = calendarEventsToWrite(now, { gios: [sn], calSync: { holidays: false } });
    const d = new Date(items[0].start);
    expect([d.getDate(), d.getMonth() + 1, d.getHours()]).toEqual([5, 6, 0]);
    expect(items[0].description).toMatch(/^Âm lịch \d+\/\d+/);
  });
  it('tắt lễ, bật rằm', () => {
    const items = calendarEventsToWrite(now, { gios: [], calSync: { holidays: false, moon: true } });
    expect(items.length).toBeGreaterThanOrEqual(46);
    expect(items.every((i) => i.key)).toBe(true);
  });
  it('bỏ qua mục đã tắt nhắc', () => {
    const items = calendarEventsToWrite(now, { gios: [{ ...gio, enabled: false }], calSync: { holidays: false } });
    expect(items.length).toBe(0);
  });
});

describe('Danh bạ & sao lưu', () => {
  it('lọc người có ngày sinh, sắp theo tháng/ngày', () => {
    const r = birthdaysFrom([
      { contactId: '1', name: { display: 'Mẹ' }, birthday: { day: 20, month: 10, year: 1965 } },
      { contactId: '2', name: { given: 'Na', family: 'Lê' } , birthday: { day: 3, month: 2 } },
      { contactId: '3', name: { display: 'Không ngày' } }
    ]);
    expect(r.map((x) => x.name)).toEqual(['Lê Na', 'Mẹ']);
    expect(r[1]).toMatchObject({ day: 20, month: 10, year: 1965 });
  });
  it('khôi phục không mang theo mã sự kiện lịch của máy cũ', () => {
    importData(JSON.stringify({ data: { gios: [gio], calSync: { enabled: true, ids: ['x'], calendarId: '9', moon: true } } }));
    expect(getState().calSync).toMatchObject({ enabled: false, ids: [], calendarId: '', moon: true });
  });
  it('số ngày từ lần sao lưu', () => {
    expect(daysSinceBackup({ lastBackup: '' })).toBe(null);
    expect(daysSinceBackup({ lastBackup: new Date(Date.now() - 40 * 864e5).toISOString() })).toBe(40);
  });
});
