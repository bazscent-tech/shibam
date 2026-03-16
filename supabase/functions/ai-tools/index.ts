import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { action, topic, articleType, content } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let systemPrompt = "";
    let userPrompt = "";

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
        systemPrompt = "أنت خبير في تحسين العناوين الإخبارية. حسّن العنوان ليكون أكثر جذباً وإيجازاً.";
        userPrompt = `حسّن هذا العنوان: "${content}"\n\nأعطني 3 خيارات محسنة.`;
        break;

      case "summarize":
        systemPrompt = "أنت خبير في تلخيص الأخبار. لخّص المحتوى بشكل دقيق ومختصر.";
        userPrompt = `لخّص هذا المحتوى في 2-3 جمل:\n\n${content}`;
        break;

      case "classify":
        systemPrompt = "أنت خبير في تصنيف الأخبار. صنّف المقال إلى أحد الأقسام التالية: سياسة، اقتصاد، تكنولوجيا، رياضة، ثقافة، صحة، علوم، منوعات، عالمي.";
        userPrompt = `صنّف هذا المقال:\n\nالعنوان: ${topic}\nالمحتوى: ${content}\n\nأجب بكلمة واحدة فقط (اسم القسم).`;
        break;

      default:
        return new Response(JSON.stringify({ error: "Unknown action" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
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
