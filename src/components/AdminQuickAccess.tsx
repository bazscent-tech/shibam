import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeftRight, Home, Settings } from "lucide-react";

const AdminQuickAccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = sessionStorage.getItem("shibam_admin") === "true";

  if (!isAdmin) return null;

  const isOnAdmin = location.pathname.startsWith("/admin");

  return (
    <button
      onClick={() => navigate(isOnAdmin ? "/" : "/admin/dashboard")}
      className="fixed bottom-6 left-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full shadow-lg transition-all hover:scale-105"
      style={{
        background: "linear-gradient(135deg, hsl(217 91% 50%), hsl(240 60% 50%))",
        color: "white",
      }}
      title={isOnAdmin ? "الصفحة الرئيسية" : "لوحة التحكم"}
    >
      {isOnAdmin ? <Home className="w-5 h-5" /> : <Settings className="w-5 h-5" />}
      <span className="text-sm font-medium hidden sm:inline">
        {isOnAdmin ? "الموقع" : "الإدارة"}
      </span>
    </button>
  );
};

export default AdminQuickAccess;
