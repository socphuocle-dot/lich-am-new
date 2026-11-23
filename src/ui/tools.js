import { go as navGo } from '../nav.js';
// Tiện ích: Văn khấn + mâm cúng, Xem ngày tốt, Đổi ngày âm ↔ dương, Thiệp mời giỗ.
import { getState, setState, updateSettings } from '../store.js';
import { jdFromDate, jdToDate, solarToLunar, lunarToSolar, canChiYear, canChiDay, THU, LUNAR_MONTH_NAME, lunarMonthLength, leapMonthOfYear } from '../lib/lunar.js';
import { nextGioDate, titleOf } from '../lib/events.js';
import { STARS, HANS } from '../lib/saohan.js';
import { OCCASIONS, occasion, fillText, plainText, ngayAmText, REGIONS, mamFor, hasRegional } from '../lib/vankhan.js';
import { ACTIVITIES, findGoodDays, rateDay, birthChi, yearWarnings } from '../lib/goodday.js';
import { esc, ICON, backHeader, toast } from './common.js';
import { isNative } from '../notify.js';
import { speakParagraphs, stopSpeaking, ttsStatus, openVoiceInstall } from '../tts.js';
import { unlockAudio } from '../sounds.js';
import { saveVoice, voiceUrl, deleteVoice, startRecording, stopRecording, cancelRecording, canRecord } from '../voice.js';
import { confirmSheet } from './dialog.js';
import { mascot, mascotName, ILL, cloud, sparkle, lanternString } from './art.js';
import { giap, giapName } from './zodiac.js';
import { pinned, pinTile } from './pins.js';

/** "Ông" + "Nguyễn Văn A" → "Ông Nguyễn Văn A"; không lặp nếu tên đã có quan hệ ("Bà Cố") */
export const withRel = (g) => (g.rel && g.rel !== 'Khác' && !g.name.toLowerCase().startsWith(g.rel.toLowerCase() + ' ') ? `${g.rel} ${g.name}` : g.name);
const todayJd = () => { const n = new Date(); return jdFromDate(n.getDate(), n.getMonth() + 1, n.getFullYear()); };
const lunarOf = (jd) => { const s = jdToDate(jd); return { s, l: solarToLunar(s.day, s.month, s.year) }; };

/* ============ VĂN KHẤN ============ */
const vk = { tab: 'van', wake: null, editHost: false, reading: -1, deadText: '', autoFrom: '', rec: 'idle', draft: null, by: '', audio: null, playing: false, voiceOpen: false };
const STYLES = [['thuong', 'Thường'], ['tram', 'Trầm, chậm'], ['tung', 'Chuông mõ']];
const mmss = (n) => `${Math.floor(n / 60)}:${String(n % 60).padStart(2, '0')}`;

/** Dịp sắp tới gần nhất có văn khấn (để gợi ý đầu danh sách) */
// Biểu tượng màu cho từng bài khấn
const VK_ICON = {
  gio: ['incense', 'rose'], tienthuong: ['incense', 'rose'], mung1: ['cal', 'butter'], ram: ['lantern', 'butter'], thantai: ['coin', 'butter'], giaihan: ['starlamp', 'lilac'], tambao: ['lotus', 'butter'], ducong: ['incense', 'peach'], thanhmau: ['frame', 'rose'], thanhhoang: ['house', 'mint'],
  ongtao: ['fish', 'peach'], tatnien: ['tray', 'peach'], giaothua: ['lantern', 'rose'], tet: ['lantern', 'rose'], hoavang: ['card', 'rose'],
  ramgieng: ['lantern', 'butter'], thanhminh: ['lotus', 'mint'], doanngo: ['tray', 'mint'], vulan: ['lotus', 'lilac'], chungsinh: ['lotus', 'lilac'],
  cungtuan: ['lotus', 'lilac'], tuan100: ['lotus', 'lilac'], giodau: ['incense', 'lilac'], giohet: ['incense', 'lilac'],
  nhaptrach: ['house', 'sky'], dongtho: ['house', 'sky'], khaitruong: ['coin', 'butter'], daythang: ['cake', 'rose'], thoinoi: ['cake', 'rose']
};

export function nextOccasion() {
  const t = todayJd();
  for (let jd = t; jd < t + 32; jd++) {
    const { l } = lunarOf(jd);
    if (l.leap) continue;
    const id = l.month === 12 && l.day === 23 ? 'ongtao' : l.month === 1 && l.day === 1 ? 'tet' : l.month === 1 && l.day === 15 ? 'ramgieng'
      : l.month === 7 && l.day === 15 ? 'vulan' : l.month === 5 && l.day === 5 ? 'doanngo' : l.day === 15 ? 'ram' : l.day === 1 ? 'mung1' : null;
    if (id) return { id, jd, diff: jd - t };
  }
  return null;
}

export function renderVankhanList(params) {
  const mamMode = params.tab === 'mam';
  const nx = nextOccasion();
  const allGroups = [...new Set(OCCASIONS.map((o) => o.group))];
  // ?g=chua: chỉ hiện nhóm "Đi lễ chùa, đền, phủ" (mở từ Tiện ích)
  const groups = params.g === 'chua' ? allGroups.filter((g) => g.startsWith('Đi lễ')) : allGroups;
  const nxO = params.g ? null : nx && occasion(nx.id);
  return `<div class="screen no-nav" data-screen="vankhan-list">
  ${backHeader(mamMode ? 'Mâm cúng theo dịp' : params.g === 'chua' ? 'Văn khấn đi lễ' : 'Văn khấn & mâm cúng', params.g ? '#/tienich' : '#/today', mamMode ? 'Danh sách đồ lễ, đánh dấu khi đã chuẩn bị' : 'Bản cổ truyền · tự điền ngày, tên, địa chỉ')}
  <main class="body" style="gap:14px">
    <section class="banner red" aria-hidden="false"><span class="bn-cloud a">${cloud(80, '#F6D27A', .5)}</span><span class="bn-cloud b">${cloud(60, '#F6D27A', .35)}</span>
      <div class="col grow" style="gap:4px;position:relative"><b>${params.g === 'chua' ? 'Đi lễ chùa, đền, phủ' : 'Văn khấn cổ truyền'}</b><span>${params.g === 'chua' ? 'Khấn Đức Ông, Tam Bảo, Thánh Mẫu, Thành Hoàng · có lễ vật nên sắm' : `${OCCASIONS.length} bài · tự điền ngày, tên, địa chỉ · đọc to cho ông bà nghe`}</span></div><div class="bn-mascot">${mascot('pray', 92)}</div></section>
    ${nxO ? `<a class="dark-card col" href="#/vankhan/${nx.id}?jd=${nx.jd}${mamMode ? '&tab=mam' : ''}" style="text-decoration:none;gap:6px">
      <span class="m small">${nx.diff === 0 ? 'Hôm nay' : nx.diff === 1 ? 'Ngày mai' : `Còn ${nx.diff} ngày`} · ${esc(nxO.when)}</span>
      <div class="h2row" style="align-items:center"><span class="serif" style="font-size:1.2rem;font-weight:700">${esc(nxO.title)}</span>${ICON.next(22)}</div></a>` : ''}
    ${groups.map((g) => `<section class="col" style="gap:8px"><h2 class="sec-title" style="margin:0">${esc(g)}</h2>
      <div class="card list">${OCCASIONS.filter((o) => o.group === g).map((o) => `<a class="item" href="#/vankhan/${o.id}${mamMode ? '?tab=mam' : ''}">
        <span class="pastel ${VK_ICON[o.id]?.[1] || 'rose'} sm">${(ILL[VK_ICON[o.id]?.[0]] || ILL.book)()}</span>
        <span class="grow col"><span class="t">${esc(o.title.replace('Văn khấn ', '').replace(/^./, (c) => c.toUpperCase()))}</span><span class="s">${esc(o.when)}</span></span>${ICON.next(18)}</a>`).join('')}</div></section>`).join('')}
    <p class="small muted" style="line-height:1.6;margin:0">Văn khấn soạn theo khuôn cổ truyền phổ biến. Mỗi vùng, mỗi nhà có thể khác — bạn cứ đọc theo lòng thành, không cần đúng từng chữ.</p>
  </main>
</div>`;
}

