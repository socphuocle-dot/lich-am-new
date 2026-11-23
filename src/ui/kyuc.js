// Ký ức gia đình: ghi âm lời kể, lời dặn của ông bà gắn vào từng người trong gia phả.
// Âm thanh lưu trong bộ nhớ riêng của app (như giọng đọc văn khấn); thông tin bản ghi lưu trong người đó: person.recs.
import { getState, setState, uid } from '../store.js';
import { saveVoice, voiceUrl, voiceBase64, deleteVoice, startRecording, stopRecording, cancelRecording, canRecord } from '../voice.js';
import { shareFile } from '../lib/files.js';
import { esc, ICON, toast } from './common.js';
import { confirmSheet } from './dialog.js';

export const STORY_TOPICS = ['Chuyện ngày xưa', 'Lời dặn con cháu', 'Chuyện quê hương', 'Bài hát ru', 'Món ăn gia truyền'];
const MAX_SEC = 30 * 60;
const ky = { rec: 'idle', person: '', title: STORY_TOPICS[0], draft: null, playing: '', audio: null, timer: 0 };
const fileId = (pid, rid) => `kyuc-${pid}-${rid}`;
const dur = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
const MIC = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>';
const PLAY = '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>';
const PAUSE = '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h4v14H7zM13 5h4v14h-4z" fill="currentColor"/></svg>';

const recsOf = (pid) => getState().people.find((p) => p.id === pid)?.recs || [];

function list(pid, editable) {
  const recs = recsOf(pid);
  if (!recs.length) return '';
  return `<div class="card list ky-list">${recs.map((r) => `<div class="item">
    <button type="button" class="ky-play${ky.playing === r.id ? ' on' : ''}" data-kyplay="${r.id}" aria-label="${ky.playing === r.id ? 'Dừng' : 'Nghe'} ${esc(r.title)}">${ky.playing === r.id ? PAUSE : PLAY}</button>
    <span class="col grow"><span class="t">${esc(r.title)}</span><span class="s">${dur(r.sec || 0)} · ghi ngày ${new Date(r.at).toLocaleDateString('vi-VN')}${r.by ? ' · ' + esc(r.by) : ''}</span></span>
    <button type="button" class="icon-btn plain" data-kyshare="${r.id}" aria-label="Gửi bản ghi ${esc(r.title)}">${ICON.share(18)}</button>
    ${editable ? `<button type="button" class="icon-btn plain" data-kydel="${r.id}" aria-label="Xóa bản ghi ${esc(r.title)}">${ICON.trash(18)}</button>` : ''}</div>`).join('')}</div>`;
}

/** Phần "Lời kể, lời dặn" — editable: trong màn sửa người (ghi được); không thì chỉ nghe */
export function storiesSection(person, editable = true) {
  if (!person) return '';
  const pid = person.id;
  const recs = person.recs || [];
  if (!editable && !recs.length) return '';
  const mine = ky.person === pid;
  let ctl = '';
  if (editable) {
    if (mine && ky.rec === 'rec') {
      ctl = `<div class="rec-live" role="status"><span class="rec-dot" aria-hidden="true"></span><b>Đang ghi: ${esc(ky.title)}</b><span class="rec-time" id="ky-time">0:00</span>
        <button type="button" class="btn" style="width:auto;height:44px;padding:0 18px" data-kyact="stop">■ Dừng</button></div>`;
    } else if (mine && ky.rec === 'review' && ky.draft) {
      ctl = `<div class="col" style="gap:8px"><audio controls src="${ky.draft.url}" style="width:100%"></audio>
        <div class="row" style="gap:8px"><button type="button" class="btn" style="flex:1.4;height:46px" data-kyact="save">Lưu bản ghi</button><button type="button" class="btn ghost" style="flex:1;height:46px" data-kyact="again">Ghi lại</button></div>
        <button type="button" class="btn text" style="height:40px" data-kyact="cancel">Bỏ bản ghi này</button></div>`;
    } else if (!canRecord()) {
      ctl = '<span class="small muted">Máy này chưa cho ghi âm trong app.</span>';
    } else {
      ctl = `<div class="field"><label class="lb small" for="ky-title">Chủ đề</label><input id="ky-title" class="input" maxlength="60" value="${esc(mine ? ky.title : STORY_TOPICS[0])}" data-kytitle list="ky-topics" autocomplete="off">
          <datalist id="ky-topics">${STORY_TOPICS.map((t) => `<option value="${t}">`).join('')}</datalist></div>
        <button type="button" class="btn ghost" style="height:48px" data-kyact="start">${MIC} Bắt đầu ghi âm</button>`;
    }
  }
  return `<section class="col ky" style="gap:8px" aria-label="Lời kể, lời dặn">
    <div class="h2row"><h2 class="h">Lời kể, lời dặn</h2>${recs.length ? `<span class="small muted">${recs.length} bản ghi</span>` : ''}</div>
    ${editable && !recs.length && ky.rec === 'idle' ? `<span class="small muted">Ghi lại giọng ${esc(person.name)} kể chuyện xưa, dặn dò con cháu. Giữ trên máy, gửi được qua Zalo.</span>` : ''}
    ${list(pid, editable)}
    ${ctl}
  </section>`;
}

