// Vị trí mộ phần: đọc tọa độ từ link bản đồ / chữ người dùng dán, tạo link chỉ đường.

const ok = (lat, lng) => Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180 && !(lat === 0 && lng === 0);
const round = (x) => Math.round(x * 1e6) / 1e6;

/** Đọc { lat, lng } từ link Google/Apple Maps, "geo:", hoặc chữ "21.0285, 105.8542". Không đọc được → null */
export function parseLatLng(text) {
  const t = String(text || '').trim();
  if (!t) return null;
  const pats = [
    /!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/, // vị trí ghim chính xác trong link Google Maps
    /@(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/,
    /[?&](?:q|query|destination|daddr|ll|sll|center)=(-?\d+(?:\.\d+)?)(?:,|%2C)\s*(-?\d+(?:\.\d+)?)/i,
    /geo:(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/i,
    /(?:^|[^\d.-])(-?\d{1,2}\.\d{3,})\s*[,;\s]\s*(-?\d{1,3}\.\d{3,})(?![\d.])/
  ];
  for (const re of pats) {
    const m = re.exec(t);
    if (m) { const lat = Number(m[1]); const lng = Number(m[2]); if (ok(lat, lng)) return { lat: round(lat), lng: round(lng) }; }
  }
  return null;
}

/** Link rút gọn (maps.app.goo.gl, goo.gl/maps) — không đọc được khi không có mạng */
export const isShortMapLink = (t) => /(maps\.app\.goo\.gl|goo\.gl\/maps|g\.co\/kgs)/i.test(String(t || ''));

export const dirUrl = (lat, lng) => `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
export const viewUrl = (lat, lng) => `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
export const fmtLatLng = (lat, lng) => `${Number(lat).toFixed(5)}, ${Number(lng).toFixed(5)}`;

/** Lấy vị trí hiện tại (độ chính xác cao). Trả { lat, lng, acc } hoặc ném lỗi có .code: 'denied' | 'unavailable' | 'timeout' */
export function currentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) { reject(Object.assign(new Error('no geo'), { code: 'unavailable' })); return; }
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: round(p.coords.latitude), lng: round(p.coords.longitude), acc: Math.round(p.coords.accuracy || 0) }),
      (e) => reject(Object.assign(new Error(e.message), { code: e.code === 1 ? 'denied' : e.code === 3 ? 'timeout' : 'unavailable' })),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    );
  });
}
