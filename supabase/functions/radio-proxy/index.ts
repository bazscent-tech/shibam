import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const streamUrl = url.searchParams.get("url");
    if (!streamUrl) {
      return new Response(JSON.stringify({ error: "Missing url parameter" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate URL
    const parsed = new URL(streamUrl);
    const isValidStream = /\.(mp3|aac|m3u8|ogg|opus)$/i.test(parsed.pathname) ||
      parsed.hostname.includes("stream") ||
      parsed.hostname.includes("radio") ||
      parsed.hostname.includes("radiojar") ||
      parsed.hostname.includes("zeno");

    if (!isValidStream && !streamUrl.includes("stream") && !streamUrl.includes("radio")) {
      return new Response(JSON.stringify({ error: "Invalid stream URL" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resp = await fetch(streamUrl, {
      headers: {
        "User-Agent": "ShibamRadio/1.0 (compatible; Mozilla/5.0)",
        "Accept": "*/*",
      },
    });

    if (!resp.ok) {
      return new Response(JSON.stringify({ error: `Stream returned ${resp.status}` }), {
        status: resp.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const contentType = resp.headers.get("content-type") || "audio/mpeg";
    return new Response(resp.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": contentType,
        "Cache-Control": "no-cache",
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
