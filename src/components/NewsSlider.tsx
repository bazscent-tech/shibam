import { useState, useEffect, useCallback } from "react";
import { DBArticle } from "@/hooks/useArticles";
import { ChevronLeft, ChevronRight, Newspaper } from "lucide-react";
import { Link } from "react-router-dom";

interface Props {
  articles: DBArticle[];
}

const NewsSlider = ({ articles }: Props) => {
  const [current, setCurrent] = useState(0);
  const items = articles.filter((a) => a.image_url).slice(0, 8);
  // If no images, use first 8 articles
  const displayItems = items.length > 0 ? items : articles.slice(0, 8);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % displayItems.length);
  }, [displayItems.length]);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + displayItems.length) % displayItems.length);
  }, [displayItems.length]);

  useEffect(() => {
    if (displayItems.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, displayItems.length]);

  if (displayItems.length === 0) return null;

  const article = displayItems[current];

  return (
    <div className="container mx-auto py-4">
      <div className="relative rounded-xl overflow-hidden h-[250px] md:h-[350px] group">
        {article.image_url ? (
          <img
            src={article.image_url}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-700"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        ) : (
          <div className="w-full h-full bg-secondary flex items-center justify-center">
            <Newspaper className="w-16 h-16 text-muted-foreground/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 right-0 left-0 p-5 md:p-8">
          <Link to={`/article/${article.id}`}>
            <h3 className="text-lg md:text-2xl font-bold text-white leading-tight line-clamp-2 hover:underline">
              {article.title}
            </h3>
          </Link>
          {article.description && (
            <p className="text-sm text-white/70 mt-2 line-clamp-1 hidden md:block">{article.description}</p>
          )}
        </div>
        {displayItems.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
        {/* Dots */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
          {displayItems.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2 h-2 rounded-full transition-all ${i === current ? "bg-white w-5" : "bg-white/40"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewsSlider;
