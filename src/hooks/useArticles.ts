import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface DBArticle {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  url: string;
  image_url: string | null;
  author: string | null;
  category: string | null;
  language: string;
  published_at: string | null;
  source_id: string | null;
  is_published: boolean;
  is_ai_generated: boolean;
  created_at: string;
  slug: string | null;
}

const PAGE_SIZE = 30;

export function useArticles(language: string = "ar", page: number = 1) {
  const [articles, setArticles] = useState<DBArticle[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      // Only show articles from last 48 hours
      const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

      const { data, error, count } = await supabase
        .from("articles")
        .select("*", { count: "exact" })
        .eq("language", language)
        .eq("is_published", true)
        .gte("published_at", cutoff)
        .order("published_at", { ascending: false })
        .range(from, to);

      if (error) throw error;
      
      // Deduplicate by title
      const seen = new Set<string>();
      const unique = (data || []).filter((a) => {
        const key = a.title.trim().toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      
      setArticles(unique);
      setTotalCount(count || 0);
    } catch (e) {
      console.error("Error fetching articles:", e);
    } finally {
      setLoading(false);
    }
  }, [language, page]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  // Subscribe to realtime changes
  useEffect(() => {
    const channel = supabase
      .channel("articles-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "articles" }, () => {
        fetchArticles();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchArticles]);

  return { articles, totalCount, loading, totalPages: Math.ceil(totalCount / PAGE_SIZE), refetch: fetchArticles };
}

export function useBreakingNews(language: string = "ar") {
  const [articles, setArticles] = useState<DBArticle[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("articles")
        .select("id, title, published_at, language, url, image_url, slug")
        .eq("language", language)
        .eq("is_published", true)
        .order("published_at", { ascending: false })
        .limit(10);
      setArticles((data as DBArticle[]) || []);
    };
    fetch();
    const interval = setInterval(fetch, 60000);
    return () => clearInterval(interval);
  }, [language]);

  return articles;
}
