// Chia sẻ danh sách giỗ / sinh nhật giữa người trong họ — không cần máy chủ.
// Dữ liệu được nén vào một mã ngắn (base64url) gắn sau link trang web của app.
const T = { gio: 'g', sinhnhat: 's', kyniem: 'k' };
const RT = { g: 'gio', s: 'sinhnhat', k: 'kyniem' };
const SIDE = { noi: 'n', ngoai: 'o' };
const RSIDE = { n: 'noi', o: 'ngoai' };

const b64url = (bytes) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64url = (s) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4)), (c) => c.charCodeAt(0));

export function encodeList(gios) {
  const rows = gios.map((g) => [T[g.type || 'gio'] || 'g', String(g.name).slice(0, 60), g.rel || '', g.cal === 'duong' ? 1 : 0, g.day, g.month, g.year ? Number(g.year) : 0, g.leap ? 1 : 0, SIDE[g.side] || '']);
  return '1' + b64url(new TextEncoder().encode(JSON.stringify(rows)));
}

const clip = (v, n) => String(v ?? '').trim().slice(0, n);

/**
 * Mã bản 2: ngày giỗ (kèm trang tưởng nhớ, không kèm ảnh) + gia phả.
 * Chỉ dùng khi có gửi kèm phần mới — danh sách ngày giỗ đơn thuần vẫn dùng mã bản 1 để app cũ đọc được.
 */
export function encodeFamily(gios, { people = [], memo = false } = {}) {
  if (!people.length && !(memo && gios.some((g) => g.memo))) return encodeList(gios);
  const gi = new Map(gios.map((g, i) => [g.id, i]));
  const rows = gios.map((g) => {
    const r = [T[g.type || 'gio'] || 'g', String(g.name).slice(0, 60), g.rel || '', g.cal === 'duong' ? 1 : 0, g.day, g.month, g.year ? Number(g.year) : 0, g.leap ? 1 : 0, SIDE[g.side] || ''];
    const m = g.memo;
    if (memo && m) r.push([Number(m.born) || 0, Number(m.died) || 0, clip(m.home, 80), clip(m.grave, 120), clip(m.bio, 1500), clip(m.words, 600)]);
    return r;
  });
  const pi = new Map(people.map((p, i) => [p.id, i]));
  const prows = people.map((p) => [clip(p.name, 60), p.gender === 'nu' ? 1 : 0, Number(p.born) || 0, Number(p.died) || 0,
    pi.has(p.parentId) ? pi.get(p.parentId) : -1, pi.has(p.spouseOf) ? pi.get(p.spouseOf) : -1, gi.has(p.gioId) ? gi.get(p.gioId) : -1]);
  return '2' + b64url(new TextEncoder().encode(JSON.stringify({ g: rows, p: prows })));
}

const yr = (v) => { const n = Number(v); return n >= 1700 && n <= 2200 ? n : ''; };

/** Giải mã có kiểm tra chặt (dữ liệu đến từ người khác). Trả { gios, people } */
export function decodeShare(code) {
  const raw = extractCode(code);
  if (!raw || (raw[0] !== '1' && raw[0] !== '2')) throw new Error('Mã không đúng định dạng');
  let obj;
  try { obj = JSON.parse(new TextDecoder().decode(unb64url(raw.slice(1)))); } catch { throw new Error('Mã bị hỏng hoặc thiếu ký tự'); }
  const rows = raw[0] === '1' ? obj : obj?.g;
  if (!Array.isArray(rows) || rows.length > 300) throw new Error('Mã không có dữ liệu');
  const gios = decodeRows(rows);
  const prows = raw[0] === '2' && Array.isArray(obj.p) ? obj.p.slice(0, 500) : [];
  const n = prows.length;
  const idx = (v, max) => (Number.isInteger(v) && v >= 0 && v < max ? v : -1);
  const people = prows.map((r) => {
    if (!Array.isArray(r)) throw new Error('Mã không hợp lệ');
    const name = clip(r[0], 60);
    if (!name) throw new Error('Gia phả có người thiếu tên');
    return { name, gender: r[1] ? 'nu' : 'nam', born: yr(r[2]), died: yr(r[3]), parent: idx(r[4], n), spouse: idx(r[5], n), gio: idx(r[6], gios.length) };
  });
  if (!gios.length && !people.length) throw new Error('Mã không có dữ liệu');
  return { gios, people };
}

/** Bản 1 (chỉ ngày giỗ) — giữ để tương thích */
export function decodeList(code) {
  const raw = extractCode(code);
  if (!raw || raw[0] !== '1') throw new Error('Mã không đúng định dạng');
  let rows;
  try { rows = JSON.parse(new TextDecoder().decode(unb64url(raw.slice(1)))); } catch { throw new Error('Mã bị hỏng hoặc thiếu ký tự'); }
  if (!Array.isArray(rows) || !rows.length || rows.length > 300) throw new Error('Mã không có dữ liệu');
  return decodeRows(rows);
}

function decodeRows(rows) {
  return rows.map((r) => {
    if (!Array.isArray(r)) throw new Error('Mã không hợp lệ');
    const [t, name, rel, cal, day, month, year, leap, side] = r;
    const g = {
      type: RT[t] || 'gio', name: String(name || '').trim().slice(0, 60), rel: String(rel || '').slice(0, 20),
      cal: cal ? 'duong' : 'am', day: Number(day), month: Number(month), year: Number(year) || '', leap: !!leap, side: RSIDE[side] || ''
    };
    if (!g.name || !(g.day >= 1 && g.day <= (g.cal === 'am' ? 30 : 31)) || !(g.month >= 1 && g.month <= 12)) throw new Error('Mã có ngày không hợp lệ');
    if (g.year && (g.year < 1800 || g.year > 2200)) g.year = '';
    const m = r[9];
    if (Array.isArray(m)) g.memo = { photo: '', born: yr(m[0]), died: yr(m[1]), home: clip(m[2], 80), grave: clip(m[3], 120), bio: clip(m[4], 1500), words: clip(m[5], 600) };
    return g;
  });
}

/** Nhận link đầy đủ, đoạn "#/nhap?d=…" hoặc chỉ mã */
export function extractCode(s) {
  const t = String(s || '').trim();
  const m = t.match(/[?&]d=([A-Za-z0-9_-]+)/);
  return m ? m[1] : (t.match(/^[A-Za-z0-9_-]+$/) ? t : '');
}

export const sameEvent = (a, b) => (a.type || 'gio') === (b.type || 'gio') && a.cal === b.cal && a.day === b.day && a.month === b.month
  && a.name.trim().toLowerCase() === b.name.trim().toLowerCase();
