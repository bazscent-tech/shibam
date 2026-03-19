import { useState, useEffect, useRef } from "react";
import { Pencil, Trash2, Loader2, X, ImagePlus, Upload, Save, Wand2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const arCategories = ["سياسة", "اقتصاد", "تكنولوجيا", "رياضة", "ثقافة", "صحة", "علوم", "منوعات"];
const enCategories = ["Politics", "Economy", "Technology", "Sports", "Culture", "Health", "Science", "Entertainment"];

interface Article {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  category: string | null;
  language: string;
  published_at: string | null;
  is_published: boolean;
  url: string;
  image_url: string | null;
  author: string | null;
}

const AdminArticles = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Article>>({});
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const load = async () => {
    const { data } = await supabase
      .from("articles")
      .select("id, title, description, content, category, language, published_at, is_published, url, image_url, author")
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

  const startEditing = (article: Article) => {
    setEditingId(article.id);
    setEditData({
      title: article.title,
      description: article.description,
      content: article.content,
      category: article.category,
      language: article.language,
      author: article.author,
      image_url: article.image_url,
    });
    setNewImages([]);
    setNewImagePreviews([]);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setNewImages((prev) => [...prev, ...files]);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => setNewImagePreviews((prev) => [...prev, ev.target?.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("article-images").upload(path, file);
    if (error) return null;
    const { data } = supabase.storage.from("article-images").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSave = async (id: string) => {
    setSaving(true);
    try {
      const updates = { ...editData };
      if (newImages.length > 0) {
        const url = await uploadImage(newImages[0]);
        if (url) updates.image_url = url;
      }
      const { error } = await supabase.from("articles").update(updates).eq("id", id);
      if (error) throw error;
      toast({ title: "تم التحديث ✓" });
      setEditingId(null);
      load();
    } catch (e: any) {
      toast({ title: "خطأ", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const categories = editData.language === "en" ? enCategories : arCategories;

  return (
    <div className="space-y-6" dir="rtl">
      <h1 className="text-xl font-bold" style={{ color: "hsl(var(--admin-text))" }}>إدارة المقالات</h1>

      {/* Full Edit Panel */}
      {editingId && (
        <div className="admin-surface p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold" style={{ color: "hsl(var(--admin-text))" }}>تحرير المقال</h2>
            <button onClick={() => setEditingId(null)} className="p-1.5 rounded hover:bg-[hsl(var(--admin-surface-hover))]" style={{ color: "hsl(var(--admin-text-muted))" }}><X className="w-5 h-5" /></button>
          </div>

          <div>
            <label className="block text-sm mb-1.5" style={{ color: "hsl(var(--admin-text-muted))" }}>العنوان *</label>
            <input type="text" value={editData.title ?? ""} onChange={(e) => setEditData((d) => ({ ...d, title: e.target.value }))} className="admin-input" />
          </div>

          <div>
            <label className="block text-sm mb-1.5" style={{ color: "hsl(var(--admin-text-muted))" }}>وصف مختصر</label>
            <textarea value={editData.description ?? ""} onChange={(e) => setEditData((d) => ({ ...d, description: e.target.value }))} className="admin-input min-h-[80px] resize-y" />
          </div>

          <div>
            <label className="block text-sm mb-1.5" style={{ color: "hsl(var(--admin-text-muted))" }}>المحتوى</label>
            <textarea value={editData.content ?? ""} onChange={(e) => setEditData((d) => ({ ...d, content: e.target.value }))} className="admin-input min-h-[150px] resize-y" />
          </div>

          <div>
            <label className="block text-sm mb-1.5" style={{ color: "hsl(var(--admin-text-muted))" }}>اسم الكاتب</label>
            <input type="text" value={editData.author ?? ""} onChange={(e) => setEditData((d) => ({ ...d, author: e.target.value }))} className="admin-input" />
          </div>

          {/* Image */}
          <div>
            <label className="block text-sm mb-1.5" style={{ color: "hsl(var(--admin-text-muted))" }}>صورة المقال</label>
            <div className="flex flex-wrap gap-3 items-start">
              {editData.image_url && newImages.length === 0 && (
                <div className="relative w-32 h-24 rounded-lg overflow-hidden border border-border">
                  <img src={editData.image_url} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => setEditData((d) => ({ ...d, image_url: null }))} className="absolute top-1 right-1 p-0.5 rounded-full bg-black/60 text-white"><X className="w-3 h-3" /></button>
                </div>
              )}
              {newImagePreviews.map((src, i) => (
                <div key={i} className="relative w-32 h-24 rounded-lg overflow-hidden border border-border">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => { setNewImages((p) => p.filter((_, j) => j !== i)); setNewImagePreviews((p) => p.filter((_, j) => j !== i)); }} className="absolute top-1 right-1 p-0.5 rounded-full bg-black/60 text-white"><X className="w-3 h-3" /></button>
                </div>
              ))}
              <button onClick={() => fileInputRef.current?.click()} className="w-32 h-24 rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-1" style={{ borderColor: "hsl(var(--admin-border))", color: "hsl(var(--admin-text-muted))" }}>
                <ImagePlus className="w-5 h-5" />
                <span className="text-[10px]">إضافة صورة</span>
              </button>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm mb-1.5" style={{ color: "hsl(var(--admin-text-muted))" }}>التصنيف</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button key={cat} onClick={() => setEditData((d) => ({ ...d, category: cat }))} className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${editData.category === cat ? "text-white" : ""}`} style={editData.category === cat ? { background: "hsl(var(--urgent-red))" } : { background: "hsl(var(--admin-surface-hover))", color: "hsl(var(--admin-text-muted))" }}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Language */}
          <div>
            <label className="block text-sm mb-1.5" style={{ color: "hsl(var(--admin-text-muted))" }}>القسم</label>
            <div className="flex gap-2">
              <button onClick={() => setEditData((d) => ({ ...d, language: "ar" }))} className={`px-4 py-2 rounded text-sm font-medium transition-colors ${editData.language === "ar" ? "btn-admin-primary" : ""}`} style={editData.language !== "ar" ? { background: "hsl(var(--admin-surface-hover))", color: "hsl(var(--admin-text-muted))" } : undefined}>عربي</button>
              <button onClick={() => setEditData((d) => ({ ...d, language: "en" }))} className={`px-4 py-2 rounded text-sm font-medium transition-colors ${editData.language === "en" ? "btn-admin-primary" : ""}`} style={editData.language !== "en" ? { background: "hsl(var(--admin-surface-hover))", color: "hsl(var(--admin-text-muted))" } : undefined}>English</button>
            </div>
          </div>

          <div className="flex gap-3 pt-3" style={{ borderTop: "1px solid hsl(var(--admin-border))" }}>
            <button onClick={() => handleSave(editingId)} disabled={saving} className="btn-admin-primary flex items-center gap-2 disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ التعديلات
            </button>
            <button onClick={() => setEditingId(null)} className="px-4 py-2 rounded text-sm" style={{ color: "hsl(var(--admin-text-muted))" }}>إلغاء</button>
          </div>
        </div>
      )}

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
                  <tr key={article.id} style={{ borderBottom: "1px solid hsl(var(--admin-border))" }} className={`hover:bg-[hsl(var(--admin-surface-hover))] ${editingId === article.id ? "bg-[hsl(var(--admin-surface-hover))]" : ""}`}>
                    <td className="px-4 py-3 max-w-xs">
                      <p className="truncate font-medium" style={{ color: "hsl(var(--admin-text))" }}>{article.title}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-1 rounded bg-urgent/10 text-urgent">{article.category || "عام"}</span>
                    </td>
                    <td className="px-4 py-3" style={{ color: "hsl(var(--admin-text-muted))" }}>{article.language === "ar" ? "عربي" : "English"}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded ${article.is_published ? "text-green-400 bg-green-400/10" : "text-amber-400 bg-amber-400/10"}`}>
                        {article.is_published ? "منشور" : "مسودة"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => startEditing(article)} className="p-1.5 rounded hover:bg-[hsl(var(--admin-surface-hover))]" style={{ color: "hsl(var(--admin-text-muted))" }}><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(article.id)} className="p-1.5 rounded hover:bg-urgent/10 text-urgent"><Trash2 className="w-3.5 h-3.5" /></button>
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
