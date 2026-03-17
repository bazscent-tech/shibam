import { useState, useEffect } from "react";
import { Pencil, Trash2, Loader2, Save, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Article {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  language: string;
  published_at: string | null;
  is_published: boolean;
  url: string;
}

const AdminArticles = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Article>>({});
  const { toast } = useToast();

  const load = async () => {
    const { data } = await supabase
      .from("articles")
      .select("id, title, description, category, language, published_at, is_published, url")
      .order("published_at", { ascending: false })
      .limit(100);
    setArticles((data as Article[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("articles").delete().eq("id", id);
    if (error) { toast({ title: "خطأ", variant: "destructive" }); return; }
    setArticles((prev) => prev.filter((a) => a.id !== id));
    toast({ title: "تم الحذف ✓" });
  };

  const handleSave = async (id: string) => {
    const { error } = await supabase.from("articles").update(editData).eq("id", id);
    if (error) { toast({ title: "خطأ", description: error.message, variant: "destructive" }); return; }
    toast({ title: "تم التحديث ✓" });
    setEditingId(null);
    load();
  };

  return (
    <div className="space-y-6" dir="rtl">
      <h1 className="text-xl font-bold" style={{ color: "hsl(var(--admin-text))" }}>إدارة المقالات</h1>

      <div className="admin-surface overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" style={{ color: "hsl(var(--admin-text-muted))" }} /></div>
        ) : articles.length === 0 ? (
          <p className="text-sm text-center py-8" style={{ color: "hsl(var(--admin-text-muted))" }}>لا توجد مقالات</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid hsl(var(--admin-border))" }}>
                  {["العنوان", "القسم", "اللغة", "الحالة", "إجراءات"].map((h) => (
                    <th key={h} className="text-right px-4 py-3 text-xs font-semibold" style={{ color: "hsl(var(--admin-text-muted))" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {articles.map((article) => (
                  <tr key={article.id} style={{ borderBottom: "1px solid hsl(var(--admin-border))" }} className="hover:bg-[hsl(var(--admin-surface-hover))]">
                    <td className="px-4 py-3 max-w-xs">
                      {editingId === article.id ? (
                        <input className="admin-input text-sm py-1.5" value={editData.title ?? article.title} onChange={(e) => setEditData((d) => ({ ...d, title: e.target.value }))} />
                      ) : (
                        <p className="truncate font-medium" style={{ color: "hsl(var(--admin-text))" }}>{article.title}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editingId === article.id ? (
                        <input className="admin-input text-xs py-1" value={editData.category ?? article.category ?? ""} onChange={(e) => setEditData((d) => ({ ...d, category: e.target.value }))} />
                      ) : (
                        <span className="text-xs px-2 py-1 rounded bg-urgent/10 text-urgent">{article.category || "عام"}</span>
                      )}
                    </td>
                    <td className="px-4 py-3" style={{ color: "hsl(var(--admin-text-muted))" }}>{article.language === "ar" ? "عربي" : "English"}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded ${article.is_published ? "text-green-400 bg-green-400/10" : "text-amber-400 bg-amber-400/10"}`}>
                        {article.is_published ? "منشور" : "مسودة"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {editingId === article.id ? (
                          <>
                            <button onClick={() => handleSave(article.id)} className="p-1.5 rounded hover:bg-green-500/10 text-green-400"><Save className="w-3.5 h-3.5" /></button>
                            <button onClick={() => setEditingId(null)} className="p-1.5 rounded hover:bg-[hsl(var(--admin-surface-hover))]" style={{ color: "hsl(var(--admin-text-muted))" }}><X className="w-3.5 h-3.5" /></button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => { setEditingId(article.id); setEditData({}); }} className="p-1.5 rounded hover:bg-[hsl(var(--admin-surface-hover))]" style={{ color: "hsl(var(--admin-text-muted))" }}><Pencil className="w-3.5 h-3.5" /></button>
                            <button onClick={() => handleDelete(article.id)} className="p-1.5 rounded hover:bg-urgent/10 text-urgent"><Trash2 className="w-3.5 h-3.5" /></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminArticles;
