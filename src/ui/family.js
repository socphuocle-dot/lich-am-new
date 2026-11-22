import { go, done as navDone } from '../nav.js';
// Chia sẻ danh sách giỗ cho cả họ (link + mã QR) và nhập danh sách từ người thân.
import qrcode from 'qrcode-generator';
import { getState, setState, saveGio, uid } from '../store.js';
import { titleOf } from '../lib/events.js';
import { LUNAR_MONTH_NAME } from '../lib/lunar.js';
import { encodeFamily, decodeShare, sameEvent } from '../lib/share.js';
import { WEB_URL } from '../config.js';
import { esc, ICON, backHeader, toast } from './common.js';
import { isNative } from '../notify.js';
import { mascot, cloud, ILL } from './art.js';

const sh = { picked: null, people: true, memo: true };
const qrCache = { k: '', v: '' };
function makeQr(link) {
  if (qrCache.k === link) return qrCache.v;
  let v = '';
  try { const qr = qrcode(0, 'L'); qr.addData(link); qr.make(); v = qr.createSvgTag({ cellSize: 4, margin: 2, scalable: true }); } catch { v = ''; }
  qrCache.k = link; qrCache.v = v;
  return v;
}
const dateText = (g) => (g.cal === 'am' ? `${g.day} tháng ${LUNAR_MONTH_NAME[g.month]} âm lịch` : `${g.day}/${g.month} dương lịch`);

const extras = (st) => ({ people: sh.people ? st.people : [], memo: sh.memo });
export const shareLink = (gios, ex = {}) => `${WEB_URL}#/nhap?d=${encodeFamily(gios, ex)}`;

export function renderShare() {
  const st = getState();
  if (!sh.picked) sh.picked = new Set(st.gios.filter((g) => (g.type || 'gio') === 'gio').map((g) => g.id));
  const pick = st.gios.filter((g) => sh.picked.has(g.id));
  // Mã QR tính sau khi màn đã hiện (mount), và nhớ theo link để bật/tắt không tính lại
  const link = pick.length || (sh.people && st.people.length) ? shareLink(pick, extras(st)) : '';
  const qrSvg = link && qrCache.k === link ? qrCache.v : link ? '<span class="small muted" data-qr-pending>Đang tạo mã QR…</span>' : '';
  return `<div class="screen no-nav" data-screen="share">
  ${backHeader('Chia sẻ cho cả họ', '#/reminders', 'Gửi danh sách để người thân không phải nhập lại')}
  <main class="body" style="gap:14px">
    <section class="banner red"><span class="bn-cloud a">${cloud(80, '#F6D27A', .45)}</span><div class="col grow" style="gap:4px"><b>Gửi cả họ cùng nhớ</b><span>Chọn ngày giỗ, gửi link qua Zalo hoặc cho quét mã QR.</span></div><div class="bn-mascot">${mascot('letter', 92)}</div></section>
    ${st.gios.length ? `<div class="h2row"><h2 class="h" style="margin:0">Chọn ngày muốn gửi (${pick.length})</h2>
      <button type="button" class="chip" data-act="all">${pick.length === st.gios.length ? 'Bỏ chọn' : 'Chọn tất cả'}</button></div>
    <section class="card list" aria-label="Danh sách ngày">${st.gios.map((g) => `<button type="button" class="item" data-pick="${esc(g.id)}" role="checkbox" aria-checked="${sh.picked.has(g.id)}">
      <span class="tick ${sh.picked.has(g.id) ? 'on' : ''}" aria-hidden="true"></span><span class="grow col"><span class="t">${esc(titleOf(g))}</span><span class="s">${dateText(g)}</span></span></button>`).join('')}</section>
    ${st.people.length || st.gios.some((g) => g.memo) ? `<section class="card list" aria-label="Gửi kèm">
      ${st.people.length ? `<div class="item"><span class="col grow"><span class="t">Kèm gia phả (${st.people.length} người)</span><span class="s">Người thân nhận được cả cây gia đình</span></span><button type="button" class="switch" role="switch" aria-checked="${sh.people}" aria-label="Kèm gia phả" data-act="t-people"></button></div>` : ''}
      ${st.gios.some((g) => g.memo) ? `<div class="item"><span class="col grow"><span class="t">Kèm trang tưởng nhớ</span><span class="s">Năm sinh – mất, quê quán, nơi an táng, tiểu sử (không kèm ảnh)</span></span><button type="button" class="switch" role="switch" aria-checked="${sh.memo}" aria-label="Kèm trang tưởng nhớ" data-act="t-memo"></button></div>` : ''}
      <div class="item"><span class="small muted">Người nhận cần app bản 1.9.1 trở lên để nhận phần gửi kèm.</span></div></section>` : ''}
    ${pick.length || (sh.people && st.people.length) ? `<section class="card pad col" style="gap:12px;align-items:center" aria-label="Mã QR">
      <div class="qr-box" role="img" aria-label="Mã QR chứa ${pick.length} ngày${sh.people && st.people.length ? ' và gia phả' : ''}">${qrSvg || '<span class="small muted">Danh sách quá dài để tạo mã QR — hãy gửi bằng link.</span>'}</div>
      <span class="small muted center" style="line-height:1.5">Người thân mở camera điện thoại quét mã, hoặc bấm link bạn gửi qua Zalo.<br>Trong app: <b>Nhắc việc → Nhập từ người thân</b>.</span></section>
    <div class="row" style="gap:10px"><button type="button" class="btn ghost" data-act="copy" style="flex:1">${ICON.copy(18)} Sao chép link</button><button type="button" class="btn" data-act="send" style="flex:1.4">${ICON.share(18)} Gửi qua Zalo…</button></div>` : ''}`
    : '<div class="empty">Chưa có ngày nào để chia sẻ</div>'}
  </main>
</div>`;
}

