// Hộp xác nhận dạng tấm trượt từ dưới lên — thay cho confirm() mặc định của trình duyệt.
import { esc } from './common.js';

export function confirmSheet({ title, message = '', ok = 'Đồng ý', cancel = 'Hủy', danger = false }) {
  return new Promise((resolve) => {
    const prev = document.activeElement;
    const scrim = document.createElement('div');
    scrim.className = 'scrim';
    scrim.innerHTML = `<div class="sheet-dialog" role="alertdialog" aria-modal="true" aria-labelledby="dlg-t" aria-describedby="dlg-m">
      <h2 id="dlg-t">${esc(title)}</h2>${message ? `<p id="dlg-m">${esc(message)}</p>` : ''}
      <button type="button" class="btn ${danger ? 'danger-solid' : ''}" data-ok>${esc(ok)}</button>
      <button type="button" class="btn text" data-cancel>${esc(cancel)}</button></div>`;
    const close = (v) => {
      document.removeEventListener('keydown', onKey);
      scrim.remove();
      prev?.focus?.();
      resolve(v);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') close(false);
      if (e.key === 'Tab') {
        const f = [...scrim.querySelectorAll('button')];
        const i = f.indexOf(document.activeElement);
        e.preventDefault();
        f[(i + (e.shiftKey ? f.length - 1 : 1)) % f.length].focus();
      }
    };
    scrim.addEventListener('click', (e) => {
      if (e.target === scrim || e.target.closest('[data-cancel]')) close(false);
      else if (e.target.closest('[data-ok]')) close(true);
    });
    document.addEventListener('keydown', onKey);
    document.body.appendChild(scrim);
    scrim.querySelector('[data-ok]').focus();
  });
}

/** Tấm chọn nhanh: items = [{ value, label, sub?, icon? }] → trả về value hoặc null */
export function actionSheet({ title, sub = '', items }) {
  return new Promise((resolve) => {
    const prev = document.activeElement;
    const scrim = document.createElement('div');
    scrim.className = 'scrim';
    scrim.innerHTML = `<div class="sheet-dialog" role="dialog" aria-modal="true" aria-labelledby="as-t">
      <div class="grab" aria-hidden="true"></div>
      <h2 id="as-t">${esc(title)}</h2>${sub ? `<p>${esc(sub)}</p>` : ''}
      <div class="card list as-list">${items.map((it, i) => `<button type="button" class="item" data-i="${i}">${it.icon || ''}<span class="grow col"><span class="t">${esc(it.label)}</span>${it.sub ? `<span class="s">${esc(it.sub)}</span>` : ''}</span></button>`).join('')}</div>
      <button type="button" class="btn text" data-cancel>Đóng</button></div>`;
    const close = (v) => { document.removeEventListener('keydown', onKey); scrim.remove(); prev?.focus?.(); resolve(v); };
    const onKey = (e) => {
      if (e.key === 'Escape') close(null);
      if (e.key === 'Tab') {
        const f = [...scrim.querySelectorAll('button')];
        const i = f.indexOf(document.activeElement);
        e.preventDefault();
        f[(i + (e.shiftKey ? f.length - 1 : 1)) % f.length].focus();
      }
    };
    scrim.addEventListener('click', (e) => {
      const b = e.target.closest('[data-i]');
      if (b) close(items[Number(b.dataset.i)].value);
      else if (e.target === scrim || e.target.closest('[data-cancel]')) close(null);
    });
    document.addEventListener('keydown', onKey);
    document.body.appendChild(scrim);
    scrim.querySelector('[data-i]')?.focus();
  });
}
