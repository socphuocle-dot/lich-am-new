package vn.lichamnhacgio.app.widget;

import android.content.Context;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/** Dữ liệu động do app ghi: ngày giỗ sắp tới + mốc đếm ngược. */
public final class UserStore {
    private UserStore() {}

    public static final String PREFS = "lich_am_widget";
    public static final String KEY = "json";

    public static final class Item implements Comparable<Item> {
        public long epoch;
        public String title;
        public int kind; // 1 rằm/mùng 1, 2 lễ, 3 giỗ
        public String route = "";

        Item(long epoch, String title, int kind) {
            this.epoch = epoch;
            this.title = title;
            this.kind = kind;
        }

        @Override
        public int compareTo(Item o) {
            if (epoch != o.epoch) return epoch < o.epoch ? -1 : 1;
            return o.kind - kind; // giỗ lên trước
        }
    }

    private static JSONObject cache;

    public static synchronized void invalidate() {
        cache = null;
    }

    private static synchronized JSONObject data(Context ctx) {
        if (cache != null) return cache;
        try {
            String s = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString(KEY, null);
            cache = s != null ? new JSONObject(s) : new JSONObject();
        } catch (Exception e) {
            cache = new JSONObject();
        }
        return cache;
    }

    /** Linh vật người dùng chọn trong app: tho | meo | lan | nghe | cun */
    /** Kiểu widget đồng hồ chọn trong app: "giay" (mặc định) hoặc "sonmai" */
    public static String clockStyle(Context ctx) {
        return data(ctx).optString("cs", "giay");
    }

    public static String mascot(Context ctx) {
        return data(ctx).optString("m", "tho");
    }

    /** Ngày giỗ trong khoảng [from, from+days) */
    public static List<Item> gios(Context ctx, long from, int days) {
        List<Item> out = new ArrayList<>();
        JSONArray a = data(ctx).optJSONArray("gios");
        if (a == null) return out;
        for (int i = 0; i < a.length(); i++) {
            JSONObject g = a.optJSONObject(i);
            if (g == null) continue;
            long e = CalendarStore.epochFromYmd(g.optString("d"));
            if (e >= from && e < from + days) {
                Item it = new Item(e, g.optString("t"), 3);
                it.route = g.optString("r", "");
                out.add(it);
            }
        }
        return out;
    }

    /** Sự kiện sắp tới (giỗ + lễ + rằm/mùng 1) đã sắp xếp. */
    public static List<Item> upcoming(Context ctx, long from, int days, int max) {
        List<Item> out = gios(ctx, from, days);
        for (long e = from; e < from + days; e++) {
            CalendarStore.Day d = CalendarStore.day(ctx, e);
            if (d.kind > 0 && !d.event.isEmpty()) out.add(new Item(e, d.event, d.kind));
        }
        Collections.sort(out);
        return out.size() > max ? new ArrayList<>(out.subList(0, max)) : out;
    }

    public static boolean hasGio(Context ctx, long epoch) {
        return !gios(ctx, epoch, 1).isEmpty();
    }

    /** Mốc đếm ngược: do app chọn, nếu chưa có thì lấy Tết sắp tới từ bảng tĩnh. */
    /* ---------- Lựa chọn riêng của từng widget (đặt khi thêm widget, hoặc giữ widget → Cấu hình lại) ---------- */
    public static final String CHOICE_PREFS = "lich_am_widget_choice";

    public static String choice(Context ctx, String key, int widgetId) {
        return ctx.getSharedPreferences(CHOICE_PREFS, Context.MODE_PRIVATE).getString(key + "_" + widgetId, "app");
    }

    public static void setChoice(Context ctx, String key, int widgetId, String value) {
        ctx.getSharedPreferences(CHOICE_PREFS, Context.MODE_PRIVATE).edit().putString(key + "_" + widgetId, value).apply();
    }

    public static void forget(Context ctx, int widgetId) {
        ctx.getSharedPreferences(CHOICE_PREFS, Context.MODE_PRIVATE).edit().remove("cd_" + widgetId).remove("cs_" + widgetId).apply();
    }

    /** Kiểu đồng hồ của một widget: chọn riêng, hoặc theo cài đặt trong app */
    public static String clockStyleFor(Context ctx, int widgetId) {
        String c = choice(ctx, "cs", widgetId);
        return "app".equals(c) ? clockStyle(ctx) : c;
    }

    /** Các ngày giỗ / sinh nhật / kỷ niệm có trong dữ liệu (mỗi người một dòng) để chọn đếm ngược */
    public static List<String[]> gioChoices(Context ctx, long today) {
        List<String[]> out = new ArrayList<>();
        java.util.Set<String> seen = new java.util.HashSet<>();
        JSONArray a = data(ctx).optJSONArray("gios");
        if (a == null) return out;
        for (int i = 0; i < a.length(); i++) {
            JSONObject g = a.optJSONObject(i);
            if (g == null) continue;
            String id = g.optString("i", "");
            long e = CalendarStore.epochFromYmd(g.optString("d"));
            if (id.isEmpty() || e < today || !seen.add(id)) continue;
            int[] c = CalendarStore.civil(e);
            out.add(new String[]{id, g.optString("t"), c[2] + "/" + c[1] + "/" + c[0]});
        }
        return out;
    }

    private static Item scanLunar(Context ctx, long today, int lm, int ld, String title) {
        for (long e = today; e < today + 400; e++) {
            CalendarStore.Day d = CalendarStore.day(ctx, e);
            if (d.ld == ld && d.lm == lm && !d.leap) return new Item(e, title, 2);
        }
        return null;
    }

    /** Mốc đếm ngược của một widget */
    public static Item countdownFor(Context ctx, long today, int widgetId) {
        String c = choice(ctx, "cd", widgetId);
        if ("tet".equals(c)) { Item it = scanLunar(ctx, today, 1, 1, "Tết Nguyên Đán"); if (it != null) return it; }
        if ("ongtao".equals(c)) { Item it = scanLunar(ctx, today, 12, 23, "Ông Công Ông Táo"); if (it != null) return it; }
        if (c.startsWith("g:")) {
            String id = c.substring(2);
            JSONArray a = data(ctx).optJSONArray("gios");
            for (int i = 0; a != null && i < a.length(); i++) {
                JSONObject g = a.optJSONObject(i);
                if (g == null || !id.equals(g.optString("i", ""))) continue;
                long e = CalendarStore.epochFromYmd(g.optString("d"));
                if (e >= today) return new Item(e, g.optString("t"), 3);
            }
        }
        return countdown(ctx, today);
    }

    public static Item countdown(Context ctx, long today) {
        JSONObject cd = data(ctx).optJSONObject("cd");
        if (cd != null) {
            long e = CalendarStore.epochFromYmd(cd.optString("d"));
            if (e >= today) return new Item(e, cd.optString("t"), 3);
        }
        for (long e = today; e < today + 400; e++) {
            CalendarStore.Day d = CalendarStore.day(ctx, e);
            if (d.ld == 1 && d.lm == 1 && !d.leap) return new Item(e, "Tết Nguyên Đán", 2);
        }
        return null;
    }
}