function shareText(pick, st) {
  const ppl = sh.people ? st.people.length : 0;
  return `Danh sách ngày giỗ của gia đình (${pick.length} ngày)${ppl ? ` và gia phả ${ppl} người` : ''}:\n${pick.map((g) => `• ${titleOf(g)}: ${dateText(g)}`).join('\n')}\n\nBấm link để thêm vào app Lịch Âm & Nhắc Giỗ, tự nhắc hằng năm:\n${shareLink(pick, extras(st))}`;
}

export function mountShare(root, rerender) {
  const pend = root.querySelector('[data-qr-pending]');
  if (pend) {
    const st = getState();
    const pick = st.gios.filter((g) => sh.picked.has(g.id));
    const link = shareLink(pick, extras(st));
    setTimeout(() => {
      const v = makeQr(link);
      const box = pend.closest('.qr-box');
      if (box && box.isConnected) box.innerHTML = v || '<span class="small muted">Danh sách quá dài để tạo mã QR — hãy gửi bằng link.</span>';
    }, 30);
  }
  root.addEventListener('click', async (e) => {
    const st = getState();
    const p = e.target.closest('[data-pick]');
    if (p) { const id = p.dataset.pick; sh.picked.has(id) ? sh.picked.delete(id) : sh.picked.add(id); rerender(); return; }
    const act = e.target.closest('[data-act]')?.dataset.act;
    if (act === 't-people') { sh.people = !sh.people; rerender(); return; }
    if (act === 't-memo') { sh.memo = !sh.memo; rerender(); return; }
    if (act === 'all') { sh.picked = sh.picked.size === st.gios.length ? new Set() : new Set(st.gios.map((g) => g.id)); rerender(); return; }
    const pick = st.gios.filter((g) => sh.picked.has(g.id));
    if (!pick.length && !(sh.people && st.people.length)) return;
    if (act === 'send') {
      const text = shareText(pick, st);
      try {
        if (isNative()) { const { Share } = await import('@capacitor/share'); await Share.share({ title: 'Danh sách ngày giỗ', text, dialogTitle: 'Gửi cho người thân qua…' }); return; }
        if (navigator.share) { await navigator.share({ title: 'Danh sách ngày giỗ', text }); return; }
      } catch { return; }
      try { await navigator.clipboard.writeText(text); toast('Đã sao chép, dán vào Zalo để gửi'); } catch { /* */ }
    }
    if (act === 'copy') {
      try { await navigator.clipboard.writeText(shareLink(pick, extras(st))); toast('Đã sao chép link'); } catch { toast('Không sao chép được'); }
    }
  });
}