/** Văn khấn dâng sao: điền sao chiếu mệnh, hạn của người khấn (truyền qua link từ màn Sao hạn) */
function starCtx(params) {
  const star = STARS.find((x) => x.id === params.sao);
  if (!star) return { baiVi: 'chư vị Tinh quân Cửu Diệu', saoHan: 'chúng con kính dâng sao cầu an, giải hạn cho cả gia đình' };
  const han = params.han ? HANS[params.han] : null;
  return { baiVi: star.baiVi, saoHan: `${params.tuoi ? 'người tuổi ' + params.tuoi + ' ' : ''}gặp sao ${star.name} chiếu mệnh${han ? ', hạn ' + han.name : ''}` };
}

function vkContext(params) {
  const st = getState();
  const g = params.gid ? st.gios.find((x) => x.id === params.gid) : null;
  // Chọn người mất mà chưa có ngày → lấy ngày giỗ sắp tới của người đó
  const jd = Number(params.jd) || (g && nextGioDate({ ...g, repeat: 'yearly' }, todayJd())?.jd) || todayJd();
  const { l } = lunarOf(jd);
  const host = st.settings.hostName || st.profile.name || '';
  const hoTen = (host.trim().split(/\s+/)[0] || '').length > 1 ? host.trim().split(/\s+/)[0] : '';
  return {
    jd, l, g,
    ctx: {
      ngayAm: ngayAmText(l.day, l.month, l.leap), nam: canChiYear(l.year), tinChu: host, diaChi: st.settings.address || '',
      hoTen, nguoiMat: g ? withRel(g) : vk.deadText,
      tenBe: st.settings.babyName || '',
      ...starCtx(params)
    }
  };
}

/** Thanh đọc: nút lớn + thẻ "Giọng đọc" (giọng máy kiểu tụng / giọng người thật ghi âm) */
function voiceBar(o, st) {
  const meta = st.voices?.[o.id];
  const useVoice = meta && st.settings.preferVoice !== false;
  const style = st.settings.ttsStyle || 'tung';
  const busy = vk.reading >= 0 || vk.playing;
  const big = useVoice
    ? `<button type="button" class="btn big-read ${vk.playing ? 'ghost' : ''}" data-act="${vk.playing ? 'v-stop' : 'v-play'}">${vk.playing ? '■ Dừng nghe' : '▶ Nghe giọng ' + esc(meta.by || 'người nhà')}</button>`
    : `<button type="button" class="btn big-read ${vk.reading >= 0 ? 'ghost' : ''}" data-act="${vk.reading >= 0 ? 'tts-stop' : 'tts-play'}">${vk.reading >= 0 ? '■ Dừng đọc' : '▶ Đọc to'}</button>`;
  const speed = useVoice ? '' : `<div class="seg" style="flex:1.3" aria-label="Tốc độ đọc">${[[0.8, 'Chậm'], [1, 'Vừa'], [1.15, 'Nhanh']].map(([v, lb]) => `<button type="button" data-rate="${v}" aria-pressed="${(st.settings.ttsRate ?? 1) === v}">${lb}</button>`).join('')}</div>`;
  const recUi = vk.rec === 'rec'
    ? `<div class="rec-live" role="status"><span class="rec-dot" aria-hidden="true"></span><b>Đang ghi âm</b><span class="rec-time" id="rec-time">0:00</span><button type="button" class="btn" style="width:auto;height:44px;padding:0 18px" data-act="rec-stop">■ Dừng</button></div>
       <span class="small muted">Đọc chậm, rõ từ đầu đến cuối bài. Có thể cầm máy gần miệng khoảng một gang tay.</span>`
    : vk.rec === 'review' && vk.draft
      ? `<div class="col" style="gap:8px"><audio controls src="${vk.draft.url}" style="width:100%"></audio>
         <label class="field"><span class="lb">Giọng của ai?</span><input id="v-by" class="input" maxlength="30" placeholder="Ví dụ: Ông nội, Thầy Thích Minh Tâm" value="${esc(vk.by)}"></label>
         <div class="row" style="gap:8px"><button type="button" class="btn" style="flex:1.4;height:46px" data-act="rec-save">Lưu giọng đọc</button><button type="button" class="btn ghost" style="flex:1;height:46px" data-act="rec-again">Ghi lại</button></div>
         <button type="button" class="btn text" style="height:40px" data-act="rec-cancel">Bỏ bản ghi này</button></div>`
      : meta
        ? `<div class="item" style="padding:6px 0;border:0"><span class="pastel sm rose">${ILL.face()}</span><span class="col grow"><span class="t">Giọng ${esc(meta.by || 'người nhà')}</span><span class="s">${mmss(meta.sec || 0)} · ghi ${esc((meta.at || '').slice(0, 10).split('-').reverse().join('/'))}</span></span></div>
           <div class="quick-acts"><button type="button" class="chip" data-act="v-prefer" aria-pressed="${useVoice}">${useVoice ? '✓ Đang dùng giọng này' : 'Dùng giọng này'}</button>
             <button type="button" class="chip" data-act="rec-start">🎙 Ghi lại</button><button type="button" class="chip" data-act="v-del">${ICON.trash(16)} Xóa</button></div>`
        : `<button type="button" class="btn ghost" style="height:48px" data-act="rec-start">🎙 Ghi âm giọng người nhà đọc bài này</button>
           <label class="chip" style="align-self:flex-start;display:inline-flex;align-items:center;gap:6px">${ICON.up(16)} Chọn file ghi âm có sẵn<input type="file" accept="audio/*" id="v-file" hidden></label>`;
  return `<div class="tts-bar" role="group" aria-label="Đọc to">${big}${speed}</div>
    <details class="card voice-card" ${vk.voiceOpen || vk.rec !== 'idle' ? 'open' : ''} data-voice>
      <summary><span class="pastel sm butter">${ILL.lotus()}</span><span class="col grow"><b>Giọng đọc</b><span class="small muted">${useVoice ? 'Giọng ' + esc(meta.by || 'người nhà') + ' (ghi âm)' : 'Giọng máy · ' + (style === 'tung' ? 'trầm, có chuông mõ' : STYLES.find((x) => x[0] === style)[1].toLowerCase())}</span></span><span class="chip">Đổi</span></summary>
      <div class="col" style="gap:10px;padding:0 14px 14px">
        <span class="lb">Giọng máy đọc</span>
        <div class="seg" role="group" aria-label="Kiểu đọc">${STYLES.map(([k, lb]) => `<button type="button" data-style="${k}" aria-pressed="${style === k}" ${busy ? 'disabled' : ''}>${lb}</button>`).join('')}</div>
        <span class="small muted">${style === 'tung' ? 'Giọng trầm, chậm, ngắt theo từng vế; chuông mở đầu và kết thúc, mõ gõ nhịp.' : style === 'tram' ? 'Giọng trầm, chậm, ngắt nghỉ theo từng vế câu.' : 'Đọc liền mạch như bình thường.'}</span>
        <span class="lb" style="margin-top:4px">Giọng người thật</span>
        ${recUi}
        <span class="small muted">Bản ghi âm lưu trên máy này, dùng riêng cho bài "${esc(o.title.replace('Văn khấn ', ''))}". Chưa nằm trong file sao lưu.</span>
      </div></details>`;
}

