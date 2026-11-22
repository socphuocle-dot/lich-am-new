import WidgetKit
import SwiftUI
import UIKit

// MARK: - Màu sơn mài (tự đổi sáng/tối)

extension UIColor {
    convenience init(hex: UInt32) {
        self.init(red: CGFloat((hex >> 16) & 0xFF) / 255, green: CGFloat((hex >> 8) & 0xFF) / 255, blue: CGFloat(hex & 0xFF) / 255, alpha: 1)
    }
}

extension Color {
    static func dyn(_ light: UInt32, _ dark: UInt32) -> Color {
        Color(UIColor { $0.userInterfaceStyle == .dark ? UIColor(hex: dark) : UIColor(hex: light) })
    }
    static func hex(_ v: UInt32) -> Color { Color(UIColor(hex: v)) }
    static let paper = Color.dyn(0xFFFCF6, 0x1F1915)
    static let paper2 = Color.dyn(0xF0E5D2, 0x15100D)
    static let card = Color.dyn(0xFFFFFF, 0x2A221C)
    static let ink = Color.dyn(0x17110E, 0xF6F0E7)
    static let muted = Color.dyn(0x4E4640, 0xBDB3A7)
    static let accent = Color.dyn(0x9B1A12, 0xFF7B67)
    static let goldInk = Color.dyn(0x7A5108, 0xEEC56E)
    static let goldSoft = Color.dyn(0xF7E8C6, 0x33270F)
    static let goldLine = Color.dyn(0xD9B566, 0x8C6A2A)
    static let onLacquerGold = Color.hex(0xF6D891)
    static let onLacquerSoft = Color.hex(0xF6DDD7)
}

enum Paint {
    static let lacquer = LinearGradient(colors: [.hex(0xC8392C), .hex(0x9B1A12), .hex(0x5C0A07)], startPoint: .topLeading, endPoint: .bottomTrailing)
    static let paper = LinearGradient(colors: [.paper, .paper2], startPoint: .top, endPoint: .bottom)
    static let gold = LinearGradient(colors: [.hex(0xF1D48A), .hex(0xC08A2A)], startPoint: .top, endPoint: .bottom)
}

extension Font {
    /// Be Vietnam Pro — cùng font với app (đóng gói trong widget)
    static func bvp(_ size: CGFloat, _ w: Font.Weight = .regular) -> Font {
        let name = w == .bold || w == .heavy ? "BeVietnamPro-Bold" : (w == .semibold || w == .medium ? "BeVietnamPro-SemiBold" : "BeVietnamPro-Regular")
        return .custom(name, size: size)
    }
    /// Chữ số Noto Serif đậm — giống số lớn trong app
    static func digits(_ size: CGFloat) -> Font { .custom("NotoSerifDigits", size: size) }
}

extension View {
    /// Nền widget: iOS 17+ bắt buộc containerBackground
    @ViewBuilder
    func widgetBackground<B: View>(pad: Bool = true, @ViewBuilder _ bg: () -> B) -> some View {
        if #available(iOSApplicationExtension 17.0, *) {
            self.containerBackground(for: .widget) { bg() }
        } else if pad {
            self.padding(12).frame(maxWidth: .infinity, maxHeight: .infinity).background(bg())
        } else {
            self
        }
    }

    /// Bóng nổi khối nhẹ cho số lớn
    func emboss(_ dark: Bool = false) -> some View {
        self.shadow(color: Color.black.opacity(dark ? 0.35 : 0.18), radius: dark ? 4 : 3, x: 0, y: 2)
    }
}

/// Chấm màu theo loại sự kiện: giỗ (đen), rằm/mùng 1 (vàng), lễ (đỏ)
struct KindDot: View {
    let kind: Int
    var body: some View {
        Circle()
            .fill(kind == 3 ? Color.ink : (kind == 1 ? Color.hex(0xC08A2A) : Color.accent))
            .frame(width: 8, height: 8)
    }
}


