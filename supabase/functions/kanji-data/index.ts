/**
 * kanji-data — serves the JMdict-derived kanji dataset
 *
 * Data source: JMdict/EDRDG (CC BY-SA 4.0)
 * https://www.edrdg.org/wiki/index.php/JMdict-EDICT_Dictionary_Project
 *
 * This function is part of nihongo-data-api, published under CC BY-SA 4.0
 * to comply with the share-alike requirements of JMdict.
 */

import { createClient } from "jsr:@supabase/supabase-js@2";

const STORAGE_BUCKET = "nihongo-public-data";
const STORAGE_PATH = "kanji-data/v1/kanji.json";
const CACHE_MAX_AGE = 86400; // 1 day

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .download(STORAGE_PATH);

    if (error || !data) {
      console.error("Storage fetch error:", error);
      return new Response(JSON.stringify({ error: "Data unavailable" }), {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const json = await data.text();

    return new Response(json, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": `public, max-age=${CACHE_MAX_AGE}, stale-while-revalidate=604800`,
        "X-Data-Source": "JMdict/EDRDG CC BY-SA 4.0 — https://www.edrdg.org/",
        "X-License": "CC BY-SA 4.0",
      },
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
