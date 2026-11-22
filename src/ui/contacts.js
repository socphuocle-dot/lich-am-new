// Nhập ngày sinh người thân từ danh bạ → tạo nhắc sinh nhật (dương lịch)
import { getState } from '../store.js';
import { esc, backHeader, toast, ICON } from './common.js';
import { contactsWithBirthdays, importBirthdays } from '../sync.js';
import { isNative } from '../notify.js';

let st = { loading: false, list: null, error: '', picked: new Set() };

export function resetContacts() { st = { loading: false, list: null, error: '', picked: new Set() }; }

export function renderContacts() {
  const have = new Set(getState().gios.filter((g) => g.contactId).map((g) => g.contactId));
  let body;
  if (!isNative()) {
    body = `<section class="card pad col" style="gap:8px"><b>Chỉ có trong app điện thoại</b><span class="small muted">Bản web không đọc được danh bạ. Hãy cài app Android hoặc iPhone để dùng tính năng này.</span></section>`;
  } else if (st.loading) {
    body = `<section class="card pad" aria-live="polite"><span class="muted">Đang đọc danh bạ…</span></section>`;
  } else if (st.error) {
    body = `<section class="card pad col" style="gap:10px" role="alert"><b>Không đọc được danh bạ</b><span class="small muted">${esc(st.error)}</span>
      <button type="button" class="btn ghost" data-act="load">Thử lại</button></section>`;
  } else if (!st.list) {
    body = `<section class="card pad col" style="gap:12px">
      <span>App sẽ tìm những người trong danh bạ <b>có ghi ngày sinh</b> để bạn chọn và đặt nhắc sinh nhật.</span>
      <span class="small muted">Chỉ đọc tên và ngày sinh. Không gửi đi đâu, không cần mạng.</span>
      <button type="button" class="btn" data-act="load">${ICON.users()} Đọc danh bạ</button></section>`;
  } else if (!st.list.length) {
    body = `<section class="card pad col" style="gap:8px"><b>Không có ai ghi ngày sinh</b><span class="small muted">Thêm ngày sinh trong ứng dụng Danh bạ (hoặc Google Contacts), rồi quay lại đây.</span></section>`;
  } else {
    const fresh = st.list.filter((c) => !have.has(c.contactId));
    const allOn = fresh.length && fresh.every((c) => st.picked.has(c.contactId));
    body = `<div class="h2row"><h2 class="h">Có ngày sinh (${st.list.length})</h2>
        ${fresh.length ? `<button type="button" class="chip" data-act="all" aria-pressed="${allOn}">${allOn ? 'Bỏ chọn' : 'Chọn tất cả'}</button>` : ''}</div>
      <section class="card list" aria-label="Danh bạ có ngày sinh">
      ${st.list.map((c) => {
        const added = have.has(c.contactId);
        const on = st.picked.has(c.contactId);
        return `<button type="button" class="item" data-pick="${esc(c.contactId)}" role="checkbox" aria-checked="${added || on}" ${added ? 'aria-disabled="true"' : ''}>
          <span class="tick ${added || on ? "on" : ""}" aria-hidden="true"></span>
          <span class="grow col"><span class="t">${esc(c.name)}</span><span class="s">${c.day}/${c.month}${c.year ? '/' + c.year : ''}${added ? ' · đã có' : ''}</span></span></button>`;
      }).join('')}
      </section>
      <button type="button" class="btn" data-act="import" ${st.picked.size ? '' : 'disabled'}>Thêm ${st.picked.size || ''} nhắc sinh nhật</button>`;
  }
  return `<div class="screen no-nav" data-screen="contacts">
  ${backHeader('Nhập từ danh bạ', '#/settings')}
  <main class="body">${body}</main>
</div>`;
}

export function mountContacts(root, rerender) {
  root.addEventListener('click', async (e) => {
    const act = e.target.closest('[data-act]')?.dataset.act;
    if (act === 'load') {
      st.loading = true; st.error = ''; rerender();
      try { st.list = await contactsWithBirthdays(); } catch (err) { st.error = String(err?.message || err); }
      st.loading = false; rerender(); return;
    }
    if (act === 'all') {
      const have = new Set(getState().gios.filter((g) => g.contactId).map((g) => g.contactId));
      const fresh = st.list.filter((c) => !have.has(c.contactId));
      const allOn = fresh.every((c) => st.picked.has(c.contactId));
      st.picked = allOn ? new Set() : new Set(fresh.map((c) => c.contactId));
      rerender(); return;
    }
    if (act === 'import') {
      const n = importBirthdays(st.list.filter((c) => st.picked.has(c.contactId)));
      st.picked = new Set();
      toast(`Đã thêm ${n} nhắc sinh nhật`);
      location.hash = '#/reminders';
      return;
    }
    const pk = e.target.closest('[data-pick]');
    if (pk && pk.getAttribute('aria-disabled') !== 'true') {
      const id = pk.dataset.pick;
      st.picked.has(id) ? st.picked.delete(id) : st.picked.add(id);
      rerender();
    }
  });
}