export function stopStories() {
  if (ky.rec === 'rec') cancelRecording();
  clearInterval(ky.timer);
  ky.audio?.pause(); ky.playing = '';
  if (ky.draft?.url) URL.revokeObjectURL(ky.draft.url);
  Object.assign(ky, { rec: 'idle', draft: null, person: '' });
}

/** Gắn xử lý; trả true nếu click đã được xử lý */
export function mountStories(root, rerender, pid) {
  if (!pid) return;
  if (ky.person && ky.person !== pid) stopStories();
  clearInterval(ky.timer);
  if (ky.rec === 'rec') {
    ky.timer = setInterval(() => {
      const el = document.getElementById('ky-time');
      const n = Math.round((Date.now() - ky.t0) / 1000);
      if (el) el.textContent = dur(n);
      if (n >= MAX_SEC) root.querySelector('[data-kyact="stop"]')?.click();
    }, 500);
  }
  root.addEventListener('input', (e) => { if (e.target.matches('[data-kytitle]')) ky.title = e.target.value; });
  root.addEventListener('click', async (e) => {
    const play = e.target.closest('[data-kyplay]');
    if (play) {
      const rid = play.dataset.kyplay;
      if (ky.playing === rid) { ky.audio?.pause(); ky.playing = ''; rerender(); return; }
      const r = recsOf(pid).find((x) => x.id === rid);
      const url = await voiceUrl(fileId(pid, rid), r?.mime);
      if (!url) { toast('Không mở được bản ghi'); return; }
      ky.audio?.pause();
      ky.audio = new Audio(url); ky.playing = rid;
      ky.audio.onended = () => { ky.playing = ''; rerender(); };
      ky.audio.play().catch(() => { ky.playing = ''; toast('Không phát được bản ghi'); rerender(); });
      rerender();
      return;
    }
    const sh = e.target.closest('[data-kyshare]');
    if (sh) {
      const r = recsOf(pid).find((x) => x.id === sh.dataset.kyshare);
      const b64 = await voiceBase64(fileId(pid, r.id));
      if (!b64) { toast('Không mở được bản ghi'); return; }
      const ext = /mp4|aac|m4a/.test(r.mime || '') ? 'm4a' : 'webm';
      const name = getState().people.find((p) => p.id === pid)?.name || '';
      try { const x = await shareFile({ base64: b64, name: `${r.title}-${name}.${ext}`.replace(/[\\/:*?"<>|]/g, ''), mime: r.mime || 'audio/webm', title: `${r.title} — ${name}` }); if (x === 'saved') toast('Đã lưu bản ghi vào máy'); } catch { toast('Không gửi được'); }
      return;
    }
    const del = e.target.closest('[data-kydel]');
    if (del) {
      const r = recsOf(pid).find((x) => x.id === del.dataset.kydel);
      if (!(await confirmSheet({ title: `Xóa bản ghi “${r.title}”?`, message: 'Không khôi phục lại được.', ok: 'Xóa', danger: true }))) return;
      await deleteVoice(fileId(pid, r.id));
      setState((s) => ({ ...s, people: s.people.map((p) => (p.id === pid ? { ...p, recs: (p.recs || []).filter((x) => x.id !== r.id) } : p)) }));
      return;
    }
    const act = e.target.closest('[data-kyact]')?.dataset.kyact;
    if (!act) return;
    if (act === 'start' || act === 'again') {
      if (ky.draft?.url) URL.revokeObjectURL(ky.draft.url);
      ky.draft = null; ky.person = pid; ky.title = (root.querySelector('[data-kytitle]')?.value || ky.title || STORY_TOPICS[0]).trim() || STORY_TOPICS[0];
      ky.audio?.pause(); ky.playing = '';
      try { await startRecording(); } catch { toast('Chưa được phép dùng micro. Hãy cho phép trong Cài đặt máy.'); ky.rec = 'idle'; rerender(); return; }
      ky.rec = 'rec'; ky.t0 = Date.now(); rerender();
      return;
    }
    if (act === 'stop') {
      clearInterval(ky.timer);
      const r = await stopRecording();
      if (!r || !r.blob.size) { ky.rec = 'idle'; toast('Chưa ghi được âm thanh'); rerender(); return; }
      ky.draft = { ...r, url: URL.createObjectURL(r.blob) }; ky.rec = 'review'; rerender();
      return;
    }
    if (act === 'cancel') { if (ky.draft?.url) URL.revokeObjectURL(ky.draft.url); ky.draft = null; ky.rec = 'idle'; rerender(); return; }
    if (act === 'save') {
      const rid = uid();
      try { await saveVoice(fileId(pid, rid), ky.draft.blob); } catch { toast('Không lưu được — bộ nhớ máy có thể đã đầy'); return; }
      const meta = { id: rid, title: ky.title, sec: ky.draft.sec, mime: ky.draft.mime, at: new Date().toISOString() };
      URL.revokeObjectURL(ky.draft.url); ky.draft = null; ky.rec = 'idle';
      setState((s) => ({ ...s, people: s.people.map((p) => (p.id === pid ? { ...p, recs: [...(p.recs || []), meta] } : p)) }));
      toast('Đã lưu lời kể');
    }
  });
}

/** Xóa hết âm thanh của một người (khi xóa người khỏi gia phả) */
export async function deleteStories(person) {
  for (const r of person?.recs || []) await deleteVoice(fileId(person.id, r.id));
}
