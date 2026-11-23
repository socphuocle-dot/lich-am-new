// In gia phả: tính bố cục cây (thuần, kiểm thử được) và đóng gói ảnh JPEG thành file PDF một trang.

export const BOX = { w: 204, h: 70, gap: 14, sib: 26, level: 64 };

/**
 * Bố cục cây từ trên xuống. Mỗi nút là một cặp (người chính + vợ/chồng).
 * Trả { nodes: [{ x, y, w, people: [p...], gen }], links: [{ x1, y1, x2, y2 }...] (đường gấp khúc cha → con), width, height, gens }
 */
export function layoutTree(people) {
  const spouses = (id) => people.filter((p) => p.spouseOf === id);
  const kids = (id) => people.filter((p) => p.parentId === id && !p.spouseOf).sort((a, b) => (Number(a.born) || 9999) - (Number(b.born) || 9999));
  const childrenOf = (p) => kids(p.id).concat(spouses(p.id).flatMap((s) => kids(s.id)));
  const roots = people.filter((p) => !p.parentId && !p.spouseOf);
  const seen = new Set();
  const build = (p, gen) => {
    seen.add(p.id);
    const ppl = [p, ...spouses(p.id)];
    const w = ppl.length * BOX.w + (ppl.length - 1) * BOX.gap;
    const ch = childrenOf(p).filter((c) => !seen.has(c.id)).map((c) => build(c, gen + 1));
    const chW = ch.reduce((a, c) => a + c.sw, 0) + Math.max(0, ch.length - 1) * BOX.sib;
    return { people: ppl, w, gen, ch, sw: Math.max(w, chW) };
  };
  const trees = roots.map((r) => build(r, 1));
  const nodes = []; const links = [];
  let gens = 0;
  const place = (t, left) => {
    const cx = left + t.sw / 2;
    const y = (t.gen - 1) * (BOX.h + BOX.level);
    gens = Math.max(gens, t.gen);
    const node = { x: cx - t.w / 2, y, w: t.w, people: t.people, gen: t.gen };
    nodes.push(node);
    if (t.ch.length) {
      const chW = t.ch.reduce((a, c) => a + c.sw, 0) + (t.ch.length - 1) * BOX.sib;
      let l = cx - chW / 2;
      const midY = y + BOX.h + BOX.level / 2;
      for (const c of t.ch) {
        const ccx = l + c.sw / 2;
        links.push({ x1: cx, y1: y + BOX.h, x2: ccx, y2: y + BOX.h + BOX.level, midY });
        place(c, l);
        l += c.sw + BOX.sib;
      }
    }
  };
  let left = 0;
  for (const t of trees) { place(t, left); left += t.sw + BOX.sib * 2; }
  const width = Math.max(0, left - BOX.sib * 2);
  return { nodes, links, width, height: gens ? gens * BOX.h + (gens - 1) * BOX.level : 0, gens };
}

/** Họ của dòng họ: chữ đầu tên người đời đầu (nam) — "Lê Văn Tổ" → "Lê" */
export function familyName(people) {
  const r = people.find((p) => !p.parentId && !p.spouseOf && p.gender !== 'nu') || people.find((p) => !p.parentId && !p.spouseOf);
  return r ? String(r.name).trim().split(/\s+/)[0] : '';
}

export const PAPER = { A4: [595.28, 841.89], A3: [841.89, 1190.55] };

/**
 * Gói ảnh JPEG (Uint8Array) thành PDF một trang khổ A4/A3, tự xoay ngang/dọc theo tỉ lệ ảnh, chừa lề 24pt.
 * Trả Uint8Array của file PDF.
 */
export function jpegToPdf(jpeg, imgW, imgH, paper = 'A4') {
  let [pw, ph] = PAPER[paper] || PAPER.A4;
  if (imgW > imgH) [pw, ph] = [ph, pw];
  const m = 24;
  const k = Math.min((pw - 2 * m) / imgW, (ph - 2 * m) / imgH);
  const dw = imgW * k; const dh = imgH * k;
  const x = (pw - dw) / 2; const y = (ph - dh) / 2;
  const f = (n) => Number(n.toFixed(2));
  const enc = new TextEncoder();
  const parts = []; const offsets = []; let len = 0;
  const add = (x2) => { const b = typeof x2 === 'string' ? enc.encode(x2) : x2; parts.push(b); len += b.length; };
  const obj = (n, body) => { offsets[n] = len; add(`${n} 0 obj\n${body}\nendobj\n`); };
  add('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
  obj(1, '<< /Type /Catalog /Pages 2 0 R >>');
  obj(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
  obj(3, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${f(pw)} ${f(ph)}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`);
  offsets[4] = len;
  add(`4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${imgW} /Height ${imgH} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`);
  add(jpeg);
  add('\nendstream\nendobj\n');
  const content = `q ${f(dw)} 0 0 ${f(dh)} ${f(x)} ${f(y)} cm /Im0 Do Q`;
  obj(5, `<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
  const xref = len;
  let t = 'xref\n0 6\n0000000000 65535 f \n';
  for (let n = 1; n <= 5; n++) t += String(offsets[n]).padStart(10, '0') + ' 00000 n \n';
  t += `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  add(t);
  const out = new Uint8Array(len); let o = 0;
  for (const p of parts) { out.set(p, o); o += p.length; }
  return out;
}
