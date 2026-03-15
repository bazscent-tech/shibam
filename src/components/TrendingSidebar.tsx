import { trendingTopics } from "@/data/mockNews";
import { TrendingUp } from "lucide-react";

const TrendingSidebar = () => {
  return (
    <aside className="news-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-urgent" />
        <h3 className="text-lg font-bold text-foreground">الأكثر تداولاً</h3>
      </div>
      <div className="space-y-1">
        {trendingTopics.map((topic, i) => (
          <a
            key={topic.id}
            href="#"
            className="flex items-center gap-3 py-3 px-2 rounded-lg hover:bg-secondary transition-colors group"
          >
            <span className="text-2xl font-bold text-muted-foreground/30 font-latin w-8 text-center tabular-nums">
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-foreground group-hover:text-urgent transition-colors truncate">
                {topic.title}
              </h4>
              <span className="text-xs text-muted-foreground font-latin tabular-nums">
                {topic.count.toLocaleString()} مقال
              </span>
            </div>
          </a>
        ))}
      </div>
    </aside>
  );
};

export default TrendingSidebar;
