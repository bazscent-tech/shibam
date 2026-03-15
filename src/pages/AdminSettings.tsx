const AdminSettings = () => {
  return (
    <div className="space-y-6" dir="rtl">
      <h1 className="text-xl font-bold" style={{ color: "hsl(var(--admin-text))" }}>
        الإعدادات
      </h1>

      <div className="admin-surface p-5 space-y-4">
        <h2 className="text-lg font-semibold" style={{ color: "hsl(var(--admin-text))" }}>
          إعدادات الجلب التلقائي
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: "hsl(var(--admin-surface-hover))" }}>
            <span className="text-sm" style={{ color: "hsl(var(--admin-text))" }}>الجلب التلقائي</span>
            <button className="relative w-11 h-6 rounded-full bg-green-500 transition-colors">
              <span className="absolute left-1 top-1 w-4 h-4 rounded-full bg-accent-foreground transition-transform" />
            </button>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: "hsl(var(--admin-surface-hover))" }}>
            <span className="text-sm" style={{ color: "hsl(var(--admin-text))" }}>كشف التكرارات</span>
            <button className="relative w-11 h-6 rounded-full bg-green-500 transition-colors">
              <span className="absolute left-1 top-1 w-4 h-4 rounded-full bg-accent-foreground transition-transform" />
            </button>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: "hsl(var(--admin-surface-hover))" }}>
            <span className="text-sm" style={{ color: "hsl(var(--admin-text))" }}>النشر الفوري</span>
            <button className="relative w-11 h-6 rounded-full bg-green-500 transition-colors">
              <span className="absolute left-1 top-1 w-4 h-4 rounded-full bg-accent-foreground transition-transform" />
            </button>
          </div>
        </div>
      </div>

      <div className="admin-surface p-5 space-y-4">
        <h2 className="text-lg font-semibold" style={{ color: "hsl(var(--admin-text))" }}>
          إعدادات عامة
        </h2>
        <div>
          <label className="block text-sm mb-1.5" style={{ color: "hsl(var(--admin-text-muted))" }}>اسم الموقع</label>
          <input className="admin-input" defaultValue="شبام نيوز" />
        </div>
        <div>
          <label className="block text-sm mb-1.5" style={{ color: "hsl(var(--admin-text-muted))" }}>اللغة الأساسية</label>
          <select className="admin-input">
            <option>العربية</option>
            <option>English</option>
          </select>
        </div>
        <button className="btn-admin-primary">حفظ التغييرات</button>
      </div>
    </div>
  );
};

export default AdminSettings;