export function renderVankhan(params) {
  const o = occasion(params.id) || OCCASIONS[0];
  if (vk.tabFrom !== location.hash) { vk.tab = params.tab === 'mam' ? 'mam' : 'van'; vk.tabFrom = location.hash; vk.editHost = false; }
  if (vk.idFrom !== o.id) { vk.idFrom = o.id; vk.deadText = ''; }
  const st = getState();
  const { jd, l, ctx, g } = vkContext(params);
  const filled = fillText(o.text, ctx);
  const missing = new Set(filled.flat().filter((x) => x.missing).map((x) => x.key));
  const size = st.settings.vkSize ?? 1;
  const region = hasRegional(o) ? (st.settings.region || 'chung') : 'chung';
  const mam = mamFor(o, region);
  const ckKey = `${o.id}:${g ? g.id + ':' : ''}${l.year}-${l.month}-${l.day}${region !== 'chung' ? ':' + region : ''}`;
  const checked = new Set(st.checklists[ckKey] || []);
  const s = jdToDate(jd);
  const needsDead = o.text.some((p) => p.includes('{nguoiMat}'));
  const needsBaby = o.text.some((p) => p.includes('{tenBe}'));
  const deadList = st.gios.filter((x) => (x.type || 'gio') === 'gio');
  const open = vk.editHost || missing.size > 0;
  const iso = `${s.year}-${String(s.month).padStart(2, '0')}-${String(s.day).padStart(2, '0')}`;
  const summary = [`${ctx.ngayAm} năm ${ctx.nam}`, ctx.tinChu, needsDead ? ctx.nguoiMat : '', needsBaby ? ctx.tenBe : ''].filter(Boolean).join(' · ');
  const infoCard = `<details class="card vk-info" ${open ? 'open' : ''} data-info>
    <summary><span class="ico3d red sm" aria-hidden="true">${ICON.card(20)}</span><span class="col grow"><b>Thông tin trong bài khấn</b><span class="small muted">${missing.size ? `Còn ${missing.size} chỗ trống — điền để đọc trọn bài` : esc(summary)}</span></span><span class="chip">${open ? 'Thu gọn' : 'Sửa'}</span></summary>
    <div class="col" style="gap:12px;padding:4px 16px 16px">
      <div class="field"><label class="lb" for="vk-date">Ngày cúng</label><input id="vk-date" class="input" type="date" value="${iso}" data-vk="date">
        <span class="small muted">Tức ${esc(ctx.ngayAm)} năm ${esc(ctx.nam)} — tự điền vào bài</span></div>
      <div class="field"><label class="lb" for="vk-host">Họ tên gia chủ (người khấn)</label><input id="vk-host" class="input" maxlength="60" placeholder="Ví dụ: Nguyễn Văn An" value="${esc(st.settings.hostName || st.profile.name || '')}" autocomplete="name" data-vk="host"></div>
      <div class="field"><label class="lb" for="vk-addr">Địa chỉ nhà</label><input id="vk-addr" class="input" maxlength="120" placeholder="Ví dụ: số 12 đường Lê Lợi, phường…, tỉnh…" value="${esc(st.settings.address || '')}" autocomplete="street-address" data-vk="addr"></div>
      ${needsDead ? `<div class="field"><label class="lb" for="vk-dead">Khấn cho ai</label>
        ${deadList.length ? `<select id="vk-dead" class="input" data-vk="dead"><option value="">${vk.deadText ? 'Người khác (nhập tên bên dưới)' : '— Chọn người đã khuất —'}</option>${deadList.map((x) => `<option value="${esc(x.id)}" ${g && g.id === x.id ? 'selected' : ''}>${esc(withRel(x))}</option>`).join('')}</select>` : ''}
        ${!g ? `<input id="vk-deadtext" class="input" maxlength="60" placeholder="Ví dụ: Ông nội Nguyễn Văn Bình" value="${esc(vk.deadText)}" data-vk="deadtext" ${deadList.length ? 'style="margin-top:8px"' : ''}>` : ''}</div>` : ''}
      ${needsBaby ? `<div class="field"><label class="lb" for="vk-baby">Tên bé</label><input id="vk-baby" class="input" maxlength="40" placeholder="Ví dụ: Nguyễn Gia Bảo" value="${esc(st.settings.babyName || '')}" data-vk="baby"></div>` : ''}
      <span class="small muted">Tên, địa chỉ được nhớ cho mọi bài khấn. Bấm vào chữ tô màu trong bài để sửa nhanh.</span>
    </div></details>`;
  const body = vk.tab === 'mam'
    ? `${hasRegional(o) ? `<div class="seg" role="group" aria-label="Vùng miền">${REGIONS.map(([k, lb]) => `<button type="button" data-region="${k}" aria-pressed="${region === k}">${lb.replace('Miền ', '')}</button>`).join('')}</div>` : ''}
      <section class="card list" aria-label="Mâm cúng gợi ý">${mam.map((m, i) => `<button type="button" class="item" data-ck="${i}" role="checkbox" aria-checked="${checked.has(i)}">
        <span class="tick ${checked.has(i) ? 'on' : ''}" aria-hidden="true"></span><span class="grow t" style="${checked.has(i) ? 'text-decoration:line-through;color:var(--muted)' : ''}">${esc(m)}</span></button>`).join('')}</section>
      <span class="small muted">Đã chuẩn bị ${checked.size}/${mam.length} · ${region !== 'chung' ? 'theo phong tục ' + REGIONS.find((r) => r[0] === region)[1].replace('Miền', 'miền') + ' · ' : ''}mỗi nhà mỗi lệ, thêm bớt cho hợp gia đình</span>`
    : `${infoCard}${voiceBar(o, st)}
      <article class="vk-text size-${size}" aria-label="${esc(o.title)}">${filled.map((p, i) => `<p class="${vk.reading === i ? 'reading' : ''}" data-p="${i}">${p.map((x) => x.fill && (x.key === 'baiVi' || x.key === 'saoHan') ? `<b class="vk-fill">${esc(x.t)}</b>` : x.fill ? `<b class="vk-fill" data-field="${x.key}" role="button" tabindex="0" title="Bấm để sửa">${esc(x.t)}</b>` : x.missing ? `<mark data-field="${x.key}" role="button" tabindex="0" title="Bấm để điền">${esc(x.t)}</mark>` : esc(x.t).replace(/\n/g, '<br>')).join('')}</p>`).join('')}</article>`;
  return `<div class="screen no-nav" data-screen="vankhan">
  ${backHeader(o.title.replace('Văn khấn ', '').replace(/^./, (c) => c.toUpperCase()), '#/vankhan', `${THU[(jd + 1) % 7]} ${s.day}/${s.month} · âm ${l.day}/${l.month}${l.leap ? ' nhuận' : ''}`)}
  <main class="body" style="gap:14px">
    <div class="seg" role="group" aria-label="Nội dung"><button type="button" data-tab="van" aria-pressed="${vk.tab === 'van'}">Văn khấn</button><button type="button" data-tab="mam" aria-pressed="${vk.tab === 'mam'}">Mâm cúng</button></div>
    <span class="small muted">${ICON.cal(14)} ${esc(o.when)}</span>
    ${body}
    ${vk.tab === 'van' ? `<div class="quick-acts" role="group" aria-label="Công cụ đọc">
      <button type="button" class="chip" data-act="smaller" aria-label="Chữ nhỏ hơn">A−</button>
      <button type="button" class="chip" data-act="bigger" aria-label="Chữ to hơn">A+</button>
      <button type="button" class="chip" data-act="copy">${ICON.copy(16)} Sao chép</button>
      <button type="button" class="chip" data-act="share">${ICON.share(16)} Gửi</button>
      <button type="button" class="chip" data-act="auto-read" aria-pressed="${!!st.settings.autoRead}">${st.settings.autoRead ? '✓ ' : ''}Tự đọc khi mở bài</button>
    </div>` : ''}
  </main>
</div>`;
}

