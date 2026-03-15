import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, User } from "lucide-react";

const AdminLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // NOTE: This is a temporary frontend-only check.
    // Production must use server-side auth via Lovable Cloud.
    if (username === "Shibam" && password === "777492635") {
      sessionStorage.setItem("shibam_admin", "true");
      navigate("/admin/dashboard");
    } else {
      setError("اسم المستخدم أو كلمة المرور غير صحيحة");
    }
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen flex items-center justify-center"
      style={{ background: "hsl(var(--admin-bg))" }}
    >
      <div className="admin-surface p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold" style={{ color: "hsl(var(--admin-text))" }}>
            شبام <span className="text-urgent">نيوز</span>
          </h1>
          <p className="text-sm mt-2" style={{ color: "hsl(var(--admin-text-muted))" }}>
            لوحة التحكم الإدارية
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm mb-1.5" style={{ color: "hsl(var(--admin-text-muted))" }}>
              اسم المستخدم
            </label>
            <div className="relative">
              <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "hsl(var(--admin-text-muted))" }} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="admin-input pr-10"
                placeholder="أدخل اسم المستخدم"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm mb-1.5" style={{ color: "hsl(var(--admin-text-muted))" }}>
              كلمة المرور
            </label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "hsl(var(--admin-text-muted))" }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="admin-input pr-10"
                placeholder="أدخل كلمة المرور"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-urgent">{error}</p>
          )}

          <button type="submit" className="btn-admin-primary w-full">
            تسجيل الدخول
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
