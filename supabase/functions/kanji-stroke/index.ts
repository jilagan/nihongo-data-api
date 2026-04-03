/**
 * kanji-stroke — KanjiVG stroke order SVG proxy (CC BY-SA 3.0)
 * https://github.com/jilagan/nihongo-data-api
 * Usage: GET ?char=<kanji>  or  GET ?hex=<5-digit hex>
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const KANJIVG_BASE = "https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji";

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("", { headers: { "Access-Control-Allow-Origin": "*" } });
  }

  const url = new URL(req.url);
  let hex: string | null = null;

  const hexParam = url.searchParams.get("hex");
  if (hexParam) {
    hex = hexParam.padStart(5, "0");
  } else {
    const char = url.searchParams.get("char");
    if (char) {
      const cp = char.codePointAt(0);
      if (cp !== undefined) hex = cp.toString(16).padStart(5, "0");
    }
  }

  if (!hex) {
    return new Response(JSON.stringify({ error: "Missing ?char or ?hex" }), {
      status: 400, headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const upstream = await fetch(`${KANJIVG_BASE}/${hex}.svg`, {
      headers: { "User-Agent": "nihongo-data-api/1.0" },
    });
    if (!upstream.ok) {
      return new Response(JSON.stringify({ error: "Not found", hex }), {
        status: upstream.status === 404 ? 404 : 502,
        headers: { "Content-Type": "application/json" },
      });
    }
    const svg = await upstream.text();
    return new Response(svg, {
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=604800",
        "X-License": "CC BY-SA 3.0",
        "X-Data-Source": "KanjiVG by Ulrich Apel https://github.com/KanjiVG/kanjivg",
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { "Content-Type": "application/json" },
    });
  }
});
