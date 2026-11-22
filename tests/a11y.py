"""Kiểm định trợ năng (axe-core) + cỡ chữ tối thiểu, cho mọi màn hình ở chế độ sáng và tối.
Chạy: python3 tests/a11y.py dist
"""
import sys, json, threading, http.server, functools, socketserver
from playwright.sync_api import sync_playwright

DIST = sys.argv[1]
AXE = 'node_modules/axe-core/axe.min.js'
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
srv = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Q, directory=DIST))
threading.Thread(target=srv.serve_forever, daemon=True).start()
BASE = f'http://127.0.0.1:{srv.server_address[1]}/index.html'

SEED = {
  'version': 1, 'onboarded': True,
  'profile': {'name': 'Nguyễn Minh Khôi', 'dob': '1996-08-18', 'hourChi': 6, 'gender': 'Nam'},
  'gios': [{'id': 'g1', 'name': 'Ông nội', 'rel': 'Ông', 'cal': 'am', 'day': 18, 'month': 10, 'year': '', 'leap': False, 'remind': [0, 3], 'time': '07:00', 'repeat': 'yearly', 'note': '', 'enabled': True}],
  'disabled': {}, 'settings': {}
}
SCREENS = ['today', 'calendar', 'reminders', 'add', 'edit/g1', 'culture', 'profile', 'tuvi', 'numerology', 'iching', 'donate', 'settings', 'contacts', 'add?type=sinhnhat', 'vankhan', 'vankhan/gio?gid=g1', 'vankhan/ram?tab=mam', 'ngaytot', 'thiep/g1', 'chiase', 'nhap', 'gopy', 'vankhan/daythang', 'vankhan/giohet', 'tienich', 'doingay', 'thiep', 'hieuhi', 'hieuhi/new', 'chuanbi', 'chuanbi/g1', 'tuongnho', 'tuongnho/g1', 'giapha', 'giapha/new', 'xemtuoi', 'vankhan/tet?tab=mam', 'saohan', 'chuanbitet', 'xongdat', 'xuathanh', 'anchay', 'menh', 'vankhan?g=chua', 'vankhan/thanhmau', 'vankhan/giaihan?sao=kedo&han=thienla&tuoi=Canh%20Ng%E1%BB%8D']
MIN_PX = 12

def run():
    problems = []
    with sync_playwright() as p:
        b = p.chromium.launch()
        for theme in ['light', 'dark']:
            seed = dict(SEED); seed['settings'] = {'theme': theme}
            ctx = b.new_context(viewport={'width': 390, 'height': 844}, bypass_csp=True, locale='vi-VN', timezone_id='Asia/Ho_Chi_Minh')
            ctx.add_init_script(f"localStorage.setItem('lamng.v1', {json.dumps(json.dumps(seed))});")
            pg = ctx.new_page()
            pg.clock.install(time='2026-11-21T20:00:00+07:00')
            for sc in SCREENS + ['welcome']:
                if sc == 'welcome':
                    c2 = b.new_context(viewport={'width': 390, 'height': 844}, bypass_csp=True, color_scheme=theme)
                    c2.add_init_script(f"localStorage.setItem('lamng.v1', {json.dumps(json.dumps({'onboarded': False, 'settings': {'theme': theme}}))});")
                    pg.close(); pg = c2.new_page(); pg.goto(BASE)
                else:
                    pg.goto(BASE + '#/' + sc)
                pg.wait_for_selector('[data-screen]')
                if sc == 'iching': pg.click('[data-act="all"]')
                pg.wait_for_timeout(350)
                pg.add_script_tag(path=AXE)
                res = pg.evaluate("""async () => {
                  const r = await axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'], rules: { 'region': { enabled: false } } });
                  return r.violations.map(v => ({ id: v.id, impact: v.impact, n: v.nodes.length, ex: v.nodes.slice(0, 2).map(n => n.target.join(' ') + ' :: ' + (n.failureSummary || '').slice(0, 160)) }));
                }""")
                small = pg.evaluate(f"""() => {{
                  const out = [];
                  for (const el of document.querySelectorAll('#app *')) {{
                    if (!el.childNodes.length || el.closest('.sr')) continue;
                    const own = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
                    if (!own) continue;
                    const r = el.getBoundingClientRect(); if (!r.width || !r.height) continue;
                    const fs = parseFloat(getComputedStyle(el).fontSize);
                    if (fs < {MIN_PX}) out.push(el.tagName + '.' + el.className + ' "' + el.textContent.trim().slice(0, 20) + '" ' + fs + 'px');
                  }}
                  return out.slice(0, 5);
                }}""")
                for v in res: problems.append((theme, sc, 'axe:' + v['id'], v['impact'], v['n'], v['ex']))
                if small: problems.append((theme, sc, 'chữ < 12px', '', len(small), small))
                print(f'{theme:5s} {sc:11s} axe={len(res)} chữ-nhỏ={len(small)}')
            ctx.close()
        b.close()
    srv.shutdown()
    print()
    for pr in problems: print('VẤN ĐỀ', pr)
    print('\nKẾT QUẢ:', 'ĐẠT — không có vi phạm' if not problems else f'{len(problems)} vấn đề')
    return 0 if not problems else 1

sys.exit(run())
