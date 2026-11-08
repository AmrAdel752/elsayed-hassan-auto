/**
 * Simplified Nissan maintenance schedule used by the calculator.
 * A general guide only — the center confirms the exact items per car.
 */
import type { Tr } from './catalog';

export interface MaintItem {
  id: string; icon: string; name: Tr;
  /** Interval in km under normal driving. */
  every: number;
  /** Shorter interval under severe driving (city traffic, heat, dust). */
  severe?: number;
  cvtOnly?: boolean;
}

/** Models that commonly ship with a CVT gearbox in Egypt. */
export const CVT_MODELS = ['Sentra', 'Qashqai', 'X-Trail', 'Juke', 'Kicks', 'Magnite'];

export const MAINT_ITEMS: MaintItem[] = [
  { id: 'oil', icon: 'oil', every: 10000, severe: 5000, name: { ar: 'تغيير زيت الموتور', en: 'Engine oil change' } },
  { id: 'oil-filter', icon: 'parts', every: 10000, severe: 5000, name: { ar: 'فلتر الزيت', en: 'Oil filter' } },
  { id: 'inspection', icon: 'cpu', every: 10000, severe: 5000, name: { ar: 'فحص شامل 30 نقطة', en: '30-point inspection' } },
  { id: 'tires', icon: 'susp', every: 10000, name: { ar: 'تبديل الكاوتش وترصيص', en: 'Tire rotation & balancing' } },
  { id: 'air-filter', icon: 'parts', every: 20000, name: { ar: 'فلتر هوا الموتور', en: 'Engine air filter' } },
  { id: 'cabin-filter', icon: 'ac', every: 20000, name: { ar: 'فلتر التكييف', en: 'Cabin (A/C) filter' } },
  { id: 'brakes', icon: 'shield', every: 20000, name: { ar: 'فحص الفرامل والتيل', en: 'Brake & pad inspection' } },
  { id: 'brake-fluid', icon: 'oil', every: 40000, name: { ar: 'تغيير زيت الفرامل', en: 'Brake fluid replacement' } },
  { id: 'spark-plugs', icon: 'cpu', every: 40000, name: { ar: 'تغيير البوجيهات', en: 'Spark plugs' } },
  { id: 'fuel-filter', icon: 'parts', every: 40000, name: { ar: 'فلتر البنزين', en: 'Fuel filter' } },
  { id: 'cvt', icon: 'engine', every: 60000, cvtOnly: true, name: { ar: 'تغيير زيت الفتيس CVT', en: 'CVT fluid change' } },
  { id: 'coolant', icon: 'ac', every: 60000, name: { ar: 'تغيير مياه الردياتير', en: 'Coolant replacement' } },
  { id: 'belt', icon: 'engine', every: 100000, name: { ar: 'تغيير سير المجموعة', en: 'Drive belt replacement' } },
];

export function intervalFor(item: MaintItem, severe: boolean) {
  return severe && item.severe ? item.severe : item.every;
}

/** Items due at a given milestone (km) for a model. */
export function dueAt(km: number, model: string, severe: boolean) {
  const cvt = CVT_MODELS.includes(model);
  return MAINT_ITEMS.filter(i => (!i.cvtOnly || cvt) && km % intervalFor(i, severe) === 0);
}