export function mountVankhan(root, rerender, params) {
  const o = occasion(params.id) || OCCASIONS[0];
  // Giữ màn hình sáng khi đang đọc
  if ('wakeLock' in navigator && !vk.wake) {
    navigator.wakeLock.request('screen').then((w) => { vk.wake = w; }).catch(() => {});
    const off = () => { if (!location.hash.startsWith('#/vankhan/')) { vk.wake?.release?.().catch(() => {}); vk.wake = null; window.removeEventListener('hashchange', off); } };
    window.addEventListener('hashchange', off);
  }
  const offTts = () => {
    if (location.hash.startsWith('#/vankhan/' + o.id)) return;
    stopSpeaking(); vk.reading = -1;
    if (vk.audio) { vk.audio.pause(); vk.playing = false; }
    if (vk.rec === 'rec') cancelRecording();
    if (vk.draft?.url) URL.revokeObjectURL(vk.draft.url);
    vk.rec = 'idle'; vk.draft = null;
    window.removeEventListener('hashchange', offTts);
  };
  window.addEventListener('hashchange', offTts);
  const go = (patch) => {
    const q = new URLSearchParams({ ...(params.jd ? { jd: params.jd } : {}), ...(params.gid ? { gid: params.gid } : {}), ...(params.tab ? { tab: params.tab } : {}), ...patch });
    for (const [k, v] of [...q]) if (!v) q.delete(k);
    vk.tabFrom = `#/vankhan/${o.id}?${q}`; vk.editHost = true; // giữ thẻ thông tin đang mở
    navGo(vk.tabFrom, { replace: true });
  };
  root.addEventListener('change', (e) => {
    const k = e.target.dataset.vk;
    if (!k) return;
    vk.editHost = true;
    const v = e.target.value.trim();
    if (k === 'date' && v) { const [y, m, d] = v.split('-').map(Number); go({ jd: String(jdFromDate(d, m, y)) }); }
    if (k === 'host') updateSettings({ hostName: v });
    if (k === 'addr') updateSettings({ address: v });
    if (k === 'baby') updateSettings({ babyName: v });
    if (k === 'dead') { vk.deadText = ''; go({ gid: v }); }
    if (k === 'deadtext') { vk.deadText = v; rerender(); }
  });
  root.querySelector('[data-voice]')?.addEventListener('toggle', (e) => { vk.voiceOpen = e.target.open; });
  // Chuẩn bị sẵn bản ghi âm để bấm nghe là phát ngay (trình duyệt chỉ cho phát trong lúc bấm)
  const meta = getState().voices?.[o.id];
  if (meta && vk.voiceFor !== o.id + meta.at) {
    vk.voiceFor = o.id + meta.at; vk.voiceSrc = '';
    voiceUrl(o.id, meta.mime).then((u) => { if (vk.voiceFor === o.id + meta.at) vk.voiceSrc = u; });
  }
  if (vk.rec === 'rec') {
    const t0 = Date.now() - (vk.recElapsed || 0);
    const tick = setInterval(() => {
      const el = document.getElementById('rec-time');
      if (!el || vk.rec !== 'rec') { clearInterval(tick); return; }
      const n = Math.floor((Date.now() - t0) / 1000); el.textContent = mmss(n);
      if (n >= 900) root.querySelector('[data-act="rec-stop"]')?.click(); // tối đa 15 phút
    }, 500);
  }
  root.querySelector('#v-file')?.addEventListener('change', (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 25 * 1024 * 1024) { toast('File quá lớn (tối đa 25 MB)'); return; }
    const url = URL.createObjectURL(f);
    const a = new Audio(url);
    a.addEventListener('loadedmetadata', () => { if (vk.draft) vk.draft.sec = Math.round(a.duration) || 0; });
    vk.draft = { blob: f, mime: f.type || 'audio/mpeg', sec: 0, url }; vk.by = ''; vk.rec = 'review'; rerender();
  });
  root.querySelector('[data-info]')?.addEventListener('toggle', (e) => { vk.editHost = e.target.open; const c = e.target.querySelector('summary .chip'); if (c) c.textContent = e.target.open ? 'Thu gọn' : 'Sửa'; });
  // Bấm chữ tô màu trong bài → mở ô tương ứng
  const FIELD = { ngayAm: 'vk-date', nam: 'vk-date', tinChu: 'vk-host', hoTen: 'vk-host', diaChi: 'vk-addr', nguoiMat: 'vk-dead', tenBe: 'vk-baby' };
  const editField = (key) => {
    vk.editHost = true; rerender();
    const app = document.querySelector('[data-screen="vankhan"]');
    const el = app?.querySelector('#' + FIELD[key]) || app?.querySelector('#vk-deadtext');
    el?.scrollIntoView({ block: 'center', behavior: 'smooth' }); el?.focus({ preventScroll: true });
  };
  root.addEventListener('keydown', (e) => { const f = e.target.closest?.('[data-field]'); if (f && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); editField(f.dataset.field); } });
  // Tự đọc khi mở bài (người lớn tuổi) hoặc khi bấm "Đọc văn khấn" trên thông báo giờ cúng (doc=1):
  // ưu tiên giọng người nhà đã ghi âm, không có thì máy đọc. Chỉ một lần mỗi lần mở.
  const wantRead = params.doc === '1' || getState().settings.autoRead;
  if (wantRead && vk.autoFrom !== location.hash) {
    if (vk.tab !== 'van') { vk.tab = 'van'; rerender(); return; }
    vk.autoFrom = location.hash;
    setTimeout(() => (root.querySelector('[data-act="v-play"]') || root.querySelector('[data-act="tts-play"]'))?.click(), 900);
  }
  root.addEventListener('click', async (e) => {
    const fd = e.target.closest('[data-field]');
    if (fd) { editField(fd.dataset.field); return; }
    const t = e.target.closest('[data-tab]');
    if (t) { vk.tab = t.dataset.tab; rerender(); return; }
    const rt = e.target.closest('[data-rate]');
    if (rt) { updateSettings({ ttsRate: Number(rt.dataset.rate) }); return; }
    const rg = e.target.closest('[data-region]');
    if (rg) { updateSettings({ region: rg.dataset.region }); return; }
    const ck = e.target.closest('[data-ck]');
    if (ck) {
      const { l, g } = vkContext(params);
      const region = hasRegional(o) ? (getState().settings.region || 'chung') : 'chung';
      const key = `${o.id}:${g ? g.id + ':' : ''}${l.year}-${l.month}-${l.day}${region !== 'chung' ? ':' + region : ''}`;
      const i = Number(ck.dataset.ck);
      setState((s) => {
        const cur = new Set(s.checklists[key] || []);
        cur.has(i) ? cur.delete(i) : cur.add(i);
        return { ...s, checklists: { ...s.checklists, [key]: [...cur] } };
      });
      return;
    }
    const sty = e.target.closest('[data-style]');
    if (sty) { updateSettings({ ttsStyle: sty.dataset.style }); return; }
    const act = e.target.closest('[data-act]')?.dataset.act;
    const sz = getState().settings.vkSize ?? 1;
    if (act === 'v-play') {
      if (!vk.voiceSrc) { toast('Đang mở bản ghi âm, bấm lại sau giây lát'); return; }
      if (!vk.audio) { vk.audio = new Audio(); vk.audio.addEventListener('ended', () => { vk.playing = false; rerender(); }); }
      vk.audio.src = vk.voiceSrc;
      vk.audio.play().then(() => { vk.playing = true; rerender(); }).catch(() => toast('Không phát được bản ghi âm'));
      return;
    }
    if (act === 'v-stop') { vk.audio?.pause(); vk.playing = false; rerender(); return; }
    if (act === 'v-prefer') { updateSettings({ preferVoice: getState().settings.preferVoice === false }); return; }
    if (act === 'rec-start' || act === 'rec-again') {
      if (!canRecord()) { toast('Máy này chưa hỗ trợ ghi âm trong app. Hãy dùng "Chọn file ghi âm có sẵn".'); return; }
      if (vk.draft?.url) URL.revokeObjectURL(vk.draft.url);
      vk.draft = null; await stopSpeaking(); vk.reading = -1; vk.audio?.pause(); vk.playing = false;
      try { await startRecording(); } catch { toast('Chưa được phép dùng micro. Hãy cho phép trong Cài đặt máy.'); vk.rec = 'idle'; rerender(); return; }
      vk.rec = 'rec'; vk.recElapsed = 0; rerender();
      return;
    }
    if (act === 'rec-stop') {
      const r = await stopRecording();
      if (!r || !r.blob.size) { vk.rec = 'idle'; toast('Chưa ghi được âm thanh'); rerender(); return; }
      vk.draft = { ...r, url: URL.createObjectURL(r.blob) }; vk.rec = 'review'; rerender();
      setTimeout(() => document.getElementById('v-by')?.focus(), 100);
      return;
    }
    if (act === 'rec-cancel') { if (vk.draft?.url) URL.revokeObjectURL(vk.draft.url); vk.draft = null; vk.rec = 'idle'; rerender(); return; }
    if (act === 'rec-save') {
      const by = (document.getElementById('v-by')?.value || '').trim() || 'người nhà';
      try { await saveVoice(o.id, vk.draft.blob); } catch { toast('Không lưu được — bộ nhớ máy có thể đã đầy'); return; }
      const m = { by, sec: vk.draft.sec || 0, mime: vk.draft.mime, at: new Date().toISOString() };
      URL.revokeObjectURL(vk.draft.url); vk.draft = null; vk.rec = 'idle'; vk.voiceFor = '';
      setState((s2) => ({ ...s2, voices: { ...s2.voices, [o.id]: m }, settings: { ...s2.settings, preferVoice: true } }));
      toast('Đã lưu giọng ' + by);
      return;
    }
    if (act === 'v-del') {
      const m = getState().voices?.[o.id];
      if (!(await confirmSheet({ title: `Xóa giọng ${m?.by || 'người nhà'}?`, message: 'Bản ghi âm của bài này sẽ bị xóa khỏi máy.', ok: 'Xóa', danger: true }))) return;
      await deleteVoice(o.id); vk.voiceFor = ''; vk.voiceSrc = '';
      setState((s2) => { const v = { ...s2.voices }; delete v[o.id]; return { ...s2, voices: v }; });
      return;
    }
    if (act === 'tts-play') {
      if ((getState().settings.ttsStyle || 'tung') === 'tung') unlockAudio();
      const status = await ttsStatus();
      if (status === 'none') { toast('Máy này chưa hỗ trợ đọc to'); return; }
      if (status === 'missing') {
        toast('Máy chưa có giọng đọc tiếng Việt', isNative() ? { label: 'Cài giọng', run: openVoiceInstall } : null, 6000);
        if (!isNative()) return;
      }
      const paras = plainText(fillText(o.text, vkContext(params).ctx)).split('\n\n');
      vk.reading = 0; rerender();
      speakParagraphs(paras, getState().settings.ttsRate ?? 1, (i) => {
        vk.reading = i;
        const app = document.querySelector('[data-screen="vankhan"]');
        if (!app) return;
        app.querySelectorAll('.vk-text p').forEach((el) => el.classList.toggle('reading', Number(el.dataset.p) === i));
        const btn = app.querySelector('[data-act="tts-stop"], [data-act="tts-play"]');
        if (btn && i < 0) { btn.dataset.act = 'tts-play'; btn.textContent = '▶ Đọc to'; btn.classList.remove('ghost'); }
        if (i >= 0) app.querySelector(`.vk-text p[data-p="${i}"]`)?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }, getState().settings.ttsStyle || 'tung');
      return;
    }
    if (act === 'tts-stop') { await stopSpeaking(); vk.reading = -1; rerender(); return; }
    if (act === 'bigger') updateSettings({ vkSize: Math.min(3, sz + 1) });
    if (act === 'smaller') updateSettings({ vkSize: Math.max(0, sz - 1) });
    if (act === 'auto-read') { updateSettings({ autoRead: !getState().settings.autoRead }); toast(getState().settings.autoRead ? 'Mở bài khấn là tự đọc to' : 'Đã tắt tự đọc'); return; }
    if (act === 'save-host') {
      updateSettings({ hostName: root.querySelector('#vk-host').value.trim(), address: root.querySelector('#vk-addr').value.trim() });
      vk.editHost = false;
      toast('Đã lưu thông tin gia chủ');
    }
    if (act === 'edit-host') { vk.editHost = true; rerender(); root.querySelector('#vk-host')?.focus(); }
    if (act === 'copy' || act === 'share') {
      const text = o.title + '\n\n' + plainText(fillText(o.text, vkContext(params).ctx));
      if (act === 'share' && navigator.share) { try { await navigator.share({ title: o.title, text }); return; } catch { /* hủy */ } }
      try { await navigator.clipboard.writeText(text); toast('Đã sao chép văn khấn'); } catch { toast('Không sao chép được'); }
    }
  });
}