// MARK: - Hình minh họa (trăng, con giáp, Bé Thỏ) đóng gói trong thư mục WidgetArt

enum Art {
    static let chi = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"]
    static func ui(_ name: String) -> UIImage? {
        guard let p = Bundle.main.path(forResource: name, ofType: "png", inDirectory: "WidgetArt") else { return nil }
        return UIImage(contentsOfFile: p)
    }
    static func moon(_ d: DayInfo) -> String? { d.hasLunar ? String(format: "widget_moon_%02d", Swift.max(1, Swift.min(30, d.ld))) : nil }
    static func giap(canChi: String) -> String? {
        guard let last = canChi.split(separator: " ").last, let i = chi.firstIndex(of: String(last)) else { return nil }
        return String(format: "widget_giap_%02d", i)
    }
    static func giapOfYear(_ ly: Int) -> String { String(format: "widget_giap_%02d", ((ly + 8) % 12 + 12) % 12) }
    static func icon(_ it: UpcomingItem) -> String {
        if it.kind == 3 {
            if it.title.hasPrefix("Ngày chay") { return "widget_ic_lotus" }
            if it.title.hasPrefix("Sinh nhật") { return "widget_ic_bday" }
            if it.title.hasPrefix("Cúng") { return "widget_ic_lotus" }
            if !it.title.hasPrefix("Giỗ") { return "widget_ic_kyniem" }
            return "widget_ic_gio"
        }
        return it.kind == 1 ? "widget_ic_moon" : "widget_ic_le"
    }
    static func mascot(for title: String, kind: Int) -> String {
        if title.hasPrefix("Sinh nhật") { return "widget_mascot_cake" }
        if title.hasPrefix("Tết") || kind == 1 { return "widget_mascot_lantern" }
        if title.hasPrefix("Giỗ") || kind == 3 { return "widget_mascot_pray" }
        return "widget_mascot_star"
    }
}

struct ArtImage: View {
    let name: String?
    let size: CGFloat
    var body: some View {
        if let n = name, let img = Art.ui(n) {
            Image(uiImage: img).resizable().interpolation(.high).scaledToFit().frame(width: size, height: size)
        }
    }
}

// MARK: - 1. Tờ lịch (nhỏ)

struct SheetView: View {
    let entry: DayEntry
    @Environment(\.colorScheme) var scheme

    var body: some View {
        let today = EpochDay.of(date: entry.date)
        let day = CalStore.shared.day(today)
        let note = UserStore().note(for: day)
        VStack(spacing: 3) {
            Text("THÁNG \(day.m) · \(String(day.y))")
                .font(.bvp(10, .bold))
                .kerning(0.8)
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 5)
                .background(
                    RoundedRectangle(cornerRadius: 10).fill(Paint.lacquer)
                        .overlay(Rectangle().fill(Color.hex(0xD9B566)).frame(height: 1.5), alignment: .bottom)
                )
                .shadow(color: Color.hex(0x5C0A07).opacity(0.35), radius: 4, x: 0, y: 2)
            Text("\(day.d)")
                .font(.digits(54))
                .foregroundStyle(scheme == .dark ? AnyShapeStyle(Color.accent) : AnyShapeStyle(Paint.lacquer))
                .minimumScaleFactor(0.5)
                .lineLimit(1)
                .emboss()
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .overlay(ArtImage(name: Art.moon(day), size: 24), alignment: .topTrailing)
            Text(LunarText.thu[day.wd])
                .font(.bvp(12, .semibold))
                .foregroundColor(.muted)
            if day.hasLunar {
                HStack(spacing: 3) {
                    ArtImage(name: Art.giap(canChi: day.canChi), size: 16)
                    Text("\(day.lunarShort) · \(day.canChi)")
                        .font(.bvp(11, .bold))
                        .foregroundColor(.goldInk)
                        .lineLimit(1)
                        .minimumScaleFactor(0.7)
                }
                .padding(.leading, 3)
                .padding(.trailing, 8)
                .padding(.vertical, 2)
                .background(Capsule().fill(Color.goldSoft).overlay(Capsule().stroke(Color.goldLine, lineWidth: 1)))
            }
            if !note.isEmpty {
                Text(note)
                    .font(.bvp(10, .bold))
                    .foregroundColor(.accent)
                    .lineLimit(1)
                    .minimumScaleFactor(0.7)
            }
        }
        .widgetBackground { Paint.paper }
        .widgetURL(DeepLink.url(for: entry.date))
    }
}

