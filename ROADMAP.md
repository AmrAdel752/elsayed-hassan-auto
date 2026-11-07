# El Sayed Hassan Auto — Frontend Roadmap

Angular 22 (standalone, signals) + Tailwind v4, Arabic/English, light (default) / dark.
Backend (.NET Web API) + dashboard come after the frontend; until then pages use static data in `src/app/data/`.

Each checkbox = one small task.

---

## ✅ Done

- Foundation: i18n (AR/EN, RTL/LTR), theme (light default), layout, preloader, WhatsApp button, live open/closed status
- Pages: home, services + details, booking wizard, contact, about
- Products + details, offers (countdown), home featured products + offers
- Tools: maintenance calculator, Nissan models + details, repair tracking, price estimate

> Booking wizard + tracking are kept for now; if the client doesn't need them we remove them later.

---

## A — Mobile polish (top priority)

Automated check at 375px: no horizontal overflow on any page. Remaining work is visual quality.

- [x] **A1 Header** — one-line top bar (hours + phone) on mobile, brand on one line, icon-tile mobile menu with tools + WhatsApp/call
- [x] **A2 Mobile bottom nav** — app-style bar (Home / Services / Book / Parts / Contact) below 1024px, raised Book button, WhatsApp button lifted above it
- [x] **A3 Home hero** — centered text, full-width buttons, stats as 3 tiles, smaller emblem + chips; fixed marquee causing 20px sideways scroll on phones
- [x] **A4 Home sections** — smaller section spacing/headings, services 2-col compact grid, offers + reviews as swipe rails, tighter product/offer/contact cards (page ~12,000px → ~9,800px on phones)
- [x] **A5 Footer** — centered brand, services + quick links side by side, hours as a compact card, centered copyright on phones
- [x] **A6 Page banner + services pages** — compact banner on all inner pages, smaller CTA band, process steps, service details shows time/warranty + book button right after the description on phones
- [x] **A7 Booking wizard** — step name under stepper on phones, tighter cards, sticky Back/Next bar above tab bar, summary sidebar + WhatsApp bubble hidden on phones
- [x] **A8 Products, product details, offers** — edge-to-edge filter chips, search + model filter on one row, compact product image, no duplicate title, sticky price + WhatsApp order bar on details
- [x] **A9 Calculator + estimate** — compact inputs (models in 4 columns), sticky result/total bar above the tab bar that jumps to the full result
- [x] **A10 Models, track, about, contact** — tighter spacing, compact model cards, track search on one row, about values/team + contact cards in 2×2 grids
- [x] **A11 Dark mode + English pass on mobile** — 15 pages in English: no leftover Arabic, no missing keys, no overflow; dark mode verified (body, cards, product cards); no fixes needed

## B — Remaining features

- [x] **B1 Interactive car** — SVG car with 6 pulsing hotspots + part chips → service panel (includes, book, details); on home + `/services`
- [x] **B2 FAQ** `/faq` — 13 general Q&As in 4 topics + all service FAQs, search, topic chips, WhatsApp "still have a question"
- [x] **B3 Reviews** `/reviews` — average + star distribution (tap to filter), service filter, review cards, Google/WhatsApp share; home uses the same data (SAMPLE reviews in `data/reviews.ts`)
- [x] **B4 Gallery** `/gallery` — filterable masonry grid + lightbox (prev/next, Esc), 3 drag-to-compare before/after sliders; drawn placeholders until real photos (`data/gallery.ts` accepts `img`/`before`/`after`)
- [x] **B5 Tips** `/tips` + `/tips/:slug` — 4 bilingual articles (oil, CVT, A/C, suspension) with takeaways, service booking CTA, related articles, WhatsApp share (`data/tips.ts`)
- [x] **B6 404 page** — "this page broke down on the road" with 404 + car on a road, home/WhatsApp buttons, 4 quick links (replaced the old "coming soon" placeholder)

## C — Professional finish

- [x] **C1 SEO** — per-page + per-item title/description in AR/EN (`core/seo.service.ts`), static Open Graph tags, AutoRepair schema, robots.txt, sitemap.xml (46 URLs). **Before launch:** replace `elsayedhassanauto.com` placeholder domain; consider prerendering so inner pages get their own link previews.
- [~] **C2 PWA** — skipped (not needed by the client)
- [x] **C3 Performance** — initial download 553KB → 432KB (130KB → 100KB gzipped): English texts + home page lazy-loaded; post-build `scripts/prerender-meta.mts` writes per-page HTML (own title/OG tags for link previews) + sitemap.xml. Lighthouse not run (needs a real deploy).
- [x] **C4 Accessibility** — labels on all fields + map title, menu aria-expanded, aria-current on nav, keyboard focus ring, skip-to-content link, reduced-motion support, small red/gold text darkened in light mode (AA contrast)
- [x] **C5 Final QA** — 98 internal links crawled (0 dead), 20 pages × AR/EN × light/dark at 375px + AR/EN at 768/1280px (0 overflow), booking→tracking, forms, calculator, estimate, car explorer smoke-tested, production build served with deep links (0 console errors)

**Frontend complete.** Run locally: `cd frontend && npm start` (dev) or `npm run build` (production, includes per-page meta + sitemap).

## D — Optional (decide with client)

- [ ] Customer portal (login, my cars, service history, invoices) — mostly useful once the backend exists

## Later — Backend + dashboard

- [ ] .NET Web API: bookings, jobs/status, products, offers, prices, customers
- [ ] Admin dashboard (Tekton-like)
- [ ] Replace `src/app/data/*` with API calls

## Needed from the client

Real prices, products + photos, offers, workshop/team photos, real reviews, review of maintenance schedule / model issues / service durations, and confirm the second phone number (`0114360461` has 10 digits).
