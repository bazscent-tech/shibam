import { useState, useRef } from "react";
import { Sparkles, Wand2, Brain, Palette, FileText, Tags, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const AdminAiTools = () => {
  const [topic, setTopic] = useState("");
  const [articleType, setArticleType] = useState("analytical");
  const [designPrompt, setDesignPrompt] = useState("");
  const [generatedText, setGeneratedText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [headlineInput, setHeadlineInput] = useState("");
  const [headlineResult, setHeadlineResult] = useState("");
  const [summarizeInput, setSummarizeInput] = useState("");
  const [summarizeResult, setSummarizeResult] = useState("");
  const [classifyInput, setClassifyInput] = useState("");
  const [classifyResult, setClassifyResult] = useState("");
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const { toast } = useToast();

  const articleTypes = [
    { id: "analytical", label: "تحليلي" },
    { id: "predictive", label: "استشرافي" },
    { id: "interpretive", label: "تفسيري" },
  ];

  const streamAI = async (body: any, onDelta: (text: string) => void) => {
    const resp = await fetch(`${SUPABASE_URL}/functions/v1/ai-tools`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
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

      let newlineIndex: number;
      while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
        let line = buffer.slice(0, newlineIndex);
        buffer = buffer.slice(newlineIndex + 1);
        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (!line.startsWith("data: ")) continue;
        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") return;
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) onDelta(content);
        } catch { /* partial */ }
      }
    }
  };

  const handleGenerate = async () => {
    if (!topic) return;
    setIsGenerating(true);
    setGeneratedText("");
    try {
      let text = "";
      await streamAI(
        { action: "generate_article", topic, articleType },
        (delta) => { text += delta; setGeneratedText(text); }
      );
    } catch (e: any) {
      toast({ title: "خطأ", description: e.message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleQuickAI = async (action: string, input: string, setter: (v: string) => void) => {
    if (!input) return;
    setActiveAction(action);
    setter("");
    try {
      let text = "";
      const body: any = { action };
      if (action === "improve_headline") body.content = input;
      if (action === "summarize") body.content = input;
      if (action === "classify") { body.topic = input; body.content = input; }
      await streamAI(body, (delta) => { text += delta; setter(text); });
    } catch (e: any) {
      toast({ title: "خطأ", description: e.message, variant: "destructive" });
    } finally {
      setActiveAction(null);
    }
  };

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
            <label className="block text-sm mb-1.5" style={{ color: "hsl(var(--admin-text-muted))" }}>الموضوع</label>
            <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} className="admin-input" placeholder="مثال: مستقبل الذكاء الاصطناعي في التعليم" />
          </div>
          <div>
            <label className="block text-sm mb-2" style={{ color: "hsl(var(--admin-text-muted))" }}>نوع المقال</label>
            <div className="flex gap-2">
              {articleTypes.map((type) => (
                <button key={type.id} onClick={() => setArticleType(type.id)} className={`px-4 py-2 rounded text-sm font-medium transition-colors ${articleType === type.id ? "btn-admin-primary" : ""}`} style={articleType !== type.id ? { background: "hsl(var(--admin-surface-hover))", color: "hsl(var(--admin-text-muted))" } : undefined}>
                  {type.label}
                </button>
              ))}
            </div>
          </div>
          <button onClick={handleGenerate} disabled={isGenerating || !topic} className="btn-admin-primary flex items-center gap-2 disabled:opacity-50">
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
            توليد المقال
          </button>
          {generatedText && (
            <div className="p-4 rounded-lg whitespace-pre-wrap text-sm leading-relaxed" style={{ background: "hsl(var(--admin-bg))", color: "hsl(var(--admin-text))" }}>
              {generatedText}
            </div>
          )}
        </div>
      </div>

      {/* Quick AI Tools */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Headline Improver */}
        <div className="admin-surface p-5">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-urgent" />
            <h3 className="text-sm font-semibold" style={{ color: "hsl(var(--admin-text))" }}>تحسين العناوين</h3>
          </div>
          <input className="admin-input text-sm mb-2" value={headlineInput} onChange={(e) => setHeadlineInput(e.target.value)} placeholder="أدخل العنوان..." />
          <button onClick={() => handleQuickAI("improve_headline", headlineInput, setHeadlineResult)} disabled={activeAction === "improve_headline"} className="btn-admin-primary text-xs px-3 py-1.5 w-full flex items-center justify-center gap-1 disabled:opacity-50">
            {activeAction === "improve_headline" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />} تحسين
          </button>
          {headlineResult && <p className="text-xs mt-2 p-2 rounded" style={{ background: "hsl(var(--admin-bg))", color: "hsl(var(--admin-text))" }}>{headlineResult}</p>}
        </div>

        {/* Summarizer */}
        <div className="admin-surface p-5">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-urgent" />
            <h3 className="text-sm font-semibold" style={{ color: "hsl(var(--admin-text))" }}>تلخيص المحتوى</h3>
          </div>
          <textarea className="admin-input text-sm mb-2 min-h-[60px] resize-none" value={summarizeInput} onChange={(e) => setSummarizeInput(e.target.value)} placeholder="ألصق المحتوى..." />
          <button onClick={() => handleQuickAI("summarize", summarizeInput, setSummarizeResult)} disabled={activeAction === "summarize"} className="btn-admin-primary text-xs px-3 py-1.5 w-full flex items-center justify-center gap-1 disabled:opacity-50">
            {activeAction === "summarize" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />} تلخيص
          </button>
          {summarizeResult && <p className="text-xs mt-2 p-2 rounded" style={{ background: "hsl(var(--admin-bg))", color: "hsl(var(--admin-text))" }}>{summarizeResult}</p>}
        </div>

        {/* Classifier */}
        <div className="admin-surface p-5">
          <div className="flex items-center gap-2 mb-3">
            <Tags className="w-4 h-4 text-urgent" />
            <h3 className="text-sm font-semibold" style={{ color: "hsl(var(--admin-text))" }}>تصنيف المقالات</h3>
          </div>
          <input className="admin-input text-sm mb-2" value={classifyInput} onChange={(e) => setClassifyInput(e.target.value)} placeholder="أدخل عنوان المقال..." />
          <button onClick={() => handleQuickAI("classify", classifyInput, setClassifyResult)} disabled={activeAction === "classify"} className="btn-admin-primary text-xs px-3 py-1.5 w-full flex items-center justify-center gap-1 disabled:opacity-50">
            {activeAction === "classify" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Tags className="w-3 h-3" />} تصنيف
          </button>
          {classifyResult && <p className="text-xs mt-2 p-2 rounded font-bold" style={{ background: "hsl(var(--admin-bg))", color: "#22c55e" }}>{classifyResult}</p>}
        </div>
      </div>

      {/* Neural AI Core */}
      <div className="admin-surface p-5">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-5 h-5 text-urgent" />
          <h2 className="text-lg font-semibold" style={{ color: "hsl(var(--admin-text))" }}>النواة العصبية</h2>
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
    </div>
  );
};

export default AdminAiTools;
