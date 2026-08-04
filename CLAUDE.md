# CLAUDE.md — Wildfire Intelligence & Cloudbreak Analytics Websites

## Project Overview

This directory contains two static websites:

### 1. Wildfire Intelligence (`/`)
- **Naming convention (deliberate, do not "fix"):** **Wintel** is the *display brand* — it appears in
  the header/footer lockup and nowhere else. **Wildfire Intelligence** remains the legal, SEO and
  contact name: page titles, meta descriptions, `og:site_name`, JSON-LD `name`, the footer copyright,
  the domain and the email. The homepage JSON-LD carries `alternateName: "Wintel"` so search engines
  associate the two. If you switch the display brand into titles/meta, do it everywhere at once and
  expect to lose ranking on the descriptive name.
- **URL:** wildfireintelligence.co.nz
- **Purpose:** AI-powered wildfire forecasting and analytics company site
- **Pages:** Home, What We Do, Solutions, Case Studies, About, Contact
- **Contact:** Alberto Ardid — alberto@wildfireintelligence.co.nz, +64 27 595 4776
- **Partners:** University of Canterbury, Scion (NZ Forest Research Institute), Covey Associates (QLD)
- **Regions:** New Zealand, Australia, Latin America

### 2. Cloudbreak Analytics (`/cloudbreak/`)
- **URL:** cloudbreakanalytics.co.nz
- **Purpose:** Broader AI-powered environmental intelligence, climate-risk, hazard analytics, and custom data science
- **Pages:** Home, What We Do, Solutions, Case Studies, About, Contact
- **Contact:** contact@cloudbreakanalytics.co.nz
- **Regions:** New Zealand, Australia, Latin America

The Wildfire Intelligence site is a rebrand of the Cloudbreak design system — same component
library, layout, and animated mesh hero, restyled to the fire palette. Keep them structurally
in sync where practical: a fix to one is usually worth porting to the other.

### Previous version
The pre-2026-08 Wildfire Intelligence site (light theme, 4 pages) is preserved in
`_old-site-backup/`. It is not linked from anywhere and is not deployed.

## Tech Stack

- Pure static HTML/CSS/JS — no build step, no framework
- Single CSS file per site (`css/style.css`)
- Single JS file per site (`js/main.js`)
- Google Fonts: Inter (400, 500, 600, 700, 800)
- No dependencies, no npm, no bundler

## Key Design Decisions

- **Logo:** source artwork is `wildfire_intelligence/logo/ChatGPT Image Aug 4, 2026, 01_56_33 PM.png`
  — a **Wintel / WILDFIRE INTELLIGENCE** lockup: detailed araucaria in navy/steel, amber fire swoosh,
  cyan wind swoosh, navy wordmark, orange tagline, with a **baked-in glow**. Real alpha channel (wall
  pixels carry grey RGB at alpha 0, so crop on alpha and ignore RGB).
  - **Two thresholds when extracting.** Use a high alpha threshold (~140) for *geometry*, or the glow
    smears the detected bounds, and keep every pixel above ~8 in the *output* so the glow survives.
  - **The emblem cannot be split off with a vertical cut**, because the canopy overhangs to the right
    above the wordmark. The extraction masks an **L-shaped region**: everything except
    (`x >= X0 AND y >= Y0`). Order matters — find `X0` first (least-dense solid column in the middle
    band, across all rows), *then* `wordTop` from the columns right of `X0`. Doing it the other way
    round samples the tagline's far-right glow, reports a `wordTop` below "Wintel", and leaves the
    name inside the emblem crop.
  - The lockup is wide (1743×512, 3.4:1), so height drives horizontal cost: 84px tall ≈ 286px wide.
  - **The artwork is drawn for light backgrounds.** Its tree and wordmark are near-black navy
    (`rgb 0,11,30`), which vanishes on this site's navy. So the site uses a **knockout version**: the
    dark ink is remapped to light cool ink (`lum < .44` and not warm → `0.97 - lum*0.62` against
    214/226/247), leaving the orange and blue swooshes untouched. Do not "correct" the emblem back to
    the source colours while the theme is dark.
  - **Two lockups are in use, matched to their surface.** `img/logo-lockup.png` (original colours) in
    the **light header bar**; `img/logo-lockup-reverse.png` (dark ink lifted to light, warm colours
    untouched) in the **dark footer band**. Both transparent, no plate, no live text. If a surface's
    lightness changes, swap which file it points at rather than editing either image.
    - **This is why the header bar is light.** The lockup's type and tree are near-black navy, so they
      need a light surface. Rather than plating the logo, the whole top bar is bone
      (`--bg-header`), with its own type tokens (`--header-text`, `--header-strong`, `--header-tint`,
      `--header-line`) because the page around it is dark. Don't repoint those at the dark-theme text
      tokens — the header is deliberately a light island on a dark page.
    - Header height is 128px (104px mobile) to fit a 96px lockup; the mobile nav's `top` offset must
      stay equal to the header height or the dropdown detaches.
    - `img/logo-lockup-reverse.png` is the same lockup with the dark ink lifted to light — use it only
      if the header ever goes dark again.
  - The lockup's tagline is ~4px tall at a 60px lockup height — it reads as texture, not words. That is
    the artwork's own proportion. Only a redrawn source with a larger tagline fixes it.
  - `img/logo-mark.png` (880×512) — knockout emblem alone (dark ink → light ink), for a dark surface
    with no plate. Currently unused by the pages; kept for slides/favicons and in case the header
    reverts to "emblem + live text" (that variant needs `--logo-sub` and `--logo-glow`).
  - `img/logo-mark-onlight.png` (880×512) — emblem alone, original colours, for light surfaces.
  - `img/favicon-32.png` and `img/favicon-180.png` — knockout emblem on a **navy tile in both sizes**;
    a transparent light-ink tree would disappear on a white tab strip.
  - Superseded sources in the same folder, newest first: `…Aug 4, 09_02_46/09_02_55…png` (same pine
    concept but wordmark set as "Wildfire Intelligence" over two lines, no "Wintel"),
    `…Aug 4, 08_59_23…png` (narrow pine, same colours), `…Aug 4, 08_38_38…png` (red flame droplet with
    alpha), `…Aug 3…png` (red flame droplet on a grey wall, no alpha — needed matting). Prefer a
    transparent export over keying if the logo is re-cut again.
  - Sizing lives in `.logo-mark` — height only, width auto. `.logo-sub` carries the 21-character
    "WILDFIRE INTELLIGENCE" line, so tracking is deliberately tight (.125em, .5rem); the old
    6-character "INTELLIGENCE" ran at .34em and would now overrun the name. `--logo-glow` is a soft
    warm halo at .22 — stronger values tint the light tree orange.
