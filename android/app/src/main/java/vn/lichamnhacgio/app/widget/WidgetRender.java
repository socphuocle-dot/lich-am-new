package vn.lichamnhacgio.app.widget;

import android.app.PendingIntent;
import android.net.Uri;
import android.content.Context;
import android.content.Intent;
import android.graphics.Typeface;
import android.text.SpannableStringBuilder;
import android.text.Spanned;
import android.text.style.ForegroundColorSpan;
import android.text.style.RelativeSizeSpan;
import android.text.style.StyleSpan;
import android.view.View;
import android.widget.RemoteViews;

import java.util.List;

import vn.lichamnhacgio.app.R;

/** Vẽ các widget bằng RemoteViews. */
public final class WidgetRender {
    private WidgetRender() {}

    static PendingIntent openApp(Context ctx) {
        return openRoute(ctx, routeFor(ctx, CalendarStore.todayEpoch()));
    }

    /** Mở app tại một màn cụ thể qua link lichamnhacgio://open/<route> */
    static PendingIntent openRoute(Context ctx, String route) {
        Intent i = new Intent(Intent.ACTION_VIEW, Uri.parse("lichamnhacgio://open/" + route));
        i.setPackage(ctx.getPackageName());
        i.setClassName(ctx, "vn.lichamnhacgio.app.MainActivity");
        i.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        return PendingIntent.getActivity(ctx, route.hashCode(), i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    /** Hôm nay có giỗ / rằm / mùng 1 / lễ có văn khấn → mở văn khấn; nếu không → màn Hôm nay */
    static String routeFor(Context ctx, long epoch) {
        for (UserStore.Item g : UserStore.gios(ctx, epoch, 1)) if (!g.route.isEmpty()) return g.route;
        CalendarStore.Day d = CalendarStore.day(ctx, epoch);
        if (!CalendarStore.hasLunar(d)) return "today";
        String id = vanKhanId(d);
        return id == null ? "today" : "vankhan/" + id + "?jd=" + (epoch + 2440588L);
    }

    static String vanKhanId(CalendarStore.Day d) {
        if (d.lm == 12 && d.ld == 23) return "ongtao";
        if (d.lm == 1 && d.ld == 1) return "tet";
        if (d.lm == 1 && (d.ld == 3 || d.ld == 4)) return "hoavang";
        if (d.lm == 1 && d.ld == 10) return "thantai";
        if (d.lm == 1 && d.ld == 15) return "ramgieng";
        if (d.lm == 5 && d.ld == 5) return "doanngo";
        if (d.lm == 7 && d.ld == 15) return "vulan";
        if (d.ld == 15) return "ram";
        if (d.ld == 1) return "mung1";
        return null;
    }

    static String countText(long diff) {
        if (diff <= 0) return "Hôm nay";
        if (diff == 1) return "Ngày mai";
        return diff + " ngày";
    }

    static String lunarLine(Context ctx, CalendarStore.Day d) {
        if (!CalendarStore.hasLunar(d)) return "";
        return CalendarStore.lunarShort(d) + " Âm · " + d.canChi;
    }

    /** Ghi chú dưới tờ lịch: sự kiện hôm nay hoặc ngày hoàng đạo / hắc đạo */
    static String todayNote(Context ctx, CalendarStore.Day d) {
        List<UserStore.Item> g = UserStore.gios(ctx, d.epoch, 1);
        if (!g.isEmpty()) return g.get(0).title;
        if (!d.event.isEmpty()) return d.event;
        if (!CalendarStore.hasLunar(d)) return "";
        return d.good ? "Ngày Hoàng đạo" : "Ngày Hắc đạo";
    }

    private static void fillSheet(Context ctx, RemoteViews v, CalendarStore.Day d, boolean longBand) {
        v.setTextViewText(R.id.band, (longBand ? "THÁNG " : "TH ") + d.m + " · " + d.y);
        v.setTextViewText(R.id.day, String.valueOf(d.d));
        v.setTextViewText(R.id.weekday, CalendarStore.THU[d.wd]);
        v.setTextViewText(R.id.lunar, lunarLine(ctx, d));
    }

    /* 0. Biểu tượng ngày (1×1) — số ngày đổi theo ngày của máy */
    public static RemoteViews icon(Context ctx) {
        CalendarStore.Day d = CalendarStore.day(ctx, CalendarStore.todayEpoch());
        RemoteViews v = new RemoteViews(ctx.getPackageName(), R.layout.widget_icon);
        v.setTextViewText(R.id.weekday, d.wd == 0 ? "CN" : "THỨ " + (d.wd + 1));
        v.setTextViewText(R.id.day, String.valueOf(d.d));
        v.setTextViewText(R.id.lunar, CalendarStore.hasLunar(d) ? CalendarStore.lunarShort(d) + " ÂL" : "");
        v.setOnClickPendingIntent(R.id.root, openApp(ctx));
        return v;
    }

    /* 1. Tờ lịch (2×2) */
    public static RemoteViews sheet(Context ctx) {
        CalendarStore.Day d = CalendarStore.day(ctx, CalendarStore.todayEpoch());
        RemoteViews v = new RemoteViews(ctx.getPackageName(), R.layout.widget_sheet);
        fillSheet(ctx, v, d, true);
        v.setTextViewText(R.id.note, todayNote(ctx, d));
        v.setOnClickPendingIntent(R.id.root, openApp(ctx));
        return v;
    }

    private static final int[] ROW = {R.id.row0, R.id.row1, R.id.row2, R.id.row3};
    private static final int[] DATE = {R.id.date0, R.id.date1, R.id.date2, R.id.date3};
    private static final int[] TITLE = {R.id.title0, R.id.title1, R.id.title2, R.id.title3};
    private static final int[] COUNT = {R.id.count0, R.id.count1, R.id.count2, R.id.count3};
    private static final int[] DOT = {R.id.dot0, R.id.dot1, R.id.dot2, R.id.dot3};

    /* 2. Lịch & sắp tới (4×2) */
    public static RemoteViews agenda(Context ctx) {
        long today = CalendarStore.todayEpoch();
        CalendarStore.Day d = CalendarStore.day(ctx, today);
        RemoteViews v = new RemoteViews(ctx.getPackageName(), R.layout.widget_agenda);
        fillSheet(ctx, v, d, false);
        List<UserStore.Item> items = UserStore.upcoming(ctx, today, 120, 3);
        for (int i = 0; i < ROW.length; i++) {
            if (i < items.size()) {
                UserStore.Item it = items.get(i);
                int[] c = CalendarStore.civil(it.epoch);
                v.setViewVisibility(ROW[i], View.VISIBLE);
                v.setTextViewText(DATE[i], CalendarStore.THU_SHORT[(int) Math.floorMod(it.epoch + 4, 7L)] + " " + c[2] + "/" + c[1]);
                v.setTextViewText(TITLE[i], it.title);
                v.setTextViewText(COUNT[i], "· " + countText(it.epoch - today));
                v.setTextColor(DATE[i], ctx.getColor(it.kind == 3 ? R.color.widget_ink : it.kind == 1 ? R.color.widget_gold_ink : R.color.widget_accent));
                v.setInt(DOT[i], "setBackgroundResource", it.kind == 3 ? R.drawable.widget_dot_gio : it.kind == 1 ? R.drawable.widget_dot_moon : R.drawable.widget_dot_le);
            } else {
                v.setViewVisibility(ROW[i], View.GONE);
            }
        }
        v.setViewVisibility(R.id.empty, items.isEmpty() ? View.VISIBLE : View.GONE);
        v.setOnClickPendingIntent(R.id.root, openApp(ctx));
        return v;
    }

    /* 3. Lịch tháng (4×4) */
    public static RemoteViews month(Context ctx) {
        long today = CalendarStore.todayEpoch();
        CalendarStore.Day t = CalendarStore.day(ctx, today);
        RemoteViews v = new RemoteViews(ctx.getPackageName(), R.layout.widget_month);
        long first = CalendarStore.epochOf(t.y, t.m, 1);
        long nextFirst = t.m == 12 ? CalendarStore.epochOf(t.y + 1, 1, 1) : CalendarStore.epochOf(t.y, t.m + 1, 1);
        int firstWd = (int) Math.floorMod(first + 4, 7L);
        int lead = (firstWd + 6) % 7; // tuần bắt đầu Thứ Hai
        CalendarStore.Day f = CalendarStore.day(ctx, first);
        CalendarStore.Day l = CalendarStore.day(ctx, nextFirst - 1);
        v.setTextViewText(R.id.title, "Tháng " + t.m + " · " + t.y);
        String sub = "";
        if (CalendarStore.hasLunar(f)) {
            sub = "Âm: tháng " + f.lm + (f.lm != l.lm ? "–" + l.lm : "") + " " + CalendarStore.yearName(ctx, l.ly);
        }
        v.setTextViewText(R.id.subtitle, sub);
        int accent = ctx.getColor(R.color.widget_accent);
        int muted = ctx.getColor(R.color.widget_muted);
        int gold = ctx.getColor(R.color.widget_gold_ink);
        int ink = ctx.getColor(R.color.widget_ink);
        int onAccent = ctx.getColor(R.color.widget_on_accent);
        int totalCells = lead + (int) (nextFirst - first);
        v.setViewVisibility(R.id.week5, totalCells > 35 ? View.VISIBLE : View.GONE);
        for (int i = 0; i < 42; i++) {
            int id = ctx.getResources().getIdentifier("cell_" + i, "id", ctx.getPackageName());
            if (id == 0) continue;
            long e = first - lead + i;
            if (e < first || e >= nextFirst) {
                v.setTextViewText(id, "");
                v.setInt(id, "setBackgroundResource", 0);
                continue;
            }
            CalendarStore.Day d = CalendarStore.day(ctx, e);
            boolean isToday = e == today;
            boolean moon = d.ld == 1 || d.ld == 15;
            boolean gio = UserStore.hasGio(ctx, e);
            SpannableStringBuilder sb = new SpannableStringBuilder();
            String num = String.valueOf(d.d);
            sb.append(num);
            sb.setSpan(new StyleSpan(Typeface.BOLD), 0, num.length(), Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
            int dayColor = isToday ? onAccent : (d.wd == 0 ? accent : ink);
            sb.setSpan(new ForegroundColorSpan(dayColor), 0, num.length(), Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
            if (CalendarStore.hasLunar(d)) {
                String lun = "\n" + (d.ld == 1 ? d.ld + "/" + d.lm : String.valueOf(d.ld)) + (gio ? " •" : "");
                int s = sb.length();
                sb.append(lun);
                sb.setSpan(new RelativeSizeSpan(0.72f), s, sb.length(), Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
                int lc = isToday ? onAccent : (moon ? gold : d.kind == 2 ? accent : muted);
                sb.setSpan(new ForegroundColorSpan(lc), s, sb.length(), Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
                if (moon || gio) sb.setSpan(new StyleSpan(Typeface.BOLD), s, sb.length(), Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
            }
            v.setTextViewText(id, sb);
            v.setInt(id, "setBackgroundResource", isToday ? R.drawable.widget_cell_today : (moon ? R.drawable.widget_cell_moon : 0));
        }
        v.setOnClickPendingIntent(R.id.root, openApp(ctx));
        return v;
    }

    /* 4. Đếm ngược (2×2) */
    public static RemoteViews countdown(Context ctx) {
        long today = CalendarStore.todayEpoch();
        RemoteViews v = new RemoteViews(ctx.getPackageName(), R.layout.widget_countdown);
        UserStore.Item it = UserStore.countdown(ctx, today);
        if (it == null) {
            v.setTextViewText(R.id.title, "Đếm ngược");
            v.setTextViewText(R.id.number, "–");
            v.setTextViewText(R.id.unit, "Mở app để chọn mốc");
            v.setTextViewText(R.id.date, "");
        } else {
            long diff = it.epoch - today;
            int[] c = CalendarStore.civil(it.epoch);
            CalendarStore.Day d = CalendarStore.day(ctx, it.epoch);
            v.setTextViewText(R.id.title, it.title);
            v.setTextViewText(R.id.number, diff <= 0 ? "Hôm nay" : String.valueOf(diff));
            v.setTextViewText(R.id.unit, diff <= 0 ? "" : "ngày nữa");
            v.setTextViewText(R.id.date, CalendarStore.THU[d.wd] + ", " + c[2] + "/" + c[1]
                    + (CalendarStore.hasLunar(d) ? " · " + CalendarStore.lunarShort(d) + " Âm" : ""));
        }
        v.setOnClickPendingIntent(R.id.root, openApp(ctx));
        return v;
    }
}
