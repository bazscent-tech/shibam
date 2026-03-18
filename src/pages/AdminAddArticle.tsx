import { useState, useRef } from "react";
import { Save, Loader2, ImagePlus, X, Wand2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const arCategories = ["سياسة", "اقتصاد", "تكنولوجيا", "رياضة", "ثقافة", "صحة", "علوم", "منوعات"];
const enCategories = ["Politics", "Economy", "Technology", "Sports", "Culture", "Health", "Science", "Entertainment"];

const AdminAddArticle = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("");
  const [language, setLanguage] = useState<"ar" | "en">("ar");
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [authorImage, setAuthorImage] = useState<File | null>(null);
  const [authorImagePreview, setAuthorImagePreview] = useState<string>("");
  const [publishing, setPublishing] = useState(false);
  const [aiEnhancing, setAiEnhancing] = useState(false);
  const [enhancedTitle, setEnhancedTitle] = useState("");
  const [enhancedSummary, setEnhancedSummary] = useState("");
  const [suggestedCategory, setSuggestedCategory] = useState("");
  const [showAiResults, setShowAiResults] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const authorFileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const categories = language === "ar" ? arCategories : enCategories;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages((prev) => [...prev, ...files]);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreviews((prev) => [...prev, ev.target?.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
    setImagePreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAuthorImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAuthorImage(file);
    const reader = new FileReader();
    reader.onload = (ev) => setAuthorImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("article-images").upload(path, file);
    if (error) { console.error("Upload error:", error); return null; }
    const { data } = supabase.storage.from("article-images").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleAiEnhance = async () => {
    if (!title && !content && !description) {
      toast({ title: "أدخل عنواناً أو محتوى أولاً", variant: "destructive" });
      return;
    }
    setAiEnhancing(true);
    setShowAiResults(false);
    setEnhancedTitle("");
    setEnhancedSummary("");
    setSuggestedCategory("");

    try {
      // Enhance title
      const resp1 = await fetch(`${SUPABASE_URL}/functions/v1/ai-tools`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${SUPABASE_KEY}` },
        body: JSON.stringify({ action: "improve_headline", content: title || description }),
      });
      let titleText = "";
      const reader1 = resp1.body!.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      while (true) {
        const { done, value } = await reader1.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        let ni: number;
        while ((ni = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, ni);
          buf = buf.slice(ni + 1);
          if (!line.startsWith("data: ")) continue;
          const j = line.slice(6).trim();
          if (j === "[DONE]") break;
          try { const p = JSON.parse(j); titleText += p.choices?.[0]?.delta?.content || ""; } catch {}
        }
      }
      setEnhancedTitle(titleText);

      // Summarize
      if (content || description) {
        const resp2 = await fetch(`${SUPABASE_URL}/functions/v1/ai-tools`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${SUPABASE_KEY}` },
          body: JSON.stringify({ action: "summarize", content: content || description }),
        });
        let sumText = "";
        const reader2 = resp2.body!.getReader();
        buf = "";
        while (true) {
          const { done, value } = await reader2.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          let ni: number;
          while ((ni = buf.indexOf("\n")) !== -1) {
            let line = buf.slice(0, ni);
            buf = buf.slice(ni + 1);
            if (!line.startsWith("data: ")) continue;
            const j = line.slice(6).trim();
            if (j === "[DONE]") break;
            try { const p = JSON.parse(j); sumText += p.choices?.[0]?.delta?.content || ""; } catch {}
          }
        }
        setEnhancedSummary(sumText);
      }

      // Classify
      const resp3 = await fetch(`${SUPABASE_URL}/functions/v1/ai-tools`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${SUPABASE_KEY}` },
        body: JSON.stringify({ action: "classify", topic: title, content: content || description || title }),
      });
      let catText = "";
      const reader3 = resp3.body!.getReader();
      buf = "";
      while (true) {
        const { done, value } = await reader3.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        let ni: number;
        while ((ni = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, ni);
          buf = buf.slice(ni + 1);
          if (!line.startsWith("data: ")) continue;
          const j = line.slice(6).trim();
          if (j === "[DONE]") break;
          try { const p = JSON.parse(j); catText += p.choices?.[0]?.delta?.content || ""; } catch {}
        }
      }
      setSuggestedCategory(catText.trim());
      setShowAiResults(true);
    } catch (e: any) {
      toast({ title: "خطأ في الذكاء الاصطناعي", description: e.message, variant: "destructive" });
    } finally {
      setAiEnhancing(false);
    }
  };

  const handlePublish = async () => {
    if (!title) { toast({ title: "العنوان مطلوب", variant: "destructive" }); return; }
    setPublishing(true);
    try {
      let imageUrl: string | null = null;
      if (images.length > 0) {
        imageUrl = await uploadImage(images[0]);
      }

      const { error } = await supabase.from("articles").insert({
        title: enhancedTitle || title,
        description: enhancedSummary || description,
        content,
        author: author || null,
        category: category || suggestedCategory || (language === "ar" ? "عام" : "General"),
        language,
        image_url: imageUrl,
        url: `manual-${Date.now()}`,
        is_published: true,
        is_ai_generated: false,
      });

      if (error) throw error;
      toast({ title: "تم نشر المقال بنجاح ✓" });
      // Reset
      setTitle(""); setDescription(""); setContent(""); setAuthor("");
      setCategory(""); setImages([]); setImagePreviews([]);
      setEnhancedTitle(""); setEnhancedSummary(""); setSuggestedCategory("");
      setShowAiResults(false);
    } catch (e: any) {
      toast({ title: "خطأ", description: e.message, variant: "destructive" });
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <h1 className="text-xl font-bold" style={{ color: "hsl(var(--admin-text))" }}>إضافة مقال جديد</h1>

      <div className="admin-surface p-5 space-y-4">
        {/* Language */}
        <div>
          <label className="block text-sm mb-1.5" style={{ color: "hsl(var(--admin-text-muted))" }}>القسم</label>
          <div className="flex gap-2">
            <button onClick={() => setLanguage("ar")} className={`px-4 py-2 rounded text-sm font-medium transition-colors ${language === "ar" ? "btn-admin-primary" : ""}`} style={language !== "ar" ? { background: "hsl(var(--admin-surface-hover))", color: "hsl(var(--admin-text-muted))" } : undefined}>عربي</button>
            <button onClick={() => setLanguage("en")} className={`px-4 py-2 rounded text-sm font-medium transition-colors ${language === "en" ? "btn-admin-primary" : ""}`} style={language !== "en" ? { background: "hsl(var(--admin-surface-hover))", color: "hsl(var(--admin-text-muted))" } : undefined}>Global (English)</button>
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm mb-1.5" style={{ color: "hsl(var(--admin-text-muted))" }}>عنوان الخبر *</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="admin-input" placeholder={language === "ar" ? "أدخل عنوان الخبر..." : "Enter article title..."} />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm mb-1.5" style={{ color: "hsl(var(--admin-text-muted))" }}>وصف مختصر</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="admin-input min-h-[80px] resize-y" placeholder={language === "ar" ? "وصف مختصر للخبر..." : "Brief description..."} />
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm mb-1.5" style={{ color: "hsl(var(--admin-text-muted))" }}>تفاصيل الخبر</label>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} className="admin-input min-h-[150px] resize-y" placeholder={language === "ar" ? "أدخل تفاصيل الخبر كاملة..." : "Enter full article content..."} />
        </div>

        {/* Images */}
        <div>
          <label className="block text-sm mb-1.5" style={{ color: "hsl(var(--admin-text-muted))" }}>صور المقال (اختياري)</label>
          <div className="flex flex-wrap gap-3">
            {imagePreviews.map((src, i) => (
              <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden border border-border">
                <img src={src} alt="" className="w-full h-full object-cover" />
                <button onClick={() => removeImage(i)} className="absolute top-1 right-1 p-0.5 rounded-full bg-black/60 text-white"><X className="w-3 h-3" /></button>
              </div>
            ))}
            <button onClick={() => fileInputRef.current?.click()} className="w-24 h-24 rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-colors hover:border-urgent/50" style={{ borderColor: "hsl(var(--admin-border))", color: "hsl(var(--admin-text-muted))" }}>
              <ImagePlus className="w-5 h-5" />
              <span className="text-[10px]">إضافة صورة</span>
            </button>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden" />
        </div>

        {/* Author */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1.5" style={{ color: "hsl(var(--admin-text-muted))" }}>اسم الكاتب (اختياري)</label>
            <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} className="admin-input" placeholder="اسم الكاتب" />
          </div>
          <div>
            <label className="block text-sm mb-1.5" style={{ color: "hsl(var(--admin-text-muted))" }}>صورة الكاتب (اختياري)</label>
            <div className="flex items-center gap-3">
              {authorImagePreview && <img src={authorImagePreview} className="w-10 h-10 rounded-full object-cover" />}
              <button onClick={() => authorFileRef.current?.click()} className="admin-input text-sm flex items-center gap-2 cursor-pointer" style={{ width: "auto" }}>
                <Upload className="w-4 h-4" /> رفع صورة
              </button>
              <input ref={authorFileRef} type="file" accept="image/*" onChange={handleAuthorImage} className="hidden" />
            </div>
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm mb-1.5" style={{ color: "hsl(var(--admin-text-muted))" }}>القسم / التصنيف</label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button key={cat} onClick={() => setCategory(cat)} className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${category === cat ? "text-white" : ""}`} style={category === cat ? { background: "hsl(var(--urgent-red))" } : { background: "hsl(var(--admin-surface-hover))", color: "hsl(var(--admin-text-muted))" }}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* AI Enhance Button */}
        <div className="flex gap-3 pt-2" style={{ borderTop: "1px solid hsl(var(--admin-border))" }}>
          <button onClick={handleAiEnhance} disabled={aiEnhancing} className="flex items-center gap-2 px-4 py-2.5 rounded text-sm font-medium transition-colors disabled:opacity-50" style={{ background: "hsl(142 76% 36% / 0.15)", color: "#22c55e" }}>
            {aiEnhancing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
            تحسين بالذكاء الاصطناعي
          </button>
          <button onClick={handlePublish} disabled={publishing || !title} className="btn-admin-primary flex items-center gap-2 disabled:opacity-50">
            {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            نشر المقال
          </button>
        </div>
      </div>

      {/* AI Enhancement Results */}
      {showAiResults && (
        <div className="admin-surface p-5 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: "hsl(var(--admin-text))" }}>
            <Wand2 className="w-5 h-5 text-green-500" /> نتائج الذكاء الاصطناعي
          </h2>
          {enhancedTitle && (
            <div>
              <label className="text-xs font-medium" style={{ color: "hsl(var(--admin-text-muted))" }}>عنوان محسّن:</label>
              <p className="text-sm mt-1 p-3 rounded" style={{ background: "hsl(var(--admin-bg))", color: "hsl(var(--admin-text))" }}>{enhancedTitle}</p>
              <button onClick={() => { setTitle(enhancedTitle.split("\n")[0].replace(/^\d+\.\s*/, "")); toast({ title: "تم تطبيق العنوان" }); }} className="text-xs mt-1 text-green-400 hover:underline">استخدام هذا العنوان</button>
            </div>
          )}
          {enhancedSummary && (
            <div>
              <label className="text-xs font-medium" style={{ color: "hsl(var(--admin-text-muted))" }}>ملخص:</label>
              <p className="text-sm mt-1 p-3 rounded" style={{ background: "hsl(var(--admin-bg))", color: "hsl(var(--admin-text))" }}>{enhancedSummary}</p>
              <button onClick={() => { setDescription(enhancedSummary); toast({ title: "تم تطبيق الملخص" }); }} className="text-xs mt-1 text-green-400 hover:underline">استخدام هذا الملخص</button>
            </div>
          )}
          {suggestedCategory && (
            <div>
              <label className="text-xs font-medium" style={{ color: "hsl(var(--admin-text-muted))" }}>تصنيف مقترح:</label>
              <p className="text-sm mt-1 font-bold" style={{ color: "#22c55e" }}>{suggestedCategory}</p>
              <button onClick={() => { setCategory(suggestedCategory); toast({ title: "تم تطبيق التصنيف" }); }} className="text-xs mt-1 text-green-400 hover:underline">استخدام هذا التصنيف</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminAddArticle;