/* ============ XEM NGÀY TỐT ============ */
const gd = { act: 'cuoi', days: 60, open: 0 };
const GD_VK = { khaitruong: 'khaitruong', dongtho: 'dongtho', nhaptrach: 'nhaptrach' };

export function renderGoodDays() {
  const st = getState();
  const t = todayJd();
  const chi = birthChi(st.profile.dob);
  const res = findGoodDays(t, gd.days, gd.act, { chi }).sort((a, b) => a.jd - b.jd);
  const act = ACTIVITIES.find((a) => a.id === gd.act);
  const by = st.profile.dob ? solarToLunar(...st.profile.dob.split('-').map(Number).reverse()).year : 0;
  const { l } = lunarOf(t);
  const warn = by ? [...new Set([...yearWarnings(by, l.year, gd.act), ...yearWarnings(by, lunarOf(t + gd.days).l.year, gd.act)])] : [];
  const lv = { tot: 'Tốt', kha: 'Tạm', xau: 'Xấu' };
  return `<div class="screen no-nav" data-screen="goodday">
  ${backHeader('Xem ngày tốt', '#/today', 'Theo hoàng đạo, 12 trực, ngày kỵ và tuổi')}
  <main class="body" style="gap:14px">
    <section class="banner gold" aria-hidden="false"><span class="bn-cloud a">${cloud(80, '#F6D27A', .5)}</span><span class="bn-cloud b">${cloud(60, '#F6D27A', .35)}</span>
      <div class="col grow" style="gap:4px;position:relative"><b>Chọn ngày lành tháng tốt</b><span>${mascotName(true)} tìm giúp ngày hợp việc, hợp tuổi bạn</span></div><div class="bn-mascot">${mascot('star', 92)}</div></section>
    <div class="field" role="group" aria-label="Việc cần làm"><span class="lb">Bạn định làm việc gì?</span>
      <div class="chips">${ACTIVITIES.map((a) => `<button type="button" class="chip" data-gact="${a.id}" aria-pressed="${gd.act === a.id}">${a.label}</button>`).join('')}</div></div>
    <div class="seg" role="group" aria-label="Khoảng thời gian">${[[30, '30 ngày'], [60, '2 tháng'], [180, '6 tháng']].map(([v, lb]) => `<button type="button" data-gdays="${v}" aria-pressed="${gd.days === v}">${lb}</button>`).join('')}</div>
    ${chi == null ? `<a class="note" href="#/profile" style="text-decoration:none;color:var(--ink)"><span style="color:var(--accent)">${ICON.star(18)}</span><span>Nhập ngày sinh ở <b>Hồ sơ</b> để loại những ngày xung tuổi của bạn.</span></a>`
      : `<span class="small muted cc-line">${giap(canChiYear(by), 22)}Đã loại ngày xung tuổi ${esc(canChiYear(by))} (con ${giapName(canChiYear(by))}) của ${esc(st.profile.name || 'bạn')}.</span>`}
    ${warn.map((w) => `<div class="note warn" role="note"><span>⚠</span><span>${esc(w)}</span></div>`).join('')}
    <h2 class="h" style="margin:0">${res.length} ngày tốt để ${esc(act.label.toLowerCase())}</h2>
    <section class="card list" aria-label="Danh sách ngày tốt">
      ${res.length ? res.map((r) => {
        const open = gd.open === r.jd;
        return `<button type="button" class="item gd-row" data-gopen="${r.jd}" aria-expanded="${open}">
          <div class="tile ${r.score >= 5 ? 'ink' : ''}"><b>${r.solar.day}</b><span>TH ${r.solar.month}</span></div>
          <span class="grow col"><span class="t">${r.weekday}, ${r.solar.day}/${r.solar.month}/${r.solar.year}</span>
            <span class="s">Âm ${r.lunar.day}/${r.lunar.month} · ${r.canChi} · trực ${r.truc}</span></span>
          <span class="gd-badge ${r.score >= 5 ? 'best' : ''}">${r.score >= 5 ? 'Rất tốt' : lv[r.level]}</span></button>
          ${open ? `<div class="gd-detail">${r.reasons.map((x) => `<span class="${x.ok ? 'ok' : x.ok === false ? 'no' : ''}">${x.ok ? '✓' : x.ok === false ? '✕' : '·'} ${esc(x.text)}</span>`).join('')}
            <span>· ${esc(r.trucY)}</span>
            <span><b>Giờ tốt:</b></span><span class="gd-hours">${r.hours.map((h) => `<span>${giap(h.chi, 22)}${h.chi} <small>${h.label}</small></span>`).join('')}</span>
            <span><b>Hướng xuất hành:</b> Hỷ thần ${r.extras.hyThan} · Tài thần ${r.extras.taiThan}</span>
            ${GD_VK[gd.act] ? `<a class="chip" style="align-self:flex-start;height:38px;display:inline-flex;align-items:center;gap:6px" href="#/vankhan/${GD_VK[gd.act]}?jd=${r.jd}">${ICON.book(16)} Văn khấn &amp; mâm cúng</a>` : ''}
            <a class="chip" style="align-self:flex-start;height:38px;display:inline-flex;align-items:center;gap:6px" href="#/add?type=kyniem&cal=duong&ld=${r.solar.day}&lm=${r.solar.month}&name=${encodeURIComponent(act.label)}&once=1">${ICON.plus(16)} Đặt nhắc ngày này</a></div>` : ''}`;
      }).join('') : '<div class="empty">Không có ngày thật tốt trong khoảng này. Thử chọn khoảng dài hơn.</div>'}
    </section>
    <p class="small muted" style="line-height:1.6;margin:0">Tham khảo theo lịch vạn niên dân gian. Việc lớn nên hỏi thêm người có kinh nghiệm trong gia đình, dòng họ.</p>
  </main>
</div>`;
}