- **Logo (Cloudbreak):** `cloudbreak/logo.png` — transparent background with white text, so it
  needs a dark surface behind it.
- **Colour: indigo-navy dark, three accents.** `css/style.css` is organised in four numbered parts —
  (1) PALETTE raw hues, (2) TOKENS semantic roles, (3) RETIRED THEMES (commented, paste-ready),
  (4) COMPONENTS. **Components must reference only tokens** (`--bg-*`, `--text-*`, `--tint-*`,
  `--line`, `--surface`, `--on-band-*`, `--logo-glow`), never raw hues. That is the whole point:
  re-theming the site means editing the token block and nothing else. A component with a hardcoded
  colour breaks that guarantee — add a token instead.
  - **Current:** navy surfaces from `--navy-950` (`#070b16`) up, cool ash type (`#cbd3e6` body /
    `#e2e8f5` lead), hairlines rather than elevation (`--shadow-rest: none`).
  - Three accents, ranked by loudness: **fire orange = action and risk only** (CTAs, stat numbers,
    hero-badge dot, CTA band wash, hot end of any scale); **sky `#38bdf8` = data** (links, section
    labels, icons, check marks, citation links); **periwinkle `#818cf8` = structure** (hairlines,
    tinted panels, partner glyphs). If orange starts appearing on ordinary UI, the CTA stops reading
    as the action. In this theme sky covers both `--link` and `--verify`; the tokens stay separate so
    a future theme can split them (the plum theme used violet for structure, cyan for verification).
  - **Darker bands punctuate the page** — `.section-dark`, `.cta-banner`, `.site-footer`. Their
    contents use `--on-band-*` tokens, so anything nested in a band uses those, not `--text-*`.
  - **Switching theme:** paste one of the commented sets in part 3 over the token block, and set the
    matching `THEME` in `js/main.js` — `'navy'` (active), `'plum'` (plum-violet dark) or `'bone'`
    (light paper). Both retired sets note the extra palette hues they need. A dual auto light/dark
    build also worked: wrap the bone set in `@media (prefers-color-scheme: light)` and pick the JS
    ramp from `matchMedia`.
  - Theme-specific gotchas worth keeping: on **bone**, pale washes vanish (`--tint-visual` needs ~.20,
    not .10, or the service-visual panels read as empty boxes) and the footer logo needs its own warm
    glow since the page-level `--logo-glow` is a dark shadow; accents must darken for contrast
    (`#a78bfa`→`#7c3aed`, `#22d3ee`→`#0891b2`, `.logo-sub`→`#c2410c`).
- **Testing themes:** headless Chromium/Edge can force the OS scheme —
  `--blink-settings=preferredColorScheme=1` (light) / `=2` (dark). The site is single-theme, so force
  the *opposite* scheme to confirm it does **not** follow the OS. After any colour change, check one
  page with a dark band (case-studies), one with form fields (contact), and one with service-visual
  panels (what-we-do). Grep the live CSS (excluding part 3) for retired hue prefixes — a component
  left pointing at `--plum-*` or `--cyan-*` fails silently as a transparent/unset value.
