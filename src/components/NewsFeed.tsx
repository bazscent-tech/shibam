import { motion } from "framer-motion";
import { Article } from "@/data/mockNews";
import { Clock } from "lucide-react";

interface NewsFeedProps {
  articles: Article[];
}

const NewsFeed = ({ articles }: NewsFeedProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {articles.map((article, i) => (
        <motion.article
          key={article.id}
          initial={i < 3 ? { opacity: 0, y: 8 } : undefined}
          animate={i < 3 ? { opacity: 1, y: 0 } : undefined}
          transition={i < 3 ? { delay: i * 0.05, duration: 0.3, ease: [0.2, 0, 0, 1] } : undefined}
          className="news-card overflow-hidden"
        >
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-48 object-cover"
            loading="lazy"
          />
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-urgent">{article.category}</span>
              <span className="text-xs text-muted-foreground font-latin">{article.source}</span>
            </div>
            <h3 className="text-base font-bold text-foreground leading-snug mb-2 line-clamp-2">
              {article.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {article.description}
            </p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              {article.publishedAt}
            </div>
          </div>
        </motion.article>
      ))}
    </div>
  );
};

export default NewsFeed;
