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

    private static final String[] CHI = {"Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"};

    static int drawable(Context ctx, String name) {
        return ctx.getResources().getIdentifier(name, "drawable", ctx.getPackageName());
    }

    /** Ảnh trăng đúng pha theo ngày âm (1–30) */
    static int moonRes(Context ctx, CalendarStore.Day d) {
        int ld = CalendarStore.hasLunar(d) ? Math.max(1, Math.min(30, d.ld)) : 15;
        return drawable(ctx, String.format(java.util.Locale.US, "widget_moon_%02d", ld));
    }

    /** Ảnh con giáp theo chi (lấy từ chữ cuối của can chi, vd "Kỷ Hợi" → Lợn) */
    static int giapRes(Context ctx, String canChi) {
        String last = canChi == null ? "" : canChi.trim();
        int sp = last.lastIndexOf(' ');
        if (sp >= 0) last = last.substring(sp + 1);
        for (int i = 0; i < 12; i++) if (CHI[i].equals(last)) return drawable(ctx, String.format(java.util.Locale.US, "widget_giap_%02d", i));
        return 0;
    }

    static int giapOfYear(Context ctx, int lunarYear) {
        return drawable(ctx, String.format(java.util.Locale.US, "widget_giap_%02d", Math.floorMod(lunarYear + 8, 12)));
    }

    /** Biểu tượng màu cho từng loại sự kiện trong danh sách */
    static int eventIcon(Context ctx, UserStore.Item it) {
        if (it.kind == 3) {
            if (it.title.startsWith("Sinh nhật")) return drawable(ctx, "widget_ic_bday");
            if (it.title.startsWith("Cúng")) return drawable(ctx, "widget_ic_lotus");
            if (!it.title.startsWith("Giỗ")) return drawable(ctx, "widget_ic_kyniem");
            return drawable(ctx, "widget_ic_gio");
        }
        return drawable(ctx, it.kind == 1 ? "widget_ic_moon" : "widget_ic_le");
    }

    private static void setImage(RemoteViews v, int viewId, int res) {
        if (res != 0) { v.setImageViewResource(viewId, res); v.setViewVisibility(viewId, View.VISIBLE); }
        else v.setViewVisibility(viewId, View.GONE);
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
        v.setTextViewText(R.id.weekday, CalendarStore.THU[d.wd].toUpperCase(new java.util.Locale("vi")));
        v.setTextViewText(R.id.day, String.valueOf(d.d));
        v.setTextViewText(R.id.lunar, CalendarStore.hasLunar(d) ? CalendarStore.lunarShort(d) : "");
        setImage(v, R.id.moon, CalendarStore.hasLunar(d) ? moonRes(ctx, d) : 0);
        v.setOnClickPendingIntent(R.id.root, openApp(ctx));
        return v;
    }

    /* 1. Tờ lịch (2×2) */
    public static RemoteViews sheet(Context ctx) {
        CalendarStore.Day d = CalendarStore.day(ctx, CalendarStore.todayEpoch());
        RemoteViews v = new RemoteViews(ctx.getPackageName(), R.layout.widget_sheet);
        fillSheet(ctx, v, d, true);
        v.setTextViewText(R.id.note, todayNote(ctx, d));
        setImage(v, R.id.moon, CalendarStore.hasLunar(d) ? moonRes(ctx, d) : 0);
        setImage(v, R.id.giap, giapRes(ctx, d.canChi));
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
        setImage(v, R.id.moon, CalendarStore.hasLunar(d) ? moonRes(ctx, d) : 0);
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
                setImage(v, DOT[i], eventIcon(ctx, it));
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
        setImage(v, R.id.giap, CalendarStore.hasLunar(t) ? giapOfYear(ctx, t.ly) : 0);
        int accent = ctx.getColor(R.color.widget_accent);
        int muted = ctx.getColor(R.color.widget_muted);
        int gold = ctx.getColor(R.color.widget_gold_ink);
        int ink = ctx.getColor(R.color.widget_ink);
        int onAccent = ctx.getColor(R.color.widget_on_accent);
        int totalCells = lead + (int) (nextFirst - first);
        v.setViewVisibility(R.id.week5, totalCells > 35 ? View.VISIBLE : View.GONE);
        java.util.Map<Long, Boolean> bdays = new java.util.HashMap<>();
        for (UserStore.Item g : UserStore.gios(ctx, first, (int) (nextFirst - first))) {
            boolean b = g.title.startsWith("Sinh nhật") || (!g.title.startsWith("Giỗ") && !g.title.startsWith("Cúng"));
            Boolean prev = bdays.get(g.epoch);
            bdays.put(g.epoch, prev == null ? b : (prev && b)); // ngày có cả giỗ và sinh nhật: ưu tiên chấm giỗ
        }
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
                String lun = "\n" + (d.ld == 1 ? d.ld + "/" + d.lm : String.valueOf(d.ld));
                int s = sb.length();
                sb.append(lun);
                sb.setSpan(new RelativeSizeSpan(0.72f), s, sb.length(), Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
                int lc = isToday ? onAccent : (moon ? gold : d.kind == 2 ? accent : muted);
                sb.setSpan(new ForegroundColorSpan(lc), s, sb.length(), Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
                if (moon) sb.setSpan(new StyleSpan(Typeface.BOLD), s, sb.length(), Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
                // Chấm màu theo loại: đỏ = giỗ, hồng = sinh nhật/kỷ niệm, vàng = lễ
                int dot = gio ? (Boolean.TRUE.equals(bdays.get(e)) ? 0xFFE0568A : 0xFFB3261E) : d.kind == 2 ? 0xFFD29A34 : 0;
                if (dot != 0) {
                    int s2 = sb.length();
                    sb.append("\n●");
                    sb.setSpan(new RelativeSizeSpan(0.5f), s2, sb.length(), Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
                    sb.setSpan(new ForegroundColorSpan(isToday ? onAccent : dot), s2, sb.length(), Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
                }
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
            setImage(v, R.id.mascot, drawable(ctx, it.title.startsWith("Sinh nhật") ? "widget_mascot_cake" : it.title.startsWith("Tết") ? "widget_mascot_lantern" : it.title.startsWith("Giỗ") ? "widget_mascot_pray" : "widget_mascot_star"));
            v.setTextViewText(R.id.number, diff <= 0 ? "Hôm nay" : String.valueOf(diff));
            v.setTextViewText(R.id.unit, diff <= 0 ? "" : "ngày nữa");
            v.setTextViewText(R.id.date, CalendarStore.THU[d.wd] + ", " + c[2] + "/" + c[1]
                    + (CalendarStore.hasLunar(d) ? " · " + CalendarStore.lunarShort(d) + " Âm" : ""));
        }
        v.setOnClickPendingIntent(R.id.root, openApp(ctx));
        return v;
    }

    /* 5. Bé Thỏ nhắc (4×1) — linh vật + lời nhắn theo ngày */
    public static RemoteViews tip(Context ctx) {
        long today = CalendarStore.todayEpoch();
        CalendarStore.Day d = CalendarStore.day(ctx, today);
        RemoteViews v = new RemoteViews(ctx.getPackageName(), R.layout.widget_tip);
        int h = java.util.Calendar.getInstance().get(java.util.Calendar.HOUR_OF_DAY);
        String greet = h < 11 ? "Chào buổi sáng!" : h < 14 ? "Chào buổi trưa!" : h < 18 ? "Chào buổi chiều!" : "Chào buổi tối!";
        v.setTextViewText(R.id.tip_title, greet + " " + CalendarStore.THU[d.wd] + " " + d.d + "/" + d.m);
        String text;
        String pose = "wave";
        List<UserStore.Item> next = UserStore.upcoming(ctx, today, 8, 1);
        if (!next.isEmpty()) {
            UserStore.Item it = next.get(0);
            long diff = it.epoch - today;
            text = (diff <= 0 ? "Hôm nay: " : diff == 1 ? "Ngày mai: " : "Còn " + diff + " ngày nữa là ") + it.title;
            pose = it.title.startsWith("Sinh nhật") ? "cake" : it.kind == 1 ? "lantern" : it.kind == 3 ? "pray" : "star";
        } else if (CalendarStore.hasLunar(d) && (d.ld == 1 || d.ld == 15)) {
            text = "Hôm nay " + (d.ld == 15 ? "Rằm" : "mùng Một") + ", nhớ thắp nén hương nhé";
            pose = "lantern";
        } else if (CalendarStore.hasLunar(d)) {
            int n = 0;
            String target = "";
            for (int i = 1; i <= 31; i++) {
                CalendarStore.Day x = CalendarStore.day(ctx, today + i);
                if (x.ld == 1 || x.ld == 15) { n = i; target = x.ld == 15 ? "Rằm" : "mùng Một"; break; }
            }
            text = n > 0 ? "Còn " + n + " ngày nữa đến " + target + " · " + (d.good ? "ngày Hoàng đạo" : "ngày Hắc đạo") : lunarLine(ctx, d);
        } else {
            text = "Mở app để xem lịch âm hôm nay";
        }
        v.setTextViewText(R.id.tip_text, text);
        setImage(v, R.id.mascot, drawable(ctx, "widget_mascot_" + pose));
        setImage(v, R.id.moon, CalendarStore.hasLunar(d) ? moonRes(ctx, d) : 0);
        v.setTextViewText(R.id.lunar, CalendarStore.hasLunar(d) ? CalendarStore.lunarShort(d) : "");
        v.setOnClickPendingIntent(R.id.root, openApp(ctx));
        return v;
    }
}
