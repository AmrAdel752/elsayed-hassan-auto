/**
 * Gallery items — placeholders until the center sends real photos.
 * Set `img` (and `before`/`after` for comparisons) to real image paths in /public to replace the drawn tiles.
 */
import type { Tr } from './catalog';

export type GalleryCat = 'workshop' | 'work' | 'cars';

export interface GalleryItem { id: number; cat: GalleryCat; icon: string; tall?: boolean; title: Tr; img?: string; }

export interface BeforeAfter { id: number; icon: string; title: Tr; desc: Tr; before?: string; after?: string; }

const T = (ar: string, en: string): Tr => ({ ar, en });

export const GALLERY: GalleryItem[] = [
  { id: 1, cat: 'workshop', icon: 'car', tall: true, title: T('صالة الاستقبال والورشة', 'Reception and workshop floor') },
  { id: 2, cat: 'work', icon: 'cpu', title: T('فحص كمبيوتر لموتور قشقاي', 'Computer diagnosis on a Qashqai') },
  { id: 3, cat: 'work', icon: 'susp', title: T('تغيير مساعدين صني', 'Sunny shock replacement') },
  { id: 4, cat: 'cars', icon: 'car', title: T('نيسان سنترا بعد الصيانة', 'Nissan Sentra after service') },
  { id: 5, cat: 'workshop', icon: 'engine', title: T('روافع هيدروليك', 'Hydraulic lifts') },
  { id: 6, cat: 'work', icon: 'ac', tall: true, title: T('شحن فريون وكشف تسريب', 'A/C recharge and leak test') },
  { id: 7, cat: 'cars', icon: 'car', tall: true, title: T('إكس تريل جاهزة للتسليم', 'X-Trail ready for pickup') },
  { id: 8, cat: 'work', icon: 'oil', title: T('تغيير زيت فتيس CVT', 'CVT fluid exchange') },
  { id: 9, cat: 'workshop', icon: 'parts', title: T('مخزن قطع الغيار', 'Spare parts store') },
  { id: 10, cat: 'work', icon: 'engine', title: T('عَمرة موتور', 'Engine overhaul') },
  { id: 11, cat: 'cars', icon: 'car', title: T('باترول في الورشة', 'Patrol in the workshop') },
  { id: 12, cat: 'workshop', icon: 'shield', title: T('منطقة فحص الجودة', 'Quality check area') },
];

export const BEFORE_AFTER: BeforeAfter[] = [
  { id: 1, icon: 'engine', title: T('تنظيف وصيانة الموتور', 'Engine cleaning & service'), desc: T('موتور سنترا قبل وبعد التنظيف وتغيير الحساسات.', 'A Sentra engine before and after cleaning and sensor replacement.') },
  { id: 2, icon: 'susp', title: T('تجديد العفشة الأمامية', 'Front suspension renewal'), desc: T('مقصات وجلب ومساعدين جداد لعربية صني.', 'New control arms, bushings and shocks on a Sunny.') },
  { id: 3, icon: 'parts', title: T('تغيير طنابير وتيل الفرامل', 'Brake discs & pads'), desc: T('طنابير مستهلكة اتغيرت بطقم جديد.', 'Worn discs replaced with a new set.') },
];