// MARK: - 2. Lịch & sắp tới (vừa)

struct AgendaView: View {
    let entry: DayEntry

    var body: some View {
        let today = EpochDay.of(date: entry.date)
        let day = CalStore.shared.day(today)
        let items = UserStore().upcoming(from: today, days: 120, max: 3)
        HStack(spacing: 12) {
            VStack(spacing: 2) {
                Text("TH \(day.m) · \(String(day.y))")
                    .font(.bvp(10, .bold)).kerning(0.8)
                    .foregroundColor(.onLacquerGold)
                Text("\(day.d)")
                    .font(.digits(48))
                    .foregroundColor(.white)
                    .minimumScaleFactor(0.5)
                    .lineLimit(1)
                    .emboss(true)
                    .frame(maxHeight: .infinity)
                Text(LunarText.thu[day.wd])
                    .font(.bvp(12, .semibold))
                    .foregroundColor(.onLacquerSoft)
                if day.hasLunar {
                    Text("\(day.lunarShort) Âm · \(day.canChi)")
                        .font(.bvp(11, .bold))
                        .foregroundColor(.onLacquerGold)
                        .lineLimit(1)
                        .minimumScaleFactor(0.7)
                }
            }
            .padding(.vertical, 8)
            .padding(.horizontal, 4)
            .frame(width: 128)
            .frame(maxHeight: .infinity)
            .background(RoundedRectangle(cornerRadius: 16).fill(Paint.lacquer))
            .overlay(ArtImage(name: Art.moon(day), size: 20).padding(7), alignment: .topTrailing)
            .shadow(color: Color.hex(0x5C0A07).opacity(0.35), radius: 6, x: 0, y: 3)

            VStack(alignment: .leading, spacing: 7) {
                Text("Sắp tới").font(.bvp(14, .bold)).foregroundColor(.ink)
                if items.isEmpty {
                    Text("Không có sự kiện trong 4 tháng tới").font(.bvp(12)).foregroundColor(.muted)
                }
                ForEach(items) { it in
                    let c = EpochDay.civil(it.epoch)
                    HStack(alignment: .center, spacing: 8) {
                        ArtImage(name: Art.icon(it), size: 24)
                        VStack(alignment: .leading, spacing: 1) {
                            Text(it.title)
                                .font(.bvp(13, .semibold))
                                .foregroundColor(.ink)
                                .lineLimit(1)
                            Text("\(LunarText.thuShort[EpochDay.weekday(it.epoch)]) \(c.2)/\(c.1) · \(LunarText.countText(it.epoch - today))")
                                .font(.bvp(12, .medium))
                                .foregroundColor(it.kind == 3 ? .muted : it.kind == 1 ? .goldInk : .accent)
                                .lineLimit(1)
                        }
                    }
                }
                Spacer(minLength: 0)
            }
        }
        .widgetBackground { Paint.paper }
        .widgetURL(DeepLink.url(for: entry.date))
    }
}

// MARK: - 3. Lịch tháng (lớn)

struct MonthView: View {
    let entry: DayEntry

