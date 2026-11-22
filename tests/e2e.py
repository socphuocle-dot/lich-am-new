"""Kiểm thử giao diện từ đầu đến cuối, chặn toàn bộ mạng ngoài (giả lập offline).
Chạy: python3 tests/e2e.py <thư mục dist> <thư mục ảnh chụp>
"""
import sys, os, re, json, threading, http.server, functools, socketserver
from playwright.sync_api import sync_playwright, expect

DIST, SHOTS = sys.argv[1], sys.argv[2]
os.makedirs(SHOTS, exist_ok=True)

class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
handler = functools.partial(Quiet, directory=DIST)
srv = socketserver.TCPServer(('127.0.0.1', 0), handler)
PORT = srv.server_address[1]
threading.Thread(target=srv.serve_forever, daemon=True).start()
BASE = f'http://127.0.0.1:{PORT}/index.html'

results = []
def check(name, fn):
    try:
        fn(); results.append((name, True, '')); print('PASS', name)
    except Exception as e:
        results.append((name, False, str(e)[:300])); print('FAIL', name, '->', str(e)[:300])

with sync_playwright() as p:
    browser = p.chromium.launch()
    for vp_name, vp in [('390x844', {'width': 390, 'height': 844}), ('360x740', {'width': 360, 'height': 740})]:
        ctx = browser.new_context(viewport=vp, device_scale_factor=2, locale='vi-VN', timezone_id='Asia/Ho_Chi_Minh', service_workers='block', permissions=['clipboard-read', 'clipboard-write'])
        external = []
        def route(r):
            if r.request.url.startswith(f'http://127.0.0.1:{PORT}'):
                return r.continue_()
            external.append(r.request.url); return r.abort()
        ctx.route('**/*', route)
        page = ctx.new_page()
        page.clock.install(time='2026-11-21T20:00:00+07:00')
        errors = []
        page.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
        page.on('pageerror', lambda e: errors.append(str(e)))
        shot = lambda n: page.screenshot(path=f'{SHOTS}/{vp_name}-{n}.png', full_page=False) if vp_name == '390x844' or n in ('today', 'tuvi', 'calendar') else None
        def no_hscroll():
            sw = page.evaluate('document.documentElement.scrollWidth'); iw = page.evaluate('innerWidth')
            assert sw <= iw + 1, f'tràn ngang {sw}>{iw}'
        page.goto(BASE)
        def t_welcome():
            page.wait_for_selector('[data-screen="welcome"]')
            shot('welcome')
            page.click('[data-act="next"]'); page.click('[data-act="next"]')
            expect(page.locator('[data-act="allow"]')).to_be_visible()
            shot('welcome-3')
            page.click('[data-act="later"]')
            page.wait_for_selector('[data-screen="today"]')
            page.goto(BASE + '#/welcome'); page.wait_for_selector('[data-screen="today"]')  # đã xem rồi thì không hiện lại
        check(f'[{vp_name}] Màn chào 3 bước, chỉ hiện lần đầu', t_welcome)

        def t_today():
            expect(page.locator('[data-test="lunar"]')).to_contain_text('13')
            expect(page.locator('.sheet-foot')).to_contain_text('Kỷ Hợi')
            expect(page.locator('.sheet-foot')).to_contain_text('Bính Ngọ')
            expect(page.locator('.pill').first).to_contain_text('Hoàng đạo')
            expect(page.locator('.hours .hour')).to_have_count(6)
            expect(page.locator('.hour.now')).to_contain_text('Tuất')  # 20:00 thuộc giờ Tuất
            expect(page.get_by_text('Rằm tháng Mười · Tết Hạ Nguyên').first).to_be_visible()
            fonts = page.evaluate("document.fonts.check('16px \"Be Vietnam Pro\"')")
            assert fonts, 'font chưa nạp'
            no_hscroll(); shot('today')
        check(f'[{vp_name}] Hôm nay hiển thị đúng 13/10 âm, Kỷ Hợi, giờ Tuất', t_today)

        def t_add_validation():
            page.click('a.fab')
            page.wait_for_selector('[data-screen="gio-form"]')
            page.click('[data-act="save"]')
            expect(page.locator('.err')).to_contain_text('Vui lòng nhập tên')
        check(f'[{vp_name}] Báo lỗi khi chưa nhập tên', t_add_validation)

        def t_add_gio():
            page.fill('#g-name', 'Ông nội <b>test</b>')
            page.select_option('select[data-f="day"]', '18')
            page.select_option('select[data-f="month"]', '10')
            expect(page.locator('[data-test="preview"]')).to_contain_text('26/11/2026')
            expect(page.locator('[data-test="preview"]')).to_contain_text('còn 5 ngày')
            page.click('[data-rem="7"]')
            shot('add')
            page.click('[data-act="save"]')
            page.wait_for_selector('[data-screen="reminders"]')
            expect(page.get_by_text('Giỗ Ông nội <b>test</b>').first).to_be_visible()  # tên được escape, không chèn HTML
            assert page.locator('b:text-is("test")').count() == 0
            shot('reminders')
        check(f'[{vp_name}] Thêm giỗ âm 18/10 → 26/11/2026', t_add_gio)

        def t_persist():
            page.reload(); page.wait_for_selector('[data-screen="reminders"]')
            expect(page.get_by_text('Giỗ Ông nội <b>test</b>').first).to_be_visible()
            page.goto(BASE + '#/today'); page.wait_for_selector('[data-screen="today"]')
            expect(page.get_by_text('Giỗ Ông nội <b>test</b>').first).to_be_visible()
        check(f'[{vp_name}] Dữ liệu còn sau khi tải lại', t_persist)

        def t_edit_delete():
            page.goto(BASE + '#/reminders'); page.wait_for_selector('[data-screen="reminders"]')
            page.locator('a.item[href^="#/edit/"]').first.click()
            page.wait_for_selector('[data-screen="gio-form"]')
            expect(page.locator('#g-name')).to_have_value('Ông nội <b>test</b>')
            page.fill('#g-name', 'Ông nội')
            page.click('[data-act="save"]'); page.wait_for_selector('[data-screen="reminders"]')
            expect(page.get_by_text('Giỗ Ông nội').first).to_be_visible()
            # thêm giỗ dương để xóa
            page.goto(BASE + '#/add'); page.wait_for_selector('[data-screen="gio-form"]')
            page.fill('#g-name', 'Xoa thu'); page.click('[data-cal="duong"]')
            page.select_option('select[data-f="day"]', '31'); page.select_option('select[data-f="month"]', '2')
            page.click('[data-act="save"]')
            expect(page.locator('.err')).to_contain_text('chỉ có')
            page.select_option('select[data-f="day"]', '1')
            page.click('[data-act="save"]'); page.wait_for_selector('[data-screen="reminders"]')
            page.locator('a.item[href^="#/edit/"]', has_text='Xoa thu').first.click()
            page.wait_for_selector('[data-act="delete"]')
            page.click('[data-act="delete"]')
            expect(page.locator('.sheet-dialog')).to_contain_text('Xóa giỗ Xoa thu?')
            shot('confirm')
            page.click('[data-cancel]'); expect(page.locator('.sheet-dialog')).to_have_count(0)
            page.click('[data-act="delete"]'); page.click('[data-ok]')
            page.wait_for_selector('[data-screen="reminders"]')
            assert page.locator('.item .t', has_text='Giỗ Xoa thu').count() == 0
            page.click('.toast button')  # Hoàn tác
            expect(page.locator('.item .t', has_text='Giỗ Xoa thu').first).to_be_visible()
            page.locator('a.item[href^="#/edit/"]', has_text='Xoa thu').first.click()
            page.click('[data-act="delete"]'); page.click('[data-ok]'); page.wait_for_selector('[data-screen="reminders"]')
            page.wait_for_timeout(300)
            assert page.locator('.item .t', has_text='Giỗ Xoa thu').count() == 0
        check(f'[{vp_name}] Sửa, kiểm tra ngày dương sai, xóa giỗ', t_edit_delete)

        def t_calendar():
            page.click('nav a[href="#/calendar"]'); page.wait_for_selector('[data-screen="calendar"]')
            expect(page.locator('h1')).to_have_text('Tháng 11, 2026')
            expect(page.locator('.cell.today')).to_contain_text('21')
            page.locator('.cell[data-jd]', has_text=re.compile(r'^23')).first.click()
            expect(page.locator('[data-test="detail"]')).to_contain_text('Rằm tháng Mười')
            expect(page.locator('[data-test="detail"]')).to_contain_text('15')
            page.locator('.cell[data-jd]', has_text=re.compile(r'^26')).first.click()
            expect(page.locator('[data-test="detail"]')).to_contain_text('Giỗ Ông nội')
            shot('calendar'); no_hscroll()
            page.click('[data-act="next"]'); page.click('[data-act="next"]'); page.click('[data-act="next"]')
            expect(page.locator('h1')).to_have_text('Tháng 2, 2027')
            page.locator('.cell[data-jd]', has_text=re.compile(r'^6')).first.click()
            expect(page.locator('[data-test="detail"]')).to_contain_text('Tết Nguyên Đán')
            page.click('[data-act="today"]')
            expect(page.locator('h1')).to_have_text('Tháng 11, 2026')
        check(f'[{vp_name}] Lịch tháng: rằm 23/11, giỗ 26/11, Tết 6/2/2027', t_calendar)

        def t_reminders():
            page.click('nav a[href="#/reminders"]'); page.wait_for_selector('[data-screen="reminders"]')
            page.click('[data-filter="gio"]')
            assert page.locator('.tile.ink').count() >= 1
            assert page.get_by_text('Mùng 1 tháng Một').count() == 0
            page.click('[data-filter="moon"]')
            expect(page.get_by_text('Mùng 1 tháng Một').first).to_be_visible()
            page.click('[data-set="autoMoon"]')
            expect(page.locator('[data-set="autoMoon"]')).to_have_attribute('aria-checked', 'false')
            page.click('[data-set="autoMoon"]')
            expect(page.locator('[data-set="autoMoon"]')).to_have_attribute('aria-checked', 'true')
            sw = page.locator('[data-key^="moon-"]').first
            sw.click(); expect(sw).to_have_attribute('aria-checked', 'false')
            page.locator('[data-key^="moon-"]').first.click()
            page.click('[data-filter="all"]')
        check(f'[{vp_name}] Lọc nhắc việc, bật/tắt nhắc', t_reminders)

        def t_culture():
            page.click('nav a[href="#/tienich"]'); page.wait_for_selector('[data-screen="hub"]')
            expect(page.locator('a[href="tel:0903545334"]')).to_be_visible()
            shot('tienich')
            page.click('a.svc[href="#/culture"]'); page.wait_for_selector('[data-screen="culture"]')
            shot('culture')
            page.goto(BASE + '#/tuvi'); page.wait_for_selector('[data-screen="profile"]')
            page.click('[data-act="save"]')
            expect(page.locator('#p-err')).to_contain_text('họ tên')
            page.fill('#p-name', 'Nguyễn Minh Khôi'); page.fill('#p-dob', '1996-08-18')
            page.select_option('#p-hour', '6')
            page.click('[data-act="save"]'); page.wait_for_selector('[data-screen="culture"]')
            page.click('a[href="#/tuvi"]'); page.wait_for_selector('[data-test="tuvi-grid"]')
            expect(page.locator('.palace')).to_have_count(12)
            expect(page.locator('.palace[aria-pressed="true"]')).to_contain_text('Mệnh')
            expect(page.locator('.palace[aria-pressed="true"]')).to_contain_text('Tử Vi')
            expect(page.locator('.tv-center')).to_contain_text('Mộc Tam Cục')
            page.locator('.palace', has_text='Quan Lộc').click()
            expect(page.locator('section[aria-live="polite"]')).to_contain_text('Hóa Kỵ')
            no_hscroll(); shot('tuvi')
            page.goto(BASE + '#/numerology'); page.wait_for_selector('[data-test="num-main"]')
            expect(page.locator('[data-test="num-main"]')).to_have_text('6')
            page.click('[data-i="1"]'); expect(page.locator('[data-test="num-main"]')).to_have_text('11')
            shot('numerology')
            page.goto(BASE + '#/iching'); page.wait_for_selector('[data-screen="iching"]')
            for i in range(6): page.click('[data-act="one"]')
            expect(page.locator('[data-test="status"]')).to_have_text('Đã đủ 6 hào')
            expect(page.locator('[data-test="result"]')).to_contain_text('QUẺ CHỦ')
            page.click('[data-act="all"]')
            expect(page.locator('[data-test="result"]')).to_be_visible()
            shot('iching')
        check(f'[{vp_name}] Văn hóa: hồ sơ, Tử Vi 12 cung, Thần số 6/11, Kinh Dịch', t_culture)

        def wait_qr():
            import time
            for _ in range(50):
                if page.locator('[data-test="qr"]').evaluate('i => i.complete && i.naturalWidth > 100'): return
                time.sleep(0.1)
            raise AssertionError('Ảnh QR không tải được')
        def t_donate():
            page.goto(BASE + '#/culture'); page.click('nav a[href="#/donate"]'); page.wait_for_selector('[data-screen="donate"]')
            img = page.locator('[data-test="qr"]')
            expect(img).to_be_visible()
            wait_qr()
            page.click('[data-acct="1"]')
            expect(page.locator('[data-screen="donate"]')).to_contain_text('0371000405296')
            wait_qr()
            shot('donate'); no_hscroll()
        check(f'[{vp_name}] Ủng hộ: mã QR MoMo + Vietcombank hiện đủ', t_donate)

        def t_settings():
            page.goto(BASE + '#/settings'); page.wait_for_selector('[data-screen="settings"]')
            expect(page.locator('[data-test="pending"]')).to_contain_text('60 thông báo')
            page.select_option('#s-cd', 'tet')
            assert json.loads(page.evaluate("localStorage.getItem('lamng.v1')"))['settings']['widgetCountdown'] == 'tet'
            page.click('[data-seg="theme"][data-v="dark"]')
            assert page.evaluate('document.documentElement.dataset.theme') == 'dark'
            shot('settings-dark')
            page.goto(BASE + '#/today'); page.wait_for_selector('[data-screen="today"]'); shot('today-dark')
            page.goto(BASE + '#/settings'); page.wait_for_selector('[data-screen="settings"]')
            page.click('[data-seg="theme"][data-v="light"]')
            page.click('[data-seg="size"][data-v="2"]')
            assert page.evaluate('document.documentElement.dataset.size') == '2'
            page.goto(BASE + '#/today'); page.wait_for_selector('[data-screen="today"]'); no_hscroll(); shot('today-bigtext')
            page.goto(BASE + '#/settings'); page.wait_for_selector('[data-screen="settings"]')
            page.click('[data-seg="size"][data-v="1"]')
            page.click('[data-tg="culture"]')
            page.goto(BASE + '#/tienich'); page.wait_for_selector('[data-screen="hub"]')
            assert page.locator('a.svc[href="#/culture"]').count() == 0
            page.goto(BASE + '#/tuvi'); page.wait_for_selector('[data-screen="today"]')
            page.goto(BASE + '#/settings'); page.click('[data-tg="culture"]')
            with page.expect_download() as dl:
                page.click('[data-act="export"]')
            data = json.loads(open(dl.value.path()).read())
            assert len(data['data']['gios']) == 1
        check(f'[{vp_name}] Cài đặt: tối, chữ lớn, ẩn Văn hóa, sao lưu', t_settings)

        def t_import_reset():
            page.goto(BASE + '#/settings'); page.wait_for_selector('[data-screen="settings"]')
            backup = page.evaluate("localStorage.getItem('lamng.v1')")
            page.click('[data-act="reset"]'); page.click('[data-ok]'); page.wait_for_selector('[data-screen="welcome"]')
            page.click('[data-act="skip"]'); page.click('[data-act="later"]'); page.wait_for_selector('[data-screen="today"]')
            assert json.loads(page.evaluate("localStorage.getItem('lamng.v1')"))['gios'] == []
            page.goto(BASE + '#/settings'); page.wait_for_selector('[data-screen="settings"]')
            path = f'{SHOTS}/_backup.json'; open(path, 'w').write(json.dumps({'data': json.loads(backup)}))
            page.set_input_files('input[data-act="import"]', path)
            page.wait_for_selector('[data-screen="reminders"]')
            expect(page.get_by_text('Giỗ Ông nội').first).to_be_visible()
            os.remove(path)
        check(f'[{vp_name}] Xóa dữ liệu và khôi phục từ file', t_import_reset)

        def t_back():
            page.goto(BASE + '#/today'); page.wait_for_selector('[data-screen="today"]')
            page.click('a.fab'); page.wait_for_selector('[data-screen="gio-form"]')
            page.click('[data-back]'); page.wait_for_selector('[data-screen="today"]')
            page.click('a[href="#/settings"]'); page.wait_for_selector('[data-screen="settings"]')
            page.click('[data-back]'); page.wait_for_selector('[data-screen="today"]')
            page.goto(BASE + '#/culture'); page.click('a[href="#/iching"]'); page.wait_for_selector('[data-screen="iching"]')
            page.click('[data-back]'); page.wait_for_selector('[data-screen="culture"]')
            # mở thẳng link (không có lịch sử) → về trang dự phòng
            page2 = ctx.new_page(); page2.clock.install(time='2026-11-21T20:00:00+07:00')
            page2.goto(BASE + '#/add'); page2.wait_for_selector('[data-screen="gio-form"]')
            page2.click('[data-back]'); page2.wait_for_selector('[data-screen="reminders"]')
            page2.close()
        check(f'[{vp_name}] Nút quay lại hoạt động ở mọi màn', t_back)

        def t_types():
            page.goto(BASE + '#/add'); page.wait_for_selector('[data-screen="gio-form"]')
            page.click('[data-type="sinhnhat"]')
            expect(page.locator('label[for="g-name"]')).to_have_text('Tên người')
            expect(page.locator('[data-cal="duong"]')).to_have_attribute('aria-pressed', 'true')
            page.fill('#g-name', 'Bé Na')
            page.select_option('select[data-f="day"]', '5'); page.select_option('select[data-f="month"]', '6')
            page.click('[data-act="save"]'); page.wait_for_selector('[data-screen="reminders"]')
            expect(page.get_by_text('Sinh nhật Bé Na').first).to_be_visible()
            page.goto(BASE + '#/add'); page.wait_for_selector('[data-screen="gio-form"]')
            page.click('[data-type="kyniem"]')
            expect(page.locator('[data-rel]')).to_have_count(0)
            expect(page.locator('label[for="g-name"]')).to_have_text('Tên sự kiện')
            shot('form-kyniem')
            page.click('[data-back]')
            page.goto(BASE + '#/settings'); page.wait_for_selector('[data-screen="settings"]')
            expect(page.get_by_text('Đồng bộ & sao lưu')).to_be_visible()
            page.click('a[href="#/contacts"]'); page.wait_for_selector('[data-screen="contacts"]')
            expect(page.get_by_text('Chỉ có trong app điện thoại')).to_be_visible()
            page.click('[data-back]'); page.wait_for_selector('[data-screen="settings"]')
            st = json.loads(page.evaluate("localStorage.getItem('lamng.v1')"))
            assert any(g.get('type') == 'sinhnhat' and g['name'] == 'Bé Na' for g in st['gios'])
            no_hscroll()
        check(f'[{vp_name}] Sinh nhật, kỷ niệm, màn đồng bộ & danh bạ', t_types)

        def t_tools():
            page.goto(BASE + '#/today'); page.wait_for_selector('[data-screen="today"]')
            page.click('[data-act="conv"]')
            expect(page.locator('[data-test="conv"]')).to_contain_text('13 tháng Mười')
            page.click('[data-cvdir="a2d"]')
            page.select_option('select[data-cv="d"]', '15'); page.select_option('select[data-cv="m"]', '10'); page.select_option('select[data-cv="y"]', '2026')
            expect(page.locator('[data-test="conv"]')).to_contain_text('23/11/2026')
            no_hscroll()
            page.click('a.tool[href="#/vankhan"]'); page.wait_for_selector('[data-screen="vankhan-list"]')
            page.click('a[href="#/vankhan/ram"]'); page.wait_for_selector('[data-screen="vankhan"]')
            expect(page.locator('.vk-text mark').first).to_be_visible()
            page.fill('#vk-host', 'Nguyễn Văn An'); page.locator('#vk-host').dispatch_event('change')
            page.fill('#vk-addr', 'số 1 Lê Lợi, Huế'); page.locator('#vk-addr').dispatch_event('change')
            expect(page.locator('.vk-text')).to_contain_text('Tín chủ con là Nguyễn Văn An, ngụ tại số 1 Lê Lợi, Huế.')
            expect(page.locator('.vk-text')).to_contain_text('năm Bính Ngọ')
            assert page.locator('.vk-text mark').count() == 0
            page.click('[data-tab="mam"]'); page.locator('[data-ck="0"]').click()
            expect(page.locator('[data-ck="0"]')).to_have_attribute('aria-checked', 'true')
            shot('vankhan')
            page.goto(BASE + '#/ngaytot'); page.wait_for_selector('[data-screen="goodday"]')
            page.click('[data-gact="khaitruong"]')
            assert page.locator('[data-gopen]').count() > 0
            page.locator('[data-gopen]').first.click()
            expect(page.locator('.gd-detail')).to_contain_text('Giờ tốt')
            no_hscroll(); shot('ngaytot')
            # Nhấn giữ một ngày trên lịch → thêm nhanh
            page.goto(BASE + '#/calendar'); page.wait_for_selector('[data-screen="calendar"]')
            if page.locator('[data-act="today"]').count(): page.click('[data-act="today"]')
            cell = page.locator('.cell[aria-label^="Ngày 26 tháng 11,"]')
            box = cell.bounding_box()
            page.mouse.move(box['x'] + 10, box['y'] + 10); page.mouse.down(); page.wait_for_timeout(700); page.mouse.up()
            page.wait_for_selector('.sheet-dialog')
            page.locator('.sheet-dialog [data-i="0"]').click()
            page.wait_for_selector('[data-screen="gio-form"]')
            expect(page.locator('select[data-f="day"]')).to_have_value('18')
            page.fill('#g-name', 'Cụ Tổ'); page.click('[data-side="noi"]'); page.click('[data-act="save"]')
            page.wait_for_selector('[data-screen="reminders"]')
            expect(page.get_by_text('Bên Nội')).to_be_visible()
            page.locator('a.item[href^="#/edit/"]', has_text='Giỗ Cụ Tổ').first.click()
            page.click('a[href^="#/thiep/"]'); page.wait_for_selector('[data-screen="invite"] canvas')
            page.fill('#inv-time', '11:00')
            page.wait_for_timeout(400)
            assert page.evaluate("document.querySelector('#inv-cv').toDataURL().length") > 20000
            shot('thiep')
        check(f'[{vp_name}] Tiện ích: đổi ngày, văn khấn, mâm cúng, ngày tốt, nhấn giữ lịch, thiệp mời', t_tools)

        def t_family():
            page.goto(BASE + '#/reminders'); page.wait_for_selector('[data-screen="reminders"]')
            page.click('a[href="#/chiase"]'); page.wait_for_selector('[data-screen="share"]')
            expect(page.locator('.qr-box svg')).to_be_visible()
            n_sel = page.locator('[data-pick][aria-checked="true"]').count()
            assert n_sel >= 1
            shot('chiase')
            page.click('[data-act="copy"]')
            link = page.evaluate("navigator.clipboard.readText()")
            assert '#/nhap?d=1' in link, link
            c2 = browser.new_context(viewport=vp, locale='vi-VN', timezone_id='Asia/Ho_Chi_Minh', service_workers='block')
            c2.route('**/*', route)
            p2 = c2.new_page(); p2.clock.install(time='2026-11-21T20:00:00+07:00')
            p2.goto(BASE + link[link.index('#'):])
            p2.wait_for_selector('[data-screen="import"]')
            assert p2.locator('[data-ipick]').count() == n_sel
            p2.click('[data-act="import"]'); p2.wait_for_selector('[data-screen="reminders"]')
            assert p2.locator('a.item[href^="#/edit/"]').count() >= n_sel
            # Nhập lại cùng link → báo đã có
            p2.goto(BASE + link[link.index('#'):]); p2.wait_for_selector('[data-screen="import"]')
            expect(p2.get_by_text('Bạn đã có đủ các ngày này.')).to_be_visible()
            p2.goto(BASE + '#/nhap'); p2.fill('#im-code', 'mã sai'); p2.click('[data-act="read"]')
            expect(p2.locator('.err')).to_be_visible()
            c2.close()
            page.goto(BASE + '#/vankhan/mung1'); page.wait_for_selector('[data-screen="vankhan"]')
            expect(page.locator('[data-act="tts-play"]')).to_be_visible()
            r = page.request.get(BASE.replace('index.html', 'privacy.html'))
            assert r.ok and 'Chính sách quyền riêng tư' in r.text()
        check(f'[{vp_name}] Chia sẻ cho cả họ bằng link, nhập không trùng; đọc to; trang riêng tư', t_family)

        def t_tang():
            page.goto(BASE + '#/add?type=gio'); page.wait_for_selector('[data-screen="gio-form"]')
            page.fill('#g-name', 'Bà Cố'); page.click('[data-rel="Bà"]')
            page.select_option('select[data-f="day"]', '5'); page.select_option('select[data-f="month"]', '10')
            page.click('[data-tang]')
            expect(page.get_by_text('Nhập năm mất')).to_be_visible()
            page.click('[data-act="save"]'); expect(page.locator('.err')).to_contain_text('năm mất')
            page.fill('input[data-f="year"]', '2026'); page.locator('input[data-f="year"]').dispatch_event('change')
            tl = page.locator('.tang-list')
            expect(tl).to_contain_text('Cúng 49 ngày'); expect(tl).to_contain_text('Giỗ đầu'); expect(tl).to_contain_text('Giỗ hết')
            expect(tl).to_contain_text('31/12/2026')   # mất 5/10 âm = 13/11/2026 → ngày thứ 49 là 31/12
            shot('tang')
            page.click('[data-act="save"]'); page.wait_for_selector('[data-screen="reminders"]')
            expect(page.get_by_text('Cúng 49 ngày Bà Cố').first).to_be_visible()
            expect(page.locator('.badge-tang').first).to_be_visible()
            page.goto(BASE + '#/vankhan/giodau'); page.wait_for_selector('[data-screen="vankhan"]')
            page.select_option('#vk-dead', label='Bà Cố'); page.wait_for_selector('.vk-text')
            expect(page.locator('.vk-text')).to_contain_text('giỗ đầu (Tiểu tường) của Bà Cố.')
            assert 'gid=' in page.url
            # Đổi ngày cúng → ngày âm, năm can chi trong bài tự đổi; thẻ thông tin vẫn mở
            page.fill('#vk-date', '2027-02-06'); page.locator('#vk-date').dispatch_event('change')
            expect(page.locator('.vk-text')).to_contain_text('ngày mùng Một tháng Giêng năm Đinh Mùi')
            expect(page.locator('details[data-info]')).to_have_attribute('open', '')
            # Người không có trong danh sách → nhập tên tự do; bấm chữ tô màu để sửa
            page.goto(BASE + '#/vankhan/cungtuan'); page.wait_for_selector('.vk-text')
            page.locator('.vk-text mark[data-field="nguoiMat"]').first.click()
            page.fill('#vk-deadtext', 'Cụ Lê Văn Tư'); page.locator('#vk-deadtext').dispatch_event('change')
            expect(page.locator('.vk-text')).to_contain_text('cúng tuần cho hương linh Cụ Lê Văn Tư')
            page.locator('.vk-text [data-field="tinChu"]').first.click()
            expect(page.locator('#vk-host')).to_be_focused()
            page.click('[data-act="auto-read"]'); expect(page.locator('[data-act="auto-read"]')).to_have_attribute('aria-pressed', 'true')
            page.click('[data-act="auto-read"]')
            shot('vankhan-dien')
            page.goto(BASE + '#/calendar'); page.wait_for_selector('[data-test="detail"]')
            expect(page.locator('[data-test="detail"]')).to_contain_text('Hỷ thần')
            page.goto(BASE + '#/gopy'); page.wait_for_selector('[data-screen="feedback"]')
            page.click('[data-act="copy"]'); expect(page.locator('.toast')).to_contain_text('viết vài dòng')
            page.fill('#fb-text', 'Thử góp ý'); expect(page.locator('.fb-info')).to_contain_text('Phiên bản app: 1.9.0')
            page.click('[data-act="copy"]')
            assert 'Thử góp ý' in page.evaluate('navigator.clipboard.readText()')
        check(f'[{vp_name}] Người mới mất: mốc 7/49/100 ngày, giỗ đầu, giỗ hết; văn khấn tang lễ; sao, hướng; góp ý', t_tang)

        def t_dongho():
            # Sổ hiếu hỉ: ghi khoản, gợi ý lịch sử qua lại khi đáp lễ
            page.goto(BASE + '#/hieuhi'); page.wait_for_selector('[data-screen="hieuhi"]')
            page.click('a[href="#/hieuhi/new"]'); page.wait_for_selector('[data-screen="hieuhi-form"]')
            page.click('[data-act="hh-save"]'); expect(page.locator('.err')).to_contain_text('tên người')
            page.fill('#hh-person', 'Chú Hai Tâm'); page.locator('#hh-person').dispatch_event('change')
            page.click('[data-amt="500000"]'); page.click('[data-act="hh-save"]')
            page.wait_for_selector('[data-screen="hieuhi"]'); expect(page.locator('.hh-box.nhan')).to_contain_text('500.000')
            page.click('a[href="#/hieuhi/new"]'); page.click('[data-dir="di"]')
            page.fill('#hh-person', 'chú hai tâm'); page.locator('#hh-person').dispatch_event('change')
            expect(page.locator('[aria-label="Lịch sử qua lại"]')).to_contain_text('500.000')
            page.click('[data-act="hh-save"]'); page.wait_for_selector('[data-screen="hieuhi"]')
            expect(page.locator('#hh-list .item')).to_have_count(2)
            # Gia phả: thêm ông, thêm con, thêm vợ
            page.goto(BASE + '#/giapha'); page.wait_for_selector('[data-screen="giapha"]')
            page.click('.bottom-bar a'); page.fill('#gp-name', 'Nguyễn Văn Tổ'); page.fill('#gp-born', '1930'); page.click('[data-act="gp-save"]')
            page.wait_for_selector('.gp-person'); page.click('.gp-add >> text=+ Con')
            page.fill('#gp-name', 'Nguyễn Văn Con'); page.click('[data-act="gp-save"]')
            page.wait_for_selector('.gp-tree ul ul .gp-person'); page.click('.gp-add >> text=+ Vợ/chồng >> nth=0')
            expect(page.locator('[data-gender="nu"]')).to_have_attribute('aria-pressed', 'true')
            page.fill('#gp-name', 'Trần Thị Bà'); page.click('[data-act="gp-save"]')
            page.wait_for_selector('[data-screen="giapha"]'); expect(page.locator('.gp-person')).to_have_count(3)
            expect(page.locator('.top .sub')).to_contain_text('3 người · 2 đời')
            # Chuẩn bị giỗ + tưởng nhớ: mở từ danh sách, tích việc, thêm khách
            page.goto(BASE + '#/chuanbi'); page.wait_for_selector('[data-screen="pick-gio"]')
            page.locator('[data-screen="pick-gio"] a.item').first.click(); page.wait_for_selector('[data-screen="prep"]')
            page.locator('[data-tk]').first.click(); expect(page.locator('[data-tk]').first).to_have_attribute('aria-checked', 'true')
            page.fill('#g-new', 'Nhà bác Cả'); page.fill('#g-n', '5'); page.click('[data-act="g-add"]')
            expect(page.locator('.prep-head')).to_contain_text('5 khách')
            page.locator('[data-gst]').first.click(); expect(page.locator('[data-gst]').first).to_have_text('Đã mời')
            page.locator('[data-whoedit]').nth(1).click(); page.fill('#who-in', 'Anh Cả'); page.keyboard.press('Enter')
            expect(page.locator('.who.set').first).to_contain_text('Anh Cả')
            gid = page.url.split('/chuanbi/')[1]
            page.goto(BASE + '#/tuongnho/' + gid); page.wait_for_selector('[data-screen="memorial-edit"]')
            page.fill('#tn-born', '1940'); page.fill('#tn-bio', 'Cả đời làm ruộng.'); page.click('[data-act="tn-save"]')
            page.wait_for_selector('[data-screen="memorial"]'); expect(page.locator('.memorial')).to_contain_text('1940')
            expect(page.locator('.mem-bio')).to_contain_text('làm ruộng')
            # Sửa ngày giỗ vẫn giữ trang tưởng nhớ
            page.goto(BASE + '#/edit/' + gid); page.wait_for_selector('[data-act="save"]'); page.click('[data-act="save"]')
            page.wait_for_selector('[data-screen="reminders"]')
            page.goto(BASE + '#/tuongnho/' + gid); page.wait_for_selector('[data-screen="memorial"]')
            # Xem tuổi + mâm cúng theo vùng
            page.goto(BASE + '#/xemtuoi'); page.wait_for_selector('[data-screen="xemtuoi"]')
            page.select_option('#xt-born', '1990'); expect(page.locator('.xt-year').first).to_contain_text('Kim Lâu Thân')
            page.click('[data-viec="cuoi"]'); expect(page.locator('.xt-year').first).not_to_contain_text('Hoang Ốc')
            page.goto(BASE + '#/vankhan/tet?tab=mam'); page.wait_for_selector('[data-region]')
            page.click('[data-region="nam"]'); expect(page.locator('[aria-label="Mâm cúng gợi ý"]')).to_contain_text('Thịt kho hột vịt')
            page.click('[data-region="bac"]'); expect(page.locator('[aria-label="Mâm cúng gợi ý"]')).to_contain_text('Bánh chưng')
            page.click('[data-region="chung"]')
            # Sao hạn: đổi năm sinh, giới tính; mở văn khấn dâng sao đã điền sẵn sao
            page.goto(BASE + '#/saohan'); page.wait_for_selector('[data-screen="saohan"]')
            page.select_option('#sh-born', '1990'); page.click('[data-g="nam"]'); page.click('[data-y="0"]')
            expect(page.locator('.sh-hero')).to_contain_text('La Hầu'); expect(page.locator('.sh-hero')).to_contain_text('Tam Kheo')
            page.click('[data-g="nu"]'); expect(page.locator('.sh-hero')).to_contain_text('Kế Đô')
            page.locator('a.chip', has_text='Văn khấn dâng sao').click(); page.wait_for_selector('.vk-text')
            expect(page.locator('.vk-text')).to_contain_text('Địa cung Thần vĩ Kế Đô Tinh quân')
            expect(page.locator('.vk-text')).to_contain_text('gặp sao Kế Đô chiếu mệnh')
            # Tết: chuẩn bị, xông đất, xuất hành; ăn chay; mệnh; văn khấn đi chùa
            page.goto(BASE + '#/tienich'); page.wait_for_selector('[data-screen="hub"]')
            expect(page.locator('.svc-group').first).to_contain_text('Tết Đinh Mùi')
            page.click('a.svc[href="#/chuanbitet"]'); page.wait_for_selector('[data-screen="tetprep"]')
            expect(page.locator('.tet-banner')).to_contain_text('đến Tết')
            page.locator('[data-tk]').first.click(); expect(page.locator('[data-tk]').first).to_have_attribute('aria-checked', 'true')
            page.fill('#tk-new', 'Đón con về quê'); page.select_option('#tk-dk', 'c28'); page.click('[data-act="tk-add"]')
            expect(page.locator('.prep-task', has_text='Đón con về quê')).to_have_count(1)
            page.goto(BASE + '#/xongdat'); page.wait_for_selector('[data-screen="xongdat"]')
            page.select_option('#xd-host', '1975'); expect(page.locator('[aria-label="Tuổi hợp nhất"] .xt-year')).to_have_count(8)
            page.select_option('#xd-check', '1985'); expect(page.locator('.xt-year').last).to_contain_text('1985')
            page.goto(BASE + '#/xuathanh'); page.wait_for_selector('.xh-day')
            expect(page.locator('.xh-day')).to_have_count(3); expect(page.locator('.xh-day').first).to_contain_text('Thứ Bảy, 6/2/2027')
            page.goto(BASE + '#/anchay'); page.click('[data-chay="2"]')
            expect(page.locator('[data-screen="anchay"] .item').first).to_contain_text('15/10 âm')
            page.goto(BASE + '#/today'); page.wait_for_selector('[data-screen="today"]')
            page.goto(BASE + '#/anchay'); page.click('[data-chay="off"]')
            page.goto(BASE + '#/menh'); page.select_option('#mn-y', '1990')
            expect(page.locator('.sh-hero')).to_contain_text('Lộ Bàng Thổ'); expect(page.locator('.mau-row').last).to_contain_text('Xanh lá')
            page.goto(BASE + '#/vankhan?g=chua'); expect(page.locator('[data-screen="vankhan-list"] a.item')).to_have_count(4)
            page.click('a[href="#/vankhan/ducong"]'); page.wait_for_selector('.vk-text')
            expect(page.locator('.vk-text')).to_contain_text('Già Lam Chân Tể')
        check(f'[{vp_name}] Dòng họ: sổ hiếu hỉ, gia phả, chuẩn bị giỗ, tưởng nhớ, xem tuổi, mâm theo vùng, sao hạn, Tết, xông đất, xuất hành, ăn chay, mệnh, đi chùa', t_dongho)

        def t_swipe():
            page.goto(BASE + '#/calendar'); page.wait_for_selector('[data-screen="calendar"]')
            g = page.locator('[data-swipe]')
            g.dispatch_event('touchstart', {'touches': [{'identifier': 0, 'clientX': 300, 'clientY': 300}]})
            g.dispatch_event('touchend', {'changedTouches': [{'identifier': 0, 'clientX': 120, 'clientY': 310}]})
            expect(page.locator('h1')).to_have_text('Tháng 12, 2026')
            g = page.locator('[data-swipe]')
            g.dispatch_event('touchstart', {'touches': [{'identifier': 0, 'clientX': 100, 'clientY': 300}]})
            g.dispatch_event('touchend', {'changedTouches': [{'identifier': 0, 'clientX': 300, 'clientY': 305}]})
            expect(page.locator('h1')).to_have_text('Tháng 11, 2026')
        check(f'[{vp_name}] Vuốt ngang đổi tháng', t_swipe)

        def t_offline_clean():
            assert not external, f'có yêu cầu mạng ngoài: {external[:3]}'
            assert not errors, f'lỗi console: {errors[:3]}'
        check(f'[{vp_name}] Không gọi mạng ngoài, không lỗi JavaScript', t_offline_clean)
        ctx.close()
    browser.close()
srv.shutdown()
ok = sum(1 for r in results if r[1])
print(f'\n{ok}/{len(results)} kiểm thử đạt')
json.dump([{'name': n, 'ok': o, 'err': e} for n, o, e in results], open(f'{SHOTS}/_results.json', 'w'), ensure_ascii=False, indent=1)
sys.exit(0 if ok == len(results) else 1)
