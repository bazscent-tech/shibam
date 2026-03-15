import { TrendingUp, ExternalLink } from "lucide-react";

const trendingArticles = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  title: [
    "تطورات جديدة في مفاوضات التجارة العالمية",
    "اكتشاف علمي يغير مفاهيم الطاقة النظيفة",
    "الأسواق المالية تشهد تقلبات حادة",
    "قمة المناخ تصدر توصيات تاريخية",
    "ثورة الذكاء الاصطناعي في القطاع الصحي",
    "أزمة سلاسل التوريد العالمية تتفاقم",
    "إطلاق أول قمر صناعي عربي للاتصالات",
    "تحولات في سوق العمل بسبب الأتمتة",
    "معرض الابتكار يكشف عن تقنيات مبهرة",
    "تعاون دولي لمكافحة الجرائم الإلكترونية",
  ][i],
  source: ["رويترز", "AP", "الجزيرة", "بي بي سي", "فرانس 24", "DW", "CNN", "سكاي نيوز", "العربية", "الشرق"][i],
  author: ["أحمد محمد", "سارة علي", "خالد عبدالله", "نورا حسن", "محمد سعيد", "فاطمة أحمد", "يوسف كريم", "هدى ناصر", "عمر بكر", "ليلى خالد"][i],
  date: `2026-03-${15 - i}`,
  time: `${9 + i}:${String(i * 5).padStart(2, "0")}`,
}));

const AdminTrending = () => {
  return (
    <div className="space-y-6" dir="rtl">
      <h1 className="text-xl font-bold" style={{ color: "hsl(var(--admin-text))" }}>
        الأبحاث والمواضيع الرائجة
      </h1>

      {/* Trending topics */}
      <div className="admin-surface p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-urgent" />
          <h2 className="text-lg font-semibold" style={{ color: "hsl(var(--admin-text))" }}>
            أكثر المواضيع تداولاً (آخر 48 ساعة)
          </h2>
        </div>
        <div className="flex flex-wrap gap-2 mb-6">
          {["الذكاء الاصطناعي", "النفط", "التكنولوجيا", "المناخ", "الأمن السيبراني", "الفضاء", "الطاقة"].map((t) => (
            <span
              key={t}
              className="px-3 py-1.5 rounded text-xs font-medium"
              style={{ background: "hsl(var(--admin-surface-hover))", color: "hsl(var(--admin-text))" }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Articles table */}
      <div className="admin-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid hsl(var(--admin-border))" }}>
                {["#", "العنوان", "المصدر", "الكاتب", "التاريخ", ""].map((h) => (
                  <th
                    key={h}
                    className="text-right px-4 py-3 text-xs font-semibold"
                    style={{ color: "hsl(var(--admin-text-muted))" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {trendingArticles.map((a) => (
                <tr
                  key={a.id}
                  style={{ borderBottom: "1px solid hsl(var(--admin-border))" }}
                  className="hover:bg-[hsl(var(--admin-surface-hover))]"
                >
                  <td className="px-4 py-3 font-latin font-bold" style={{ color: "hsl(var(--admin-text-muted))" }}>
                    {a.id}
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    <p className="truncate font-medium" style={{ color: "hsl(var(--admin-text))" }}>
                      {a.title}
                    </p>
                  </td>
                  <td className="px-4 py-3" style={{ color: "hsl(var(--admin-text-muted))" }}>{a.source}</td>
                  <td className="px-4 py-3" style={{ color: "hsl(var(--admin-text-muted))" }}>{a.author}</td>
                  <td className="px-4 py-3 font-latin whitespace-nowrap" style={{ color: "hsl(var(--admin-text-muted))" }}>
                    {a.date} {a.time}
                  </td>
                  <td className="px-4 py-3">
                    <button className="btn-admin-primary text-xs px-3 py-1.5">
                      نشر
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminTrending;
