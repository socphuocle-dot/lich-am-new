import { describe, it, expect } from 'vitest';
import { solarToLunar, lunarToSolar, jdFromDate, jdToDate, canChiDay, canChiYear, canChiMonth, hoangDaoHours, daySpirit, leapMonthOfYear, dayInfo, lunarMonthLength } from '../src/lib/lunar.js';
import { listEvents, nextGioDate } from '../src/lib/events.js';
import { buildSchedule, MAX_PENDING } from '../src/lib/reminders.js';
import { lifePath, nameNumbers, personalYear, birthChart, reduce } from '../src/lib/numerology.js';
import { readCast, hexagramFromBits, tossCoins } from '../src/lib/iching.js';
import { buildChart } from '../src/lib/tuvi.js';

const tet = (y) => lunarToSolar(1, 1, y);

describe('Âm lịch', () => {
  it('ngày Tết Nguyên Đán đúng theo lịch Việt Nam', () => {
    const known = { 1985: [21, 1], 1996: [19, 2], 2000: [5, 2], 2007: [17, 2], 2020: [25, 1], 2023: [22, 1], 2024: [10, 2], 2025: [29, 1], 2026: [17, 2], 2027: [6, 2], 2030: [2, 2] } // 2030: VN 2/2, TQ 3/2;
    for (const [y, [d, m]] of Object.entries(known)) {
      expect(tet(Number(y)), `Tết ${y}`).toEqual({ day: d, month: m, year: Number(y) });
    }
  });
  it('tháng nhuận đúng', () => {
    expect(leapMonthOfYear(2017)).toBe(6);
    expect(leapMonthOfYear(2020)).toBe(4);
    expect(leapMonthOfYear(2023)).toBe(2);
    expect(leapMonthOfYear(2025)).toBe(6);
    expect(leapMonthOfYear(2028)).toBe(5);
    expect(leapMonthOfYear(2024)).toBe(0);
    expect(leapMonthOfYear(2026)).toBe(0);
  });
  it('lễ âm lịch quen thuộc', () => {
    expect(lunarToSolar(15, 8, 2025)).toEqual({ day: 6, month: 10, year: 2025 }); // Trung thu 2025
    expect(lunarToSolar(15, 7, 2025)).toEqual({ day: 6, month: 9, year: 2025 }); // Vu Lan 2025
    expect(lunarToSolar(10, 3, 2026)).toEqual({ day: 26, month: 4, year: 2026 }); // Giỗ Tổ 2026
  });
  it('đổi hai chiều khớp nhau cho mọi ngày 1990–2050', () => {
    let jd = jdFromDate(1, 1, 1990);
    const end = jdFromDate(31, 12, 2050);
    let checked = 0;
    for (; jd <= end; jd += 1) {
      const s = jdToDate(jd);
      const l = solarToLunar(s.day, s.month, s.year);
      const back = lunarToSolar(l.day, l.month, l.year, l.leap);
      if (!back || back.day !== s.day || back.month !== s.month || back.year !== s.year) {
        throw new Error(`Sai ở ${s.day}/${s.month}/${s.year} → ${JSON.stringify(l)} → ${JSON.stringify(back)}`);
      }
      checked++;
    }
    expect(checked).toBeGreaterThan(22000);
  });
  it('can chi ngày/tháng/năm', () => {
    expect(canChiDay(jdFromDate(1, 1, 2000))).toBe('Mậu Ngọ');
    expect(canChiYear(2026)).toBe('Bính Ngọ');
    expect(canChiYear(2027)).toBe('Đinh Mùi');
    expect(canChiYear(1996)).toBe('Bính Tý');
    expect(canChiMonth(1, 2026)).toBe('Canh Dần');
    expect(canChiMonth(10, 2026)).toBe('Kỷ Hợi');
  });
  it('ngày 21/11/2026', () => {
    const d = dayInfo(21, 11, 2026);
    expect(d.lunar).toEqual({ day: 13, month: 10, year: 2026, leap: false });
    expect(d.canChi.day).toBe('Kỷ Hợi');
    expect(d.weekday).toBe('Thứ Bảy');
    expect(d.hours.map((h) => h.chi)).toEqual(['Sửu', 'Thìn', 'Ngọ', 'Mùi', 'Tuất', 'Hợi']);
    expect(d.spirit).toEqual({ name: 'Kim Đường', good: true });
    expect(d.xung).toBe('Tỵ');
    expect(['Lập Đông', 'Tiểu Tuyết']).toContain(d.solarTerm);
  });
  it('giờ hoàng đạo ngày Tý', () => {
    expect(hoangDaoHours(0).map((h) => h.chi)).toEqual(['Tý', 'Sửu', 'Mão', 'Ngọ', 'Thân', 'Dậu']);
    expect(hoangDaoHours(0)[0].label).toBe('23–1h');
  });
  it('ngày Thanh Long tháng Giêng là ngày Tý', () => {
    expect(daySpirit(1, 0)).toEqual({ name: 'Thanh Long', good: true });
  });
  it('độ dài tháng âm 29/30', () => {
    for (let m = 1; m <= 12; m++) expect([29, 30]).toContain(lunarMonthLength(m, 2026));
  });
});

