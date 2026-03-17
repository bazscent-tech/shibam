import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useArticles } from "@/hooks/useArticles";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import NewsFeedDB from "@/components/NewsFeedDB";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

const NewsArchive = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const lang = (searchParams.get("lang") || "ar") as string;
  const page = parseInt(searchParams.get("page") || "1", 10);

  const { articles, totalPages, loading } = useArticles(lang, page);

  const setPage = (p: number) => {
    searchParams.set("page", String(p));
    setSearchParams(searchParams);
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-background" dir={lang === "ar" ? "rtl" : "ltr"}>
      <SiteHeader />
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-foreground">
            {lang === "ar" ? "أرشيف الأخبار" : "News Archive"}
          </h1>
          <Link to="/" className="text-sm text-urgent hover:underline">
            {lang === "ar" ? "← الرئيسية" : "← Home"}
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
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="p-2 rounded-lg bg-secondary text-foreground disabled:opacity-30"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  const p = page <= 4 ? i + 1 : page + i - 3;
                  if (p < 1 || p > totalPages) return null;
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-10 h-10 rounded-lg text-sm font-bold transition-colors ${
                        p === page ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground hover:bg-secondary/80"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  className="p-2 rounded-lg bg-secondary text-foreground disabled:opacity-30"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
      <SiteFooter />
    </div>
  );
};

export default NewsArchive;
