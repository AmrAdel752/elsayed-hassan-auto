/**
 * Post-build: writes dist/<route>/index.html copies of the app shell with that page's own
 * <title>, description, canonical address and Open Graph tags, so search engines and
 * WhatsApp/Facebook link previews (which don't run JavaScript) see the right page.
 * Each copy also gets structured data (breadcrumbs, FAQ, product, service, article) and a
 * plain-text version of the page inside <app-root> (replaced when the app starts), so crawlers
 * that don't run JavaScript still read real content and follow real links.
 * Also writes sitemap.xml from the same route list. /admin is never listed here.
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

interface Page {
  path: string; title: string; desc: string;
  /** Short name for breadcrumbs. */
  name: string;
  /** Parent section path for breadcrumbs. */
  parent?: string;
  /** Plain-text content for crawlers (HTML, already escaped). */
  body?: string;
  /** Search phrases specific to this page (put before the site-wide ones). */
  kw?: string[];
  /** Extra schema.org objects for this page. */
  ld?: object[];
  priority: number;
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const strip = (s: string) => s.replace(/<[^>]+>/g, '');
const ul = (items: string[]) => `<ul>${items.map(i => `<li>${i}</li>`).join('')}</ul>`;
const link = (path: string, text: string) => `<a href="/${path}">${esc(text)}</a>`;
const faqHtml = (qa: string[][]) => qa.map(([q, a]) => `<h3>${esc(q)}</h3><p>${esc(a)}</p>`).join('');
const faqLd = (qa: string[][]) => ({
  '@context': 'https://schema.org', '@type': 'FAQPage',
  mainEntity: qa.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
});
/** Points at the AutoRepair business described in index.html. */
const BUSINESS = { '@id': `${DOMAIN}/#business` };
const top = (key: string, path: string, priority: number, extra: Partial<Page> = {}): Page =>
  ({ path, title: `${pages[key][0]} | ${site}`, desc: pages[key][1], name: pages[key][0], priority, ...extra });

/** Arabic model names, the way people type them in search. */
const MODEL_AR: Record<string, string> = {
  Sunny: 'صني', Sentra: 'سنترا', Qashqai: 'قشقاي', 'X-Trail': 'إكس تريل', Juke: 'جوك', Tiida: 'تيدا', Patrol: 'باترول', Kicks: 'كيكس', Magnite: 'ماجنايت',
};
const arName = (name: string) => MODEL_AR[name] ?? name;

const allFaq = (AR.faq.groups as { items: string[][] }[]).flatMap(g => g.items);
const serviceLinks = ul(AR.services.map(s => `${link(`services/${s.slug}`, `${s.t} نيسان`)} — ${esc(s.d)}`));
const modelLinks = ul(CAR_MODELS.map(m => `${link(`models/${m.slug}`, `صيانة نيسان ${arName(m.name)} (${m.name})`)} — ${esc(m.tagline.ar)}`));