describe('Sự kiện & giỗ', () => {
  const from = jdFromDate(21, 11, 2026);
  it('rằm, mùng 1, lễ trong 90 ngày tới', () => {
    const ev = listEvents(from, 90, []);
    const find = (t) => ev.find((e) => e.title.startsWith(t));
    expect(find('Rằm tháng Mười').solar).toEqual({ day: 23, month: 11, year: 2026 });
    expect(find('Mùng 1 tháng Một').solar).toEqual({ day: 9, month: 12, year: 2026 });
    expect(find('Ông Công Ông Táo').solar).toEqual({ day: 30, month: 1, year: 2027 });
    expect(find('Tết Nguyên Đán').solar).toEqual({ day: 6, month: 2, year: 2027 });
    expect(find('Giao thừa').solar).toEqual({ day: 5, month: 2, year: 2027 });
    expect(find('Lễ Giáng sinh').solar).toEqual({ day: 25, month: 12, year: 2026 });
  });
  it('giỗ âm lịch 18/10 rơi vào 26/11/2026', () => {
    const g = { id: 'a', name: 'Ông nội', cal: 'am', day: 18, month: 10, repeat: 'yearly' };
    expect(nextGioDate(g, from).solar).toEqual({ day: 26, month: 11, year: 2026 });
  });
  it('giỗ ngày 30 khi tháng chỉ có 29 ngày → cúng ngày 29', () => {
    // tìm một tháng 29 ngày trong 2027
    let month = 0;
    for (let m = 1; m <= 12; m++) if (lunarMonthLength(m, 2027) === 29) { month = m; break; }
    expect(month).toBeGreaterThan(0);
    const g = { id: 'b', name: 'Cụ', cal: 'am', day: 30, month, repeat: 'yearly' };
    const s = lunarToSolar(1, 1, 2027);
    const ev = nextGioDate(g, jdFromDate(s.day, s.month, s.year));
    expect(ev.lunar.day).toBe(29);
    expect(ev.lunar.month).toBe(month);
  });
  it('giỗ dương lịch', () => {
    const g = { id: 'c', name: 'Mẹ', cal: 'duong', day: 1, month: 12, repeat: 'yearly' };
    expect(nextGioDate(g, from).solar).toEqual({ day: 1, month: 12, year: 2026 });
  });
});

describe('Lịch thông báo', () => {
  const state = {
    settings: { autoMoon: true, moonEveOn: true, moonEve: '19:00', moonMornOn: true, moonMorning: '06:00', holidayOn: true },
    gios: [{ id: 'g1', name: 'Ông nội', cal: 'am', day: 18, month: 10, remind: [0, 3], time: '07:00', repeat: 'yearly' }],
    disabled: {}
  };
  const now = new Date(2026, 10, 21, 20, 0);
  it('tối đa 60, toàn bộ ở tương lai, có thứ tự', () => {
    const s = buildSchedule(now, state);
    expect(s.length).toBe(MAX_PENDING);
    for (let i = 0; i < s.length; i++) {
      expect(s[i].at.getTime()).toBeGreaterThan(now.getTime());
      if (i) expect(s[i].at.getTime()).toBeGreaterThanOrEqual(s[i - 1].at.getTime());
    }
    expect(new Set(s.map((x) => x.id)).size).toBe(s.length);
  });
  it('nhắc rằm tối hôm trước 19:00 và giỗ trước 3 ngày', () => {
    const s = buildSchedule(now, state);
    const eve = s.find((x) => x.title === 'Ngày mai: Rằm tháng Mười · Tết Hạ Nguyên');
    expect(eve.at).toEqual(new Date(2026, 10, 22, 19, 0));
    const g3 = s.find((x) => x.title === 'Còn 3 ngày nữa: Giỗ Ông nội');
    expect(g3.at).toEqual(new Date(2026, 10, 23, 7, 0));
    const g0 = s.find((x) => x.title === 'Hôm nay: Giỗ Ông nội');
    expect(g0.at).toEqual(new Date(2026, 10, 26, 7, 0));
  });
  it('tắt nhắc rằm tự động', () => {
    const s = buildSchedule(now, { ...state, settings: { ...state.settings, autoMoon: false } });
    expect(s.some((x) => x.title.includes('Mùng 1 tháng Một'))).toBe(false);
    // Rằm tháng Mười vẫn là ngày lễ (Tết Hạ Nguyên) nên vẫn nhắc buổi sáng
    expect(s.some((x) => x.title === 'Hôm nay: Rằm tháng Mười · Tết Hạ Nguyên')).toBe(true);
  });
});

