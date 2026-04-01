import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DBArticle } from "@/hooks/useArticles";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ShareButtons from "@/components/ShareButtons";
import { ArrowRight, Clock, Loader2, ExternalLink, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { Helmet } from "react-helmet-async";
import { decodeHtmlEntities, cleanArticleContent } from "@/lib/htmlUtils";

const ArticlePage = () => {
  const { slug } = useParams();
  const [article, setArticle] = useState<DBArticle | null>(null);
  const [related, setRelated] = useState<DBArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!slug) return;
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

      // Fetch related articles
      if (data) {
        const { data: relatedData } = await supabase
          .from("articles")
          .select("id, title, image_url, published_at, category, slug, author")
          .eq("is_published", true)
          .eq("language", data.language)
          .neq("id", data.id)
          .order("published_at", { ascending: false })
          .limit(6);
        setRelated((relatedData as DBArticle[]) || []);
      }
    };
    fetchArticle();
    window.scrollTo(0, 0);
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
  const cleanTitle = decodeHtmlEntities(article.title);
  const cleanDesc = decodeHtmlEntities(article.description);
  const cleanContent = cleanArticleContent(article.content);

  return (
    <div className="min-h-screen bg-background" dir={isAr ? "rtl" : "ltr"}>
      <Helmet>
        <title>{cleanTitle} | شبام نيوز</title>
        <meta name="description" content={cleanDesc || cleanTitle} />
        <meta property="og:title" content={cleanTitle} />
        <meta property="og:description" content={cleanDesc || cleanTitle} />
        <meta property="og:url" content={siteUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="شبام نيوز - Shibam News" />
        {article.image_url && <meta property="og:image" content={article.image_url} />}
        {article.image_url && <meta property="og:image:width" content="1200" />}
        {article.image_url && <meta property="og:image:height" content="630" />}
        {article.author && <meta property="article:author" content={article.author} />}
        <meta name="twitter:card" content={article.image_url ? "summary_large_image" : "summary"} />
        <meta name="twitter:title" content={cleanTitle} />
        <meta name="twitter:description" content={cleanDesc || cleanTitle} />
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
          <h1 className="text-2xl md:text-4xl font-bold text-foreground leading-tight mt-2 mb-4">{cleanTitle}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
            {article.author && (
              <span className="flex items-center gap-1.5">
                <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                {article.author}
              </span>
            )}
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{timeAgo}</span>
          </div>

          {article.image_url && (
            <img
              src={article.image_url}
              alt={cleanTitle}
              className="w-full rounded-lg mb-6 max-h-[500px] object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          )}

          {cleanDesc && (
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">{cleanDesc}</p>
          )}

          {cleanContent && (
            <div className="prose prose-lg max-w-none text-foreground leading-relaxed whitespace-pre-wrap">
              {cleanContent}
            </div>
          )}

          {/* View Original Source */}
          {article.url && (
            <div className="mt-8 pt-4 border-t border-border">
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-sm font-medium text-foreground hover:bg-secondary/80 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                {isAr ? "عرض المصدر الأصلي" : "View Original Source"}
              </a>
            </div>
          )}

          <div className="flex items-center gap-3 mt-6 pt-6 border-t border-border">
            <span className="text-sm text-muted-foreground">{isAr ? "مشاركة:" : "Share:"}</span>
            <ShareButtons title={cleanTitle} articleId={article.id} slug={articleSlug} author={article.author} description={cleanDesc} />
          </div>
        </article>

        {/* Related Articles */}
        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold text-foreground mb-6">{isAr ? "مقالات ذات صلة" : "Related Articles"}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {related.map((r) => (
                <Link
                  key={r.id}
                  to={`/article/${r.slug || r.id}`}
                  className="news-card overflow-hidden group"
                >
                  {r.image_url && (
                    <img src={r.image_url} alt="" className="w-full h-36 object-cover" loading="lazy" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  )}
                  <div className="p-3">
                    <span className="text-xs text-urgent font-semibold">{r.category}</span>
                    <h3 className="text-sm font-bold text-foreground line-clamp-2 mt-1 group-hover:text-urgent transition-colors">
                      {decodeHtmlEntities(r.title)}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
      <SiteFooter />
    </div>
  );
};

export default ArticlePage;
