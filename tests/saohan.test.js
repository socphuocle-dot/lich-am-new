import { describe, it, expect } from 'vitest';
import { saoOf, hanOf, tuoiMu, nextStarDays, STARS } from '../src/lib/saohan.js';
import { jdFromDate } from '../src/lib/lunar.js';

describe('sao hạn', () => {
  it('sao chiếu mệnh theo tuổi mụ chia 9', () => {
    expect(saoOf(37, 'nam').name).toBe('La Hầu');
    expect(saoOf(37, 'nu').name).toBe('Kế Đô');
    expect(saoOf(31, 'nam').name).toBe('Thái Bạch'); // 1996 năm 2026
    expect(saoOf(31, 'nu').name).toBe('Thái Âm');
    expect(saoOf(36, 'nam').name).toBe('Mộc Đức');
    expect(saoOf(36, 'nu').name).toBe('Thủy Diệu');
    expect(saoOf(51, 'nu').name).toBe('La Hầu'); // 1976 nữ năm 2026
  });
  it('hạn khớp bảng năm 2026', () => {
    const y = 2026;
    const cases = [[1988, 'nam', 'Thiên Tinh'], [1988, 'nu', 'Tam Kheo'], [1997, 'nam', 'Ngũ Mộ'], [2009, 'nam', 'Huỳnh Tuyền'], [2009, 'nu', 'Toán Tận'],
      [1994, 'nam', 'Thiên La'], [1994, 'nu', 'Diêm Vương'], [1948, 'nam', 'Diêm Vương'], [1948, 'nu', 'Thiên La'], [1984, 'nam', 'Địa Võng'], [1984, 'nu', 'Địa Võng'],
      [1960, 'nam', 'Toán Tận'], [1960, 'nu', 'Huỳnh Tuyền'], [1972, 'nam', 'Tam Kheo'], [1972, 'nu', 'Thiên Tinh']];
    for (const [b, g, h] of cases) expect(hanOf(tuoiMu(b, y), g).name, `${b} ${g}`).toBe(h);
  });
  it('các tuổi Thiên Tinh và Huỳnh Tuyền', () => {
    expect([13, 22, 31, 39, 40, 48, 57, 66, 75, 84, 93].every((a) => hanOf(a, 'nam').name === 'Thiên Tinh')).toBe(true);
    expect([11, 19, 20, 28, 37, 46, 55, 64, 73, 82, 91].every((a) => hanOf(a, 'nu').name === 'Thiên Tinh')).toBe(true);
    expect([18, 27, 36, 45, 54, 63, 72, 81, 89, 90, 98].every((a) => hanOf(a, 'nam').name === 'Huỳnh Tuyền')).toBe(true);
    expect([14, 23, 32, 41, 49, 50, 58, 67, 76, 85, 94].every((a) => hanOf(a, 'nu').name === 'Huỳnh Tuyền')).toBe(true);
  });
  it('ngày cúng sao tiếp theo', () => {
    const from = jdFromDate(22, 11, 2026); // 14/10 âm
    const ds = nextStarDays(STARS[3], from, 2); // Thái Bạch: rằm
    expect(ds[0].solar).toMatchObject({ day: 23, month: 11, year: 2026 });
    expect(ds).toHaveLength(2);
    const lh = nextStarDays(STARS[0], from, 1); // La Hầu: mùng 8 tháng sau
    expect(lh[0].lunar.month).toBe(11);
  });
});
