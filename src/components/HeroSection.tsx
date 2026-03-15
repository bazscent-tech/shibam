import { motion } from "framer-motion";
import { Article } from "@/data/mockNews";
import { Clock } from "lucide-react";

interface HeroSectionProps {
  mainArticle: Article;
  sideArticles: Article[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.2, 0, 0, 1] } },
};

const HeroSection = ({ mainArticle, sideArticles }: HeroSectionProps) => {
  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="container mx-auto py-6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main hero - takes 2 cols */}
        <motion.article variants={itemVariants} className="lg:col-span-2 news-card overflow-hidden">
          <div className="relative">
            <img
              src={mainArticle.image}
              alt={mainArticle.title}
              className="w-full h-[300px] md:h-[420px] object-cover"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
            <div className="absolute bottom-0 right-0 left-0 p-5 md:p-8">
              {mainArticle.isBreaking && (
                <span className="live-badge mb-3">عاجل</span>
              )}
              <h2 className="text-xl md:text-3xl font-bold text-primary-foreground mb-2 leading-tight">
                {mainArticle.title}
              </h2>
              <p className="text-sm md:text-base text-primary-foreground/80 line-clamp-2 mb-3">
                {mainArticle.description}
              </p>
              <div className="flex items-center gap-3 text-primary-foreground/60 text-xs">
                <span className="font-latin">{mainArticle.source}</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {mainArticle.publishedAt}
                </span>
              </div>
            </div>
          </div>
        </motion.article>

        {/* Side articles */}
        <div className="flex flex-col gap-4">
          {sideArticles.map((article) => (
            <motion.article
              key={article.id}
              variants={itemVariants}
              className="news-card overflow-hidden flex-1"
            >
              <div className="relative h-full">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full min-h-[180px] object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
                <div className="absolute bottom-0 right-0 left-0 p-4">
                  {article.isLive && (
                    <span className="live-badge mb-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-foreground" />
                      مباشر
                    </span>
                  )}
                  <span className="text-xs text-primary-foreground/60 block mb-1">{article.category}</span>
                  <h3 className="text-sm md:text-base font-bold text-primary-foreground leading-snug line-clamp-2">
                    {article.title}
                  </h3>
                  <div className="flex items-center gap-2 text-primary-foreground/50 text-xs mt-2">
                    <Clock className="w-3 h-3" />
                    {article.publishedAt}
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default HeroSection;
