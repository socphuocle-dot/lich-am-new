import { describe, it, expect } from 'vitest';
import { giap, giapName, GIAP } from '../src/ui/zodiac.js';
import { mascot, moonPhase, ILL } from '../src/ui/art.js';

describe('Minh họa', () => {
  it('12 con giáp kiểu Việt: Mão là Mèo, Sửu là Trâu', () => {
    expect(GIAP.length).toBe(12);
    expect(giapName('Mão')).toBe('Mèo');
    expect(giapName('Bính Ngọ')).toBe('Ngựa');
    expect(giap('Kỷ Hợi')).toContain('Hợi — Lợn');
    for (let i = 0; i < 12; i++) expect(giap(i)).toMatch(/^<svg[\s\S]*<\/svg>$/);
  });
  it('linh vật đủ dáng, mã SVG không trùng id gradient', () => {
    const a = mascot('wave'), b = mascot('wave');
    const ids = (s) => [...s.matchAll(/id="([^"]+)"/g)].map((m) => m[1]);
    expect(ids(a).some((x) => ids(b).includes(x))).toBe(false);
    for (const p of ['wave', 'lantern', 'pray', 'star', 'cake', 'letter', 'phone', 'book', 'moon']) expect(mascot(p)).toContain('<svg');
  });
  it('trăng: mùng 1 không có phần sáng, rằm tròn đủ', () => {
    expect(moonPhase(1)).toContain('d="M0 0"');
    const rx = Number(moonPhase(15).match(/A28 28 0 0 1 32 60 A([\d.]+) 28/)[1]);
    expect(rx).toBeGreaterThan(26); // gần tròn đủ
    expect(moonPhase(8)).toMatch(/A[0-9.]+ 28 0 0 0 32 4z/); // thượng huyền: nửa phải sáng
    expect(Object.keys(ILL).length).toBeGreaterThanOrEqual(23);
  });
});
