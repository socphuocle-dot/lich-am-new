import Foundation

/// Một ngày trong bảng lịch tĩnh (calendar.json sinh sẵn từ thuật toán âm lịch của app).
struct DayInfo {
    let epoch: Int
    let y: Int, m: Int, d: Int, wd: Int // wd: 0 = Chủ Nhật
    var ld = 0, lm = 0, ly = 0
    var leap = false, good = false
    var canChi = ""
    var event = ""
    var kind = 0 // 0 không, 1 rằm/mùng 1, 2 lễ

    var hasLunar: Bool { ld > 0 }
    var lunarShort: String { "\(ld)/\(lm)\(leap ? "N" : "")" }
}

struct UpcomingItem: Identifiable {
    let id = UUID()
    let epoch: Int
    let title: String
    let kind: Int // 1 rằm/mùng 1, 2 lễ, 3 giỗ
}

enum LunarText {
    static let thu = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"]
    static let thuShort = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"]

    static func countText(_ diff: Int) -> String {
        if diff <= 0 { return "Hôm nay" }
        if diff == 1 { return "Ngày mai" }
        return "\(diff) ngày"
    }
}

enum EpochDay {
    /// Số ngày kể từ 1970-01-01 (days_from_civil)
    static func of(_ y0: Int, _ m: Int, _ d: Int) -> Int {
        let y = m <= 2 ? y0 - 1 : y0
        let era = (y >= 0 ? y : y - 399) / 400
        let yoe = y - era * 400
        let doy = (153 * (m + (m > 2 ? -3 : 9)) + 2) / 5 + d - 1
        let doe = yoe * 365 + yoe / 4 - yoe / 100 + doy
        return era * 146097 + doe - 719468
    }

    static func civil(_ z0: Int) -> (Int, Int, Int) {
        let z = z0 + 719468
        let era = (z >= 0 ? z : z - 146096) / 146097
        let doe = z - era * 146097
        let yoe = (doe - doe / 1460 + doe / 36524 - doe / 146096) / 365
        let y = yoe + era * 400
        let doy = doe - (365 * yoe + yoe / 4 - yoe / 100)
        let mp = (5 * doy + 2) / 153
        let d = doy - (153 * mp + 2) / 5 + 1
        let m = mp < 10 ? mp + 3 : mp - 9
        return (m <= 2 ? y + 1 : y, m, d)
    }

    static func of(date: Date) -> Int {
        let c = Calendar.current.dateComponents([.year, .month, .day], from: date)
        return of(c.year ?? 2026, c.month ?? 1, c.day ?? 1)
    }

    /// 0 giờ của một ngày theo múi giờ máy
    static func midnight(_ epoch: Int) -> Date {
        let (y, m, d) = civil(epoch)
        return Calendar.current.date(from: DateComponents(year: y, month: m, day: d)) ?? Date()
    }

    static func fromYmd(_ s: String) -> Int? {
        let p = s.split(separator: "-").compactMap { Int($0) }
        guard p.count == 3 else { return nil }
        return of(p[0], p[1], p[2])
    }

    static func weekday(_ epoch: Int) -> Int {
        let r = (epoch + 4) % 7
        return r < 0 ? r + 7 : r
    }
}

final class CalStore {
    static let shared = CalStore()
    private var days: [[Any]] = []
    private var start = 0
    private var years: [String: String] = [:]

    private init() {
        guard let url = Bundle.main.url(forResource: "calendar", withExtension: "json"),
              let data = try? Data(contentsOf: url),
              let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else { return }
        days = obj["days"] as? [[Any]] ?? []
        start = (obj["startEpochDay"] as? NSNumber)?.intValue ?? 0
        years = obj["years"] as? [String: String] ?? [:]
    }

    func day(_ epoch: Int) -> DayInfo {
        let (y, m, d) = EpochDay.civil(epoch)
        var info = DayInfo(epoch: epoch, y: y, m: m, d: d, wd: EpochDay.weekday(epoch))
        let i = epoch - start
        guard i >= 0, i < days.count else { return info }
        let a = days[i]
        func int(_ k: Int) -> Int { k < a.count ? ((a[k] as? NSNumber)?.intValue ?? 0) : 0 }
        func str(_ k: Int) -> String { k < a.count ? (a[k] as? String ?? "") : "" }
        info.ld = int(0)
        info.lm = int(1)
        info.leap = int(2) == 1
        info.ly = int(3)
        info.canChi = str(4)
        info.good = int(5) == 1
        info.event = str(6)
        info.kind = int(7)
        return info
    }