const routes: Page[] = [
  {
    path: '', title: AR.meta.title, desc: AR.meta.desc, name: site, priority: 1,
    body: `<h2>خدمات صيانة نيسان</h2>${serviceLinks}<h2>موديلات نيسان اللي بنصلّحها</h2>${modelLinks}` +
      `<h2>العنوان ومواعيد العمل</h2><p>${esc(AR.top.addr)}</p><p>${esc(AR.top.hours)}</p>`,
  },
  top('services', 'services', 0.9, { body: serviceLinks }),
  top('book', 'book', 0.9),
  top('products', 'products', 0.8, { body: ul(PRODUCTS.map(p => `${link(`products/${p.slug}`, p.name.ar)} — ${p.price} ج.م`)) }),
  top('offers', 'offers', 0.8),
  top('calc', 'maintenance-calculator', 0.7),
  top('estimate', 'estimate', 0.7),
  top('track', 'track', 0.3),
  top('models', 'models', 0.8, { body: modelLinks }),
  top('faq', 'faq', 0.7, { body: faqHtml(allFaq), ld: [faqLd(allFaq)] }),
  top('reviews', 'reviews', 0.6),
  top('gallery', 'gallery', 0.5),
  top('tips', 'tips', 0.7, { body: ul(TIPS.map(t => `${link(`tips/${t.slug}`, t.title.ar)} — ${esc(t.excerpt.ar)}`)) }),
  top('about', 'about', 0.6),
  top('contact', 'contact', 0.8, {
    body: `<p>${esc(AR.top.addr)}</p><p>تليفون وواتساب: <a href="tel:+201080941711">01080941711</a></p><p>${esc(AR.top.hours)}</p>`,
  }),

  ...AR.services.map((s): Page => ({
    path: `services/${s.slug}`, parent: 'services', name: s.t, priority: 0.8,
    title: `${s.t} نيسان في فيصل | ${site}`, desc: s.d,
    kw: [`${s.t} نيسان`, `صيانة ${s.t} نيسان`, `${s.t} نيسان فيصل`, `${s.t} نيسان الجيزة`, `أسعار ${s.t} نيسان`, `مركز ${s.t} نيسان`],
    body: `<p>${esc(s.long)}</p><h2>الخدمة بتشمل</h2>${ul(s.includes.map(esc))}<h2>أسئلة شائعة</h2>${faqHtml(s.faq)}`,
    ld: [
      {
        '@context': 'https://schema.org', '@type': 'Service', name: `${s.t} نيسان`, description: s.d, serviceType: s.t,
        provider: BUSINESS, areaServed: 'الجيزة', url: `${DOMAIN}/services/${s.slug}`,
      },
      faqLd(s.faq),
    ],
  })),

  ...PRODUCTS.map((p): Page => ({
    path: `products/${p.slug}`, parent: 'products', name: p.name.ar, priority: 0.6,
    title: `${p.name.ar} | ${site}`, desc: p.desc.ar,
    kw: [p.name.ar, p.name.en, `سعر ${p.name.ar}`, `${p.brand} نيسان`, ...p.models.slice(0, 4).map(m => `قطع غيار نيسان ${arName(m)}`)],
    body: `<p>${esc(p.desc.ar)}</p><p>السعر: ${p.price} ج.م — ${esc(p.brand)}</p><p>مناسب لـ: ${esc(p.models.map(m => `نيسان ${arName(m)}`).join('، '))}</p>`,
    ld: [{
      '@context': 'https://schema.org', '@type': 'Product', name: p.name.ar, description: p.desc.ar,
      brand: { '@type': 'Brand', name: p.brand }, image: `${DOMAIN}/logo.jpg`,
      offers: {
        '@type': 'Offer', price: p.price, priceCurrency: 'EGP', url: `${DOMAIN}/products/${p.slug}`,
        availability: `https://schema.org/${p.inStock ? 'InStock' : 'OutOfStock'}`, seller: BUSINESS,
      },
    }],
  })),

  ...CAR_MODELS.map((m): Page => ({
    path: `models/${m.slug}`, parent: 'models', name: `نيسان ${arName(m.name)}`, priority: 0.7,
    title: `صيانة نيسان ${arName(m.name)} (Nissan ${m.name}) — أعطال وقطع غيار | ${site}`, desc: m.tagline.ar,
    kw: [`صيانة نيسان ${arName(m.name)}`, `صيانة ${arName(m.name)}`, `أعطال نيسان ${arName(m.name)}`, `قطع غيار نيسان ${arName(m.name)}`, `مركز صيانة نيسان ${arName(m.name)}`,
      `عيوب نيسان ${arName(m.name)}`, `Nissan ${m.name} service`, `Nissan ${m.name} maintenance`],
    body: `<p>${esc(m.tagline.ar)}</p><p>${esc(m.years)} — ${esc(m.engine)} — ${esc(m.gearbox.ar)}</p>` +
      `<h2>الأعطال الشائعة في نيسان ${esc(arName(m.name))} (${esc(m.name)})</h2>${m.issues.map(i => `<h3>${esc(i.title.ar)}</h3><p>${esc(i.desc.ar)}</p>`).join('')}`,
  })),

  ...TIPS.map((t): Page => ({
    path: `tips/${t.slug}`, parent: 'tips', name: t.title.ar, priority: 0.5,
    title: `${t.title.ar} | ${site}`, desc: t.excerpt.ar,
    kw: [t.title.ar, 'نصايح صيانة نيسان', 'صيانة عربيات نيسان'],
    body: `<p>${esc(t.excerpt.ar)}</p>${t.sections.map(x => `<h2>${esc(x.h.ar)}</h2><p>${esc(x.p.ar)}</p>`).join('')}${ul(t.points.map(x => esc(x.ar)))}`,
    ld: [{
      '@context': 'https://schema.org', '@type': 'Article', headline: t.title.ar, description: t.excerpt.ar,
      datePublished: t.date, inLanguage: 'ar', image: `${DOMAIN}/logo.jpg`,
      author: { '@type': 'Organization', name: site }, publisher: BUSINESS, mainEntityOfPage: `${DOMAIN}/tips/${t.slug}`,
    }],
  })),
];

