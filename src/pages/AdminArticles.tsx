import { useState, useEffect, useRef } from "react";
import { Pencil, Trash2, Loader2, X, ImagePlus, Save, Wand2, FileText, Tags, RotateCcw, Sparkles, Search as SearchIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { decodeHtmlEntities } from "@/lib/htmlUtils";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const allCategories = ["سياسة", "اقتصاد", "تكنولوجيا", "رياضة", "ثقافة", "صحة", "علوم", "منوعات", "المقالات", "فنون", "لقاءات", "تصريحات", "تمون"];
const enCategories = ["Politics", "Economy", "Technology", "Sports", "Culture", "Health", "Science", "Entertainment", "Articles", "Arts", "Interviews", "Statements", "Supplies"];

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

const streamAI = async (body: any, onDelta: (text: string) => void) => {
  const resp = await fetch(`${SUPABASE_URL}/functions/v1/ai-tools`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${SUPABASE_KEY}` },
    body: JSON.stringify(body),
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.error || "خطأ في الاتصال");
  }
  const reader = resp.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let idx: number;
    while ((idx = buffer.indexOf("\n")) !== -1) {
      let line = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (!line.startsWith("data: ")) continue;
      const json = line.slice(6).trim();
      if (json === "[DONE]") return;
      try {
        const parsed = JSON.parse(json);
        const c = parsed.choices?.[0]?.delta?.content;
        if (c) onDelta(c);
      } catch {}
    }
  }
};

const AdminArticles = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Article>>({});
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
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
    await supabase.from("articles").delete().eq("id", id);
    setArticles((prev) => prev.filter((a) => a.id !== id));
    toast({ title: "تم الحذف ✓" });
  };

  const startEditing = (article: Article) => {
    setEditingId(article.id);
    setEditData({
      title: decodeHtmlEntities(article.title),
      description: decodeHtmlEntities(article.description),
      content: decodeHtmlEntities(article.content),
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
      await supabase.from("articles").update(updates).eq("id", id);
      toast({ title: "تم التحديث ✓" });
      setEditingId(null);
      load();
    } catch (e: any) {
      toast({ title: "خطأ", description: e.message, variant: "destructive" });
    } finally { setSaving(false); }
  };

  // AI tool helper
  const runAI = async (action: string, field: "title" | "content" | "description", extraBody: any = {}) => {
    setAiLoading(action);
    try {
      let text = "";
      await streamAI(
        { action, ...extraBody },
        (delta) => { text += delta; setEditData((d) => ({ ...d, [field]: text })); }
      );
    } catch (e: any) {
      toast({ title: "خطأ AI", description: e.message, variant: "destructive" });
    } finally { setAiLoading(null); }
  };

  const categories = editData.language === "en" ? enCategories : allCategories;

  const filtered = articles.filter((a) =>
    !searchQuery || a.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold" style={{ color: "hsl(var(--admin-text))" }}>إدارة المقالات</h1>
        <div className="relative w-64">
          <SearchIcon className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "hsl(var(--admin-text-muted))" }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث في المقالات..."
            className="admin-input text-sm pr-9 py-2"
          />
        </div>
      </div>

      {/* Full Edit Panel */}
      {editingId && (
        <div className="admin-surface p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold" style={{ color: "hsl(var(--admin-text))" }}>تحرير المقال</h2>
            <button onClick={() => setEditingId(null)} className="p-1.5 rounded hover:bg-[hsl(var(--admin-surface-hover))]"><X className="w-5 h-5" style={{ color: "hsl(var(--admin-text-muted))" }} /></button>
          </div>

          {/* Title with AI */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm" style={{ color: "hsl(var(--admin-text-muted))" }}>العنوان *</label>
              <button
                onClick={() => runAI("improve_headline", "title", { content: editData.title })}
                disabled={!!aiLoading}
                className="text-xs px-2 py-1 rounded flex items-center gap-1 hover:bg-[hsl(var(--admin-surface-hover))]"
                style={{ color: "hsl(var(--sidebar-ring))" }}
                title="تحسين العنوان بالذكاء الاصطناعي"
              >
                {aiLoading === "improve_headline" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                تحسين العنوان
              </button>
            </div>
            <input type="text" value={editData.title ?? ""} onChange={(e) => setEditData((d) => ({ ...d, title: e.target.value }))} className="admin-input" />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm mb-1.5" style={{ color: "hsl(var(--admin-text-muted))" }}>وصف مختصر</label>
            <textarea value={editData.description ?? ""} onChange={(e) => setEditData((d) => ({ ...d, description: e.target.value }))} className="admin-input min-h-[80px] resize-y" />
          </div>

          {/* Content with AI tools */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm" style={{ color: "hsl(var(--admin-text-muted))" }}>المحتوى</label>
              <div className="flex items-center gap-1 flex-wrap">
                {[
                  { action: "rewrite_content", label: "إعادة صياغة", icon: RotateCcw },
                  { action: "enhance_style", label: "تحسين الأسلوب", icon: Sparkles },
                  { action: "professional_rewrite", label: "كتابة احترافية", icon: FileText },
                  { action: "summarize", label: "تلخيص", icon: Tags },
                  { action: "fetch_full_content", label: "جلب المحتوى", icon: SearchIcon },
                ].map(({ action, label, icon: Icon }) => (
                  <button
                    key={action}
                    onClick={() => runAI(action, "content", { content: editData.content, title: editData.title })}
                    disabled={!!aiLoading}
                    className="text-xs px-2 py-1 rounded flex items-center gap-1 hover:bg-[hsl(var(--admin-surface-hover))]"
                    style={{ color: "hsl(var(--sidebar-ring))" }}
                    title={label}
                  >
                    {aiLoading === action ? <Loader2 className="w-3 h-3 animate-spin" /> : <Icon className="w-3 h-3" />}
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <textarea value={editData.content ?? ""} onChange={(e) => setEditData((d) => ({ ...d, content: e.target.value }))} className="admin-input min-h-[200px] resize-y" />
          </div>

          {/* SEO Generator */}
          <button
            onClick={() => runAI("generate_seo", "description", { content: editData.content, title: editData.title })}
            disabled={!!aiLoading}
            className="text-xs px-3 py-2 rounded flex items-center gap-1.5 w-fit"
            style={{ background: "hsl(var(--admin-surface-hover))", color: "hsl(var(--sidebar-ring))" }}
          >
            {aiLoading === "generate_seo" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            توليد SEO
          </button>

          {/* Author */}
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
            <input ref={fileInputRef} type="file" accept="image/jpg,image/jpeg,image/png,image/webp,image/gif" onChange={handleImageSelect} className="hidden" />
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
        ) : filtered.length === 0 ? (
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
                {filtered.map((article) => (
                  <tr key={article.id} style={{ borderBottom: "1px solid hsl(var(--admin-border))" }} className={`hover:bg-[hsl(var(--admin-surface-hover))] ${editingId === article.id ? "bg-[hsl(var(--admin-surface-hover))]" : ""}`}>
                    <td className="px-4 py-3 max-w-xs">
                      <p className="truncate font-medium" style={{ color: "hsl(var(--admin-text))" }}>{decodeHtmlEntities(article.title)}</p>
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
