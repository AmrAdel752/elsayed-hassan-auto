/**
 * Sample price ranges (EGP, parts + labor) for the estimate tool.
 * Placeholder values until the center's real price list comes from the dashboard.
 */
import type { Tr } from './catalog';

export interface Job { id: string; service: string; name: Tr; min: number; max: number; }

const T = (ar: string, en: string): Tr => ({ ar, en });

export const JOBS: Job[] = [
  { id: 'diag', service: 'mechanics', name: T('فحص كمبيوتر', 'Computer diagnosis'), min: 300, max: 500 },
  { id: 'throttle', service: 'mechanics', name: T('تنظيف ثروتل', 'Throttle body cleaning'), min: 350, max: 600 },
  { id: 'coil', service: 'mechanics', name: T('تغيير موبينة', 'Ignition coil replacement'), min: 900, max: 1800 },
  { id: 'cvt-service', service: 'mechanics', name: T('صيانة فتيس CVT', 'CVT gearbox service'), min: 2500, max: 4500 },
  { id: 'service-10k', service: 'maintenance', name: T('صيانة 10,000 كم', '10,000 km service'), min: 1600, max: 2400 },
  { id: 'service-40k', service: 'maintenance', name: T('صيانة 40,000 كم', '40,000 km service'), min: 3500, max: 5500 },
  { id: 'plugs', service: 'maintenance', name: T('تغيير بوجيهات', 'Spark plugs'), min: 800, max: 1600 },
  { id: 'pads', service: 'suspension', name: T('تيل فرامل أمامي', 'Front brake pads'), min: 1100, max: 1800 },
  { id: 'shocks', service: 'suspension', name: T('مساعدين أمامي (زوج)', 'Front shocks (pair)'), min: 3200, max: 5500 },
  { id: 'arms', service: 'suspension', name: T('مقصات وجلب', 'Control arms & bushings'), min: 1800, max: 3500 },
  { id: 'align', service: 'suspension', name: T('ضبط زوايا وترصيص', 'Alignment & balancing'), min: 300, max: 500 },
  { id: 'ac-gas', service: 'ac', name: T('شحن فريون', 'Refrigerant recharge'), min: 600, max: 900 },
  { id: 'ac-leak', service: 'ac', name: T('كشف وإصلاح تسريب', 'Leak detection & repair'), min: 800, max: 2000 },
  { id: 'ac-comp', service: 'ac', name: T('تغيير كمبروسر', 'Compressor replacement'), min: 8000, max: 12000 },
  { id: 'oil', service: 'oils', name: T('تغيير زيت + فلتر', 'Oil + filter change'), min: 1200, max: 1900 },
  { id: 'cvt-oil', service: 'oils', name: T('تغيير زيت فتيس CVT', 'CVT fluid change'), min: 2200, max: 3200 },
  { id: 'coolant', service: 'oils', name: T('تغيير مياه ردياتير', 'Coolant change'), min: 450, max: 750 },
];

/** Bigger cars cost more in parts and labor. */
export const MODEL_FACTOR: Record<string, number> = {
  Sunny: 1, Tiida: 1, Sentra: 1.15, Juke: 1.15, Kicks: 1.1, Qashqai: 1.3, 'X-Trail': 1.35, Patrol: 1.8, Magnite: 1.05,
};

/** Approved alternative parts are cheaper than genuine. */
export const ALT_FACTOR = 0.78;

/** Rounds to the nearest 50 EGP for friendlier numbers. */
export const round50 = (n: number) => Math.round(n / 50) * 50;