    func yearName(_ ly: Int) -> String { years[String(ly)] ?? "" }
}

/// Dữ liệu động do app ghi vào App Group: ngày giỗ + mốc đếm ngược.
final class UserStore {
    static let appGroup = "group.vn.lichamnhacgio.app"
    static let key = "widget_json"

    struct Gio { let epoch: Int; let title: String; var route: String = "" }
    let gios: [Gio]
    let countdown: (epoch: Int, title: String)?

    init() {
        var g: [Gio] = []
        var cd: (epoch: Int, title: String)? = nil
        if let s = UserDefaults(suiteName: UserStore.appGroup)?.string(forKey: UserStore.key),
           let data = s.data(using: .utf8),
           let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any] {
            for item in obj["gios"] as? [[String: Any]] ?? [] {
                if let d = item["d"] as? String, let e = EpochDay.fromYmd(d) {
                    g.append(Gio(epoch: e, title: item["t"] as? String ?? "", route: item["r"] as? String ?? ""))
                }
            }
            if let c = obj["cd"] as? [String: Any], let d = c["d"] as? String, let e = EpochDay.fromYmd(d) {
                cd = (e, c["t"] as? String ?? "")
            }
        }
        gios = g
        countdown = cd
    }

    func giosOn(_ epoch: Int) -> [Gio] { gios.filter { $0.epoch == epoch } }

    func upcoming(from today: Int, days: Int, max: Int) -> [UpcomingItem] {
        var out = gios.filter { $0.epoch >= today && $0.epoch < today + days }.map { UpcomingItem(epoch: $0.epoch, title: $0.title, kind: 3) }
        for e in today..<(today + days) {
            let d = CalStore.shared.day(e)
            if d.kind > 0 && !d.event.isEmpty { out.append(UpcomingItem(epoch: e, title: d.event, kind: d.kind)) }
        }
        out.sort { $0.epoch != $1.epoch ? $0.epoch < $1.epoch : $0.kind > $1.kind }
        return Array(out.prefix(max))
    }

    func countdownTarget(from today: Int) -> (epoch: Int, title: String)? {
        if let c = countdown, c.epoch >= today { return c }
        for e in today..<(today + 400) {
            let d = CalStore.shared.day(e)
            if d.ld == 1 && d.lm == 1 && !d.leap { return (e, "Tết Nguyên Đán") }
        }
        return nil
    }

    func note(for d: DayInfo) -> String {
        if let g = giosOn(d.epoch).first { return g.title }
        if !d.event.isEmpty { return d.event }
        if !d.hasLunar { return "" }
        return d.good ? "Ngày Hoàng đạo" : "Ngày Hắc đạo"
    }
}


/// Link mở thẳng một màn trong app khi bấm widget: lichamnhacgio://open/<route>
enum DeepLink {
    static func vanKhanId(_ d: DayInfo) -> String? {
        if d.lm == 12 && d.ld == 23 { return "ongtao" }
        if d.lm == 1 && d.ld == 1 { return "tet" }
        if d.lm == 1 && (d.ld == 3 || d.ld == 4) { return "hoavang" }
        if d.lm == 1 && d.ld == 10 { return "thantai" }
        if d.lm == 1 && d.ld == 15 { return "ramgieng" }
        if d.lm == 5 && d.ld == 5 { return "doanngo" }
        if d.lm == 7 && d.ld == 15 { return "vulan" }
        if d.ld == 15 { return "ram" }
        if d.ld == 1 { return "mung1" }
        return nil
    }

    static func route(epoch: Int) -> String {
        if let g = UserStore().giosOn(epoch).first(where: { !$0.route.isEmpty }) { return g.route }
        let d = CalStore.shared.day(epoch)
        guard d.hasLunar, let id = vanKhanId(d) else { return "today" }
        return "vankhan/\(id)?jd=\(epoch + 2440588)"
    }

    static func url(for date: Date) -> URL? {
        let c = Calendar.current.dateComponents([.year, .month, .day], from: date)
        let e = EpochDay.of(c.year ?? 2026, c.month ?? 1, c.day ?? 1)
        return URL(string: "lichamnhacgio://open/" + route(epoch: e))
    }
}
