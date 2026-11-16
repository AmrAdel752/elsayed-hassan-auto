/**
 * Exports the static catalog (src/app/data/catalog.ts) as the API's seed file.
 * Run from frontend/:  node scripts/export-seed.mts
 * The API inserts it on first start when the catalog tables are empty (CatalogSeeder).
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { CATEGORIES, PRODUCTS, OFFERS } from '../src/app/data/catalog.ts';
import { REVIEWS } from '../src/app/data/reviews.ts';
import { GALLERY, BEFORE_AFTER } from '../src/app/data/gallery.ts';

const dir = '../backend/ElSayedHassan.Api/Data/Seed';
mkdirSync(dir, { recursive: true });
writeFileSync(`${dir}/catalog.json`, JSON.stringify({ categories: CATEGORIES, products: PRODUCTS, offers: OFFERS, reviews: REVIEWS, gallery: GALLERY, beforeAfter: BEFORE_AFTER }, null, 2) + '\n');
console.log(`catalog.json: ${CATEGORIES.length} categories, ${PRODUCTS.length} products, ${OFFERS.length} offers, ${REVIEWS.length} reviews, ${GALLERY.length} gallery tiles, ${BEFORE_AFTER.length} before/after`);
