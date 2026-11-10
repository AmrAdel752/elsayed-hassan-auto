/**
 * Exports the static catalog (src/app/data/catalog.ts) as the API's seed file.
 * Run from frontend/:  node scripts/export-seed.mts
 * The API inserts it on first start when the catalog tables are empty (CatalogSeeder).
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { CATEGORIES, PRODUCTS, OFFERS } from '../src/app/data/catalog.ts';

const dir = '../backend/ElSayedHassan.Api/Data/Seed';
mkdirSync(dir, { recursive: true });
writeFileSync(`${dir}/catalog.json`, JSON.stringify({ categories: CATEGORIES, products: PRODUCTS, offers: OFFERS }, null, 2) + '\n');
console.log(`catalog.json: ${CATEGORIES.length} categories, ${PRODUCTS.length} products, ${OFFERS.length} offers`);