export function mountGoodDays(root, rerender) {
  root.addEventListener('click', (e) => {
    const a = e.target.closest('[data-gact]'); if (a) { gd.act = a.dataset.gact; gd.open = 0; rerender(); return; }
    const d = e.target.closest('[data-gdays]'); if (d) { gd.days = Number(d.dataset.gdays); gd.open = 0; rerender(); return; }
    const o = e.target.closest('[data-gopen]'); if (o) { const jd = Number(o.dataset.gopen); gd.open = gd.open === jd ? 0 : jd; rerender(); }
  });
}

export { rateDay };

/* ============ ĐỔI NGÀY ÂM ↔ DƯƠNG (trên màn Hôm nay) ============ */
const cv = { open: false, dir: 'd2a', d: 0, m: 0, y: 0, leap: false };

export function converterCard(force = false) {
  const n = new Date();
  if (!cv.y) { cv.d = n.getDate(); cv.m = n.getMonth() + 1; cv.y = n.getFullYear(); }
  if (!cv.open && !force) return '';
  let result = '';
  if (cv.dir === 'd2a') {
    const dim = new Date(cv.y, cv.m, 0).getDate();
    const d = Math.min(cv.d, dim);
    const l = solarToLunar(d, cv.m, cv.y);
    const jd = jdFromDate(d, cv.m, cv.y);
    result = `<b>${THU[(jd + 1) % 7]}</b> · âm lịch <b>${l.day} tháng ${LUNAR_MONTH_NAME[l.month]}${l.leap ? ' (nhuận)' : ''}</b> năm ${canChiYear(l.year)} · ngày ${canChiDay(jd)}`;
  } else {
    const leapM = leapMonthOfYear(cv.y);
    const leap = cv.leap && leapM === cv.m;
    const len = lunarMonthLength(cv.m, cv.y, leap);
    const d = Math.min(cv.d, len);
    const s = lunarToSolar(d, cv.m, cv.y, leap);
    const jd = jdFromDate(s.day, s.month, s.year);
    result = `<b>${THU[(jd + 1) % 7]}, ${s.day}/${s.month}/${s.year}</b> dương lịch${cv.d > len ? ` · tháng này chỉ có ${len} ngày` : ''}`;
  }
  const yrs = Array.from({ length: 41 }, (_, i) => n.getFullYear() - 20 + i);
  const leapM = cv.dir === 'a2d' ? leapMonthOfYear(cv.y) : 0;
  return `<section class="card pad col conv" style="gap:12px" aria-label="Đổi ngày âm dương">
    <div class="seg" role="group" aria-label="Chiều đổi"><button type="button" data-cvdir="d2a" aria-pressed="${cv.dir === 'd2a'}">Dương → Âm</button><button type="button" data-cvdir="a2d" aria-pressed="${cv.dir === 'a2d'}">Âm → Dương</button></div>
    <div class="grid3">
      <label class="field"><span class="small muted">Ngày</span><select class="input" data-cv="d">${Array.from({ length: 31 }, (_, i) => `<option ${cv.d === i + 1 ? 'selected' : ''}>${i + 1}</option>`).join('')}</select></label>
      <label class="field"><span class="small muted">Tháng</span><select class="input" data-cv="m">${Array.from({ length: 12 }, (_, i) => `<option ${cv.m === i + 1 ? 'selected' : ''}>${i + 1}</option>`).join('')}</select></label>
      <label class="field"><span class="small muted">Năm</span><select class="input" data-cv="y">${yrs.map((y) => `<option ${cv.y === y ? 'selected' : ''}>${y}</option>`).join('')}</select></label>
    </div>
    ${leapM && leapM === cv.m ? `<label class="row small" style="gap:8px"><input type="checkbox" data-cv="leap" ${cv.leap ? 'checked' : ''}> Tháng ${cv.m} nhuận</label>` : ''}
    <div class="note" data-test="conv" aria-live="polite"><span style="color:var(--accent)">${ICON.swap(18)}</span><span>${result}</span></div>
  </section>`;
}

