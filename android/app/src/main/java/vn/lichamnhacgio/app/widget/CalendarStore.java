package vn.lichamnhacgio.app.widget;

import android.content.Context;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Calendar;

/** Bảng lịch tĩnh (assets/widget_calendar.json) sinh sẵn từ thuật toán âm lịch của app. */
public final class CalendarStore {
    private CalendarStore() {}

    public static final class Day {
        public long epoch;
        public int y, m, d, wd; // wd: 0 = Chủ Nhật
        public int ld, lm, ly;
        public boolean leap, good;
        public String canChi = "";
        public String event = "";
        public int kind; // 0 không, 1 rằm/mùng 1, 2 lễ
    }

    public static final String[] THU = {"Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"};
    public static final String[] THU_SHORT = {"CN", "T2", "T3", "T4", "T5", "T6", "T7"};

    private static JSONArray days;
    private static JSONObject years;
    private static long startEpoch;

    private static synchronized void ensure(Context ctx) {
        if (days != null) return;
        try (InputStream in = ctx.getAssets().open("widget_calendar.json")) {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            byte[] buf = new byte[16384];
            int n;
            while ((n = in.read(buf)) > 0) out.write(buf, 0, n);
            JSONObject o = new JSONObject(new String(out.toByteArray(), StandardCharsets.UTF_8));
            days = o.getJSONArray("days");
            years = o.getJSONObject("years");
            startEpoch = o.getLong("startEpochDay");
        } catch (Exception e) {
            days = new JSONArray();
            years = new JSONObject();
            startEpoch = 0;
        }
    }

    /** Số ngày kể từ 1970-01-01 (thuật toán days_from_civil). */
    public static long epochOf(int y, int m, int d) {
        y -= m <= 2 ? 1 : 0;
        long era = (y >= 0 ? y : y - 399) / 400;
        long yoe = y - era * 400;
        long doy = (153L * (m + (m > 2 ? -3 : 9)) + 2) / 5 + d - 1;
        long doe = yoe * 365 + yoe / 4 - yoe / 100 + doy;
        return era * 146097 + doe - 719468;
    }

    public static int[] civil(long z) {
        z += 719468;
        long era = (z >= 0 ? z : z - 146096) / 146097;
        long doe = z - era * 146097;
        long yoe = (doe - doe / 1460 + doe / 36524 - doe / 146096) / 365;
        long y = yoe + era * 400;
        long doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
        long mp = (5 * doy + 2) / 153;
        long d = doy - (153 * mp + 2) / 5 + 1;
        long m = mp < 10 ? mp + 3 : mp - 9;
        return new int[]{(int) (y + (m <= 2 ? 1 : 0)), (int) m, (int) d};
    }

    public static long todayEpoch() {
        Calendar c = Calendar.getInstance();
        return epochOf(c.get(Calendar.YEAR), c.get(Calendar.MONTH) + 1, c.get(Calendar.DAY_OF_MONTH));
    }

    public static long epochFromYmd(String s) {
        try {
            String[] p = s.split("-");
            return epochOf(Integer.parseInt(p[0]), Integer.parseInt(p[1]), Integer.parseInt(p[2]));
        } catch (Exception e) {
            return Long.MIN_VALUE;
        }
    }

    /** Thông tin một ngày; ngoài phạm vi bảng (2025–2036) thì phần âm lịch để trống. */
    public static Day day(Context ctx, long epoch) {
        ensure(ctx);
        Day d = new Day();
        d.epoch = epoch;
        int[] c = civil(epoch);
        d.y = c[0];
        d.m = c[1];
        d.d = c[2];
        d.wd = (int) Math.floorMod(epoch + 4, 7L);
        long i = epoch - startEpoch;
        if (i >= 0 && i < days.length()) {
            JSONArray a = days.optJSONArray((int) i);
            if (a != null) {
                d.ld = a.optInt(0);
                d.lm = a.optInt(1);
                d.leap = a.optInt(2) == 1;
                d.ly = a.optInt(3);
                d.canChi = a.optString(4, "");
                d.good = a.optInt(5) == 1;
                d.event = a.optString(6, "");
                d.kind = a.optInt(7);
            }
        }
        return d;
    }

    public static String yearName(Context ctx, int ly) {
        ensure(ctx);
        return years.optString(String.valueOf(ly), "");
    }

    public static boolean hasLunar(Day d) {
        return d.ld > 0;
    }

    public static String lunarShort(Day d) {
        return d.ld + "/" + d.lm + (d.leap ? "N" : "");
    }
}
