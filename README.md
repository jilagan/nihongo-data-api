# nihongo-data-api

Open-source data API for the Nihongo Mentor Suite (Kanji Mentor, Kiku Mentor, Yomu Mentor).

This service provides the data layer for the Nihongo Mentor iOS apps. It is published as open source under CC BY-SA 4.0 to comply with the share-alike requirements of the underlying datasets (JMdict/EDRDG and KanjiVG).

## Endpoints

### `GET /functions/v1/kanji-data`

Returns the full kanji dataset (JMdict-derived). JLPT N5–N1 + Foundation kana entries with readings, meanings, compounds, and vocabulary.

Response: `application/json` — array of `KanjiEntry` objects.

Cache-Control: `public, max-age=86400, stale-while-revalidate=604800`

### `GET /functions/v1/kanji-stroke?char={kanji}`

Returns KanjiVG stroke order SVG for a single kanji character.

Example: `/functions/v1/kanji-stroke?char=漢`

Proxies from [KanjiVG](https://github.com/KanjiVG/kanjivg) (Ulrich Apel, CC BY-SA 3.0).

## Attribution

| Dataset | Source | License |
|---------|--------|---------|
| Kanji readings, meanings, compounds | [JMdict/EDRDG](https://www.edrdg.org/) | CC BY-SA 4.0 |
| Stroke order SVG | [KanjiVG](https://github.com/KanjiVG/kanjivg) (Ulrich Apel) | CC BY-SA 3.0 |

## License

This repository and the services it defines are licensed under
[Creative Commons Attribution-ShareAlike 4.0 International](LICENSE).

Derivatives must carry the same license.

## Deployment

Deployed as Supabase Edge Functions (Deno). See `supabase/functions/`.