export function renderConvert() {
  return `<div class="screen no-nav" data-screen="doingay">
  ${backHeader('Đổi ngày âm ↔ dương', '#/tienich', 'Kèm thứ, can chi, tháng nhuận')}
  <main class="body">${converterCard(true)}</main>
</div>`;
}

export function mountConvert(root, rerender) {
  root.addEventListener('change', (e) => { if (onConverterEvent(e)) rerender(); });
  root.addEventListener('click', (e) => { if (e.target.closest('[data-cvdir]')) { onConverterEvent(e); rerender(); } });
}

export function toggleConverter() { cv.open = !cv.open; return cv.open; }
export const converterOpen = () => cv.open;

export function onConverterEvent(e) {
  const d = e.target.closest('[data-cvdir]');
  if (d) { cv.dir = d.dataset.cvdir; if (cv.dir === 'a2d') { const l = solarToLunar(cv.d, cv.m, cv.y); cv.d = l.day; cv.m = l.month; cv.y = l.year; } return true; }
  const f = e.target.closest('[data-cv]');
  if (f && e.type === 'change') {
    const k = f.dataset.cv;
    if (k === 'leap') cv.leap = f.checked; else cv[k] = Number(f.value);
    return true;
  }
  return false;
}

/* ============ THIỆP MỜI GIỖ ============ */
const inv = {};

function invData(gid) {
  const st = getState();
  const g = st.gios.find((x) => x.id === gid);
  if (!g) return null;
  const nx = nextGioDate({ ...g, repeat: 'yearly' }, todayJd());
  inv[gid] ||= { time: '10:30', place: st.settings.address || '', host: st.settings.hostName || st.profile.name || '', msg: '' };
  return { g, nx, f: inv[gid] };
}

