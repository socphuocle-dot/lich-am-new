// Màn "In gia phả": vẽ sơ đồ cây thành ảnh lớn (giấy dó, viền vàng) để in khổ A4/A3 hoặc gửi Zalo.
import { getState, updateSettings } from '../store.js';
import { layoutTree, familyName, jpegToPdf, BOX } from '../lib/print.js';
import { shareFile, bytesToBase64 } from '../lib/files.js';
import { chiOfYear } from '../lib/xemtuoi.js';
import { giap } from './zodiac.js';
import { esc, ICON, backHeader, toast } from './common.js';

const pr = { title: null, paper: 'A4', url: '', key: '', busy: false };
const PAD = 70; const HEAD = 150; const FOOT = 60;

const lifeText = (p) => (p.born || p.died ? `${p.born || '?'}${p.died ? ' – ' + p.died : ''}` : '');
const defaultTitle = (ppl) => { const h = familyName(ppl); return h ? `Gia phả họ ${h}` : 'Gia phả gia đình'; };

export function renderGiaphaIn() {
  const st = getState();
  const ppl = st.people;
  if (pr.title === null) pr.title = st.settings.gpTitle || defaultTitle(ppl);
  return `<div class="screen" data-screen="giaphain">
  ${backHeader('In gia phả', '#/giapha', 'Ảnh lớn hoặc PDF để in, gửi cả họ')}
  <main class="body">
    ${ppl.length ? `<div class="field"><label class="lb" for="pr-title">Tiêu đề</label><input id="pr-title" class="input" maxlength="60" value="${esc(pr.title)}"></div>
    <div class="field"><span class="lb" id="pr-paper-l">Khổ giấy (cho file PDF)</span><div class="seg" role="group" aria-labelledby="pr-paper-l">${['A4', 'A3'].map((k) => `<button type="button" data-paper="${k}" aria-pressed="${pr.paper === k}">${k}${k === 'A3' ? ' · cây lớn' : ''}</button>`).join('')}</div></div>
    <section class="card pr-prev" aria-label="Xem trước bản in">${pr.url ? `<img src="${pr.url}" alt="Xem trước sơ đồ gia phả" data-test="pr-img">` : '<div class="empty">Đang vẽ sơ đồ…</div>'}</section>
    <span class="small muted center">Chạm ảnh rồi phóng to để xem rõ. Ảnh vẽ đủ nét để in khổ lớn; cây nhiều đời nên chọn A3 hoặc in ở tiệm.</span>
    <div class="grid2">
      <button type="button" class="btn ghost" data-act="pr-png">${ICON.share(18)} Gửi ảnh</button>
      <button type="button" class="btn" data-act="pr-pdf">${ICON.down(18)} File PDF</button>
    </div>` : `<section class="card empty"><b>Chưa có ai trong gia phả</b><a class="link" href="#/giapha">Thêm người vào gia phả</a></section>`}
  </main>
</div>`;
}

/* ---------- Vẽ ---------- */
const imgCache = new Map();
function loadImg(src) {
  if (imgCache.has(src)) return imgCache.get(src);
  const p = new Promise((res) => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = src; });
  imgCache.set(src, p);
  return p;
}
const giapSrc = (year) => { const m = /href="([^"]+)"/.exec(giap(chiOfYear(Number(year)), 48)); return m ? m[1] : ''; };

function roundRect(c, x, y, w, h, r) {
  c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
}
function fitText(c, text, max) {
  if (c.measureText(text).width <= max) return text;
  let t = text;
  while (t.length > 1 && c.measureText(t + '…').width > max) t = t.slice(0, -1);
  return t + '…';
}

