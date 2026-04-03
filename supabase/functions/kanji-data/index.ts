/**
 * kanji-data — JMdict-derived kanji dataset (CC BY-SA 4.0)
 * https://github.com/jilagan/nihongo-data-api
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const STORAGE_URL =
  "https://fltusorahxjvsdjaspgy.supabase.co/storage/v1/object/public/nihongo-public-data/kanji-data/v1/kanji.json";

serve(async (_req: Request) => {
  try {
    const upstream = await fetch(STORAGE_URL);
    if (!upstream.ok) {
      return new Response(JSON.stringify({ error: "Data unavailable" }), {
        status: 503, headers: { "Content-Type": "application/json" },
      });
    }
    const text = await upstream.text();
    return new Response(text, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=86400",
        "X-License": "CC BY-SA 4.0",
        "X-Data-Source": "JMdict/EDRDG https://www.edrdg.org/",
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { "Content-Type": "application/json" },
    });
  }
});
