import { useState } from "react";
import { Sparkles, Wand2, Brain, Palette } from "lucide-react";

const AdminAiTools = () => {
  const [topic, setTopic] = useState("");
  const [articleType, setArticleType] = useState("analytical");
  const [designPrompt, setDesignPrompt] = useState("");

  const articleTypes = [
    { id: "analytical", label: "تحليلي" },
    { id: "predictive", label: "استشرافي" },
    { id: "interpretive", label: "تفسيري" },
  ];

  return (
    <div className="space-y-6" dir="rtl">
      <h1 className="text-xl font-bold" style={{ color: "hsl(var(--admin-text))" }}>
        أدوات الذكاء الاصطناعي
      </h1>

      {/* AI Article Generator */}
      <div className="admin-surface p-5">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-urgent" />
          <h2 className="text-lg font-semibold" style={{ color: "hsl(var(--admin-text))" }}>
            توليد مقال بالذكاء الاصطناعي
          </h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1.5" style={{ color: "hsl(var(--admin-text-muted))" }}>
              الموضوع أو الكلمة المفتاحية
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="admin-input"
              placeholder="مثال: مستقبل الذكاء الاصطناعي في التعليم"
            />
          </div>

          <div>
            <label className="block text-sm mb-2" style={{ color: "hsl(var(--admin-text-muted))" }}>
              نوع المقال
            </label>
            <div className="flex gap-2">
              {articleTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setArticleType(type.id)}
                  className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                    articleType === type.id ? "btn-admin-primary" : ""
                  }`}
                  style={articleType !== type.id ? {
                    background: "hsl(var(--admin-surface-hover))",
                    color: "hsl(var(--admin-text-muted))",
                  } : undefined}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <button className="btn-admin-primary flex items-center gap-2">
            <Wand2 className="w-4 h-4" />
            توليد المقال
          </button>
        </div>
      </div>

      {/* Neural AI Core */}
      <div className="admin-surface p-5">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-5 h-5 text-urgent" />
          <h2 className="text-lg font-semibold" style={{ color: "hsl(var(--admin-text))" }}>
            النواة العصبية
          </h2>
        </div>
        <p className="text-sm mb-4" style={{ color: "hsl(var(--admin-text-muted))" }}>
          النظام يتعلم من جميع الأخبار الواردة لتحسين التوصيات والتحليلات تلقائياً.
        </p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "مقالات محللة", value: "12,847" },
            { label: "أنماط مكتشفة", value: "234" },
            { label: "دقة التصنيف", value: "94.2%" },
          ].map((stat) => (
            <div key={stat.label} className="text-center p-3 rounded-lg" style={{ background: "hsl(var(--admin-surface-hover))" }}>
              <p className="text-lg font-bold font-latin" style={{ color: "hsl(var(--admin-text))" }}>{stat.value}</p>
              <p className="text-xs" style={{ color: "hsl(var(--admin-text-muted))" }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Site Improvement AI */}
      <div className="admin-surface p-5">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="w-5 h-5 text-urgent" />
          <h2 className="text-lg font-semibold" style={{ color: "hsl(var(--admin-text))" }}>
            تحسين الموقع بالذكاء الاصطناعي
          </h2>
        </div>
        <div>
          <label className="block text-sm mb-1.5" style={{ color: "hsl(var(--admin-text-muted))" }}>
            أدخل أوامرك لتعديل التصميم
          </label>
          <textarea
            value={designPrompt}
            onChange={(e) => setDesignPrompt(e.target.value)}
            className="admin-input min-h-[100px] resize-none"
            placeholder="مثال: غيّر لون الخلفية إلى الأزرق الداكن وأضف قسم الفيديو"
          />
          <button className="btn-admin-primary mt-3 flex items-center gap-2">
            <Wand2 className="w-4 h-4" />
            تطبيق التحسينات
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminAiTools;