/** Vẽ toàn bộ bản in lên canvas mới; trả canvas */
export async function drawTree(people, title) {
  const L = layoutTree(people);
  const W = Math.max(L.width + PAD * 2, 900); const H = L.height + PAD * 2 + HEAD + FOOT;
  const scale = Math.max(1, Math.min(2.5, Math.sqrt(36e6 / (W * H)))); // giới hạn ~36 triệu điểm ảnh
  const cv = document.createElement('canvas');
  cv.width = Math.round(W * scale); cv.height = Math.round(H * scale);
  const c = cv.getContext('2d');
  c.scale(scale, scale);
  try { await document.fonts?.ready; } catch { /* */ }
  const sans = "'Be Vietnam Pro', system-ui, sans-serif"; const serif = "'Noto Serif', Georgia, serif";
  // Nền giấy + viền đôi vàng
  const bg = c.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#FFF8EA'); bg.addColorStop(1, '#F8EBD0');
  c.fillStyle = bg; c.fillRect(0, 0, W, H);
  c.strokeStyle = '#B98A2E'; c.lineWidth = 4; c.strokeRect(18, 18, W - 36, H - 36);
  c.lineWidth = 1.5; c.strokeRect(28, 28, W - 56, H - 56);
  // Tiêu đề
  c.textAlign = 'center'; c.textBaseline = 'alphabetic';
  c.fillStyle = '#8E1A10'; c.font = `700 46px ${serif}`;
  c.fillText(title.toUpperCase(), W / 2, PAD + 46);
  c.fillStyle = '#7A5108'; c.font = `500 18px ${sans}`;
  const n = new Date();
  c.fillText(`${people.length} người · ${L.gens} đời · lập ngày ${n.getDate()}/${n.getMonth() + 1}/${n.getFullYear()}`, W / 2, PAD + 82);
  c.strokeStyle = '#D9B566'; c.lineWidth = 2; c.beginPath(); c.moveTo(W / 2 - 120, PAD + 104); c.lineTo(W / 2 + 120, PAD + 104); c.stroke();
  c.fillStyle = '#C08A2A'; c.beginPath(); c.arc(W / 2, PAD + 104, 5, 0, Math.PI * 2); c.fill();
  const ox = (W - L.width) / 2; const oy = PAD + HEAD;
  // Đường nối
  c.strokeStyle = '#C9A253'; c.lineWidth = 2.4; c.lineJoin = 'round';
  for (const k of L.links) {
    c.beginPath(); c.moveTo(ox + k.x1, oy + k.y1); c.lineTo(ox + k.x1, oy + k.midY); c.lineTo(ox + k.x2, oy + k.midY); c.lineTo(ox + k.x2, oy + k.y2); c.stroke();
  }
  // Ô người
  const avatars = await Promise.all(people.map((p) => (p.born ? loadImg(giapSrc(p.born)) : Promise.resolve(null))));
  const av = new Map(people.map((p, i) => [p.id, avatars[i]]));
  for (const nd of L.nodes) {
    nd.people.forEach((p, i) => {
      const x = ox + nd.x + i * (BOX.w + BOX.gap); const y = oy + nd.y;
      c.save(); c.shadowColor = 'rgba(90,50,10,.18)'; c.shadowBlur = 8; c.shadowOffsetY = 2;
      roundRect(c, x, y, BOX.w, BOX.h, 12); c.fillStyle = p.died ? '#EFE7DA' : '#FFFFFF'; c.fill(); c.restore();
      c.lineWidth = 1; c.strokeStyle = '#E2D3B8'; roundRect(c, x, y, BOX.w, BOX.h, 12); c.stroke();
      c.save(); roundRect(c, x, y, BOX.w, BOX.h, 12); c.clip(); c.fillStyle = p.gender === 'nu' ? '#E3577D' : '#5C8FD6'; c.fillRect(x, y, BOX.w, 5); c.restore();
      const a = av.get(p.id);
      c.fillStyle = '#F7E8C6'; c.beginPath(); c.arc(x + 30, y + 37, 21, 0, Math.PI * 2); c.fill();
      if (a) c.drawImage(a, x + 12, y + 19, 36, 36);
      else { c.fillStyle = '#7A5108'; c.font = `600 20px ${sans}`; c.textAlign = 'center'; c.fillText(p.gender === 'nu' ? '♀' : '♂', x + 30, y + 44); }
      c.textAlign = 'left'; c.fillStyle = '#2A1A12'; c.font = `700 15px ${sans}`;
      c.fillText(fitText(c, p.name + (p.died ? ' ✿' : ''), BOX.w - 64), x + 58, y + 34);
      c.fillStyle = '#7B6A5C'; c.font = `500 12.5px ${sans}`;
      c.fillText(fitText(c, lifeText(p) || ' ', BOX.w - 64), x + 58, y + 54);
      if (i > 0) { // dấu nối vợ chồng
        const hx = x - BOX.gap / 2; const hy = y + BOX.h / 2;
        c.fillStyle = '#FFF4E0'; c.beginPath(); c.arc(hx, hy, 9, 0, Math.PI * 2); c.fill(); c.strokeStyle = '#D9B566'; c.lineWidth = 1; c.stroke();
        c.fillStyle = '#C8392C'; c.font = `700 11px ${sans}`; c.textAlign = 'center'; c.fillText('♥', hx, hy + 4);
      }
    });
  }
  c.textAlign = 'center'; c.fillStyle = '#9A8A78'; c.font = `500 13px ${sans}`;
  c.fillText('Viền xanh: nam · viền hồng: nữ · nền xám ✿: đã mất   —   Lập bằng app Lịch Âm & Nhắc Giỗ', W / 2, H - PAD + 18);
  return cv;
}

