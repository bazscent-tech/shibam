import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useArticles } from "@/hooks/useArticles";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import NewsFeedDB from "@/components/NewsFeedDB";
import { Loader2 } from "lucide-react";

const NewsArchive = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const lang = (searchParams.get("lang") || "ar") as string;
  const page = parseInt(searchParams.get("page") || "1", 10);

  const { articles, totalPages, loading } = useArticles(lang, page);
  const isAr = lang === "ar";

  const setPage = (p: number) => {
    searchParams.set("page", String(p));
    setSearchParams(searchParams);
    window.scrollTo(0, 0);
  };

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
    <div className="min-h-screen bg-background" dir={isAr ? "rtl" : "ltr"}>
      <SiteHeader />
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-foreground">
            {isAr ? "أرشيف الأخبار" : "News Archive"}
          </h1>
          <Link to="/" className="text-sm text-urgent hover:underline">
            {isAr ? "← الرئيسية" : "← Home"}
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <NewsFeedDB articles={articles} language={lang} />
            {totalPages > 1 && (
              <nav className="flex items-center justify-center gap-1 mt-8 flex-wrap" dir={isAr ? "rtl" : "ltr"}>
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="px-3 py-2 rounded-lg text-sm font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 disabled:opacity-30 transition-colors"
                >
                  {isAr ? "← السابق" : "← Previous"}
                </button>

                {getPageNumbers().map((p, i) =>
                  p === "ellipsis" ? (
                    <span key={`e${i}`} className="px-2 text-muted-foreground">...</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
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

                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  className="px-3 py-2 rounded-lg text-sm font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 disabled:opacity-30 transition-colors"
                >
                  {isAr ? "التالي →" : "Next →"}
                </button>

                {page < totalPages && (
                  <button
                    onClick={() => setPage(totalPages)}
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
      <SiteFooter />
    </div>
  );
};

export default NewsArchive;
