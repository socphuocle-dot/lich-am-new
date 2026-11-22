import { describe, it, expect } from 'vitest';
import { kimLau, hoangOc, tamTai, tuoiMu, xemNam, chiOfYear } from '../src/lib/xemtuoi.js';

describe('xem tuổi', () => {
  it('tuổi mụ', () => { expect(tuoiMu(1990, 2026)).toBe(37); });
  it('Kim Lâu theo số dư 9', () => {
    expect(kimLau(37).bad).toBe(true); // 37 % 9 = 1
    expect(kimLau(37).name).toContain('Thân');
    expect(kimLau(30).bad).toBe(true); // dư 3
    expect(kimLau(33).bad).toBe(true); // dư 6
    expect(kimLau(35).bad).toBe(true); // dư 8
    expect(kimLau(29).bad).toBe(false); // dư 2
  });
  it('Hoang Ốc đếm đúng cung', () => {
    expect(hoangOc(10).name).toBe('Nhất Cát');
    expect(hoangOc(20).name).toBe('Nhì Nghi');
    expect(hoangOc(25).name).toBe('Nhất Cát');
    expect(hoangOc(30).name).toBe('Tam Địa Sát');
    expect(hoangOc(41).name).toBe('Ngũ Thọ Tử');
    expect(hoangOc(60).name).toBe('Lục Hoang Ốc');
    expect(hoangOc(70).name).toBe('Nhất Cát');
  });
  it('Tam Tai', () => {
    expect(chiOfYear(2026)).toBe('Ngọ');
    // Tuổi Tý (1984): Tam Tai các năm Dần, Mão, Thìn
    expect(tamTai(1984, 2022).bad).toBe(true); // Nhâm Dần
    expect(tamTai(1984, 2024).name).toBe('Tam Tai năm thứ 3'); // Giáp Thìn
    expect(tamTai(1984, 2026).bad).toBe(false);
  });
  it('tổng hợp mức độ', () => {
    const r = xemNam(1990, 2026, 'nha');
    expect(r.canChi).toBe('Bính Ngọ');
    expect(r.level).toBeGreaterThanOrEqual(1);
  });
});