describe('Thần số học', () => {
  it('số chủ đạo và tên', () => {
    expect(lifePath(18, 8, 1996).value).toBe(6);
    expect(nameNumbers('Nguyễn Minh Khôi').expression).toBe(11);
    expect(nameNumbers('Đặng Thị Ánh').letters).toBe('DANGTHIANH');
    expect(personalYear(18, 8, 2026)).toBe(9);
    expect(reduce(29)).toBe(11);
    expect(birthChart(18, 8, 1996).find((c) => c.n === 9).count).toBe(2);
  });
});

describe('Kinh Dịch', () => {
  it('tra quẻ đúng', () => {
    expect(hexagramFromBits([1, 1, 1, 1, 1, 1]).name).toBe('Thuần Càn');
    expect(hexagramFromBits([0, 0, 0, 0, 0, 0]).no).toBe(2);
    expect(hexagramFromBits([1, 0, 0, 0, 1, 0]).name).toBe('Thủy Lôi Truân');
    expect(hexagramFromBits([1, 1, 1, 0, 0, 0]).name).toBe('Địa Thiên Thái');
    const r = readCast([7, 7, 9, 8, 7, 8]);
    expect(r.main.name).toBe('Thủy Thiên Nhu');
    expect(r.moving).toEqual([3]);
    expect(r.changed.name).toBe('Thủy Trạch Tiết');
  });
  it('đủ 64 quẻ khác nhau', () => {
    const seen = new Set();
    for (let i = 0; i < 64; i++) seen.add(hexagramFromBits([0, 1, 2, 3, 4, 5].map((b) => (i >> b) & 1)).no);
    expect(seen.size).toBe(64);
  });
  it('xác suất đồng xu hợp lệ', () => {
    for (let i = 0; i < 200; i++) expect([6, 7, 8, 9]).toContain(tossCoins().value);
  });
});

describe('Tử Vi', () => {
  it('lá số mẫu 18/08/1996 giờ Ngọ, Nam', () => {
    const c = buildChart({ dob: '1996-08-18', hourChi: 6, gender: 'Nam' });
    expect(c.palaces).toHaveLength(12);
    const menh = c.palaces.find((p) => p.name === 'Mệnh');
    expect(menh.branch).toBe('Dần');
    expect(menh.majors.map((m) => m.name)).toEqual(['Tử Vi', 'Thiên Phủ']);
    expect(c.five).toBe('Mộc Tam Cục');
    expect(c.palaces.some((p) => p.name === 'Tử Tức')).toBe(true);
    for (const p of c.palaces) expect(p.pos).toBeTruthy();
  });
});

import { buildStaticCalendar, buildUserWidgetData, epochDay } from '../src/lib/widgetData.js';
describe('Dữ liệu widget', () => {
  const cal = buildStaticCalendar(2025, 2036);
  const at = (d, m, y) => cal.days[epochDay(d, m, y) - cal.startEpochDay];
  it('bảng tĩnh đủ ngày và đúng mốc', () => {
    expect(cal.count).toBe(4383);
    expect(cal.startEpochDay).toBe(Math.floor(Date.UTC(2025, 0, 1) / 864e5));
    expect(at(21, 11, 2026)).toEqual([13, 10, 0, 2026, 'Kỷ Hợi', 1, '', 0]);
    expect(at(6, 2, 2027).slice(0, 2)).toEqual([1, 1]);
    expect(at(6, 2, 2027)[6]).toBe('Tết Nguyên Đán');
    expect(at(23, 11, 2026)[7]).toBe(2);
    expect(at(9, 12, 2026)[7]).toBe(1);
    expect(at(31, 12, 2036)).toBeTruthy();
    expect(cal.years['2026']).toBe('Bính Ngọ');
  });
  it('dữ liệu động: giỗ + đếm ngược', () => {
    const st = { settings: { widgetCountdown: 'auto' }, gios: [{ id: 'g', name: 'Ông nội', cal: 'am', day: 18, month: 10, repeat: 'yearly' }] };
    const now = new Date(2026, 10, 21, 9);
    const d = buildUserWidgetData(now, st);
    expect(d.gios[0]).toMatchObject({ d: '2026-11-26', t: 'Giỗ Ông nội', l: '18/10' });
    expect(d.gios[0].r).toMatch(/^vankhan\/gio\?gid=g&jd=/);
    expect(d.cd).toEqual({ t: 'Giỗ Ông nội', d: '2026-11-26' });
    expect(buildUserWidgetData(now, { ...st, settings: { widgetCountdown: 'tet' } }).cd).toEqual({ t: 'Tết Nguyên Đán', d: '2027-02-06' });
    expect(buildUserWidgetData(now, { ...st, settings: { widgetCountdown: 'ongtao' } }).cd).toEqual({ t: 'Ông Công Ông Táo', d: '2027-01-30' });
    expect(buildUserWidgetData(now, { ...st, settings: { widgetCountdown: 'gio:g' } }).cd.d).toBe('2026-11-26');
    expect(buildUserWidgetData(now, { settings: {}, gios: [] }).cd.t).toBe('Tết Nguyên Đán');
  });
});
