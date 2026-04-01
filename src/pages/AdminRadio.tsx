import { useState, useEffect, useRef } from "react";
import { Radio, Plus, Trash2, Loader2, Save, X, Play, Pause, Check, AlertCircle, GripVertical } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Station {
  id: string;
  name: string;
  stream_urls: string[];
  logo_url: string | null;
  frequency: string | null;
  country: string | null;
  sort_order: number;
  is_active: boolean;
  is_working: boolean;
  play_count: number;
  quality_score: number;
}

const AdminRadio = () => {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Station | null>(null);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", stream_urls: [""], logo_url: "", frequency: "", country: "YE" });
  const fileRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  const load = async () => {
    const { data } = await supabase.from("radio_stations").select("*").order("sort_order", { ascending: true });
    setStations((data as Station[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setForm({ name: "", stream_urls: [""], logo_url: "", frequency: "", country: "YE" });
    setEditing(null);
    setAdding(false);
  };

  const startEdit = (s: Station) => {
    setEditing(s);
    setAdding(true);
    setForm({
      name: s.name,
      stream_urls: s.stream_urls.length ? s.stream_urls : [""],
      logo_url: s.logo_url || "",
      frequency: s.frequency || "",
      country: s.country || "YE",
    });
  };

  const handleSave = async () => {
    if (!form.name || !form.stream_urls.filter(Boolean).length) {
      toast({ title: "أدخل الاسم ورابط بث واحد على الأقل", variant: "destructive" });
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name,
      stream_urls: form.stream_urls.filter(Boolean),
      logo_url: form.logo_url || null,
      frequency: form.frequency || null,
      country: form.country || "YE",
    };
    try {
      if (editing) {
        await supabase.from("radio_stations").update(payload).eq("id", editing.id);
      } else {
        await supabase.from("radio_stations").insert(payload);
      }
      toast({ title: editing ? "تم التحديث ✓" : "تمت الإضافة ✓" });
      resetForm();
      load();
    } catch (e: any) {
      toast({ title: "خطأ", description: e.message, variant: "destructive" });
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    await supabase.from("radio_stations").delete().eq("id", id);
    toast({ title: "تم الحذف ✓" });
    load();
  };

  const testStream = async (url: string) => {
    setTesting(url);
    try {
      const audio = new Audio();
      audio.src = url;
      await new Promise<void>((resolve, reject) => {
        audio.oncanplay = () => { audio.pause(); resolve(); };
        audio.onerror = () => reject(new Error("فشل"));
        setTimeout(() => reject(new Error("انتهت المهلة")), 8000);
      });
      toast({ title: "✅ البث يعمل" });
    } catch {
      toast({ title: "❌ البث لا يعمل", variant: "destructive" });
    } finally { setTesting(null); }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split(".").pop();
    const path = `radio/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("article-images").upload(path, file);
    if (error) { toast({ title: "خطأ رفع الصورة", variant: "destructive" }); return; }
    const { data } = supabase.storage.from("article-images").getPublicUrl(path);
    setForm((f) => ({ ...f, logo_url: data.publicUrl }));
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold" style={{ color: "hsl(var(--admin-text))" }}>إدارة الراديو</h1>
        <button onClick={() => { resetForm(); setAdding(true); }} className="btn-admin-primary flex items-center gap-2 text-xs">
          <Plus className="w-4 h-4" /> إضافة محطة
        </button>
      </div>

      {/* Add/Edit form */}
      {adding && (
        <div className="admin-surface p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold" style={{ color: "hsl(var(--admin-text))" }}>
              {editing ? "تعديل المحطة" : "إضافة محطة جديدة"}
            </h2>
            <button onClick={resetForm} className="p-1.5 rounded hover:bg-[hsl(var(--admin-surface-hover))]">
              <X className="w-5 h-5" style={{ color: "hsl(var(--admin-text-muted))" }} />
            </button>
          </div>

          <div>
            <label className="block text-sm mb-1.5" style={{ color: "hsl(var(--admin-text-muted))" }}>اسم المحطة *</label>
            <input className="admin-input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="مثال: إذاعة صنعاء" />
          </div>

          <div>
            <label className="block text-sm mb-1.5" style={{ color: "hsl(var(--admin-text-muted))" }}>روابط البث *</label>
            {form.stream_urls.map((url, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input
                  className="admin-input flex-1"
                  value={url}
                  onChange={(e) => {
                    const urls = [...form.stream_urls];
                    urls[i] = e.target.value;
                    setForm((f) => ({ ...f, stream_urls: urls }));
                  }}
                  placeholder="https://stream.example.com/live.mp3"
                />
                <button onClick={() => url && testStream(url)} disabled={testing === url || !url} className="btn-admin-primary text-xs px-3 disabled:opacity-50">
                  {testing === url ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                </button>
                {form.stream_urls.length > 1 && (
                  <button onClick={() => setForm((f) => ({ ...f, stream_urls: f.stream_urls.filter((_, j) => j !== i) }))} className="p-2 text-urgent">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button onClick={() => setForm((f) => ({ ...f, stream_urls: [...f.stream_urls, ""] }))} className="text-xs px-3 py-1.5 rounded" style={{ color: "hsl(var(--admin-text-muted))", background: "hsl(var(--admin-surface-hover))" }}>
              + إضافة رابط بديل
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1.5" style={{ color: "hsl(var(--admin-text-muted))" }}>التردد</label>
              <input className="admin-input" value={form.frequency} onChange={(e) => setForm((f) => ({ ...f, frequency: e.target.value }))} placeholder="FM 91.5" />
            </div>
            <div>
              <label className="block text-sm mb-1.5" style={{ color: "hsl(var(--admin-text-muted))" }}>الدولة</label>
              <input className="admin-input" value={form.country} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))} placeholder="YE" />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1.5" style={{ color: "hsl(var(--admin-text-muted))" }}>شعار المحطة</label>
            <div className="flex items-center gap-3">
              {form.logo_url && <img src={form.logo_url} alt="" className="w-12 h-12 rounded-lg object-cover" />}
              <button onClick={() => fileRef.current?.click()} className="text-xs px-3 py-1.5 rounded" style={{ color: "hsl(var(--admin-text-muted))", background: "hsl(var(--admin-surface-hover))" }}>
                رفع صورة
              </button>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
            </div>
          </div>

          <button onClick={handleSave} disabled={saving} className="btn-admin-primary flex items-center gap-2 disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {editing ? "تحديث" : "إضافة"}
          </button>
        </div>
      )}

      {/* Station list */}
      <div className="admin-surface overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" style={{ color: "hsl(var(--admin-text-muted))" }} /></div>
        ) : stations.length === 0 ? (
          <p className="text-sm text-center py-8" style={{ color: "hsl(var(--admin-text-muted))" }}>لا توجد محطات راديو</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid hsl(var(--admin-border))" }}>
                  {["المحطة", "التردد", "الحالة", "مرات التشغيل", "إجراءات"].map((h) => (
                    <th key={h} className="text-right px-4 py-3 text-xs font-semibold" style={{ color: "hsl(var(--admin-text-muted))" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stations.map((s) => (
                  <tr key={s.id} style={{ borderBottom: "1px solid hsl(var(--admin-border))" }} className="hover:bg-[hsl(var(--admin-surface-hover))]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {s.logo_url ? (
                          <img src={s.logo_url} alt="" className="w-8 h-8 rounded object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded bg-[hsl(var(--admin-surface-hover))] flex items-center justify-center">
                            <Radio className="w-4 h-4" style={{ color: "hsl(var(--admin-text-muted))" }} />
                          </div>
                        )}
                        <span className="font-medium" style={{ color: "hsl(var(--admin-text))" }}>{s.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3" style={{ color: "hsl(var(--admin-text-muted))" }}>{s.frequency || "—"}</td>
                    <td className="px-4 py-3">
                      {s.is_working ? (
                        <span className="text-xs px-2 py-1 rounded text-green-400 bg-green-400/10 flex items-center gap-1 w-fit">
                          <Check className="w-3 h-3" /> يعمل
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-1 rounded text-red-400 bg-red-400/10 flex items-center gap-1 w-fit">
                          <AlertCircle className="w-3 h-3" /> متوقف
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-latin" style={{ color: "hsl(var(--admin-text-muted))" }}>{s.play_count}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => startEdit(s)} className="p-1.5 rounded hover:bg-[hsl(var(--admin-surface-hover))]" style={{ color: "hsl(var(--admin-text-muted))" }}>
                          <Save className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(s.id)} className="p-1.5 rounded hover:bg-urgent/10 text-urgent">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
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

export default AdminRadio;
