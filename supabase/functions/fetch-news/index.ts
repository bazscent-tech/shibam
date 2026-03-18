import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function extractArticlesFromRSS(xml: string, sourceId: string, language: string) {
  const articles: any[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const item = match[1];
    const getTag = (tag: string) => {
      const m = item.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
      return m ? (m[1] || m[2] || "").trim() : "";
    };

    const title = getTag("title");
    const link = getTag("link");
    const description = getTag("description").replace(/<[^>]*>/g, "").substring(0, 500);
    const pubDate = getTag("pubDate");

    // Try to extract image from media:content, enclosure, or description
    let imageUrl = "";
    const mediaMatch = item.match(/url="([^"]+\.(jpg|jpeg|png|webp|gif)[^"]*)"/i);
    if (mediaMatch) imageUrl = mediaMatch[1];

    if (title && link) {
      articles.push({
        source_id: sourceId,
        title,
        description,
        url: link,
        image_url: imageUrl || null,
        language,
        published_at: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
        is_published: true,
      });
    }
  }
  return articles;
}

function extractArticlesFromHTML(html: string, sourceId: string, baseUrl: string, language: string) {
  const articles: any[] = [];
  // Simple headline extraction from common patterns
  const patterns = [
    /<h[23][^>]*>\s*<a[^>]*href="([^"]*)"[^>]*>([^<]+)<\/a>/gi,
    /<a[^>]*href="([^"]*)"[^>]*class="[^"]*title[^"]*"[^>]*>([^<]+)<\/a>/gi,
    /<article[^>]*>[\s\S]*?<a[^>]*href="([^"]*)"[^>]*>[\s\S]*?<h[23][^>]*>([^<]+)<\/h[23]>/gi,
  ];

  const seen = new Set<string>();
  for (const pattern of patterns) {
    let m;
    while ((m = pattern.exec(html)) !== null && articles.length < 20) {
      let url = m[1];
      const title = m[2].trim();
      if (!title || title.length < 10) continue;
      if (url.startsWith("/")) url = new URL(url, baseUrl).href;
      if (seen.has(url)) continue;
      seen.add(url);
      articles.push({
        source_id: sourceId,
        title,
        description: "",
        url,
        image_url: null,
        language,
        published_at: new Date().toISOString(),
        is_published: true,
      });
    }
  }
  return articles;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    let sourceId: string | undefined;
    try {
      const body = await req.json();
      sourceId = body?.sourceId;
    } catch {
      // Empty body from cron - fetch all active sources
    }

    // Get source(s) to fetch
    let query = supabase.from("news_sources").select("*").eq("is_active", true);
    if (sourceId) {
      query = supabase.from("news_sources").select("*").eq("id", sourceId);
    }
    const { data: sources, error: srcErr } = await query;
    if (srcErr) throw srcErr;
    if (!sources || sources.length === 0) {
      return new Response(JSON.stringify({ fetched: 0, message: "لا توجد مصادر نشطة" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let totalFetched = 0;

    for (const source of sources) {
      try {
        const response = await fetch(source.fetch_url, {
          headers: { "User-Agent": "ShibamNews/1.0" },
        });
        const text = await response.text();

        let articles: any[] = [];
        if (source.fetch_method === "rss") {
          articles = extractArticlesFromRSS(text, source.id, source.language);
        } else {
          articles = extractArticlesFromHTML(text, source.id, source.url, source.language);
        }

        if (articles.length > 0) {
          // Upsert to avoid duplicates (url is unique)
          const { data: inserted, error: insErr } = await supabase
            .from("articles")
            .upsert(articles, { onConflict: "url", ignoreDuplicates: true })
            .select("id");

          const count = inserted?.length || 0;
          totalFetched += count;

          // Update source stats
          await supabase
            .from("news_sources")
            .update({
              last_fetched_at: new Date().toISOString(),
              articles_count: source.articles_count + count,
            })
            .eq("id", source.id);
        }
      } catch (fetchErr) {
        console.error(`Error fetching from ${source.name}:`, fetchErr);
      }
    }

    return new Response(JSON.stringify({ fetched: totalFetched, sources: sources.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("fetch-news error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
