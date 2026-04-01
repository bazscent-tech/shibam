import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Auto-categorization keywords
const arCategoryMap: Record<string, string[]> = {
  "سياسة": ["رئيس", "وزير", "حكومة", "برلمان", "انتخابات", "دبلوماس", "سفير", "مجلس", "قرار", "سياس", "حزب", "معارض"],
  "اقتصاد": ["اقتصاد", "بورصة", "أسهم", "نفط", "تجار", "استثمار", "بنك", "عمل", "دولار", "ريال", "مالي", "ميزاني"],
  "تكنولوجيا": ["تكنولوجيا", "تقن", "ذكاء اصطناعي", "هاتف", "تطبيق", "إنترنت", "رقم", "برمج", "حاسوب", "آبل", "جوجل", "سامسونج"],
  "رياضة": ["رياض", "كرة", "مباراة", "دوري", "منتخب", "لاعب", "مدرب", "بطولة", "هدف", "فوز", "تأهل", "كأس"],
  "ثقافة": ["ثقاف", "أدب", "كتاب", "معرض", "رواية", "شعر", "موسيق"],
  "صحة": ["صح", "طب", "مرض", "علاج", "مستشفى", "لقاح", "وباء", "دواء", "طبيب", "جراح"],
  "علوم": ["علم", "فضاء", "ناسا", "اكتشاف", "بحث", "دراسة", "تجربة", "مختبر", "فيزياء", "كيمياء"],
  "منوعات": ["منوع", "غريب", "طريف", "سفر", "سياحة", "طعام", "موضة"],
  "المقالات": ["مقال", "رأي", "تحليل", "عمود", "كاتب", "افتتاحية"],
  "فنون": ["فن", "مسرح", "سينما", "فيلم", "رسم", "تشكيل", "فنان", "معرض فني"],
  "لقاءات": ["لقاء", "حوار", "مقابلة", "تصريح خاص", "حصري"],
  "تصريحات": ["تصريح", "صرح", "أعلن", "أكد", "نفى", "بيان", "مؤتمر صحفي"],
  "تمون": ["تموين", "غذاء", "أسعار", "سلع", "محروقات", "وقود", "قمح", "سكر"],
};

const enCategoryMap: Record<string, string[]> = {
  "Politics": ["president", "minister", "government", "election", "diplomat", "congress", "senate", "politic", "vote", "law"],
  "Economy": ["economy", "stock", "market", "oil", "trade", "invest", "bank", "finance", "dollar", "gdp", "inflation"],
  "Technology": ["tech", "ai", "artificial", "phone", "app", "software", "google", "apple", "microsoft", "cyber", "digital"],
  "Sports": ["sport", "football", "soccer", "basketball", "match", "league", "player", "coach", "championship", "goal", "win"],
  "Culture": ["culture", "book", "literary", "festival", "heritage"],
  "Health": ["health", "medical", "disease", "treatment", "hospital", "vaccine", "pandemic", "drug", "doctor", "surgery"],
  "Science": ["science", "space", "nasa", "discover", "research", "study", "experiment", "physics", "climate"],
  "Entertainment": ["entertain", "celebrity", "show", "concert", "game", "funny", "travel", "food", "fashion"],
  "Articles": ["opinion", "column", "editorial", "analysis", "commentary", "essay"],
  "Arts": ["art", "film", "movie", "music", "theater", "exhibition", "painting", "artist", "cinema"],
  "Interviews": ["interview", "exclusive", "dialogue", "conversation", "q&a"],
  "Statements": ["statement", "declared", "announced", "confirmed", "denied", "press conference", "briefing"],
  "Supplies": ["supply", "food prices", "commodity", "fuel", "wheat", "grain", "sugar", "shortage"],
};

function autoClassify(title: string, description: string, language: string): string {
  const text = `${title} ${description}`.toLowerCase();
  const map = language === "ar" ? arCategoryMap : enCategoryMap;
  let bestCat = language === "ar" ? "عام" : "General";
  let bestScore = 0;

  for (const [cat, keywords] of Object.entries(map)) {
    let score = 0;
    for (const kw of keywords) {
      if (text.includes(kw.toLowerCase())) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      bestCat = cat;
    }
  }
  return bestCat;
}

function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'")
    .replace(/&hellip;/g, '…').replace(/&mdash;/g, '—').replace(/&ndash;/g, '–')
    .replace(/&laquo;/g, '«').replace(/&raquo;/g, '»').replace(/&nbsp;/g, ' ')
    .replace(/&#\d+;/g, (m) => String.fromCharCode(parseInt(m.slice(2, -1))))
    .replace(/&#x[0-9a-fA-F]+;/g, (m) => String.fromCharCode(parseInt(m.slice(3, -1), 16)));
}

function cleanText(html: string): string {
  return decodeEntities(html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim());
}

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

    const title = cleanText(getTag("title"));
    const link = getTag("link").trim();
    const description = cleanText(getTag("description")).substring(0, 500);
    const pubDate = getTag("pubDate");

    let imageUrl = "";
    const mediaMatch = item.match(/url="([^"]+\.(jpg|jpeg|png|webp|gif)[^"]*)"/i);
    if (mediaMatch) imageUrl = mediaMatch[1];

    if (title && link) {
      const category = autoClassify(title, description, language);
      articles.push({
        source_id: sourceId,
        title,
        description,
        url: link,
        image_url: imageUrl || null,
        language,
        category,
        published_at: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
        is_published: true,
      });
    }
  }
  return articles;
}

function extractArticlesFromHTML(html: string, sourceId: string, baseUrl: string, language: string) {
  const articles: any[] = [];
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
      const category = autoClassify(title, "", language);
      articles.push({
        source_id: sourceId,
        title,
        description: "",
        url,
        image_url: null,
        language,
        category,
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
          const { data: inserted, error: insErr } = await supabase
            .from("articles")
            .upsert(articles, { onConflict: "url", ignoreDuplicates: true })
            .select("id");

          const count = inserted?.length || 0;
          totalFetched += count;

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
