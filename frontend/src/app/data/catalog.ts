/**
 * Static catalog data — placeholder until the .NET API and dashboard exist.
 * Prices are sample values in EGP.
 */
export interface Tr { ar: string; en: string; }

export interface Category { id: string; icon: string; name: Tr; }

export interface Product {
  slug: string; cat: string; icon: string; brand: string;
  name: Tr; desc: Tr;
  price: number; oldPrice?: number;
  models: string[]; inStock: boolean; featured?: boolean; badge?: Tr;
}

export interface Offer {
  id: string; icon: string; title: Tr; desc: Tr;
  discount: Tr; price?: number; oldPrice?: number;
  endsAt: string; service?: string; includes: Tr[];
}

export const CATEGORIES: Category[] = [
  { id: 'oils', icon: 'oil', name: { ar: 'زيوت', en: 'Oils' } },
  { id: 'filters', icon: 'parts', name: { ar: 'فلاتر', en: 'Filters' } },
  { id: 'brakes', icon: 'susp', name: { ar: 'فرامل', en: 'Brakes' } },
  { id: 'suspension', icon: 'car', name: { ar: 'عفشة', en: 'Suspension' } },
  { id: 'ac', icon: 'ac', name: { ar: 'تكييف', en: 'A/C' } },
  { id: 'electrical', icon: 'cpu', name: { ar: 'كهربا', en: 'Electrical' } },
];

const ALL = ['Sunny', 'Sentra', 'Qashqai', 'X-Trail', 'Juke', 'Tiida', 'Patrol', 'Kicks'];

export const PRODUCTS: Product[] = [
  { slug: 'nissan-5w30-4l', cat: 'oils', icon: 'oil', brand: 'Nissan Genuine', price: 1450, oldPrice: 1650, models: ALL, inStock: true, featured: true,
    name: { ar: 'زيت نيسان أصلي 5W-30 — 4 لتر', en: 'Nissan Genuine Oil 5W-30 — 4L' },
    desc: { ar: 'زيت تخليقي كامل أصلي من نيسان، بيحمي الموتور ويقلل الاحتكاك ويوفر في البنزين.', en: 'Fully synthetic genuine Nissan oil that protects the engine, reduces friction and saves fuel.' },
    badge: { ar: 'الأكثر طلباً', en: 'Best seller' } },
  { slug: 'nissan-cvt-ns3', cat: 'oils', icon: 'oil', brand: 'Nissan Genuine', price: 980, models: ['Sentra', 'Qashqai', 'X-Trail', 'Juke', 'Kicks'], inStock: true, featured: true,
    name: { ar: 'زيت فتيس CVT NS-3 — 1 لتر', en: 'CVT Fluid NS-3 — 1L' },
    desc: { ar: 'زيت فتيس CVT الأصلي المخصص لفتيسات نيسان الأوتوماتيك.', en: 'Genuine CVT fluid made for Nissan automatic CVT gearboxes.' } },
  { slug: 'mobil-10w40-4l', cat: 'oils', icon: 'oil', brand: 'Mobil', price: 1100, models: ALL, inStock: true,
    name: { ar: 'زيت موبيل 10W-40 — 4 لتر', en: 'Mobil 10W-40 — 4L' },
    desc: { ar: 'زيت نص تخليقي مناسب للعربيات اللي عدت 100 ألف كم.', en: 'Semi-synthetic oil suited for cars above 100,000 km.' } },
  { slug: 'oil-filter-sunny', cat: 'filters', icon: 'parts', brand: 'Nissan Genuine', price: 220, oldPrice: 260, models: ['Sunny', 'Tiida', 'Sentra'], inStock: true, featured: true,
    name: { ar: 'فلتر زيت أصلي', en: 'Genuine Oil Filter' },
    desc: { ar: 'فلتر زيت نيسان الأصلي لموتورات 1.5 و1.6.', en: 'Genuine Nissan oil filter for 1.5 and 1.6 engines.' } },
  { slug: 'air-filter-qashqai', cat: 'filters', icon: 'parts', brand: 'Nissan Genuine', price: 380, models: ['Qashqai', 'X-Trail', 'Juke'], inStock: true,
    name: { ar: 'فلتر هوا موتور', en: 'Engine Air Filter' },
    desc: { ar: 'فلتر هوا أصلي بيحافظ على أداء الموتور واستهلاك البنزين.', en: 'Genuine air filter that keeps engine performance and fuel economy.' } },
  { slug: 'cabin-filter', cat: 'filters', icon: 'ac', brand: 'Bosch', price: 290, models: ALL, inStock: true, featured: true,
    name: { ar: 'فلتر تكييف كربون', en: 'Carbon Cabin Filter' },
    desc: { ar: 'فلتر تكييف كربون بيمنع التراب والريحة جوه العربية.', en: 'Carbon cabin filter that blocks dust and odors.' } },
  { slug: 'front-pads-sunny', cat: 'brakes', icon: 'susp', brand: 'Nissan Genuine', price: 950, oldPrice: 1150, models: ['Sunny', 'Tiida'], inStock: true, featured: true,
    name: { ar: 'تيل فرامل أمامي أصلي', en: 'Genuine Front Brake Pads' },
    desc: { ar: 'طقم تيل فرامل أمامي أصلي بيوقف بثبات ومن غير صوت.', en: 'Genuine front brake pad set for quiet, confident stopping.' },
    badge: { ar: 'خصم', en: 'Sale' } },
  { slug: 'brake-discs-qashqai', cat: 'brakes', icon: 'susp', brand: 'Brembo', price: 2800, models: ['Qashqai', 'X-Trail'], inStock: false,
    name: { ar: 'طقم طنابير أمامي', en: 'Front Brake Discs (pair)' },
    desc: { ar: 'طنابير فرامل عالية الجودة بتتحمل الحرارة.', en: 'High-quality, heat-resistant brake discs.' } },
  { slug: 'shocks-sunny', cat: 'suspension', icon: 'car', brand: 'KYB', price: 3200, models: ['Sunny', 'Tiida'], inStock: true, featured: true,
    name: { ar: 'طقم مساعدين أمامي', en: 'Front Shock Absorbers (pair)' },
    desc: { ar: 'مساعدين KYB يابانية بتدي ثبات وراحة في المطبات.', en: 'Japanese KYB shocks for stability and comfort over bumps.' } },
  { slug: 'control-arm-sentra', cat: 'suspension', icon: 'car', brand: 'Nissan Genuine', price: 1850, models: ['Sentra'], inStock: true,
    name: { ar: 'مقص أمامي', en: 'Front Control Arm' },
    desc: { ar: 'مقص أمامي أصلي بالجلب.', en: 'Genuine front control arm with bushings.' } },
  { slug: 'ac-compressor', cat: 'ac', icon: 'ac', brand: 'Denso', price: 9500, models: ['Sunny', 'Sentra', 'Tiida'], inStock: true,
    name: { ar: 'كمبروسر تكييف', en: 'A/C Compressor' },
    desc: { ar: 'كمبروسر تكييف Denso بنفس مواصفات الأصلي.', en: 'Denso A/C compressor matching OEM specs.' } },
  { slug: 'spark-plugs-iridium', cat: 'electrical', icon: 'cpu', brand: 'NGK', price: 1200, oldPrice: 1400, models: ALL, inStock: true, featured: true,
    name: { ar: 'طقم بوجيهات إريديوم', en: 'Iridium Spark Plugs (set of 4)' },
    desc: { ar: 'بوجيهات NGK إريديوم بتعيش أطول وبتحسن الاشتعال.', en: 'NGK iridium plugs that last longer and improve ignition.' } },
  { slug: 'battery-70ah', cat: 'electrical', icon: 'cpu', brand: 'Varta', price: 4200, models: ALL, inStock: true, featured: true,
    name: { ar: 'بطارية 70 أمبير', en: 'Battery 70Ah' },
    desc: { ar: 'بطارية Varta بضمان سنة.', en: 'Varta battery with a 1-year warranty.' } },
];

