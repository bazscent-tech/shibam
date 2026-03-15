import { Newspaper, Link2, Eye, TrendingUp } from "lucide-react";

const stats = [
  { label: "إجمالي المقالات", value: "1,247", icon: Newspaper, change: "+24 اليوم" },
  { label: "المصادر النشطة", value: "18", icon: Link2, change: "4 مصادر جديدة" },
  { label: "الزيارات اليوم", value: "45.2K", icon: Eye, change: "+12.5%" },
  { label: "المواضيع الرائجة", value: "8", icon: TrendingUp, change: "تحديث مباشر" },
];

const AdminDashboard = () => {
  return (
    <div className="space-y-6" dir="rtl">
      <h1 className="text-xl font-bold" style={{ color: "hsl(var(--admin-text))" }}>
        مرحباً بك في لوحة التحكم
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="admin-surface p-5">
            <div className="flex items-center justify-between mb-3">
              <stat.icon className="w-5 h-5" style={{ color: "hsl(var(--admin-text-muted))" }} />
            </div>
            <p className="text-2xl font-bold font-latin" style={{ color: "hsl(var(--admin-text))" }}>
              {stat.value}
            </p>
            <p className="text-sm mt-1" style={{ color: "hsl(var(--admin-text-muted))" }}>
              {stat.label}
            </p>
            <p className="text-xs mt-2 text-urgent">{stat.change}</p>
          </div>
        ))}
      </div>

      <div className="admin-surface p-5">
        <h2 className="text-lg font-semibold mb-4" style={{ color: "hsl(var(--admin-text))" }}>
          آخر النشاطات
        </h2>
        <div className="space-y-3">
          {[
            { text: "تم جلب 52 مقالاً من 4 مصادر بنجاح", time: "منذ 5 دقائق" },
            { text: "تمت إضافة مصدر جديد: رويترز عربي", time: "منذ 30 دقيقة" },
            { text: "الذكاء الاصطناعي ولّد مقالاً تحليلياً جديداً", time: "منذ ساعة" },
            { text: "تم تصنيف 15 مقالاً تلقائياً", time: "منذ ساعتين" },
          ].map((activity, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-2 px-3 rounded-lg"
              style={{ background: i === 0 ? "hsl(var(--admin-surface-hover))" : undefined }}
            >
              <span className="text-sm" style={{ color: "hsl(var(--admin-text))" }}>{activity.text}</span>
              <span className="text-xs whitespace-nowrap mr-4" style={{ color: "hsl(var(--admin-text-muted))" }}>{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
