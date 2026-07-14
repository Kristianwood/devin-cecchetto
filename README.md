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

## Editing content — the admin panel

**All content lives in [content.json](content.json)** and is edited at
**`/admin.html`** (e.g. `https://kristianwood.github.io/devin-cecchetto/admin.html`).
The panel edits everything: video sections and YouTube links, the released
catalogue, news posts, acting credits, press, bio, contact, socials, and every
photo — with upload, crop and resize built in. Publishing commits straight to
this repo via the GitHub API; GitHub Pages redeploys in about a minute.

One-time setup for the editor:

1. Sign in to a GitHub account with write access to this repo
   (add Devin as a collaborator under Settings → Collaborators if needed)
2. Create a fine-grained personal access token at
   https://github.com/settings/personal-access-tokens/new —
   Repository access: *Only select repositories* → `devin-cecchetto`;
   Permissions: **Contents → Read and write**; expiration up to 1 year
3. Open `/admin.html`, paste the token. It is stored only in that browser.

The panel's **Preview draft** button shows unpublished changes exactly as
visitors will see them; **Publish to live site** makes them real.

Photos live in `assets/` (web-optimized; uploads are resized to max 1920px
and saved as JPEG automatically).

## Hosting

Plain static site — no build step. Served with GitHub Pages from the `main` branch root.
`.nojekyll` disables Jekyll processing.
