import { describe, it, expect } from 'vitest';
import { napAm, menhInfo, xongDatScore, goiYXongDat, tetYear, chayDaysOfMonth, isChay, nextChayDays, ngay30, lunarJd } from '../src/lib/tet.js';
import { jdFromDate, jdToDate } from '../src/lib/lunar.js';

describe('nạp âm, màu hợp', () => {
  it('nạp âm đúng', () => {
    expect(napAm(1984).name).toBe('Hải Trung Kim');
    expect(napAm(1990).name).toBe('Lộ Bàng Thổ');
    expect(napAm(1988).name).toBe('Đại Lâm Mộc');
    expect(napAm(1996).name).toBe('Giản Hạ Thủy');
    expect(napAm(2027).name).toBe('Thiên Hà Thủy');
    expect(napAm(1975).name).toBe('Đại Khê Thủy');
    expect(napAm(1965).name).toBe('Phú Đăng Hỏa');
  });
  it('màu hợp: bản mệnh + hành sinh ra mình; kỵ hành khắc mình', () => {
    const m = menhInfo(1990); // Thổ: hợp Vàng, Nâu + Hỏa (Đỏ…); kỵ Mộc (Xanh lá)
    expect(m.hopMau).toContain('Vàng'); expect(m.hopMau).toContain('Đỏ'); expect(m.kyMau).toEqual(['Xanh lá']);
    expect(m.lucHop).toBe('Mùi'); expect(m.tamHop.sort()).toEqual(['Dần', 'Tuất'].sort());
    expect(m.tuHanhXung).toContain('Tý');
  });
});

describe('xông đất', () => {
  it('chấm điểm có giải thích, xếp hạng', () => {
    const r = xongDatScore(1983, 1990, 2027);
    expect(r.notes.length).toBeGreaterThan(0);
    const top = goiYXongDat(1990, 2027);
    expect(top).toHaveLength(8);
    expect(top[0].score).toBeGreaterThanOrEqual(top[7].score);
    // tuổi xung với năm Mùi (Sửu) không lọt nhóm đầu
    expect(top.some((x) => x.canChi.endsWith('Sửu'))).toBe(false);
  });
});

describe('Tết, ăn chay', () => {
  it('Tết sắp tới và ngày 30', () => {
    expect(tetYear(new Date(2026, 10, 22))).toBe(2027);
    expect(jdToDate(lunarJd(1, 1, 2027))).toMatchObject({ day: 6, month: 2, year: 2027 });
    expect([29, 30]).toContain(ngay30(2027));
  });
  it('tháng thiếu dời ngày chay', () => {
    expect(chayDaysOfMonth('4', 1, 2027).length).toBe(4);
    const ds = chayDaysOfMonth('10', 1, 2027);
    expect(ds).toHaveLength(10);
    expect(isChay('2', { day: 15, month: 10, year: 2026, leap: false })).toBe(true);
    expect(isChay('off', { day: 15, month: 10, year: 2026 })).toBe(false);
    const nx = nextChayDays('2', jdFromDate(22, 11, 2026), 20);
    expect(jdToDate(nx[0].jd)).toMatchObject({ day: 23, month: 11 });
  });
});

import { phrases } from '../src/tts.js';
describe('đọc kiểu tụng', () => {
  it('tách vế, lặp "3 lần"', () => {
    expect(phrases('Nam mô A Di Đà Phật! (3 lần)')).toEqual(['Nam mô A Di Đà Phật', 'Nam mô A Di Đà Phật', 'Nam mô A Di Đà Phật']);
    expect(phrases('Con lạy chín phương Trời, mười phương chư Phật.\nCon kính lạy.')).toEqual(['Con lạy chín phương Trời,', 'mười phương chư Phật.', 'Con kính lạy.']);
    expect(phrases('Tín chủ con là ……, ngụ tại …….')).not.toContain('……');
  });
});