- **Colour palette (Cloudbreak):** Navy 60% / white-slate 30% / blue + orange 10%.
- **Backdrop:** Cloudbreak uses a full-page surf photo at 26% opacity. Wildfire Intelligence
  uses a fixed gradient instead (`body::before` / `body::after`) — two cool fields (cyan top-right,
  violet top-left) plus one restrained ember glow bottom-left. No image weight, higher text
  contrast. A commented hook in `css/style.css` shows where to drop a photo in.
- **Homepage visuals (two, deliberately separated):**
  - **Hero** — a still image, `img/hero-ember-tree.png` (860×604): the araucaria burning from within,
    cropped from `wildfire_intelligence/logo/ChatGPT Image Aug 4, 2026, 01_46_51 PM.png`. Transparent
    PNG, so it reads straight against the page gradient with no plate. **It is 1.0 MB** — the soft
    smoke alpha is expensive in PNG. No WebP encoder exists on this machine (the `convert.exe` on PATH
    is Windows' filesystem tool, not ImageMagick); converting it to WebP elsewhere would cut it to
    roughly 150–250 KB and is the single biggest page-weight win available.
  - **Mesh band** — the animated canvas, moved out of the hero to sit *below* the What We Do section
    (`.mesh-band`), where it illustrates the capabilities instead of competing with the headline. It
    keeps `id="hero-field"` because `js/main.js` binds to that id, and it sizes itself from its
    parent's box, so `.mesh-band .hero-graphic` must keep an `aspect-ratio` (26/9 desktop, 16/9 small).
    There must be exactly one `#hero-field` on the page.
- **Mesh animation:** topographic mesh on `<canvas id="hero-field">`, driven by `js/main.js`.
  Height maps to colour so low ground reads benign and peaks read hot, and signal particles propagate
  across the grid. Two ramps are defined and one `THEME` constant picks between them — it **must match
  the CSS token block**. `RAMPS.light` (active) runs pale steel → teal → amber → deep red with a high
  alpha floor (.36); `RAMPS.dark` runs violet → cyan → amber → fire red on thin ink (.17). A ramp tuned
  for a dark page goes invisible on bone, so switching theme inverts which end carries the ink — it is
  not a recolour. Keep whichever ramp is active in step with the CSS accents. Honours
  `prefers-reduced-motion` by rendering one static frame.
- **Minimalist style:** no scroll-reveal animations, no decorative pseudo-elements beyond the
  backdrop. Subtle hover microinteractions only (card lift, border colour change).
- **Contact forms:** fall back to `mailto:` since there's no backend. Replace with
  Formspree/Netlify Forms/Google Apps Script for production.

## File Structure

```
website/
├── index.html                  # Wildfire Intelligence home
├── what-we-do.html
├── solutions.html
├── case-studies.html
├── about.html
├── contact.html
├── favicon.svg
├── robots.txt
├── sitemap.xml
├── css/style.css
├── js/main.js
├── wildfire_intelligence/logo/ # source logo render (not used by the site)
├── _old-site-backup/           # previous light-theme WI site (4 pages)
└── cloudbreak/
    ├── index.html              # Cloudbreak Analytics home
    ├── what-we-do.html
    ├── solutions.html
    ├── case-studies.html
    ├── about.html
    ├── contact.html
    ├── logo.png                # transparent background, white text
    ├── favicon.svg
    ├── robots.txt
    ├── sitemap.xml
    ├── css/style.css
    └── js/main.js
```

## Deployment

Upload the relevant folder to any static host (Netlify, Cloudflare Pages, GitHub Pages, Vercel).
No build step needed. Note that `cloudbreak/` sits inside the Wildfire Intelligence root — when
deploying WI on its own, exclude `cloudbreak/`, `_old-site-backup/`, and `wildfire_intelligence/`.

## SEO

Each page has a unique `<title>`, `<meta description>`, keywords, Open Graph tags, and canonical
URL. Both homepages include JSON-LD Organization schema. Both sites have `robots.txt` and
`sitemap.xml` — add new pages to the sitemap.

## Common Tasks

- **Add a new page:** copy an existing inner page, update `<title>`, meta tags, canonical URL,
  the nav `active` class, and content; then add the URL to `sitemap.xml`.
- **Change the logo:** edit the inline `.logo-mark` SVG — it appears twice per page (header and
  footer) on all six pages, plus `favicon.svg`. Sizing lives in `.logo-mark` / `.logo-word` CSS.
- **Retune the hero animation:** `js/main.js` → the topographic mesh IIFE. `COLS`/`ROWS` set
  grid density, `edgeStyle()` the height-to-colour ramp, `sigColor()` the particle colour.
- **Connect the contact form:** replace the mailto handler in `js/main.js` with a form action URL.
- **Add a case study:** follow the `<article class="case-study">` pattern in `case-studies.html`
  (id anchor, tag, date, Problem / What We Built / Outcome, partners).