export function renderInvite(params) {
  const d = invData(params.id);
  if (!d) {
    const list = getState().gios.filter((g) => (g.type || 'gio') === 'gio');
    return `<div class="screen no-nav" data-screen="invite">${backHeader('Thiệp mời giỗ', '#/tienich', 'Chọn ngày giỗ để tạo thiệp')}<main class="body">
      ${list.length ? `<section class="card list">${list.map((g) => `<a class="item" href="#/thiep/${esc(g.id)}">${ICON.card(20)}<span class="grow t">${esc(titleOf(g))}</span>${ICON.next(18)}</a>`).join('')}</section>`
        : `<div class="empty">Chưa có ngày giỗ nào. <a class="link" href="#/add?type=gio">Thêm ngày giỗ</a></div>`}</main></div>`;
  }
  const { f } = d;
  return `<div class="screen no-nav" data-screen="invite">
  ${backHeader('Thiệp mời ' + titleOf(d.g).replace(/^./, (c) => c.toLowerCase()), `#/edit/${d.g.id}`, 'Tạo ảnh gửi họ hàng qua Zalo, Messenger')}
  <main class="body" style="gap:14px">
    <div class="invite-wrap"><canvas id="inv-cv" width="1080" height="1350" role="img" aria-label="Ảnh thiệp mời"></canvas></div>
    <div class="grid2">
      <div class="field"><label class="lb" for="inv-time">Giờ</label><input id="inv-time" class="input" data-inv="time" value="${esc(f.time)}" maxlength="20"></div>
      <div class="field"><label class="lb" for="inv-host">Gia đình</label><input id="inv-host" class="input" data-inv="host" value="${esc(f.host)}" maxlength="40" placeholder="Tên gia chủ"></div>
    </div>
    <div class="field"><label class="lb" for="inv-place">Địa điểm</label><input id="inv-place" class="input" data-inv="place" value="${esc(f.place)}" maxlength="90" placeholder="Địa chỉ nhà thờ / nhà riêng"></div>
    <div class="field"><label class="lb" for="inv-msg">Lời nhắn (tùy ý)</label><input id="inv-msg" class="input" data-inv="msg" value="${esc(f.msg)}" maxlength="80" placeholder="Rất mong cả nhà sắp xếp về dự"></div>
  </main>
  <div class="bottom-bar row" style="gap:10px"><button type="button" class="btn ghost" data-act="inv-text" style="flex:1">Gửi chữ</button><button type="button" class="btn" data-act="inv-img" style="flex:2">${ICON.share(18)} Gửi ảnh thiệp</button></div>
</div>`;
}

function wrap(ctx, text, maxW) {
  const words = text.split(' '); const lines = []; let line = '';
  for (const w of words) { const t = line ? line + ' ' + w : w; if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t; }
  if (line) lines.push(line);
  return lines;
}

async function drawInvite(cv, d) {
  const { g, nx, f } = d;
  try { await Promise.all(['700 60px "Noto Serif"', '500 40px "Be Vietnam Pro"', '700 40px "Be Vietnam Pro"'].map((x) => document.fonts.load(x))); } catch { /* dùng font dự phòng */ }
  const c = cv.getContext('2d'); const W = 1080, H = 1350;
  const bg = c.createLinearGradient(0, 0, W, H); bg.addColorStop(0, '#C8392C'); bg.addColorStop(.48, '#9B1A12'); bg.addColorStop(1, '#5E0B07');
  c.fillStyle = bg; c.fillRect(0, 0, W, H);
  const glow = c.createRadialGradient(W / 2, 330, 40, W / 2, 330, 640); glow.addColorStop(0, 'rgba(255,214,140,.28)'); glow.addColorStop(1, 'rgba(255,214,140,0)');
  c.fillStyle = glow; c.fillRect(0, 0, W, H);
  const gold = c.createLinearGradient(0, 0, W, 0); gold.addColorStop(0, '#E9C46A'); gold.addColorStop(.5, '#FFF1C1'); gold.addColorStop(1, '#D4A537');
  c.strokeStyle = gold; c.lineWidth = 6; c.strokeRect(44, 44, W - 88, H - 88); c.lineWidth = 2; c.strokeRect(64, 64, W - 128, H - 128);
  [[64, 64], [W - 64, 64], [64, H - 64], [W - 64, H - 64]].forEach(([x, y]) => { c.fillStyle = gold; c.beginPath(); c.arc(x, y, 12, 0, 7); c.fill(); });
  c.textAlign = 'center'; c.fillStyle = '#F6E3B4';
  c.font = '600 34px "Be Vietnam Pro", sans-serif'; c.fillText('T H I Ệ P   M Ờ I', W / 2, 190);
  c.fillStyle = gold; c.beginPath(); c.arc(W / 2, 250, 30, 0, 7); c.fill();
  c.fillStyle = '#FFF8EA'; c.font = '500 38px "Be Vietnam Pro", sans-serif'; c.fillText('Kính mời quý họ hàng, bà con đến dự', W / 2, 350);
  c.fillStyle = gold; c.font = '700 92px "Noto Serif", serif'; c.fillText('LỄ GIỖ', W / 2, 480);
  const who = withRel(g);
  c.fillStyle = '#FFFFFF'; c.font = '700 64px "Noto Serif", serif';
  let y = 580; wrap(c, who, W - 220).slice(0, 2).forEach((ln) => { c.fillText(ln, W / 2, y); y += 78; });
  y += 20;
  c.strokeStyle = 'rgba(246,227,180,.5)'; c.lineWidth = 2; c.beginPath(); c.moveTo(300, y - 20); c.lineTo(W - 300, y - 20); c.stroke();
  if (nx) {
    c.fillStyle = '#FFF8EA'; c.font = '700 48px "Be Vietnam Pro", sans-serif';
    c.fillText(`${THU[(nx.jd + 1) % 7]}, ${nx.solar.day}/${nx.solar.month}/${nx.solar.year}`, W / 2, y + 50);
    c.font = '500 36px "Be Vietnam Pro", sans-serif'; c.fillStyle = '#F6E3B4';
    c.fillText(`(Tức ngày ${nx.lunar.day} tháng ${LUNAR_MONTH_NAME[nx.lunar.month]} năm ${canChiYear(nx.lunar.year)})`, W / 2, y + 106);
    y += 180;
  }
  c.fillStyle = '#FFF8EA'; c.font = '500 38px "Be Vietnam Pro", sans-serif';
  if (f.time) { c.fillText('Thời gian: ' + f.time, W / 2, y); y += 62; }
  if (f.place) { wrap(c, 'Tại: ' + f.place, W - 240).slice(0, 3).forEach((ln) => { c.fillText(ln, W / 2, y); y += 54; }); y += 8; }
  if (f.msg) { c.font = 'italic 500 36px "Be Vietnam Pro", sans-serif'; c.fillStyle = '#F6E3B4'; wrap(c, '“' + f.msg + '”', W - 260).slice(0, 2).forEach((ln) => { c.fillText(ln, W / 2, y); y += 50; }); }
  if (f.host) { c.font = '700 40px "Be Vietnam Pro", sans-serif'; c.fillStyle = gold; c.fillText('Gia đình ' + f.host + ' kính mời', W / 2, H - 170); }
  c.font = '500 24px "Be Vietnam Pro", sans-serif'; c.fillStyle = 'rgba(246,227,180,.65)'; c.fillText('Lịch Âm & Nhắc Giỗ', W / 2, H - 96);
}

function inviteText(d) {
  const { g, nx, f } = d;
  const who = withRel(g);
  return [`KÍNH MỜI dự LỄ GIỖ ${who.toUpperCase()}`,
    nx ? `Vào ${THU[(nx.jd + 1) % 7]}, ${nx.solar.day}/${nx.solar.month}/${nx.solar.year} (tức ${nx.lunar.day}/${nx.lunar.month} âm lịch năm ${canChiYear(nx.lunar.year)})` : '',
    f.time ? 'Thời gian: ' + f.time : '', f.place ? 'Tại: ' + f.place : '', f.msg, f.host ? `Gia đình ${f.host} kính mời.` : ''].filter(Boolean).join('\n');
}

export function mountInvite(root, rerender, params) {
  const d = invData(params.id);
  if (!d) return;
  const cv = root.querySelector('#inv-cv');
  let t = null;
  const redraw = () => { clearTimeout(t); t = setTimeout(() => drawInvite(cv, d), 120); };
  drawInvite(cv, d);
  root.addEventListener('input', (e) => { const k = e.target.dataset.inv; if (k) { d.f[k] = e.target.value; redraw(); } });
  root.addEventListener('click', async (e) => {
    const act = e.target.closest('[data-act]')?.dataset.act;
    if (act === 'inv-text') {
      const text = inviteText(d);
      if (navigator.share) { try { await navigator.share({ text }); return; } catch { /* hủy */ } }
      try { await navigator.clipboard.writeText(text); toast('Đã sao chép lời mời'); } catch { /* */ }
    }
    if (act === 'inv-img') {
      await drawInvite(cv, d);
      const name = `thiep-moi-gio-${d.g.id}.png`;
      const dataUrl = cv.toDataURL('image/png');
      try {
        if (isNative()) {
          const { Filesystem, Directory } = await import('@capacitor/filesystem');
          const { Share } = await import('@capacitor/share');
          const w = await Filesystem.writeFile({ path: name, data: dataUrl.split(',')[1], directory: Directory.Cache });
          await Share.share({ title: 'Thiệp mời giỗ', text: inviteText(d), files: [w.uri], dialogTitle: 'Gửi thiệp qua…' });
          return;
        }
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], name, { type: 'image/png' });
        if (navigator.canShare?.({ files: [file] })) { await navigator.share({ files: [file], title: 'Thiệp mời giỗ' }); return; }
        const a = document.createElement('a'); a.href = dataUrl; a.download = name; document.body.appendChild(a); a.click(); a.remove();
        toast('Đã lưu ảnh thiệp');
      } catch (err) { if (!/cancel|abort/i.test(String(err?.message || err?.name))) toast('Không gửi được ảnh'); }
    }
  });
}

/* ============ Lối tắt tiện ích trên màn Hôm nay ============ */
export function toolsRow() {
  const ids = pinned();
  return `<section class="col" style="gap:8px" aria-label="Tiện ích nhanh">
    <div class="h2row"><h2 class="h">Tiện ích nhanh</h2><a class="link" href="#/ghim">Tùy chỉnh</a></div>
    ${ids.length ? `<div class="tools">${ids.map((id) => pinTile(id, cv.open)).join('')}</div>`
      : `<a class="card pad row" href="#/ghim" style="text-decoration:none;color:var(--ink);gap:12px"><span class="pastel sm butter">${ILL.star()}</span><span class="grow col"><b>Chọn tiện ích hay dùng</b><span class="small muted">Ghim văn khấn, ngày tốt, gia phả… ra trang này</span></span>${ICON.next(18)}</a>`}
  </section>`;
}

