import { describe, it, expect } from 'vitest';
import { pinned, DEFAULT_PINS, MAX_PINS, CATALOG } from '../src/ui/pins.js';

const st = (pins, culture = false) => ({ settings: { pins, culture } });
describe('tiện ích ghim', () => {
  it('chưa chọn → bộ mặc định', () => expect(pinned(st(undefined))).toEqual(DEFAULT_PINS));
  it('bỏ mục lạ, trùng, và mục Văn hóa khi đang tắt', () => {
    expect(pinned(st(['giapha', 'xxx', 'giapha', 'tuvi']))).toEqual(['giapha']);
    expect(pinned(st(['tuvi'], true))).toEqual(['tuvi']);
  });
  it('tối đa 8 ô', () => expect(pinned(st(Object.keys(CATALOG))).length).toBe(MAX_PINS));
  it('mảng rỗng là bỏ hết', () => expect(pinned(st([]))).toEqual([]));
});
