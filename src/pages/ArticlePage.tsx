import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DBArticle } from "@/hooks/useArticles";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ShareButtons from "@/components/ShareButtons";
import { ArrowRight, Clock, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { Helmet } from "react-helmet-async";

const ArticlePage = () => {
  const { slug } = useParams();
  const [article, setArticle] = useState<DBArticle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!slug) return;
      // Try slug first, fallback to id for old links
      let { data } = await supabase
        .from("articles")
        .select("*")
        .eq("slug", slug)
        .single();
      if (!data) {
        const res = await supabase
          .from("articles")
          .select("*")
          .eq("id", slug)
          .single();
        data = res.data;
      }
      setArticle(data as DBArticle | null);
      setLoading(false);
    };
    fetchArticle();
  }, [slug]);

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

  const articleSlug = article.slug || article.id;
  const siteUrl = `${window.location.origin}/article/${articleSlug}`;

  return (
    <div className="min-h-screen bg-background" dir={isAr ? "rtl" : "ltr"}>
      <Helmet>
        <title>{article.title} | شبام نيوز</title>
        <meta name="description" content={article.description || article.title} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.description || article.title} />
        <meta property="og:url" content={siteUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="شبام نيوز" />
        {article.image_url && <meta property="og:image" content={article.image_url} />}
        {article.image_url && <meta property="og:image:width" content="1200" />}
        {article.image_url && <meta property="og:image:height" content="630" />}
        {article.author && <meta property="article:author" content={article.author} />}
        <meta name="twitter:card" content={article.image_url ? "summary_large_image" : "summary"} />
        <meta name="twitter:title" content={article.title} />
        <meta name="twitter:description" content={article.description || article.title} />
        {article.image_url && <meta name="twitter:image" content={article.image_url} />}
      </Helmet>

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
            <ShareButtons title={article.title} articleId={article.id} slug={articleSlug} author={article.author} description={article.description} />
          </div>
        </article>
      </div>
      <SiteFooter />
    </div>
  );
};

export default ArticlePage;
