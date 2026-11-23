import WidgetKit
import SwiftUI

/// Dòng thời gian: một mục cho bây giờ và mỗi nửa đêm trong 7 ngày tới — không cần mở app, không cần mạng.
struct DayEntry: TimelineEntry {
    let date: Date
}

struct DayProvider: TimelineProvider {
    func placeholder(in context: Context) -> DayEntry { DayEntry(date: Date()) }

    func getSnapshot(in context: Context, completion: @escaping (DayEntry) -> Void) {
        completion(DayEntry(date: Date()))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<DayEntry>) -> Void) {
        let today = EpochDay.of(date: Date())
        var entries = [DayEntry(date: Date())]
        for i in 1...7 {
            entries.append(DayEntry(date: EpochDay.midnight(today + i).addingTimeInterval(5)))
        }
        completion(Timeline(entries: entries, policy: .atEnd))
    }
}

/// Đồng hồ: mỗi phút một mục trong 3 giờ tới (iOS không cho widget chạy đồng hồ thật như hệ thống);
/// nửa đêm và đầu giờ âm nằm sẵn trong dòng thời gian nên ngày âm, giờ hoàng đạo cũng tự đổi.
struct ClockProvider: TimelineProvider {
    func placeholder(in context: Context) -> DayEntry { DayEntry(date: Date()) }
    func getSnapshot(in context: Context, completion: @escaping (DayEntry) -> Void) { completion(DayEntry(date: Date())) }
    func getTimeline(in context: Context, completion: @escaping (Timeline<DayEntry>) -> Void) {
        let now = Date()
        let cal = Calendar.current
        let start = cal.date(bySetting: .second, value: 0, of: now) ?? now
        var entries = [DayEntry(date: now)]
        for i in 1...180 {
            if let d = cal.date(byAdding: .minute, value: i, to: start) { entries.append(DayEntry(date: d)) }
        }
        completion(Timeline(entries: entries, policy: .atEnd))
    }
}

struct ClockWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "ClockWidget", provider: ClockProvider()) { e in ClockView(entry: e) }
            .configurationDisplayName("Đồng hồ & lịch âm")
            .description("Đồng hồ, ngày âm, giờ hoàng đạo và việc sắp tới. Đổi kiểu Giấy / Sơn mài trong app.")
            .supportedFamilies([.systemMedium, .systemLarge])
            .noContentMargins()
    }
}

extension WidgetConfiguration {
    /// iOS 17+: tự lo lề để dải sơn mài tràn sát mép
    func noContentMargins() -> some WidgetConfiguration {
        if #available(iOSApplicationExtension 17.0, *) { return self.contentMarginsDisabled() } else { return self }
    }
}

struct SheetWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "SheetWidget", provider: DayProvider()) { e in SheetView(entry: e) }
            .configurationDisplayName("Tờ lịch")
            .description("Ngày dương, ngày âm, can chi và ngày tốt hôm nay.")
            .supportedFamilies([.systemSmall])
    }
}

struct AgendaWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "AgendaWidget", provider: DayProvider()) { e in AgendaView(entry: e) }
            .configurationDisplayName("Lịch & sắp tới")
            .description("Tờ lịch kèm ngày giỗ, rằm, lễ sắp tới. Cỡ lớn hiện nhiều việc hơn.")
            .supportedFamilies([.systemMedium, .systemLarge])
    }
}

struct MonthWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "MonthWidget", provider: DayProvider()) { e in MonthView(entry: e) }
            .configurationDisplayName("Lịch tháng")
            .description("Cả tháng có ngày âm, đánh dấu rằm, mùng 1, ngày giỗ.")
            .supportedFamilies([.systemLarge])
    }
}

struct CountdownWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "CountdownWidget", provider: DayProvider()) { e in CountdownView(entry: e) }
            .configurationDisplayName("Đếm ngược")
            .description("Đếm ngày tới Tết hoặc ngày giỗ bạn chọn trong app.")
            .supportedFamilies([.systemSmall, .systemMedium])
    }
}

struct LockWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "LockWidget", provider: DayProvider()) { e in LockView(entry: e) }
            .configurationDisplayName("Âm lịch · Màn hình khóa")
            .description("Ngày âm và sự kiện sắp tới trên màn hình khóa.")
            .supportedFamilies([.accessoryInline, .accessoryCircular, .accessoryRectangular])
    }
}

struct IconWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "IconWidget", provider: DayProvider()) { e in IconView(entry: e) }
            .configurationDisplayName("Ngày hôm nay")
            .description("Giống biểu tượng Lịch: thứ, ngày dương lớn và ngày âm có trăng.")
            .supportedFamilies([.systemSmall])
    }
}

struct TipWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "TipWidget", provider: DayProvider()) { e in TipView(entry: e) }
            .configurationDisplayName("Lời nhắc hôm nay")
            .description("Linh vật nhắc ngày giỗ, rằm, ngày chay, Tết sắp tới.")
            .supportedFamilies([.systemMedium])
    }
}

@main
struct LichAmWidgetBundle: WidgetBundle {
    var body: some Widget {
        IconWidget()
        SheetWidget()
        TipWidget()
        AgendaWidget()
        ClockWidget()
        MonthWidget()
        CountdownWidget()
        LockWidget()
    }
}
