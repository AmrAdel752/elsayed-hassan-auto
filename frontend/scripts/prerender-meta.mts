/**
 * Post-build: writes dist/<route>/index.html copies of the app shell with that page's own
 * <title>, description and Open Graph tags, so WhatsApp/Facebook link previews (which don't
 * run JavaScript) show the right page. Also writes sitemap.xml from the same route list.
 *
 * Runs automatically after `npm run build` (Node 24 runs this TypeScript file directly).
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { AR } from '../src/app/i18n/ar.ts';
import { PRODUCTS } from '../src/app/data/catalog.ts';
import { CAR_MODELS } from '../src/app/data/models.ts';
import { TIPS } from '../src/app/data/tips.ts';

// Site address used in link previews + sitemap. Order: SITE_URL env (set it once the real domain
// exists) → Vercel's production URL (set automatically on Vercel) → placeholder.
// The placeholder written in src/index.html and public/robots.txt is swapped for it below.
const PLACEHOLDER = 'https://elsayedhassanauto.com';
const vercel = process.env['VERCEL_PROJECT_PRODUCTION_URL'];
const DOMAIN = (process.env['SITE_URL'] || (vercel ? `https://${vercel}` : PLACEHOLDER)).replace(/\/$/, '');

const root = dirname(fileURLToPath(import.meta.url));
const dist = join(root, '../dist/frontend/browser');
const swapDomain = (s: string) => s.replaceAll(PLACEHOLDER, DOMAIN);
const shell = swapDomain(readFileSync(join(dist, 'index.html'), 'utf8'));
writeFileSync(join(dist, 'robots.txt'), swapDomain(readFileSync(join(dist, 'robots.txt'), 'utf8')));
const site = AR.meta.site;
const pages = AR.meta.pages as Record<string, string[]>;

const routes: { path: string; title: string; desc: string }[] = [
  { path: '', title: AR.meta.title, desc: AR.meta.desc },
  ...Object.entries({
    services: 'services', book: 'book', products: 'products', offers: 'offers', 'maintenance-calculator': 'calc',
    estimate: 'estimate', track: 'track', models: 'models', faq: 'faq', reviews: 'reviews', gallery: 'gallery',
    tips: 'tips', about: 'about', contact: 'contact',
  }).map(([path, key]) => ({ path, title: `${pages[key][0]} | ${site}`, desc: pages[key][1] })),
  ...AR.services.map(s => ({ path: `services/${s.slug}`, title: `${s.t} | ${site}`, desc: s.d })),
  ...PRODUCTS.map(p => ({ path: `products/${p.slug}`, title: `${p.name.ar} | ${site}`, desc: p.desc.ar })),
  ...CAR_MODELS.map(m => ({ path: `models/${m.slug}`, title: `Nissan ${m.name} | ${site}`, desc: m.tagline.ar })),
  ...TIPS.map(t => ({ path: `tips/${t.slug}`, title: `${t.title.ar} | ${site}`, desc: t.excerpt.ar })),
];

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const setAttr = (html: string, attr: string, key: string, value: string) =>
  html.replace(new RegExp(`(<meta ${attr}="${key}" content=")[^"]*(")`), `$1${esc(value)}$2`);

for (const r of routes) {
  const url = `${DOMAIN}/${r.path}`;
  let html = shell.replace(/<title>[^<]*<\/title>/, `<title>${esc(r.title)}</title>`);
  html = setAttr(html, 'name', 'description', r.desc);
  html = setAttr(html, 'property', 'og:title', r.title);
  html = setAttr(html, 'property', 'og:description', r.desc);
  html = setAttr(html, 'property', 'og:url', url);
  html = setAttr(html, 'name', 'twitter:title', r.title);
  html = setAttr(html, 'name', 'twitter:description', r.desc);
  const out = join(dist, r.path, 'index.html');
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, html);
}

writeFileSync(join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  routes.map(r => `  <url><loc>${DOMAIN}/${r.path}</loc></url>`).join('\n') + `\n</urlset>\n`);

console.log(`prerender-meta: wrote ${routes.length} pages + sitemap.xml for ${DOMAIN}`);
