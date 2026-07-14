# Devin Cecchetto — Official Portfolio Site

Static portfolio website for singer-songwriter and actress **Devin Cecchetto**,
built from the Claude Design project "Devin Cecchetto Portfolio".

## Sections

- **Home** — cinematic zoom-out montage of photos from her IMDb gallery
- **Videos** — two upcoming singles ("coming soon" heroes) + full released catalogue
  (Super Sonic Girl, Ships in the Night, So Obvious, Fantasy, OFF MY MIND!, Phase,
  the Christmas special) embedded from YouTube, with a link to her
  [Vevo channel](https://www.youtube.com/@DevinCecchettoVEVO)
- **Acting** — credits (The Way Home, Wayward, Ginny & Georgia, …) + IMDb link
- **Press** — interview features
- **About** — bio + portrait
- **Contact** — email, YouTube / Vevo / Instagram / TikTok / Spotify / Apple Music

## Editing content

All content lives in the `DATA` object at the top of [site.js](site.js) —
titles, YouTube links, credits, press, bio, email and socials.
When a new video premieres, paste its YouTube URL into the matching
`projects[].youtube` field and set `released: true`.

Photos live in `assets/` (from her IMDb gallery, web-optimized to max 1920px).

## Hosting

Plain static site — no build step. Served with GitHub Pages from the `main` branch root.
`.nojekyll` disables Jekyll processing.
