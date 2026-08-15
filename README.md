# HW FanVL — Studio Website

Premium studio site for HW FanVL, a mobile-app and digital-product studio serving global (US/EU) markets with Google Play / App Store publishing and intelligent ad monetization.

Production URL: **https://hwfanvl.com**

---

## Stack

- Static site, no build step. Plain HTML + CSS + vanilla JavaScript.
- Hosted on **GitHub Pages** (custom domain `hwfanvl.com` via the `CNAME` file).
- 5 pages: `index.html`, `services.html`, `contact.html`, `privacy.html`, `terms.html`.
- Decorative SVGs are inline or referenced from `/images/`.
- Fonts use system stack (`Inter, Manrope, -apple-system, "SF Pro Display", system-ui, ...`) — no external font CDN required.

> GitHub Pages serves `index.html` automatically at `https://hwfanvl.com/`. **Do not** rename the homepage to anything else.

---

## Directory layout

```
hwfanvl-build/
├── CNAME              # custom domain: hwfanvl.com
├── .nojekyll          # disable Jekyll processing on Pages
├── app-ads.txt        # IAB authorized-sellers placeholder
├── robots.txt         # allow all + sitemap pointer
├── sitemap.xml        # 5 URL entries
├── README.md          # this file
├── index.html         # homepage
├── services.html
├── contact.html
├── privacy.html
├── terms.html
├── css/
│   ├── style.css        # main stylesheet
│   └── animations.css   # scroll / parallax / glow animations
├── js/
│   ├── main.js          # nav, smooth scroll, reveal, form, counter
│   └── animations.js    # parallax, tilt, cursor, float
└── images/              # logos, favicon, icons, animals, patterns, placeholders
```

---

## Conventions for content agents

1. **Nav and Footer are shared, identical across all 5 pages.** Do not modify them. The HTML markers `<!-- NAV_START/END -->` and `<!-- FOOTER_START/END -->` delimit them.
2. **Replace only the inner content of `<!-- *_SECTION_START --> ... <!-- *_SECTION_END -->` blocks.** The `main` element wrapper, head, nav, and footer must remain untouched.
3. **Replace `<!-- TODO: content -->` placeholders inside a section** with real markup. Keep section IDs intact.
4. **Use the existing CSS classes** (`.btn-primary`, `.card`, `.section-title`, `.grid-3`, etc.) instead of inventing new utility classes.
5. **Image placeholders** are `images/placeholder-*.svg`. Replace each with a real PNG/WebP, keeping the same filename so references in HTML continue to resolve.
6. **SEO meta tags** are already complete in `<head>`. Update `og:description` / `og:title` only if the page H1 truly changes.

---

## Local preview

No build step — open `index.html` directly in a browser, or serve the directory:

```bash
cd hwfanvl-build
python3 -m http.server 8080
# then visit http://localhost:8080/
```

## Deploy

Push to the `main` branch of the GitHub Pages repo. The `CNAME` file binds the custom domain `hwfanvl.com` automatically.