    var body: some View {
        let today = EpochDay.of(date: entry.date)
        let t = CalStore.shared.day(today)
        let first = EpochDay.of(t.y, t.m, 1)
        let nextFirst = t.m == 12 ? EpochDay.of(t.y + 1, 1, 1) : EpochDay.of(t.y, t.m + 1, 1)
        let lead = (EpochDay.weekday(first) + 6) % 7
        let rows = (lead + (nextFirst - first) + 6) / 7
        let f = CalStore.shared.day(first)
        let l = CalStore.shared.day(nextFirst - 1)
        let user = UserStore()
        VStack(spacing: 4) {
            HStack(alignment: .center) {
                if t.hasLunar { ArtImage(name: Art.giapOfYear(t.ly), size: 22) }
                Text("Tháng \(t.m) · \(String(t.y))").font(.bvp(15, .bold)).foregroundColor(.white)
                Spacer()
                if f.hasLunar {
                    Text("Âm: tháng \(f.lm)\(f.lm != l.lm ? "–\(l.lm)" : "") \(CalStore.shared.yearName(l.ly))")
                        .font(.bvp(11, .bold)).foregroundColor(.onLacquerGold).lineLimit(1)
                }
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 8)
            .background(RoundedRectangle(cornerRadius: 14).fill(Paint.lacquer))
            .shadow(color: Color.hex(0x5C0A07).opacity(0.3), radius: 4, x: 0, y: 2)
            HStack(spacing: 2) {
                ForEach(0..<7, id: \.self) { i in
                    Text(["T2", "T3", "T4", "T5", "T6", "T7", "CN"][i])
                        .font(.bvp(11, .bold))
                        .foregroundColor(i == 6 ? .accent : .muted)
                        .frame(maxWidth: .infinity)
                }
            }
            .padding(.top, 2)
            ForEach(0..<rows, id: \.self) { r in
                HStack(spacing: 3) {
                    ForEach(0..<7, id: \.self) { c in
                        let e = first - lead + r * 7 + c
                        if e < first || e >= nextFirst {
                            Color.clear.frame(maxWidth: .infinity, maxHeight: .infinity)
                        } else {
                            MonthCell(day: CalStore.shared.day(e), isToday: e == today,
                                      gio: user.giosOn(e).contains(where: { !$0.title.hasPrefix("Ngày chay") }),
                                      chay: user.giosOn(e).contains(where: { $0.title.hasPrefix("Ngày chay") }))
                        }
                    }
                }
            }
        }
        .widgetBackground { Paint.paper }
        .widgetURL(DeepLink.url(for: entry.date))
    }
}

struct MonthCell: View {
    let day: DayInfo
    let isToday: Bool
    let gio: Bool
    var chay: Bool = false

    var body: some View {
        let moon = day.ld == 1 || day.ld == 15
        VStack(spacing: 0) {
            Text("\(day.d)")
                .font(.bvp(14, .semibold))
                .foregroundColor(isToday ? .white : (day.wd == 0 ? .accent : .ink))
            if day.hasLunar {
                Text(day.ld == 1 ? "\(day.ld)/\(day.lm)" : "\(day.ld)")
                    .font(.bvp(10, moon || gio ? .bold : .regular))
                    .foregroundColor(isToday ? .onLacquerGold : (moon ? .goldInk : day.kind == 2 ? .accent : .muted))
            }
            Circle().fill(isToday ? Color.white : (gio ? Color.hex(0xB3261E) : day.kind == 2 ? Color.hex(0xD29A34) : chay ? Color.hex(0x2F9E6A) : Color.clear))
                .frame(width: 4, height: 4)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(
            Group {
                if isToday {
                    RoundedRectangle(cornerRadius: 9).fill(Paint.lacquer)
                        .shadow(color: Color.hex(0x5C0A07).opacity(0.35), radius: 3, x: 0, y: 2)
                } else if moon {
                    RoundedRectangle(cornerRadius: 9).fill(Color.goldSoft)
                        .overlay(RoundedRectangle(cornerRadius: 9).stroke(Color.goldLine, lineWidth: 1))
                } else {
                    Color.clear
                }
            }
        )
    }
}

// MARK: - 4. Đếm ngược (nhỏ, nền sơn mài)

struct CountdownView: View {
    let entry: DayEntry