export function resetShare() { sh.picked = null; }

/* ---------- Nhập từ người thân ---------- */
const im = { code: '', items: null, people: [], error: '', picked: null, hash: '', withPeople: true };

export function renderImport(params) {
  if (im.hash !== location.hash) { im.hash = location.hash; im.code = params.d || ''; im.items = null; im.error = ''; }
  if (im.code && !im.items && !im.error) {
    try { const r = decodeShare(im.code); im.items = r.gios; im.people = r.people; im.picked = new Set(im.items.map((_, i) => i)); } catch (e) { im.error = e.message; }
  }
  const st = getState();
  const dup = (g) => st.gios.some((x) => sameEvent(x, g));
  const fresh = im.items ? im.items.filter((g) => !dup(g)) : [];
  const n = im.items ? im.items.filter((g, i) => im.picked.has(i) && !dup(g)).length : 0;
  return `<div class="screen no-nav" data-screen="import">
  ${backHeader('Nhập từ người thân', st.onboarded ? '#/reminders' : '#/today', 'Danh sách giỗ người trong họ gửi cho bạn')}
  <main class="body" style="gap:14px">
    ${!im.items ? `<section class="banner red"><span class="bn-cloud a">${cloud(80, '#F6D27A', .45)}</span><div class="col grow" style="gap:4px"><b>Nhận danh sách giỗ</b><span>Người trong họ gửi link — bấm một chạm là có đủ ngày, khỏi gõ lại.</span></div><div class="bn-mascot">${mascot('letter', 92)}</div></section>
    <section class="card pad col" style="gap:10px">
      <label class="lb" for="im-code">Dán link hoặc mã nhận được</label>
      <textarea id="im-code" class="input" rows="3" placeholder="https://…#/nhap?d=1…" spellcheck="false" autocomplete="off">${esc(im.code)}</textarea>
      ${im.error ? `<p class="err" role="alert">${esc(im.error)}</p>` : ''}
      <button type="button" class="btn" data-act="read">Xem danh sách</button>
      <span class="small muted">Nhờ người thân vào <b>Nhắc việc → Chia sẻ cho cả họ</b> rồi gửi link cho bạn.</span></section>`
    : `<h2 class="h" style="margin:0">${im.items.length} ngày trong danh sách${im.people.length ? ` · gia phả ${im.people.length} người` : ''}</h2>
      <section class="card list" aria-label="Danh sách nhận được">${im.items.map((g, i) => {
        const d = dup(g);
        const on = !d && im.picked.has(i);
        return `<button type="button" class="item" data-ipick="${i}" role="checkbox" aria-checked="${on || d}" ${d ? 'aria-disabled="true"' : ''}>
          <span class="tick ${on || d ? 'on' : ''}" aria-hidden="true"></span><span class="grow col"><span class="t">${esc(titleOf(g))}</span><span class="s">${dateText(g)}${d ? ' · đã có' : ''}</span></span></button>`;
      }).join('')}</section>
      ${im.people.length ? `<section class="card list"><div class="item"><span class="pastel sm peach">${ILL.tree()}</span><span class="col grow"><span class="t">Gia phả ${im.people.length} người</span><span class="s">${esc(im.people.slice(0, 4).map((p) => p.name).join(', '))}${im.people.length > 4 ? '…' : ''}${st.people.length ? ' · người đã có sẽ không thêm trùng' : ''}</span></span>
        <button type="button" class="switch" role="switch" aria-checked="${im.withPeople}" aria-label="Nhập gia phả" data-act="t-ppl"></button></div></section>` : ''}
      ${im.items.some((g) => g.memo) ? '<span class="small muted">Có kèm trang tưởng nhớ (tiểu sử, quê quán, nơi an táng).</span>' : ''}
      ${fresh.length || im.people.length ? '' : '<span class="small muted">Bạn đã có đủ các ngày này.</span>'}
      <div class="row" style="gap:10px"><button type="button" class="btn ghost" data-act="other" style="flex:1">Mã khác</button>
        <button type="button" class="btn" data-act="import" style="flex:1.6" ${n || (im.withPeople && im.people.length) ? '' : 'disabled'}>Thêm ${n} ngày${im.withPeople && im.people.length ? ' + gia phả' : ''}</button></div>`}
  </main>
</div>`;
}

