import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/AdminLogin";
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import AdminArticles from "./pages/AdminArticles";
import AdminAddArticle from "./pages/AdminAddArticle";
import AdminSources from "./pages/AdminSources";
import AdminAiTools from "./pages/AdminAiTools";
import AdminTrending from "./pages/AdminTrending";
import AdminSettings from "./pages/AdminSettings";
import AdminRadio from "./pages/AdminRadio";
import AdminQuickAccess from "./components/AdminQuickAccess";
import ArticlePage from "./pages/ArticlePage";
import NewsArchive from "./pages/NewsArchive";

const queryClient = new QueryClient();

const AdminGuard = ({ children }: { children: React.ReactNode }) => {
  const isAdmin = sessionStorage.getItem("shibam_admin") === "true";
  if (!isAdmin) return <Navigate to="/admin" replace />;
  return <>{children}</>;
};

const App = () => (
  <HelmetProvider>
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AdminQuickAccess />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/article/:slug" element={<ArticlePage />} />
          <Route path="/archive" element={<NewsArchive />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <AdminGuard>
                <AdminLayout />
              </AdminGuard>
            }
          >
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="articles" element={<AdminArticles />} />
            <Route path="add-article" element={<AdminAddArticle />} />
            <Route path="sources" element={<AdminSources />} />
            <Route path="ai-tools" element={<AdminAiTools />} />
            <Route path="trending" element={<AdminTrending />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="radio" element={<AdminRadio />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </HelmetProvider>
);

export default App;