const byPath = new Map(routes.map(r => [r.path, r]));
const setAttr = (html: string, attr: string, key: string, value: string) =>
  html.replace(new RegExp(`(<meta ${attr}="${key}" content=")[^"]*(")`), (_, a, b) => a + esc(value) + b);
const ldTag = (o: object) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`;

/** Main links offered to crawlers on every page. */
const NAV = `<nav>${[['', site], ['services', 'خدمات صيانة نيسان'], ['book', 'احجز موعد صيانة'], ['products', 'قطع غيار نيسان'],
  ['offers', 'عروض الصيانة'], ['models', 'موديلات نيسان'], ['tips', 'نصايح الصيانة'], ['faq', 'أسئلة شائعة'], ['contact', 'العنوان والتليفون']]
  .map(([p, t]) => link(p, t)).join(' · ')}</nav>`;

for (const r of routes) {
  const url = `${DOMAIN}/${r.path}`;
  let html = shell.replace(/<title>[^<]*<\/title>/, () => `<title>${esc(r.title)}</title>`);
  html = setAttr(html, 'name', 'description', r.desc);
  html = setAttr(html, 'property', 'og:title', r.title);
  html = setAttr(html, 'property', 'og:description', r.desc);
  html = setAttr(html, 'property', 'og:url', url);
  html = setAttr(html, 'name', 'twitter:title', r.title);
  html = setAttr(html, 'name', 'twitter:description', r.desc);
  html = html.replace(/(<link rel="canonical" href=")[^"]*(")/, (_, a, b) => a + url + b);
  if (r.kw) html = setAttr(html, 'name', 'keywords', [...r.kw, ...AR.meta.keywords.split(', ').slice(0, 12)].join(', '));

  // breadcrumbs: Home > section > page
  const trail = [byPath.get('')!, ...(r.parent ? [byPath.get(r.parent)!] : []), ...(r.path ? [r] : [])];
  const ld: object[] = [...(r.ld ?? [])];
  if (trail.length > 1) ld.push({
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: trail.map((t, n) => ({ '@type': 'ListItem', position: n + 1, name: t.name, item: `${DOMAIN}/${t.path}` })),
  });
  html = html.replace('</head>', () => `${ld.map(ldTag).join('\n')}\n</head>`);

  // Plain-text copy of the page for crawlers that don't run JavaScript. It sits inside <app-root>, so the
  // app replaces it the moment it starts; it's kept out of sight until then so visitors don't see a flash.
  const h1 = r.path ? strip(r.title.split(' | ')[0]) : `مركز صيانة نيسان في فيصل والجيزة — ${site}`;
  const text = `<div id="seo-static" style="position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)">` +
    `<h1>${esc(h1)}</h1><p>${esc(r.desc)}</p>${r.body ?? ''}${NAV}</div>`;
  html = html.replace(/<app-root><\/app-root>/, () => `<app-root>${text}</app-root>`);

  const out = join(dist, r.path, 'index.html');
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, html);
}

const today = new Date().toISOString().slice(0, 10);
writeFileSync(join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  routes.map(r => `  <url><loc>${DOMAIN}/${r.path}</loc><lastmod>${today}</lastmod><priority>${r.priority.toFixed(1)}</priority></url>`).join('\n') +
  `\n</urlset>\n`);

console.log(`prerender-meta: wrote ${routes.length} pages + sitemap.xml for ${DOMAIN}`);