    var body: some View {
        let today = EpochDay.of(date: entry.date)
        let target = UserStore().countdownTarget(from: today)
        VStack(spacing: 2) {
            if let t = target {
                let diff = t.epoch - today
                let d = CalStore.shared.day(t.epoch)
                Text(t.title)
                    .font(.bvp(13, .bold))
                    .foregroundColor(.onLacquerGold)
                    .multilineTextAlignment(.center)
                    .lineLimit(2)
                    .minimumScaleFactor(0.8)
                HStack(alignment: .bottom, spacing: 0) {
                    Text(diff <= 0 ? "Hôm nay" : "\(diff)")
                        .font(.digits(50))
                        .foregroundColor(.white)
                        .minimumScaleFactor(0.4)
                        .lineLimit(1)
                        .emboss(true)
                    Spacer(minLength: 0)
                    ArtImage(name: Art.mascot(for: t.title, kind: 0), size: 54)
                }
                .frame(maxHeight: .infinity)
                if diff > 0 {
                    Text("ngày nữa").font(.bvp(12, .semibold)).foregroundColor(.onLacquerSoft)
                }
                Text("\(LunarText.thu[d.wd]), \(d.d)/\(d.m)" + (d.hasLunar ? " · \(d.lunarShort) Âm" : ""))
                    .font(.bvp(11))
                    .foregroundColor(.onLacquerSoft)
                    .lineLimit(1)
                    .minimumScaleFactor(0.7)
            } else {
                Text("Mở app để chọn mốc đếm ngược").font(.bvp(12)).foregroundColor(.white).multilineTextAlignment(.center)
            }
        }
        .widgetBackground { Paint.lacquer }
        .widgetURL(DeepLink.url(for: entry.date))
    }
}

// MARK: - 5. Màn hình khóa

struct LockView: View {
    let entry: DayEntry
    @Environment(\.widgetFamily) var family

    var body: some View {
        let today = EpochDay.of(date: entry.date)
        let day = CalStore.shared.day(today)
        let next = UserStore().upcoming(from: today, days: 60, max: 1).first
        Group {
            switch family {
            case .accessoryInline:
                Text(day.hasLunar ? "\(day.lunarShort) Âm · \(day.canChi)" : LunarText.thu[day.wd])
            case .accessoryCircular:
                ZStack {
                    AccessoryWidgetBackground()
                    VStack(spacing: 0) {
                        Text(day.hasLunar ? "\(day.ld)" : "\(day.d)")
                            .font(.digits(22))
                        Text(day.hasLunar ? "TH \(day.lm)\(day.leap ? "N" : "")" : "TH \(day.m)")
                            .font(.system(size: 9, weight: .semibold))
                    }
                }
            default:
                VStack(alignment: .leading, spacing: 1) {
                    Text(day.hasLunar ? "\(day.lunarShort) Âm · \(day.canChi)" : LunarText.thu[day.wd])
                        .font(.system(size: 14, weight: .bold))
                        .lineLimit(1)
                    if let n = next {
                        Text(n.title).font(.system(size: 12)).lineLimit(1)
                        Text(LunarText.countText(n.epoch - today)).font(.system(size: 12)).foregroundColor(.secondary)
                    } else {
                        Text(day.good ? "Ngày Hoàng đạo" : "Ngày Hắc đạo").font(.system(size: 12))
                    }
                }
                .frame(maxWidth: .infinity, alignment: .leading)
            }
        }
        .widgetBackground(pad: false) { Color.clear }
        .widgetURL(DeepLink.url(for: entry.date))
    }
}


// MARK: - 6. Ngày hôm nay (nhỏ) — giống biểu tượng Lịch của iOS

struct IconView: View {
    let entry: DayEntry

