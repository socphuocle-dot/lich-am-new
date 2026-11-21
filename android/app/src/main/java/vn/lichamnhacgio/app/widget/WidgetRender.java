package vn.lichamnhacgio.app.widget;

import android.app.PendingIntent;
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
        Intent i = ctx.getPackageManager().getLaunchIntentForPackage(ctx.getPackageName());
        if (i == null) i = new Intent();
        i.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        return PendingIntent.getActivity(ctx, 0, i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
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

    private static void fillSheet(Context ctx, RemoteViews v, CalendarStore.Day d) {
        v.setTextViewText(R.id.band, "TH " + d.m + " · " + d.y);
        v.setTextViewText(R.id.day, String.valueOf(d.d));
        v.setTextViewText(R.id.weekday, CalendarStore.THU[d.wd]);
        v.setTextViewText(R.id.lunar, lunarLine(ctx, d));
    }

    /* 1. Tờ lịch (2×2) */
    public static RemoteViews sheet(Context ctx) {
        CalendarStore.Day d = CalendarStore.day(ctx, CalendarStore.todayEpoch());
        RemoteViews v = new RemoteViews(ctx.getPackageName(), R.layout.widget_sheet);
        fillSheet(ctx, v, d);
        v.setTextViewText(R.id.note, todayNote(ctx, d));
        v.setOnClickPendingIntent(R.id.root, openApp(ctx));
        return v;
    }

    private static final int[] ROW = {R.id.row0, R.id.row1, R.id.row2, R.id.row3};
    private static final int[] DATE = {R.id.date0, R.id.date1, R.id.date2, R.id.date3};
    private static final int[] TITLE = {R.id.title0, R.id.title1, R.id.title2, R.id.title3};
    private static final int[] COUNT = {R.id.count0, R.id.count1, R.id.count2, R.id.count3};

    /* 2. Lịch & sắp tới (4×2) */
    public static RemoteViews agenda(Context ctx) {
        long today = CalendarStore.todayEpoch();
        CalendarStore.Day d = CalendarStore.day(ctx, today);
        RemoteViews v = new RemoteViews(ctx.getPackageName(), R.layout.widget_agenda);
        fillSheet(ctx, v, d);
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
