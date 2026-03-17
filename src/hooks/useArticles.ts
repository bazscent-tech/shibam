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
}

const PAGE_SIZE = 15;

export function useArticles(language: string = "ar", page: number = 1) {
  const [articles, setArticles] = useState<DBArticle[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error, count } = await supabase
        .from("articles")
        .select("*", { count: "exact" })
        .eq("language", language)
        .eq("is_published", true)
        .order("published_at", { ascending: false })
        .range(from, to);

      if (error) throw error;
      setArticles(data || []);
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
        .select("id, title, published_at, language, url, image_url")
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
