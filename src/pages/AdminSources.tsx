import { useState } from "react";
import { Search, Globe, Rss, Code, Zap, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface DetectionResult {
  method: string;
  icon: typeof Rss;
  status: "success" | "warning" | "error";
  description: string;
}

const AdminSources = () => {
  const [url, setUrl] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<DetectionResult[] | null>(null);

  const handleAnalyze = () => {
    if (!url) return;
    setAnalyzing(true);
    // Simulate analysis
    setTimeout(() => {
      setResults([
        { method: "RSS Feed", icon: Rss, status: "success", description: "تم العثور على RSS صالح" },
        { method: "HTML Scraping", icon: Code, status: "success", description: "بنية HTML قابلة للاستخراج" },
        { method: "JavaScript Rendering", icon: Globe, status: "warning", description: "محتوى ديناميكي - يتطلب متصفح" },
        { method: "API Detection", icon: Zap, status: "error", description: "لم يتم العثور على API عام" },
      ]);
      setAnalyzing(false);
    }, 2000);
  };

  const statusIcon = (status: string) => {
    if (status === "success") return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (status === "warning") return <AlertCircle className="w-4 h-4 text-amber-500" />;
    return <AlertCircle className="w-4 h-4 text-urgent" />;
  };

  return (
    <div className="space-y-6" dir="rtl">
      <h1 className="text-xl font-bold" style={{ color: "hsl(var(--admin-text))" }}>
        محلل المصادر الإخبارية
      </h1>

      {/* URL Input */}
      <div className="admin-surface p-5">
        <label className="block text-sm mb-2" style={{ color: "hsl(var(--admin-text-muted))" }}>
          ألصق رابط المصدر الإخباري
        </label>
        <div className="flex gap-3">
          <input
            type="url"
            dir="ltr"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="admin-input flex-1"
            placeholder="https://example.com/news"
          />
          <button
            onClick={handleAnalyze}
            disabled={analyzing || !url}
            className="btn-admin-primary flex items-center gap-2 disabled:opacity-50"
          >
            {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            تحليل
          </button>
        </div>
      </div>

      {/* Results */}
      {results && (
        <div className="admin-surface p-5">
          <h2 className="text-lg font-semibold mb-4" style={{ color: "hsl(var(--admin-text))" }}>
            نتائج التحليل
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {results.map((r) => (
              <div
                key={r.method}
                className="flex items-center gap-3 p-4 rounded-lg"
                style={{ background: "hsl(var(--admin-surface-hover))" }}
              >
                <r.icon className="w-5 h-5" style={{ color: "hsl(var(--admin-text-muted))" }} />
                <div className="flex-1">
                  <p className="text-sm font-semibold" style={{ color: "hsl(var(--admin-text))" }}>{r.method}</p>
                  <p className="text-xs" style={{ color: "hsl(var(--admin-text-muted))" }}>{r.description}</p>
                </div>
                {statusIcon(r.status)}
              </div>
            ))}
          </div>

          {/* Preview articles */}
          <h3 className="text-base font-semibold mt-6 mb-3" style={{ color: "hsl(var(--admin-text))" }}>
            معاينة أول 5 مقالات
          </h3>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-lg"
                style={{ background: "hsl(var(--admin-bg))" }}
              >
                <div className="w-16 h-12 rounded skeleton-pulse shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "hsl(var(--admin-text))" }}>
                    عنوان المقال رقم {i} - نموذج معاينة
                  </p>
                  <p className="text-xs" style={{ color: "hsl(var(--admin-text-muted))" }}>
                    منذ {i * 2} ساعات
                  </p>
                </div>
              </div>
            ))}
          </div>

          <button className="btn-admin-primary mt-4">
            إضافة كمصدر
          </button>
        </div>
      )}

      {/* Existing sources */}
      <div className="admin-surface p-5">
        <h2 className="text-lg font-semibold mb-4" style={{ color: "hsl(var(--admin-text))" }}>
          المصادر الحالية
        </h2>
        <div className="space-y-2">
          {[
            { name: "رويترز عربي", type: "RSS", articles: 342, status: "نشط" },
            { name: "الجزيرة نت", type: "HTML", articles: 567, status: "نشط" },
            { name: "بي بي سي عربي", type: "RSS", articles: 234, status: "نشط" },
            { name: "سكاي نيوز عربية", type: "API", articles: 189, status: "متوقف" },
          ].map((source) => (
            <div
              key={source.name}
              className="flex items-center justify-between p-3 rounded-lg"
              style={{ background: "hsl(var(--admin-surface-hover))" }}
            >
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4" style={{ color: "hsl(var(--admin-text-muted))" }} />
                <div>
                  <p className="text-sm font-medium" style={{ color: "hsl(var(--admin-text))" }}>{source.name}</p>
                  <p className="text-xs" style={{ color: "hsl(var(--admin-text-muted))" }}>
                    {source.type} · {source.articles} مقال
                  </p>
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded ${source.status === "نشط" ? "text-green-400 bg-green-400/10" : "text-amber-400 bg-amber-400/10"}`}>
                {source.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminSources;
