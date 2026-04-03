/**
 * kanji-stroke — proxies KanjiVG stroke order SVG data
 *
 * Data source: KanjiVG by Ulrich Apel (CC BY-SA 3.0)
 * https://github.com/KanjiVG/kanjivg
 *
 * This function is part of nihongo-data-api, published under CC BY-SA 4.0
 * to comply with the share-alike requirements of KanjiVG.
 *
 * Usage: GET /functions/v1/kanji-stroke?char=漢
 *        GET /functions/v1/kanji-stroke?hex=6f22
 */

const KANJIVG_BASE = "https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji";
const CACHE_MAX_AGE = 604800; // 7 days — stroke data is stable

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  let hex: string | null = url.searchParams.get("hex");

  if (!hex) {
    const char = url.searchParams.get("char");
    if (!char) {
      return new Response(JSON.stringify({ error: "Missing ?char or ?hex param" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const codePoint = char.codePointAt(0);
    if (!codePoint) {
      return new Response(JSON.stringify({ error: "Invalid character" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    hex = codePoint.toString(16).padStart(5, "0");
  }

  const svgUrl = `${KANJIVG_BASE}/${hex}.svg`;

  try {
    const upstream = await fetch(svgUrl, {
      headers: { "User-Agent": "nihongo-data-api/1.0" },
    });

    if (!upstream.ok) {
      return new Response(JSON.stringify({ error: "Stroke data not found", hex }), {
        status: upstream.status === 404 ? 404 : 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const svg = await upstream.text();

    return new Response(svg, {
      headers: {
        ...corsHeaders,
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Cache-Control": `public, max-age=${CACHE_MAX_AGE}`,
        "X-Data-Source": "KanjiVG by Ulrich Apel — CC BY-SA 3.0 — https://github.com/KanjiVG/kanjivg",
        "X-License": "CC BY-SA 3.0",
        "X-Kanji-Hex": hex,
      },
    });
  } catch (err) {
    console.error("Upstream fetch error:", err);
    return new Response(JSON.stringify({ error: "Upstream unavailable" }), {
      status: 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
