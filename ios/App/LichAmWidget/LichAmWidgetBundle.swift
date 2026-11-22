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
            .description("Tờ lịch kèm ngày giỗ, rằm, lễ sắp tới.")
            .supportedFamilies([.systemMedium])
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
            .supportedFamilies([.systemSmall])
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
            .configurationDisplayName("Bé Thỏ nhắc")
            .description("Bé Thỏ Ngọc nhắc ngày giỗ, rằm, sinh nhật sắp tới.")
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
        MonthWidget()
        CountdownWidget()
        LockWidget()
    }
}
