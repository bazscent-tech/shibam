import { useState, useEffect } from "react";
import { TrendingUp, Newspaper, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

interface LatestArticle {
  id: string;
  title: string;
  image_url: string | null;
  published_at: string | null;
  category: string | null;
}

const TrendingSidebar = () => {
  const [latest, setLatest] = useState<LatestArticle[]>([]);
  const [mostRead, setMostRead] = useState<LatestArticle[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      // Latest 5 articles
      const { data: latestData } = await supabase
        .from("articles")
        .select("id, title, image_url, published_at, category")
        .eq("is_published", true)
        .order("published_at", { ascending: false })
        .limit(5);
      setLatest((latestData as LatestArticle[]) || []);

      // "Most Read" - oldest articles with most views (simulated by created_at diversity)
      const { data: readData } = await supabase
        .from("articles")
        .select("id, title, image_url, published_at, category")
        .eq("is_published", true)
        .order("created_at", { ascending: true })
        .limit(8);
      setMostRead((readData as LatestArticle[]) || []);
    };
    fetchData();
  }, []);

  return (
    <aside className="space-y-6">
      {/* Latest 5 Articles */}
      <div className="news-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Newspaper className="w-5 h-5 text-urgent" />
          <h3 className="text-lg font-bold text-foreground">آخر المقالات</h3>
        </div>
        <div className="space-y-3">
          {latest.map((article) => (
            <Link
              key={article.id}
              to={`/article/${article.id}`}
              className="flex gap-3 group"
            >
              {article.image_url && (
                <img
                  src={article.image_url}
                  alt=""
                  className="w-16 h-16 rounded-lg object-cover shrink-0"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              )}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-foreground group-hover:text-urgent transition-colors line-clamp-2 leading-snug">
                  {article.title}
                </h4>
                <span className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {article.published_at
                    ? formatDistanceToNow(new Date(article.published_at), { addSuffix: true, locale: ar })
                    : ""}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Most Read Topics */}
      <div className="news-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-urgent" />
          <h3 className="text-lg font-bold text-foreground">الأكثر قراءة</h3>
        </div>
        <div className="space-y-1">
          {mostRead.map((article, i) => (
            <Link
              key={article.id}
              to={`/article/${article.id}`}
              className="flex items-center gap-3 py-3 px-2 rounded-lg hover:bg-secondary transition-colors group"
            >
              <span className="text-2xl font-bold text-muted-foreground/30 font-latin w-8 text-center tabular-nums">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-foreground group-hover:text-urgent transition-colors line-clamp-2">
                  {article.title}
                </h4>
                {article.category && (
                  <span className="text-xs text-urgent">{article.category}</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default TrendingSidebar;
