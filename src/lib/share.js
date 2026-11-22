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

/** Giải mã có kiểm tra chặt (dữ liệu đến từ người khác). Ném lỗi nếu không hợp lệ. */
export function decodeList(code) {
  const raw = extractCode(code);
  if (!raw || raw[0] !== '1') throw new Error('Mã không đúng định dạng');
  let rows;
  try { rows = JSON.parse(new TextDecoder().decode(unb64url(raw.slice(1)))); } catch { throw new Error('Mã bị hỏng hoặc thiếu ký tự'); }
  if (!Array.isArray(rows) || !rows.length || rows.length > 300) throw new Error('Mã không có dữ liệu');
  return rows.map((r) => {
    if (!Array.isArray(r)) throw new Error('Mã không hợp lệ');
    const [t, name, rel, cal, day, month, year, leap, side] = r;
    const g = {
      type: RT[t] || 'gio', name: String(name || '').trim().slice(0, 60), rel: String(rel || '').slice(0, 20),
      cal: cal ? 'duong' : 'am', day: Number(day), month: Number(month), year: Number(year) || '', leap: !!leap, side: RSIDE[side] || ''
    };
    if (!g.name || !(g.day >= 1 && g.day <= (g.cal === 'am' ? 30 : 31)) || !(g.month >= 1 && g.month <= 12)) throw new Error('Mã có ngày không hợp lệ');
    if (g.year && (g.year < 1800 || g.year > 2200)) g.year = '';
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
