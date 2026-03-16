import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { action, source } = await req.json();

    switch (action) {
      case "list": {
        const { data, error } = await supabase
          .from("news_sources")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;
        return new Response(JSON.stringify({ sources: data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "add": {
        const { data, error } = await supabase
          .from("news_sources")
          .insert({
            name: source.name,
            url: source.url,
            fetch_method: source.fetch_method,
            fetch_url: source.fetch_url,
            language: source.language || "ar",
            category: source.category || "عام",
            fetch_interval_minutes: source.fetch_interval_minutes || 15,
            is_active: true,
          })
          .select()
          .single();
        if (error) throw error;
        return new Response(JSON.stringify({ source: data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "update": {
        const { data, error } = await supabase
          .from("news_sources")
          .update({
            name: source.name,
            fetch_url: source.fetch_url,
            fetch_interval_minutes: source.fetch_interval_minutes,
            is_active: source.is_active,
            fetch_method: source.fetch_method,
          })
          .eq("id", source.id)
          .select()
          .single();
        if (error) throw error;
        return new Response(JSON.stringify({ source: data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "delete": {
        const { error } = await supabase
          .from("news_sources")
          .delete()
          .eq("id", source.id);
        if (error) throw error;
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      default:
        return new Response(JSON.stringify({ error: "Unknown action" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
  } catch (e) {
    console.error("manage-sources error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
