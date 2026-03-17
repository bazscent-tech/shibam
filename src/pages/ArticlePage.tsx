import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DBArticle } from "@/hooks/useArticles";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ShareButtons from "@/components/ShareButtons";
import { ArrowRight, Clock, Newspaper, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

const ArticlePage = () => {
  const { id } = useParams();
  const [article, setArticle] = useState<DBArticle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      if (!id) return;
      const { data } = await supabase
        .from("articles")
        .select("*")
        .eq("id", id)
        .single();
      setArticle(data as DBArticle | null);
      setLoading(false);
    };
    fetch();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="container mx-auto py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">المقال غير موجود</h1>
          <Link to="/" className="text-urgent hover:underline">العودة للرئيسية</Link>
        </div>
        <SiteFooter />
      </div>
    );
  }

  const isAr = article.language === "ar";
  const timeAgo = article.published_at
    ? formatDistanceToNow(new Date(article.published_at), { addSuffix: true, locale: isAr ? ar : undefined })
    : "";

  return (
    <div className="min-h-screen bg-background" dir={isAr ? "rtl" : "ltr"}>
      <SiteHeader />
      <div className="container mx-auto py-6 max-w-4xl">
        <Link to="/" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowRight className="w-4 h-4" />
          {isAr ? "العودة للرئيسية" : "Back to Home"}
        </Link>

        <article>
          <span className="text-xs font-semibold text-urgent">{article.category}</span>
          <h1 className="text-2xl md:text-4xl font-bold text-foreground leading-tight mt-2 mb-4">{article.title}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
            {article.author && <span>{article.author}</span>}
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{timeAgo}</span>
          </div>

          {article.image_url && (
            <img
              src={article.image_url}
              alt={article.title}
              className="w-full rounded-lg mb-6 max-h-[500px] object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          )}

          {article.description && (
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">{article.description}</p>
          )}

          {article.content && (
            <div className="prose prose-lg max-w-none text-foreground leading-relaxed whitespace-pre-wrap">
              {article.content}
            </div>
          )}

          <div className="flex items-center gap-3 mt-8 pt-6 border-t border-border">
            <span className="text-sm text-muted-foreground">{isAr ? "مشاركة:" : "Share:"}</span>
            <ShareButtons title={article.title} url={article.url} />
          </div>

          {article.url && (
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 text-sm text-urgent hover:underline"
            >
              {isAr ? "قراءة المصدر الأصلي ←" : "Read original source →"}
            </a>
          )}
        </article>
      </div>
      <SiteFooter />
    </div>
  );
};

export default ArticlePage;