async function refresh(rerender) {
  const st = getState();
  const key = JSON.stringify([st.people, pr.title]);
  if (pr.key === key && pr.url) return;
  pr.key = key;
  const cv = await drawTree(st.people, pr.title || defaultTitle(st.people));
  const prev = Math.min(1, 1400 / cv.width);
  const small = document.createElement('canvas'); small.width = Math.round(cv.width * prev); small.height = Math.round(cv.height * prev);
  small.getContext('2d').drawImage(cv, 0, 0, small.width, small.height);
  pr.url = small.toDataURL('image/jpeg', .85);
  rerender();
}

export function mountGiaphaIn(root, rerender) {
  if (!getState().people.length) return;
  setTimeout(() => refresh(rerender), 30);
  const title = root.querySelector('#pr-title');
  let tmr;
  title?.addEventListener('input', () => { pr.title = title.value; clearTimeout(tmr); tmr = setTimeout(() => { updateSettings({ gpTitle: pr.title.trim() }); }, 600); });
  title?.addEventListener('change', () => refresh(rerender));
  root.addEventListener('click', async (e) => {
    const p = e.target.closest('[data-paper]');
    if (p) { pr.paper = p.dataset.paper; rerender(); return; }
    const act = e.target.closest('[data-act]')?.dataset.act;
    if (!act || pr.busy) return;
    pr.busy = true;
    try {
      const st = getState();
      const t = (pr.title || defaultTitle(st.people)).trim();
      const cv = await drawTree(st.people, t);
      const slug = t.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[đĐ]/g, 'd').replace(/[^a-z0-9]+/gi, '-').toLowerCase();
      let r;
      if (act === 'pr-png') {
        r = await shareFile({ base64: cv.toDataURL('image/png').split(',')[1], name: `${slug}.png`, mime: 'image/png', title: t });
      } else {
        const jpgB64 = cv.toDataURL('image/jpeg', .92).split(',')[1];
        const bytes = Uint8Array.from(atob(jpgB64), (ch) => ch.charCodeAt(0));
        const pdf = jpegToPdf(bytes, cv.width, cv.height, pr.paper);
        r = await shareFile({ base64: bytesToBase64(pdf), name: `${slug}-${pr.paper}.pdf`, mime: 'application/pdf', title: t });
      }
      if (r === 'saved') toast('Đã lưu file vào máy');
    } catch { toast('Không tạo được file, thử lại'); } finally { pr.busy = false; }
  });
}
