import { useState } from "react";
import { Link } from "react-router-dom";
import SiteHeader from "@/components/SiteHeader";
import SectionBar from "@/components/SectionBar";
import BreakingNewsTicker from "@/components/BreakingNewsTicker";
import MetalPrices from "@/components/MetalPrices";
import NewsSlider from "@/components/NewsSlider";
import SectionToggle from "@/components/SectionToggle";
import NewsFeedDB from "@/components/NewsFeedDB";
import TrendingSidebar from "@/components/TrendingSidebar";
import SiteFooter from "@/components/SiteFooter";
import { useArticles } from "@/hooks/useArticles";
import { Loader2 } from "lucide-react";
import { categories } from "@/data/mockNews";

const Index = () => {
  const [activeSection, setActiveSection] = useState<"ar" | "en">("ar");
  const [activeCategory, setActiveCategory] = useState("الرئيسية");

  const { articles, loading, totalPages } = useArticles(activeSection === "ar" ? "ar" : "en", 1);

  // Filter by category if not "الرئيسية" / all
  const filtered = activeCategory === "الرئيسية" || activeCategory === "All"
    ? articles
    : articles.filter((a) => a.category === activeCategory);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <BreakingNewsTicker language={activeSection === "ar" ? "ar" : "en"} />
      <MetalPrices />

      {/* Slider with latest articles that have images */}
      {articles.length > 0 && <NewsSlider articles={articles} />}

      <SectionToggle activeSection={activeSection} onChange={setActiveSection} />

      <SectionBar
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      <div className="container mx-auto py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">
                {activeSection === "ar" ? "آخر الأخبار" : "Latest News"}
              </h2>
              {totalPages > 1 && (
                <Link
                  to={`/archive?lang=${activeSection}`}
                  className="text-sm text-urgent hover:underline"
                >
                  {activeSection === "ar" ? "عرض الكل ←" : "View All →"}
                </Link>
              )}
            </div>
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <p className="text-lg">
                  {activeSection === "ar"
                    ? "لا توجد أخبار حالياً. أضف مصادر من لوحة التحكم لبدء الجلب."
                    : "No news yet. Add sources from admin panel to start fetching."}
                </p>
              </div>
            ) : (
              <NewsFeedDB articles={filtered} language={activeSection} />
            )}
          </div>
          <div className="lg:col-span-1">
            <TrendingSidebar />
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
};

export default Index;
