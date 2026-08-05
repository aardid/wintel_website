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

- **Logo:** source artwork is `wildfire_intelligence/logo/ChatGPT Image Aug 5, 2026, 11_42_11 AM.png`
  — a **Wintel / WILDFIRE INTELLIGENCE** lockup: a **shield** split vertically, cool blue water on the
  left and orange flame on the right, with a dark tree silhouette standing on the seam; navy wordmark,
  orange-red tagline. Real alpha channel (wall pixels carry grey RGB at alpha 0, so crop on alpha and
  ignore RGB).
  - **The build script is `_scratch`-only, so keep these numbers.** Everything below was measured off
    this source; re-deriving them costs a session. The crop box is the `alpha > 140` bbox - origin
    `(297,318)`, size **902x323**, aspect **2.79:1** - shipped **downscaled to 760x272** (167 KB).
    The emblem-only marks stay at native res because no page ships them.
  - **Measure in the same frame you cut in.** All geometry is in the `alpha > 140` crop frame. An
    earlier source's pass measured against the `alpha > 8` bbox instead - a 1px/3px offset, enough to
    leave the top three rows of "Wintel" inside the emblem crop. The build script re-derives `X0` at
    run time and hard-fails if it moves, so a re-cut source shouts.
  - **One threshold, not two.** Both baked glows (cool around the shield, red around the tagline) live
    entirely in the *wall* at alpha 0, so a single alpha threshold (~140) does geometry and output. The
    Aug 4 lockup was the exception, with its glow in the alpha channel. No white plate either - the
    09_25 orange render was the only source that baked one in.
  - **Plain vertical cut, with room to spare.** Columns **267..307 are all empty** (41 of them), so the
    emblem is `x < X0` and the type block is `x >= X0`, with **`X0 = 287`** (the gutter midpoint). No
    L-shaped mask: the shield is compact and does not overhang the wordmark the way the araucaria
    lockups did. If a future source returns to a spreading canopy, the L-cut logic is in this file's
    history.
  - The lockup is wide (2.79:1), so height drives horizontal cost: 84px tall is ~235px wide.
  - **The knockout needs a spatial gate, and colour alone cannot substitute.** The artwork is drawn for
    light backgrounds - its wordmark is near-black navy (`rgb 0,32,70`) and vanishes on this site's
    navy - but inside the shield that *same* navy is two different things: the outer border **and the
    tree silhouette**, which only reads because the fill behind it is bright. Lifting it there would
    erase the tree. So:
    - The lift applies **only to `x >= X0`**, where separation is total: "Wintel" ink is 20,740 px below
      lum .14, then a dead zone (30 px in .14-.16, 1 px in .16-.22), then the orange tagline above .22
      (`rgb 251,62,16`), excluded anyway by the `(B - R) > 15` navy test.
    - **The shield is left exactly as drawn.** Its bright blue/orange fill is what carries the shape on
      a dark page, and its dark border reading quietly against the page is the artwork's own look. Do
      not "fix" it by lifting the border - that takes the tree with it.
    - Lifted ink maps to `0.97 - lum*0.62` against 214/226/247.
    - Consequence worth knowing: the emblem crop is **identical in both lockups**, because the lift
      never touches `x < X0`. `logo-mark.png` and `logo-mark-onlight.png` are the same image here.
  - **THE PAGES NO LONGER RENDER A LOCKUP PNG.** Header and footer both use **emblem image + live
    text**: `img/logo-mark.png` (the shield, original colours) next to real `<span>`s for "Wintel" and
    the tagline. The `logo-lockup*.png` files are still built and `logo-lockup.png` is still what the
    homepage JSON-LD `logo` cites (search engines render that on white), but nothing on the pages
    references them. See the LIVE-TEXT LOCKUP entry below for why.
    - **The header bar is dark (changed 2026-08-05).** It was previously a bone "light island", which
      existed only so a full-colour lockup could keep its near-black navy ink on a light surface.
      Live text removed that constraint entirely — the wordmark is now a CSS colour, so it follows the
      theme onto any surface. `--bg-header` / `--header-line` / `--header-text` / `--header-strong` /
      `--header-tint` point at dark-theme values; `--bg-header` is `rgba(11,16,32,.88)`, one step off
      the page so the sticky edge still reads under `backdrop-filter: blur(14px)`.
      **Keep those five tokens separate** rather than folding them into the ordinary `--text-*` set —
      that indirection is what let the header be a light island before and what would let it become
      one again cheaply. If a surface ever does go light, only two things change: those tokens, and
      `.logo-word`'s colour (the shield itself works on both, being full-colour artwork).
    - Header height is 116px (104px mobile) to fit an 84px shield (62px mobile); the mobile nav's `top`
      offset must stay equal to the *mobile* header height or the dropdown detaches (verified at 0px
      gap).
    - **The mobile nav now takes over at 900px, not 768px.** The six-item nav needs ~580px on its own;
      below ~865px it collided with the logo and clipped the Contact button. That was already true of
      the original lockup, so this fixes a long-standing squeeze rather than one live text introduced.
      Between 901px and 1080px there is an intermediate step that shrinks the lockup and tightens nav
      padding - the lockup gives way rather than the nav, which is why `.nav-links a` is `nowrap`.
      Three numbers must move together if the breakpoint changes: the `max-width` on the mobile block,
      the `min-width` on the intermediate block, and `.nav-links` `top`.
  - **LIVE-TEXT LOCKUP (changed 2026-08-05).** Only the shield is artwork; "Wintel" and
    "WILDFIRE INTELLIGENCE" are CSS type (`.logo-mark` + `.logo-text` > `.logo-word` / `.logo-sub`).
    - *Why.* Every source so far locks its tagline to a fixed share of the artwork's height - ~14% for
      this shield, which is ~12px at an 84px lockup and unchangeable without a redraw. The pine lockup
      was worse (5.4px, and it forced a 136px header); the Aug 4 lockup worse still (~4px, pure
      texture). Live text sets the two lines **independently**, which is the only way to make the
      tagline larger than the artwork allows. It is also crisp at any DPR, selectable, and indexable.
    - *Sizes.* `.logo-word` 2.55rem/800, `.logo-sub` 1.12rem/700 at .04em tracking, uppercased in CSS
      (the DOM text is "Wildfire Intelligence", so screen readers and search engines get normal case).
      Footer: 1.9rem / .84rem against a 62px shield. The tagline is deliberately large — it is the line
      that names the company, and live text is the only reason it can be.
    - *The two lines are deliberately not width-matched.* A lockup ties them to the artwork's ratio
      (sub ≈ .28 × word for equal widths); here the ratio is ~.44, so the tagline runs wider than
      "Wintel" above it. Keep the stack **left-aligned** so that reads as intentional. The tagline is
      now the widest element in the lockup, so it — not the wordmark — sets the logo's footprint and is
      what the 1080px nav breakpoint is fighting. Four places move together when it changes: the base
      rule, the 1080px block, the 900px block, and `.footer-brand`.
    - *Colour.* `--logo-sub` (fire-500) rather than the artwork's own `rgb 251,62,16`, so the tagline
      is a site token and re-themes with everything else. `--logo-glow` is a soft warm drop-shadow at
      .20 lifting the shield off the bar; both tokens are live now, `--logo-plate` is unused.
    - *The alt text moved.* `<img>` carries `alt=""` because the words are now real text beside it; the
      accessible name comes from the `<a aria-label>`. Don't restore a descriptive alt or the name gets
      announced twice.
  - **Palette note:** this mark carries **both** site accents - blue water and orange flame - and the
    tagline is `--action`-adjacent orange. Good fit; nothing to reconcile. (The 09_50 mark's red was a
    fourth warm hue distinct from `--action`, which is why it did not sit as well.)
  - `img/logo-mark.png` (267x323) - the shield alone. **This is the file every page renders.**
    `img/logo-mark-onlight.png` is byte-identical (the lift never touches `x < X0`), kept only so
    anything referencing the on-light name still resolves.
  - `img/favicon-32.png` and `img/favicon-180.png` - the shield on a navy tile. This emblem is
    **near-square (0.83:1) and its own fill is bright**, so it needs no squaring crop and no knockout,
    and it is by some margin the most legible favicon of the Aug 2026 set. The tree marks needed the
    tile because their light-ink linework would vanish on a white tab strip; this one keeps the tile
    only for a consistent silhouette.
  - Superseded sources in the same folder, newest first: `…Aug 5, 11_13_29 AM…png` (tall narrow conifer
    with a blue+orange flame swoosh, 1.45:1 — the only lockup so far that needed NO spatial gate, since
    its swoosh crossed in front of the trunk; also the only one that forced a taller header).
    The rest are araucaria/spreading-canopy lockups, all needing an L-cut rather than a vertical one:
    `…Aug 5, 09_50_15 AM…png` (blue swoosh, **red** tagline, 2.95:1;
    the source of the spatial-gate knockout), `…Aug 5, 09_25_05 AM…png` (orange swoosh and orange
    tagline on a baked white plate — the warmth-gated plate knockout lives in this file's history if
    that direction returns), `…Aug 4, 01_56_33 PM…png` ("Wintel" over a much smaller tagline, 2.47:1,
    glow baked into the *alpha* so it needed two thresholds), `…Aug 4, 09_02_46/09_02_55…png` (same pine
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
    (light paper). Both retired sets note the extra palette hues they need. Each also carries its own
    `--header-*` type tokens and a line saying which lockup file to point the `<img>` at — the header
    has its own surface, so a paste that skips those leaves the nav text the wrong polarity and the
    logo's ink invisible. A dual auto light/dark
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
    **It is a backdrop, not a column item.** `.hero .hero-visual` is `position: absolute`, anchored
    `inset: 0 auto 0 30%`, at `opacity: .42`, with the image at `width: min(76vw, 1010px)` — ~995px
    rendered at a 1440 viewport, starting under the copy and bleeding past the container's right edge
    to the viewport (`.hero` clips it with `overflow: hidden`). That is up from ~600px in-flow, fully
    opaque, and starting clear of the text.
    - **Two masks, intersected**, are what make that survivable. Horizontal: the leading edge fades to
      transparent by 34% so the embers stop competing with the headline it now sits under. Vertical:
      at 1010px the image is ~699px tall against a ~670px hero, so without a top/bottom fade the
      overflow clip would cut the smoke on a hard horizontal line at the header and at the band below.
      `mask-composite: intersect` (`-webkit-mask-composite: source-in`); if a browser ignores the
      composite the layers default to `add` and the fades weaken, which degrades quietly.
    - **This is past native resolution.** The artwork is 860px wide, so 1010px upscales ~1.17x. It
      holds up only because it is soft smoke at .42 opacity behind a mask — do not push it much
      further without a larger source render.
    - **Scoped to `.hero` deliberately.** `what-we-do.html` reuses `.hero-visual` for the mesh canvas
      inside `.page-header-split`, and that one must stay in flow as a real grid column. Never drop
      the `.hero ` prefix on these rules.
    - **`.hero-content` needs its explicit `z-index: 1`.** An absolutely positioned child paints
      *above* in-flow siblings even at `z-index: 0`, so source order alone would put the tree over the
      headline. Removing that line silently buries the copy.
    - Lifting the visual out of flow leaves grid column 2 empty; the copy stays pinned to column 1 at
      ~432px, which is what keeps the h1 on three lines.
    - The 900px block undoes all of this — `position: static`, `mask-image: none`, opacity .62,
      centred and capped at 440px. A faint image *beside* the copy is atmosphere; *under* a narrow
      single column it is just poor contrast. The mask reset matters: in flow and centred, the
      horizontal fade lops the left side off the tree and the whole thing looks lopsided.
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
- **Change the logo:** the lockup is an emblem image plus live text, twice per page (header and
  footer) on all six pages. Swapping artwork means re-cutting `img/logo-mark.png` from a new source
  (see the Logo section for the extraction recipe) - the wordmark and tagline are CSS and need no
  re-export. Sizing lives in `.logo-mark` / `.logo-word` / `.logo-sub`, with a mobile block at 900px
  and an intermediate block at 1080px.
- **Retune the hero animation:** `js/main.js` → the topographic mesh IIFE. `COLS`/`ROWS` set
  grid density, `edgeStyle()` the height-to-colour ramp, `sigColor()` the particle colour.
- **Connect the contact form:** replace the mailto handler in `js/main.js` with a form action URL.
- **Add a case study:** follow the `<article class="case-study">` pattern in `case-studies.html`
  (id anchor, tag, date, Problem / What We Built / Outcome, partners).
