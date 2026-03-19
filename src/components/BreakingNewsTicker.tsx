import { useBreakingNews } from "@/hooks/useArticles";
import { motion } from "framer-motion";

interface Props {
  language?: string;
}

const BreakingNewsTicker = ({ language = "ar" }: Props) => {
  const articles = useBreakingNews(language);
  const isAr = language === "ar";

  if (articles.length === 0) return null;

  const text = articles.map((a) => a.title).join("  ◆  ");

  return (
    <div className="bg-urgent text-white overflow-hidden py-2">
      <div className="container mx-auto flex items-center gap-3">
        <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded whitespace-nowrap shrink-0">
          {isAr ? "عاجل" : "BREAKING"}
        </span>
        <div className="overflow-hidden flex-1 relative">
          <motion.div
            className="whitespace-nowrap text-sm font-medium"
            animate={{ x: ["100%", "-100%"] }}
            transition={{ duration: articles.length * 8, repeat: Infinity, ease: "linear" }}
          >
            {text}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default BreakingNewsTicker;
