import { useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import SectionBar from "@/components/SectionBar";
import HeroSection from "@/components/HeroSection";
import NewsFeed from "@/components/NewsFeed";
import TrendingSidebar from "@/components/TrendingSidebar";
import EnglishNewsSection from "@/components/EnglishNewsSection";
import SiteFooter from "@/components/SiteFooter";
import { mockArticles } from "@/data/mockNews";
import { englishArticles } from "@/data/englishNews";

const Index = () => {
  const [activeCategory, setActiveCategory] = useState("الرئيسية");

  const mainArticle = mockArticles[0];
  const sideArticles = mockArticles.slice(1, 3);
  const feedArticles = mockArticles.slice(3);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <SectionBar activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
      <HeroSection mainArticle={mainArticle} sideArticles={sideArticles} />

      <div className="container mx-auto pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <h2 className="text-xl font-bold text-foreground mb-4">آخر الأخبار</h2>
            <NewsFeed articles={feedArticles} />
          </div>
          <div className="lg:col-span-1">
            <TrendingSidebar />
          </div>
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <EnglishNewsSection articles={englishArticles} />
      </div>

      <SiteFooter />
    </div>
  );
};

export default Index;
