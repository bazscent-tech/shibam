import { mockArticles } from "@/data/mockNews";
import { Pencil, Trash2, Plus } from "lucide-react";

const AdminArticles = () => {
  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold" style={{ color: "hsl(var(--admin-text))" }}>
          إدارة المقالات
        </h1>
        <button className="btn-admin-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          مقال جديد
        </button>
      </div>

      <div className="admin-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid hsl(var(--admin-border))" }}>
                {["العنوان", "القسم", "المصدر", "التاريخ", "إجراءات"].map((h) => (
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
              {mockArticles.map((article) => (
                <tr
                  key={article.id}
                  style={{ borderBottom: "1px solid hsl(var(--admin-border))" }}
                  className="hover:bg-[hsl(var(--admin-surface-hover))]"
                >
                  <td className="px-4 py-3 max-w-xs">
                    <p className="truncate font-medium" style={{ color: "hsl(var(--admin-text))" }}>
                      {article.title}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-1 rounded bg-urgent/10 text-urgent">
                      {article.category}
                    </span>
                  </td>
                  <td className="px-4 py-3" style={{ color: "hsl(var(--admin-text-muted))" }}>
                    {article.source}
                  </td>
                  <td className="px-4 py-3" style={{ color: "hsl(var(--admin-text-muted))" }}>
                    {article.publishedAt}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 rounded hover:bg-[hsl(var(--admin-surface-hover))]" style={{ color: "hsl(var(--admin-text-muted))" }}>
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1.5 rounded hover:bg-urgent/10 text-urgent">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
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

export default AdminArticles;
