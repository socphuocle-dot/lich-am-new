import WidgetKit
import SwiftUI
import UIKit

// MARK: - Màu (tự đổi sáng/tối)

extension UIColor {
    convenience init(hex: UInt32) {
        self.init(red: CGFloat((hex >> 16) & 0xFF) / 255, green: CGFloat((hex >> 8) & 0xFF) / 255, blue: CGFloat(hex & 0xFF) / 255, alpha: 1)
    }
}

extension Color {
    static func dyn(_ light: UInt32, _ dark: UInt32) -> Color {
        Color(UIColor { $0.userInterfaceStyle == .dark ? UIColor(hex: dark) : UIColor(hex: light) })
    }
    static let paper = Color.dyn(0xF8F4EC, 0x1F1B18)
    static let card = Color.dyn(0xFFFFFF, 0x2A2521)
    static let ink = Color.dyn(0x1C1917, 0xF5F1EA)
    static let muted = Color.dyn(0x57534E, 0xB8B0A6)
    static let accent = Color.dyn(0xA3201A, 0xF0705F)
    static let accentSoft = Color.dyn(0xFBEDEA, 0x3A1F1B)
    static let onAccent = Color.dyn(0xFFFFFF, 0x1C1917)
    static let goldInk = Color.dyn(0x7A5410, 0xE2B65A)
    static let goldSoft = Color.dyn(0xFBF1D9, 0x3A2E15)
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
    func widgetBackground(_ color: Color, pad: Bool = true) -> some View {
        if #available(iOSApplicationExtension 17.0, *) {
            self.containerBackground(color, for: .widget)
        } else if pad {
            self.padding(12).frame(maxWidth: .infinity, maxHeight: .infinity).background(color)
        } else {
            self
        }
    }
}

// MARK: - Khối tờ lịch dùng chung

struct SheetBlock: View {
    let day: DayInfo
    var compact = false

    var body: some View {
        VStack(spacing: 2) {
            Text("TH \(day.m) · \(String(day.y))")
                .font(.bvp(11, .bold))
                .foregroundColor(.onAccent)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 4)
                .background(RoundedRectangle(cornerRadius: 8).fill(Color.accent))
            Text("\(day.d)")
                .font(.digits(compact ? 44 : 50))
                .foregroundColor(.accent)
                .minimumScaleFactor(0.5)
                .lineLimit(1)
                .frame(maxHeight: .infinity)
            Text(LunarText.thu[day.wd])
                .font(.bvp(12))
                .foregroundColor(.muted)
            if day.hasLunar {
                Text("\(day.lunarShort) Âm · \(day.canChi)")
                    .font(.bvp(compact ? 11 : 12, .semibold))
                    .foregroundColor(.ink)
                    .lineLimit(1)
                    .minimumScaleFactor(0.7)
            }
        }
    }
}

// MARK: - 1. Tờ lịch (nhỏ)

struct SheetView: View {
    let entry: DayEntry

    var body: some View {
        let today = EpochDay.of(date: entry.date)
        let day = CalStore.shared.day(today)
        let note = UserStore().note(for: day)
        VStack(spacing: 2) {
            SheetBlock(day: day)
            if !note.isEmpty {
                Text(note)
                    .font(.bvp(11, .bold))
                    .foregroundColor(.accent)
                    .lineLimit(1)
                    .minimumScaleFactor(0.7)
            }
        }
        .widgetBackground(.paper)
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
            SheetBlock(day: day, compact: true)
                .padding(6)
                .background(RoundedRectangle(cornerRadius: 14).fill(Color.card))
                .frame(width: 132)
            VStack(alignment: .leading, spacing: 6) {
                Text("Sắp tới").font(.bvp(14, .bold)).foregroundColor(.ink)
                if items.isEmpty {
                    Text("Không có sự kiện trong 4 tháng tới").font(.bvp(12)).foregroundColor(.muted)
                }
                ForEach(items) { it in
                    let c = EpochDay.civil(it.epoch)
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
                Spacer(minLength: 0)
            }
        }
        .widgetBackground(.paper)
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
            HStack(alignment: .lastTextBaseline) {
                Text("Tháng \(t.m) · \(String(t.y))").font(.bvp(16, .bold)).foregroundColor(.ink)
                Spacer()
                if f.hasLunar {
                    Text("Âm: tháng \(f.lm)\(f.lm != l.lm ? "–\(l.lm)" : "") \(CalStore.shared.yearName(l.ly))")
                        .font(.bvp(11)).foregroundColor(.muted).lineLimit(1)
                }
            }
            HStack(spacing: 2) {
                ForEach(0..<7, id: \.self) { i in
                    Text(["T2", "T3", "T4", "T5", "T6", "T7", "CN"][i])
                        .font(.bvp(11, .bold))
                        .foregroundColor(i == 6 ? .accent : .muted)
                        .frame(maxWidth: .infinity)
                }
            }
            ForEach(0..<rows, id: \.self) { r in
                HStack(spacing: 2) {
                    ForEach(0..<7, id: \.self) { c in
                        let e = first - lead + r * 7 + c
                        if e < first || e >= nextFirst {
                            Color.clear.frame(maxWidth: .infinity, maxHeight: .infinity)
                        } else {
                            MonthCell(day: CalStore.shared.day(e), isToday: e == today, gio: !user.giosOn(e).isEmpty)
                        }
                    }
                }
            }
        }
        .widgetBackground(.paper)
    }
}

struct MonthCell: View {
    let day: DayInfo
    let isToday: Bool
    let gio: Bool

    var body: some View {
        let moon = day.ld == 1 || day.ld == 15
        VStack(spacing: 0) {
            Text("\(day.d)")
                .font(.bvp(14, .semibold))
                .foregroundColor(isToday ? .onAccent : (day.wd == 0 ? .accent : .ink))
            if day.hasLunar {
                Text((day.ld == 1 ? "\(day.ld)/\(day.lm)" : "\(day.ld)") + (gio ? " •" : ""))
                    .font(.bvp(10, moon || gio ? .bold : .regular))
                    .foregroundColor(isToday ? .onAccent : (moon ? .goldInk : day.kind == 2 ? .accent : .muted))
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(
            RoundedRectangle(cornerRadius: 8)
                .fill(isToday ? Color.accent : (moon ? Color.goldSoft : Color.clear))
        )
    }
}

// MARK: - 4. Đếm ngược (nhỏ)

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
                    .foregroundColor(.ink)
                    .multilineTextAlignment(.center)
                    .lineLimit(2)
                    .minimumScaleFactor(0.8)
                Text(diff <= 0 ? "Hôm nay" : "\(diff)")
                    .font(.digits(48))
                    .foregroundColor(.accent)
                    .minimumScaleFactor(0.4)
                    .lineLimit(1)
                    .frame(maxHeight: .infinity)
                if diff > 0 {
                    Text("ngày nữa").font(.bvp(12)).foregroundColor(.muted)
                }
                Text("\(LunarText.thu[d.wd]), \(d.d)/\(d.m)" + (d.hasLunar ? " · \(d.lunarShort) Âm" : ""))
                    .font(.bvp(11))
                    .foregroundColor(.muted)
                    .lineLimit(1)
                    .minimumScaleFactor(0.7)
            } else {
                Text("Mở app để chọn mốc đếm ngược").font(.bvp(12)).foregroundColor(.muted).multilineTextAlignment(.center)
            }
        }
        .widgetBackground(.paper)
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
        .widgetBackground(.clear, pad: false)
    }
}
