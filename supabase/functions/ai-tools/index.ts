import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { action, topic, articleType, content, title, url: articleUrl } = await req.json();

    // Use Lovable AI gateway for text AI tasks
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    // Use Gemini for web-related tasks
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

    let systemPrompt = "";
    let userPrompt = "";

    // Web scraping actions that use fetch directly
    if (action === "fetch_original_content" && articleUrl) {
      try {
        const resp = await fetch(articleUrl, {
          headers: { "User-Agent": "Mozilla/5.0 (compatible; ShibamNews/1.0)" },
        });
        const html = await resp.text();
        // Extract text content - remove scripts, styles, nav, footer, etc.
        let text = html
          .replace(/<script[\s\S]*?<\/script>/gi, "")
          .replace(/<style[\s\S]*?<\/style>/gi, "")
          .replace(/<nav[\s\S]*?<\/nav>/gi, "")
          .replace(/<footer[\s\S]*?<\/footer>/gi, "")
          .replace(/<header[\s\S]*?<\/header>/gi, "")
          .replace(/<aside[\s\S]*?<\/aside>/gi, "")
          .replace(/<[^>]+>/g, "\n")
          .replace(/&nbsp;/g, " ")
          .replace(/&quot;/g, '"')
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&#\d+;/g, "")
          .replace(/\n{3,}/g, "\n\n")
          .trim();

        // Use AI to clean and extract only article content
        if (LOVABLE_API_KEY && text.length > 100) {
          const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-3-flash-preview",
              messages: [
                { role: "system", content: "أنت مساعد لاستخراج المحتوى الإخباري. استخرج نص المقال الأساسي فقط بدون تواريخ أو رموز تقنية أو قوائم تنقل. حافظ على تنسيق الفقرات." },
                { role: "user", content: `استخرج محتوى المقال الإخباري الأساسي فقط من النص التالي:\n\n${text.substring(0, 8000)}` },
              ],
              stream: true,
            }),
          });
          if (aiResp.ok) {
            return new Response(aiResp.body, {
              headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
            });
          }
        }

        return new Response(JSON.stringify({ result: text.substring(0, 5000) }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: "فشل في جلب المحتوى الأصلي" }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    if (action === "fetch_original_image" && articleUrl) {
      try {
        const resp = await fetch(articleUrl, {
          headers: { "User-Agent": "Mozilla/5.0 (compatible; ShibamNews/1.0)" },
        });
        const html = await resp.text();
        // Extract og:image and main article images
        const images: string[] = [];
        const ogMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
        if (ogMatch) images.push(ogMatch[1]);
        const twitterMatch = html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i);
        if (twitterMatch && !images.includes(twitterMatch[1])) images.push(twitterMatch[1]);
        // Find large images in article body
        const imgRegex = /<img[^>]*src=["']([^"']+)["'][^>]*/gi;
        let m;
        while ((m = imgRegex.exec(html)) !== null && images.length < 10) {
          const src = m[1];
          if (src.startsWith("data:")) continue;
          if (src.includes("logo") || src.includes("icon") || src.includes("avatar")) continue;
          if (src.includes("1x1") || src.includes("pixel")) continue;
          const fullUrl = src.startsWith("http") ? src : new URL(src, articleUrl).href;
          if (!images.includes(fullUrl)) images.push(fullUrl);
        }
        return new Response(JSON.stringify({ images }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch {
        return new Response(JSON.stringify({ error: "فشل في جلب الصور", images: [] }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    if (action === "fetch_details") {
      if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: "أنت باحث إخباري. ابحث عن تفاصيل إضافية ومعلومات مرتبطة بالموضوع التالي من مصادر إخبارية موثوقة. قدم المعلومات كنص فقط بدون تواريخ أو رموز تقنية." },
            { role: "user", content: `ابحث عن تفاصيل إضافية حول هذا الموضوع:\n\nالعنوان: ${title || ""}\nالمحتوى: ${(content || "").substring(0, 1000)}\n\nقدم معلومات إضافية وتفاصيل مرتبطة من مصادر مختلفة.` },
          ],
          stream: true,
        }),
      });
      if (!response.ok) {
        const t = await response.text();
        console.error("AI error:", response.status, t);
        return new Response(JSON.stringify({ error: "خطأ في البحث عن التفاصيل" }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(response.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    if (action === "summarize_bullets") {
      if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");
      systemPrompt = "أنت محرر صحفي محترف. لخّص المحتوى على شكل نقاط مرتبة ومنسقة.";
      userPrompt = `لخّص هذا المقال على شكل نقاط مرتبة ومنسقة:\n\n${content}`;
    } else {
      // Standard actions
      if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

      switch (action) {
        case "generate_article":
          systemPrompt = "أنت كاتب صحفي محترف في شبام نيوز. اكتب مقالات إخبارية باللغة العربية بأسلوب مهني ودقيق.";
          const typeMap: Record<string, string> = {
            analytical: "تحليلي معمّق",
            predictive: "استشرافي يتنبأ بالمستقبل",
            interpretive: "تفسيري يشرح الأسباب والنتائج",
          };
          userPrompt = `اكتب مقالاً ${typeMap[articleType] || "تحليلي"} عن: ${topic}\n\nالمقال يجب أن يحتوي على عنوان جذاب، مقدمة، عدة فقرات، وخاتمة. اجعله بين 400-600 كلمة.`;
          break;

        case "improve_headline":
          systemPrompt = "أنت خبير في تحسين العناوين الإخبارية. حسّن العنوان ليكون أكثر جذباً وإيجازاً مع الحفاظ على جوهر الموضوع. أعطِ عنواناً واحداً مختلفاً في كل مرة.";
          userPrompt = `حسّن هذا العنوان وأعطني عنواناً واحداً محسّناً فقط بدون شرح:\n"${content}"`;
          break;

        case "rewrite_content":
          systemPrompt = "أنت كاتب صحفي محترف. أعد صياغة المحتوى بأسلوب جديد تماماً مع الحفاظ على نفس المضمون والمعلومات.";
          userPrompt = `أعد صياغة هذا المحتوى بأسلوب جديد:\n\n${content}`;
          break;

        case "enhance_style":
          systemPrompt = "أنت محرر أدبي محترف. أعد ترتيب سرد المقال بشكل احترافي، إبداعي، وسهل القراءة مع الحفاظ على المعنى.";
          userPrompt = `حسّن أسلوب وسرد هذا النص ليكون أكثر احترافية وإبداعاً:\n\n${content}`;
          break;

        case "professional_rewrite":
          systemPrompt = "أنت رئيس تحرير صحفي محترف. أعد كتابة المقال بالكامل بأسلوب صحفي احترافي منظم عالي الجودة.";
          userPrompt = `أعد كتابة هذا المقال بالكامل بأسلوب صحفي احترافي منظم:\n\nالعنوان: ${title || ""}\n\n${content}`;
          break;

        case "generate_seo":
          systemPrompt = "أنت خبير SEO محترف. أنشئ بيانات SEO للمقال التالي بتنسيق واضح.";
          userPrompt = `أنشئ بيانات SEO لهذا المقال:\n\nالعنوان: ${title || ""}\nالمحتوى: ${(content || "").substring(0, 500)}\n\nأعطني:\n1. عنوان SEO (60 حرف كحد أقصى)\n2. وصف meta (160 حرف)\n3. كلمات مفتاحية (5-8 كلمات)\n4. هاشتاقات منظمة (5 هاشتاقات)\n5. اسم الموقع: شبام نيوز / Shibam News`;
          break;

        case "summarize":
          systemPrompt = "أنت خبير في تلخيص الأخبار. لخّص المحتوى بشكل احترافي ودقيق ومختصر.";
          userPrompt = `لخّص هذا المحتوى تلخيصاً احترافياً:\n\n${content}`;
          break;

        case "fetch_full_content":
          systemPrompt = "أنت مساعد في استخراج محتوى المقالات. استخرج المحتوى الكامل والنظيف.";
          userPrompt = `بناءً على هذا العنوان والوصف، اكتب مقالاً كاملاً ومفصلاً:\n\nالعنوان: ${title || ""}\nالوصف: ${content || ""}\n\nاكتب مقالاً كاملاً من 300-500 كلمة.`;
          break;

        case "classify":
          systemPrompt = "أنت خبير في تصنيف الأخبار. صنّف المقال إلى أحد الأقسام التالية: سياسة، اقتصاد، تكنولوجيا، رياضة، ثقافة، صحة، علوم، منوعات، المقالات، فنون، لقاءات، تصريحات، تمون.";
          userPrompt = `صنّف هذا المقال:\n\nالعنوان: ${topic || title}\nالمحتوى: ${content}\n\nأجب بكلمة واحدة فقط (اسم القسم).`;
          break;

        default:
          return new Response(JSON.stringify({ error: "Unknown action" }), {
            status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
      }
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "تم تجاوز حد الطلبات، حاول مرة أخرى لاحقاً" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "يرجى إضافة رصيد للذكاء الاصطناعي" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", status, t);
      return new Response(JSON.stringify({ error: "خطأ في الاتصال بالذكاء الاصطناعي" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ai-tools error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
