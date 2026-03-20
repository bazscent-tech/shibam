import { motion } from "framer-motion";
import { DBArticle } from "@/hooks/useArticles";
import { Clock } from "lucide-react";
import ShareButtons from "./ShareButtons";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

interface Props {
  articles: DBArticle[];
  language?: string;
}

const formatTime = (dateStr: string | null, lang: string) => {
  if (!dateStr) return "";
  try {
    return formatDistanceToNow(new Date(dateStr), {
      addSuffix: true,
      locale: lang === "ar" ? ar : undefined,
    });
  } catch {
    return "";
  }
};

const NewsFeedDB = ({ articles, language = "ar" }: Props) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {articles.map((article, i) => (
        <motion.article
          key={article.id}
          initial={i < 6 ? { opacity: 0, y: 8 } : undefined}
          animate={i < 6 ? { opacity: 1, y: 0 } : undefined}
          transition={i < 6 ? { delay: i * 0.03, duration: 0.3 } : undefined}
          className="news-card overflow-hidden"
        >
          {article.image_url && (
            <Link to={`/article/${article.slug || article.id}`}>
              <img
                src={article.image_url}
                alt={article.title}
                className="w-full h-48 object-cover"
                loading="lazy"
                onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = "none"; }}
              />
            </Link>
          )}
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-urgent">{article.category || (language === "ar" ? "عام" : "General")}</span>
            </div>
            <Link to={`/article/${article.slug || article.id}`}>
              <h3 className="text-base font-bold text-foreground leading-snug mb-2 line-clamp-2 hover:text-urgent transition-colors">
                {article.title}
              </h3>
            </Link>
            {article.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{article.description}</p>
            )}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {formatTime(article.published_at, language)}
              </div>
              <ShareButtons title={article.title} articleId={article.id} />
            </div>
          </div>
        </motion.article>
      ))}
    </div>
  );
};

export default NewsFeedDB;
