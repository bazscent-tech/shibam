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

const arCategories = ["الرئيسية", "سياسة", "اقتصاد", "تكنولوجيا", "رياضة", "ثقافة", "صحة", "علوم", "منوعات"];
const enCategories = ["All", "Politics", "Economy", "Technology", "Sports", "Culture", "Health", "Science", "Entertainment"];

const Index = () => {
  const [activeSection, setActiveSection] = useState<"ar" | "en">("ar");
  const [arCategory, setArCategory] = useState("الرئيسية");
  const [enCategory, setEnCategory] = useState("All");
  const [page, setPage] = useState(1);

  const { articles: arArticles, loading: arLoading, totalPages: arTotalPages, totalCount: arTotalCount } = useArticles("ar", activeSection === "ar" ? page : 1);
  const { articles: enArticles, loading: enLoading, totalPages: enTotalPages, totalCount: enTotalCount } = useArticles("en", activeSection === "en" ? page : 1);

  const isAr = activeSection === "ar";
  const articles = isAr ? arArticles : enArticles;
  const loading = isAr ? arLoading : enLoading;
  const totalPages = isAr ? arTotalPages : enTotalPages;
  const activeCategory = isAr ? arCategory : enCategory;
  const setActiveCategory = isAr ? setArCategory : setEnCategory;

  const filtered = activeCategory === "الرئيسية" || activeCategory === "All"
    ? articles
    : articles.filter((a) => a.category === activeCategory);

  const handleSectionChange = (section: "ar" | "en") => {
    setActiveSection(section);
    setPage(1);
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("ellipsis");
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
        pages.push(i);
      }
      if (page < totalPages - 2) pages.push("ellipsis");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <BreakingNewsTicker language={activeSection} />
      <MetalPrices />

      {articles.length > 0 && <NewsSlider articles={articles} />}

      <SectionToggle activeSection={activeSection} onChange={handleSectionChange} />

      <SectionBar
        categories={isAr ? arCategories : enCategories}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      <div className="container mx-auto py-6" dir={isAr ? "rtl" : "ltr"}>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">
                {isAr ? "آخر الأخبار" : "Latest News"}
              </h2>
              {totalPages > 1 && (
                <Link
                  to={`/archive?lang=${activeSection}`}
                  className="text-sm text-urgent hover:underline"
                >
                  {isAr ? "عرض الكل ←" : "View All →"}
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
                  {isAr
                    ? "لا توجد أخبار حالياً. أضف مصادر من لوحة التحكم لبدء الجلب."
                    : "No news yet. Add sources from admin panel to start fetching."}
                </p>
              </div>
            ) : (
              <>
                <NewsFeedDB articles={filtered} language={activeSection} />

                {/* Pagination */}
                {totalPages > 1 && (
                  <nav className="flex items-center justify-center gap-1 mt-8 flex-wrap" dir={isAr ? "rtl" : "ltr"}>
                    {/* Previous */}
                     <button
                      disabled={page <= 1}
                      onClick={() => { setPage(page - 1); }}
                      className="px-3 py-2 rounded-lg text-sm font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 disabled:opacity-30 transition-colors"
                    >
                      {isAr ? "← السابق" : "← Previous"}
                    </button>

                    {/* Page numbers */}
                    {getPageNumbers().map((p, i) =>
                      p === "ellipsis" ? (
                        <span key={`e${i}`} className="px-2 text-muted-foreground">...</span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => { setPage(p); window.scrollTo(0, 0); }}
                          className={`w-10 h-10 rounded-lg text-sm font-bold transition-colors ${
                            p === page
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                          }`}
                        >
                          {p}
                        </button>
                      )
                    )}

                    {/* Next */}
                    <button
                      disabled={page >= totalPages}
                      onClick={() => { setPage(page + 1); window.scrollTo(0, 0); }}
                      className="px-3 py-2 rounded-lg text-sm font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 disabled:opacity-30 transition-colors"
                    >
                      {isAr ? "التالي →" : "Next →"}
                    </button>

                    {/* Oldest */}
                    {page < totalPages && (
                      <button
                        onClick={() => { setPage(totalPages); window.scrollTo(0, 0); }}
                        className="px-3 py-2 rounded-lg text-sm font-medium bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
                      >
                        {isAr ? "الأقدم" : "Oldest"}
                      </button>
                    )}
                  </nav>
                )}
              </>
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