export function mountImport(root, rerender) {
  root.addEventListener('click', (e) => {
    const act = e.target.closest('[data-act]')?.dataset.act;
    if (act === 'read') { im.code = root.querySelector('#im-code').value; im.items = null; im.error = ''; if (!im.code.trim()) im.error = 'Bạn chưa dán link hoặc mã'; rerender(); return; }
    if (act === 'other') { im.code = ''; im.items = null; im.error = ''; if (location.hash.includes('?')) go('#/nhap', { replace: true }); else rerender(); return; }
    if (act === 't-ppl') { im.withPeople = !im.withPeople; rerender(); return; }
    if (act === 'import') {
      const st = getState();
      const time = st.settings.gioTime || '07:00';
      let n = 0;
      const gioIds = im.items.map((g, i) => {
        const old = st.gios.find((x) => sameEvent(x, g));
        if (old) {
          // Đã có ngày này: bổ sung trang tưởng nhớ nếu máy mình chưa có
          if (g.memo && !old.memo) saveGio({ ...old, memo: g.memo });
          return old.id;
        }
        if (!im.picked.has(i)) return '';
        const id = uid();
        saveGio({ id, ...g, remind: g.type === 'gio' ? [0, 3] : [0, 1], time, repeat: 'yearly', note: '', enabled: true, source: 'family' });
        n++;
        return id;
      });
      let added = 0;
      if (im.withPeople && im.people.length) {
        const cur = getState().people;
        const key = (p) => p.name.trim().toLowerCase() + '|' + (p.born || '');
        const ids = im.people.map((p) => cur.find((x) => key(x) === key(p))?.id || '');
        im.people.forEach((p, i) => { if (!ids[i]) ids[i] = uid(); });
        const fresh = im.people.map((p, i) => ({ p, i })).filter(({ i }) => !cur.some((x) => x.id === ids[i]))
          .map(({ p, i }) => ({ id: ids[i], name: p.name, gender: p.gender, born: p.born, died: p.died, parentId: p.parent >= 0 ? ids[p.parent] : '', spouseOf: p.spouse >= 0 ? ids[p.spouse] : '', gioId: p.gio >= 0 ? gioIds[p.gio] || '' : '', note: '' }));
        added = fresh.length;
        if (added) setState((s2) => ({ ...s2, people: [...s2.people, ...fresh] }));
      }
      if (!getState().onboarded) setState((s) => ({ ...s, onboarded: true }));
      im.code = ''; im.items = null; im.people = [];
      toast(`Đã thêm ${n} ngày${added ? ` và ${added} người vào gia phả` : ''}. App sẽ tự nhắc hằng năm.`);
      navDone('#/reminders');
      return;
    }
    const p = e.target.closest('[data-ipick]');
    if (p && p.getAttribute('aria-disabled') !== 'true') { const i = Number(p.dataset.ipick); im.picked.has(i) ? im.picked.delete(i) : im.picked.add(i); rerender(); }
  });
}

export function resetImport() { im.hash = ''; im.code = ''; im.items = null; im.error = ''; }
