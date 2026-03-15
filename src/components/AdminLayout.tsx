import { useState } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Newspaper,
  Link2,
  Sparkles,
  TrendingUp,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const adminNav = [
  { label: "لوحة التحكم", path: "/admin/dashboard", icon: LayoutDashboard },
  { label: "المقالات", path: "/admin/articles", icon: Newspaper },
  { label: "المصادر", path: "/admin/sources", icon: Link2 },
  { label: "أدوات الذكاء", path: "/admin/ai-tools", icon: Sparkles },
  { label: "الأبحاث والترندات", path: "/admin/trending", icon: TrendingUp },
  { label: "الإعدادات", path: "/admin/settings", icon: Settings },
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    sessionStorage.removeItem("shibam_admin");
    navigate("/admin");
  };

  return (
    <div dir="rtl" className="min-h-screen flex" style={{ background: "hsl(var(--admin-bg))" }}>
      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 right-0 z-50 w-64 transform transition-transform duration-200 lg:transform-none ${
          sidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        }`}
        style={{ background: "hsl(var(--admin-surface))", borderLeft: "1px solid hsl(var(--admin-border))" }}
      >
        <div className="p-5 flex items-center justify-between">
          <h2 className="text-lg font-bold" style={{ color: "hsl(var(--admin-text))" }}>
            شبام <span className="text-urgent">نيوز</span>
          </h2>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden" style={{ color: "hsl(var(--admin-text-muted))" }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="px-3 space-y-1">
          {adminNav.map((item) => {
            const active = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => { navigate(item.path); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active ? "text-urgent" : ""
                }`}
                style={{
                  color: active ? undefined : "hsl(var(--admin-text-muted))",
                  background: active ? "hsl(var(--admin-surface-hover))" : undefined,
                }}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-4 right-0 left-0 px-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors"
            style={{ color: "hsl(var(--admin-text-muted))" }}
          >
            <LogOut className="w-4 h-4" />
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <header
          className="h-14 flex items-center px-4 gap-3"
          style={{ borderBottom: "1px solid hsl(var(--admin-border))" }}
        >
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden" style={{ color: "hsl(var(--admin-text-muted))" }}>
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-sm font-medium" style={{ color: "hsl(var(--admin-text-muted))" }}>
            {adminNav.find((n) => n.path === location.pathname)?.label || "لوحة التحكم"}
          </span>
        </header>
        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
