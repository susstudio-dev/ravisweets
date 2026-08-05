# Recovered ravisweets.com images

60 files salvaged from the Internet Archive on 2026-08-06, after the WordPress
host that every site image hotlinked was suspended.

## Why these exist

Until 2026-08-02 the storefront hotlinked all of its imagery — 87 product images
plus the header logo — from `ravisweets.com/wp-content/uploads/`. That host began
answering **HTTP 402 (payment required)**, so every image on the site broke at
once. Commit `652e4fd` replaced the logo with a code-drawn katli lockup and gave
product cards a dashed-diamond fallback as damage control.

The domain has since been repointed to the Cloudflare Pages build, so the
WordPress files are no longer served from it at all. They now return 404.

## What was recoverable, and what was not

The Internet Archive holds **70 unique ravisweets.com image URLs, all captured
between 2016 and 2021**. 60 of those still return bytes; 10 are indexed but the
payload is gone. Three were only recoverable from 2016 captures.

**No 2025 upload was ever archived.** That means neither the current product
photography nor the current logo is here, including:

```
2025/09/cropped-WhatsApp_Image_2025-09-04_at_5.28.12_PM-removebg-preview-1-1.png
```

— the logo the site used until 2026-08-02. Its filename dates the master artwork
to a WhatsApp image of 2025-09-04 17:28, background-removed and set as the
WordPress Site Logo. That original is most likely still in the owner's WhatsApp
history or photo library.

## Condition

| Class | Count | Meaning |
|---|---:|---|
| Usable | 24 | ≥500px on the long edge, and not a thumbnail of another file here |
| Too small | 21 | Under 500px — fine for a chip, not a product page |
| Derivative | 15 | WordPress-generated resize of another file in this folder |

`manifest.tsv` lists every file with real header dimensions, byte size, and class.

Two files were discarded as not brand assets: `eicons.svg` (an Elementor icon
font) and `placeholder.jpg` (a blank WordPress placeholder).

## Before using any of this

These are 2021 stock, and most show a **Bites** range (Khajoor Bite, Anjeer
Bite, Oreo Bites, Butterscotch, Channa Fusion) that the current 24-product
catalogue no longer sells. Several 1000×1000 files are visibly upscaled from
smaller originals — soft, with compression artefacts.

Treat this folder as a **fallback of last resort**, not a substitute for real
photography. The recovery order that actually matters is in
`docs/superpowers/specs/2026-08-06-admin-media-and-go-live-design.md` §9.2 —
and it leads with recovering the old hosting account, which would return the
logo and all 87 current product images together.

## Provenance

Fetched via the Wayback CDX API, using the `id_` modifier so each request
returns the original bytes rather than an archive-wrapped page. Original URLs
and capture timestamps for the first pass are preserved in the git history of
this file's sibling `manifest.tsv`.