export const OFFERS: Offer[] = [
  { id: 'oil-package', icon: 'oil', service: 'oils', price: 1599, oldPrice: 1950, endsAt: '2026-11-30T22:00:00+02:00',
    title: { ar: 'باكدج تغيير الزيت الكامل', en: 'Full Oil Change Package' },
    desc: { ar: 'زيت نيسان أصلي + فلتر + فحص 30 نقطة مجاناً.', en: 'Genuine Nissan oil + filter + free 30-point check.' },
    discount: { ar: 'وفّر 18%', en: 'Save 18%' },
    includes: [{ ar: 'زيت نيسان 5W-30 أصلي', en: 'Genuine Nissan 5W-30 oil' }, { ar: 'فلتر زيت أصلي', en: 'Genuine oil filter' }, { ar: 'فحص شامل 30 نقطة', en: '30-point inspection' }] },
  { id: 'ac-check', icon: 'ac', service: 'ac', endsAt: '2026-11-20T22:00:00+02:00',
    title: { ar: 'فحص التكييف مجاناً', en: 'Free A/C Check' },
    desc: { ar: 'كشف تسريب وقياس ضغط الفريون من غير أي تكلفة.', en: 'Leak detection and refrigerant pressure test at no cost.' },
    discount: { ar: 'مجاناً', en: 'Free' },
    includes: [{ ar: 'كشف تسريب بالجهاز', en: 'Leak detection' }, { ar: 'قياس ضغط الفريون', en: 'Pressure test' }, { ar: 'تقرير بحالة التكييف', en: 'A/C condition report' }] },
  { id: 'suspension', icon: 'susp', service: 'suspension', endsAt: '2026-12-15T22:00:00+02:00',
    title: { ar: 'خصم 20% على شغل العفشة', en: '20% Off Suspension Work' },
    desc: { ar: 'على المصنعية مع ضبط زوايا مجاني.', en: 'On labor, plus free wheel alignment.' },
    discount: { ar: '20%-', en: '-20%' },
    includes: [{ ar: 'فحص العفشة على الرافعة', en: 'Lift inspection' }, { ar: 'خصم 20% على المصنعية', en: '20% off labor' }, { ar: 'ضبط زوايا مجاني', en: 'Free alignment' }] },
];
