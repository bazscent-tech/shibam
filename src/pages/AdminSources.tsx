import { useState, useEffect } from "react";
import { Search, Globe, Rss, Code, Zap, CheckCircle, AlertCircle, Loader2, Copy, Plus, Pencil, Trash2, RefreshCw, Timer } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DetectionResult {
  method: string;
  methodKey: string;
  icon: typeof Rss;
  status: "success" | "warning" | "error";
  description: string;
  fetchUrl: string;
}

interface Source {
  id: string;
  name: string;
  url: string;
  fetch_method: string;
  fetch_url: string;
  language: string;
  fetch_interval_minutes: number;
  is_active: boolean;
  articles_count: number;
  last_fetched_at: string | null;
}

const AdminSources = () => {
  const [url, setUrl] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<DetectionResult[] | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [sourceName, setSourceName] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState<"ar" | "en">("ar");
  const [fetchInterval, setFetchInterval] = useState(5);
  const [autoFetchEnabled, setAutoFetchEnabled] = useState(true);
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Source>>({});
  const [fetching, setFetching] = useState<string | null>(null);
  const [fetchResult, setFetchResult] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => { loadSources(); }, []);

  // Auto-fetch timer
  useEffect(() => {
    const activeSources = sources.filter((s) => s.is_active);
    if (activeSources.length === 0) return;
    
    const intervals = activeSources.map((source) => {
      return setInterval(() => {
        handleManualFetch(source.id);
      }, source.fetch_interval_minutes * 60 * 1000);
    });

    return () => intervals.forEach(clearInterval);
  }, [sources]);

  const loadSources = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("manage-sources", { body: { action: "list" } });
      if (error) throw error;
      setSources(data.sources || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleAnalyze = async () => {
    if (!url) return;
    setAnalyzing(true);
    setResults(null);
    setSelectedMethod(null);
    try {
      const isRssUrl = url.includes("/rss") || url.includes("/feed") || url.includes(".xml") || url.includes("atom");
      const detections: DetectionResult[] = [
        { method: "RSS Feed", methodKey: "rss", icon: Rss, status: isRssUrl ? "success" : "warning", description: isRssUrl ? "تم العثور على RSS صالح - الأفضل" : "قد يحتوي على RSS", fetchUrl: isRssUrl ? url : `${url.replace(/\/$/, "")}/feed` },
        { method: "HTML Scraping", methodKey: "html", icon: Code, status: !isRssUrl ? "success" : "warning", description: !isRssUrl ? "بنية HTML قابلة للاستخراج" : "متاح كبديل", fetchUrl: url },
        { method: "JavaScript", methodKey: "js", icon: Globe, status: "warning", description: "محتوى ديناميكي", fetchUrl: url },
        { method: "API", methodKey: "api", icon: Zap, status: "error", description: "لم يتم العثور على API", fetchUrl: `${url.replace(/\/$/, "")}/api/news` },
      ];
      setResults(detections);
      const best = detections.find((d) => d.status === "success");
      if (best) setSelectedMethod(best.methodKey);
    } finally { setAnalyzing(false); }
  };

  const statusIcon = (status: string) => {
    if (status === "success") return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (status === "warning") return <AlertCircle className="w-4 h-4 text-amber-500" />;
    return <AlertCircle className="w-4 h-4 text-urgent" />;
  };

  const selectedResult = results?.find((r) => r.methodKey === selectedMethod);

  const handleAddSource = async () => {
    if (!selectedResult || !sourceName) { toast({ title: "أدخل اسم المصدر", variant: "destructive" }); return; }
    try {
      const { data, error } = await supabase.functions.invoke("manage-sources", {
        body: {
          action: "add",
          source: {
            name: sourceName, url, fetch_method: selectedResult.methodKey, fetch_url: selectedResult.fetchUrl,
            fetch_interval_minutes: autoFetchEnabled ? fetchInterval : 0, language: sourceLanguage, is_active: autoFetchEnabled,
          },
        },
      });
      if (error) throw error;
      toast({ title: "تمت إضافة المصدر بنجاح ✓" });
      setSources((prev) => [data.source, ...prev]);
      
      // Immediately fetch news from the new source
      if (autoFetchEnabled) {
        setFetching(data.source.id);
        try {
          const { data: fetchData } = await supabase.functions.invoke("fetch-news", { body: { sourceId: data.source.id } });
          toast({ title: `تم جلب ${fetchData?.fetched || 0} مقال من المصدر الجديد ✓` });
          loadSources();
        } catch {} finally { setFetching(null); }
      }
      
      setUrl(""); setResults(null); setSelectedMethod(null); setSourceName("");
    } catch (e: any) {
      toast({ title: "خطأ", description: e.message, variant: "destructive" });
    }
  };

  const handleUpdateSource = async (id: string) => {
    try {
      const { error } = await supabase.functions.invoke("manage-sources", { body: { action: "update", source: { id, ...editData } } });
      if (error) throw error;
      toast({ title: "تم التحديث ✓" }); setEditingId(null); loadSources();
    } catch (e: any) { toast({ title: "خطأ", description: e.message, variant: "destructive" }); }
  };

  const handleDeleteSource = async (id: string) => {
    try {
      const { error } = await supabase.functions.invoke("manage-sources", { body: { action: "delete", source: { id } } });
      if (error) throw error;
      setSources((prev) => prev.filter((s) => s.id !== id));
      toast({ title: "تم الحذف ✓" });
    } catch (e: any) { toast({ title: "خطأ", description: e.message, variant: "destructive" }); }
  };

  const handleManualFetch = async (sourceId?: string) => {
    setFetching(sourceId || "all");
    setFetchResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("fetch-news", { body: { sourceId } });
      if (error) throw error;
      setFetchResult(`تم جلب ${data.fetched} مقال من ${data.sources} مصادر`);
      toast({ title: `تم جلب ${data.fetched} مقال ✓` });
      loadSources();
    } catch (e: any) { toast({ title: "خطأ في الجلب", description: e.message, variant: "destructive" }); } finally { setFetching(null); }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold" style={{ color: "hsl(var(--admin-text))" }}>محلل المصادر الإخبارية</h1>
        <button onClick={() => handleManualFetch()} disabled={fetching === "all"} className="btn-admin-primary flex items-center gap-2 disabled:opacity-50">
          {fetching === "all" ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} جلب الأخبار الآن
        </button>
      </div>

      {fetchResult && (
        <div className="admin-surface p-4" style={{ borderColor: "hsl(142 76% 36% / 0.3)" }}>
          <p className="text-sm text-green-400">{fetchResult}</p>
        </div>
      )}

      {/* URL Input */}
      <div className="admin-surface p-5">
        <label className="block text-sm mb-2" style={{ color: "hsl(var(--admin-text-muted))" }}>ألصق رابط المصدر الإخباري</label>
        <div className="flex gap-3">
          <input type="url" dir="ltr" value={url} onChange={(e) => setUrl(e.target.value)} className="admin-input flex-1" placeholder="https://example.com/news" />
          <button onClick={handleAnalyze} disabled={analyzing || !url} className="btn-admin-primary flex items-center gap-2 disabled:opacity-50">
            {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />} تحليل
          </button>
        </div>
      </div>

      {/* Results */}
      {results && (
        <div className="admin-surface p-5 space-y-4">
          <h2 className="text-lg font-semibold" style={{ color: "hsl(var(--admin-text))" }}>نتائج التحليل</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {results.map((r) => {
              const isSelected = selectedMethod === r.methodKey;
              const isBest = r.status === "success";
              return (
                <button key={r.method} onClick={() => setSelectedMethod(r.methodKey)} className={`flex items-center gap-3 p-4 rounded-lg text-right transition-all ${isSelected ? "ring-2 ring-green-500" : ""}`} style={{ background: isBest ? "hsl(142 76% 36% / 0.1)" : "hsl(var(--admin-surface-hover))" }}>
                  <input type="radio" checked={isSelected} onChange={() => setSelectedMethod(r.methodKey)} className="w-4 h-4 accent-green-500" />
                  <r.icon className="w-5 h-5" style={{ color: isBest ? "#22c55e" : "hsl(var(--admin-text-muted))" }} />
                  <div className="flex-1">
                    <p className="text-sm font-semibold" style={{ color: isBest ? "#22c55e" : "hsl(var(--admin-text))" }}>{r.method} {isBest && "★"}</p>
                    <p className="text-xs" style={{ color: "hsl(var(--admin-text-muted))" }}>{r.description}</p>
                  </div>
                  {statusIcon(r.status)}
                </button>
              );
            })}
          </div>

          {selectedResult && (
            <div className="space-y-3 pt-4" style={{ borderTop: "1px solid hsl(var(--admin-border))" }}>
              <div>
                <label className="block text-sm mb-1.5" style={{ color: "hsl(var(--admin-text-muted))" }}>رابط الجلب</label>
                <input type="text" dir="ltr" readOnly value={selectedResult.fetchUrl} className="admin-input flex-1 font-latin text-sm" />
              </div>
              <div>
                <label className="block text-sm mb-1.5" style={{ color: "hsl(var(--admin-text-muted))" }}>اسم المصدر</label>
                <input type="text" value={sourceName} onChange={(e) => setSourceName(e.target.value)} className="admin-input" placeholder="مثال: رويترز عربي" />
              </div>
              <div>
                <label className="block text-sm mb-1.5" style={{ color: "hsl(var(--admin-text-muted))" }}>القسم</label>
                <div className="flex gap-2">
                  <button onClick={() => setSourceLanguage("ar")} className={`px-4 py-2 rounded text-sm font-medium transition-colors ${sourceLanguage === "ar" ? "btn-admin-primary" : ""}`} style={sourceLanguage !== "ar" ? { background: "hsl(var(--admin-surface-hover))", color: "hsl(var(--admin-text-muted))" } : undefined}>عربي</button>
                  <button onClick={() => setSourceLanguage("en")} className={`px-4 py-2 rounded text-sm font-medium transition-colors ${sourceLanguage === "en" ? "btn-admin-primary" : ""}`} style={sourceLanguage !== "en" ? { background: "hsl(var(--admin-surface-hover))", color: "hsl(var(--admin-text-muted))" } : undefined}>Global</button>
                </div>
              </div>

              {/* Auto fetch toggle */}
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={autoFetchEnabled} onChange={(e) => setAutoFetchEnabled(e.target.checked)} className="w-4 h-4 accent-green-500" />
                  <span className="text-sm" style={{ color: "hsl(var(--admin-text))" }}>تفعيل الجلب التلقائي</span>
                </label>
              </div>

              {autoFetchEnabled && (
                <div>
                  <label className="block text-sm mb-1.5" style={{ color: "hsl(var(--admin-text-muted))" }}>
                    <Timer className="w-3.5 h-3.5 inline ml-1" /> فترة الجلب (1-10 دقائق)
                  </label>
                  <div className="flex items-center gap-3">
                    <input type="range" min={1} max={10} value={fetchInterval} onChange={(e) => setFetchInterval(Number(e.target.value))} className="flex-1 accent-green-500" />
                    <span className="text-sm font-latin font-bold w-12 text-center" style={{ color: "hsl(var(--admin-text))" }}>{fetchInterval} د</span>
                  </div>
                </div>
              )}

              <button onClick={handleAddSource} className="btn-admin-primary flex items-center gap-2">
                <Plus className="w-4 h-4" /> نشر المصدر
              </button>
            </div>
          )}
        </div>
      )}

      {/* Existing sources */}
      <div className="admin-surface p-5">
        <h2 className="text-lg font-semibold mb-4" style={{ color: "hsl(var(--admin-text))" }}>المصادر الحالية ({sources.length})</h2>
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" style={{ color: "hsl(var(--admin-text-muted))" }} /></div>
        ) : sources.length === 0 ? (
          <p className="text-sm text-center py-8" style={{ color: "hsl(var(--admin-text-muted))" }}>لا توجد مصادر بعد</p>
        ) : (
          <div className="space-y-2">
            {sources.map((source) => (
              <div key={source.id} className="p-4 rounded-lg" style={{ background: "hsl(var(--admin-surface-hover))" }}>
                {editingId === source.id ? (
                  <div className="space-y-3">
                    <input className="admin-input text-sm" value={editData.name ?? source.name} onChange={(e) => setEditData((d) => ({ ...d, name: e.target.value }))} />
                    <input className="admin-input text-sm font-latin" dir="ltr" value={editData.fetch_url ?? source.fetch_url} onChange={(e) => setEditData((d) => ({ ...d, fetch_url: e.target.value }))} />
                    <div className="flex items-center gap-3">
                      <label className="text-xs" style={{ color: "hsl(var(--admin-text-muted))" }}>الفترة:</label>
                      <input type="range" min={1} max={10} value={editData.fetch_interval_minutes ?? source.fetch_interval_minutes} onChange={(e) => setEditData((d) => ({ ...d, fetch_interval_minutes: Number(e.target.value) }))} className="flex-1 accent-green-500" />
                      <span className="text-xs font-latin" style={{ color: "hsl(var(--admin-text))" }}>{editData.fetch_interval_minutes ?? source.fetch_interval_minutes} د</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleUpdateSource(source.id)} className="btn-admin-primary text-xs px-3 py-1.5">حفظ</button>
                      <button onClick={() => setEditingId(null)} className="text-xs px-3 py-1.5 rounded" style={{ color: "hsl(var(--admin-text-muted))" }}>إلغاء</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Globe className="w-4 h-4" style={{ color: "hsl(var(--admin-text-muted))" }} />
                      <div>
                        <p className="text-sm font-medium" style={{ color: "hsl(var(--admin-text))" }}>{source.name}</p>
                        <p className="text-xs" style={{ color: "hsl(var(--admin-text-muted))" }}>
                          {source.fetch_method.toUpperCase()} · {source.language === "ar" ? "عربي" : "English"} · {source.articles_count} مقال · كل {source.fetch_interval_minutes} دقيقة
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleManualFetch(source.id)} disabled={fetching === source.id} className="p-1.5 rounded hover:bg-[hsl(var(--admin-bg))] transition-colors" style={{ color: "hsl(var(--admin-text-muted))" }} title="جلب الآن">
                        {fetching === source.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                      </button>
                      <button onClick={() => { setEditingId(source.id); setEditData({}); }} className="p-1.5 rounded hover:bg-[hsl(var(--admin-bg))] transition-colors" style={{ color: "hsl(var(--admin-text-muted))" }}>
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDeleteSource(source.id)} className="p-1.5 rounded hover:bg-urgent/10 text-urgent">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <span className={`text-xs px-2 py-1 rounded ${source.is_active ? "text-green-400 bg-green-400/10" : "text-amber-400 bg-amber-400/10"}`}>
                        {source.is_active ? "نشط" : "متوقف"}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSources;