    var body: some View {
        let day = CalStore.shared.day(EpochDay.of(date: entry.date))
        VStack(spacing: 0) {
            Text(LunarText.thu[day.wd].uppercased())
                .font(.bvp(15, .bold))
                .foregroundColor(.hex(0xE0352B))
                .lineLimit(1)
                .minimumScaleFactor(0.7)
            Text("\(day.d)")
                .font(.system(size: 86, weight: .light))
                .foregroundColor(.ink)
                .minimumScaleFactor(0.5)
                .lineLimit(1)
                .frame(maxHeight: .infinity)
            if day.hasLunar {
                HStack(spacing: 4) {
                    ArtImage(name: Art.moon(day), size: 16)
                    Text("\(day.lunarShort) Âm").font(.bvp(13, .semibold)).foregroundColor(.muted)
                }
            }
        }
        .widgetBackground { LinearGradient(colors: [.dyn(0xFFFFFF, 0x2A221D), .dyn(0xF6F1EA, 0x1C1612)], startPoint: .top, endPoint: .bottom) }
        .widgetURL(DeepLink.url(for: entry.date))
    }
}

// MARK: - 7. Bé Thỏ nhắc (vừa)

struct TipView: View {
    let entry: DayEntry

    var body: some View {
        let today = EpochDay.of(date: entry.date)
        let day = CalStore.shared.day(today)
        let next = UserStore().upcoming(from: today, days: 8, max: 1).first
        let h = Calendar.current.component(.hour, from: entry.date)
        let greet = h < 11 ? "Chào buổi sáng!" : h < 14 ? "Chào buổi trưa!" : h < 18 ? "Chào buổi chiều!" : "Chào buổi tối!"
        let msg = TipView.message(today: today, day: day, next: next)
        HStack(spacing: 8) {
            ArtImage(name: msg.1, size: 78)
            VStack(alignment: .leading, spacing: 3) {
                Text("\(greet) \(LunarText.thu[day.wd]) \(day.d)/\(day.m)")
                    .font(.bvp(13, .bold)).foregroundColor(.accent).lineLimit(1).minimumScaleFactor(0.8)
                Text(msg.0)
                    .font(.bvp(13)).foregroundColor(.ink).lineLimit(3).minimumScaleFactor(0.85)
            }
            .padding(.horizontal, 10).padding(.vertical, 8)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(RoundedRectangle(cornerRadius: 14).fill(Color.card).overlay(RoundedRectangle(cornerRadius: 14).stroke(Color.goldLine.opacity(0.6), lineWidth: 1)))
            VStack(spacing: 2) {
                ArtImage(name: Art.moon(day), size: 30)
                if day.hasLunar { Text(day.lunarShort).font(.bvp(11, .semibold)).foregroundColor(.muted) }
            }
        }
        .widgetBackground { Paint.paper }
        .widgetURL(DeepLink.url(for: entry.date))
    }

    static func message(today: Int, day: DayInfo, next: UpcomingItem?) -> (String, String) {
        if let n = next {
            let diff = n.epoch - today
            let lead = diff <= 0 ? "Hôm nay: " : diff == 1 ? "Ngày mai: " : "Còn \(diff) ngày nữa là "
            return (lead + n.title, Art.mascot(for: n.title, kind: n.kind))
        }
        for i in 1...30 {
            let x = CalStore.shared.day(today + i)
            if x.ld == 1 && x.lm == 1 && !x.leap {
                return ("Còn \(i) ngày nữa là Tết \(CalStore.shared.yearName(x.ly))!", "widget_mascot_star")
            }
        }
        if day.hasLunar && (day.ld == 1 || day.ld == 15) {
            return ("Hôm nay \(day.ld == 15 ? "Rằm" : "mùng Một"), nhớ thắp nén hương nhé", "widget_mascot_lantern")
        }
        if day.hasLunar {
            for i in 1...31 {
                let x = CalStore.shared.day(today + i)
                if x.ld == 1 || x.ld == 15 {
                    return ("Còn \(i) ngày nữa đến \(x.ld == 15 ? "Rằm" : "mùng Một") · \(day.good ? "ngày Hoàng đạo" : "ngày Hắc đạo")", "widget_mascot_wave")
                }
            }
        }
        return ("Mở app để xem lịch âm hôm nay", "widget_mascot_wave")
    }
}
