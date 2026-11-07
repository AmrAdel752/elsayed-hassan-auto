/** Nissan models the center services — static until the API exists. */
import type { Tr } from './catalog';

export interface Issue { title: Tr; desc: Tr; service: string; }

export interface CarModel {
  slug: string; name: string; type: Tr; years: string; engine: string; gearbox: Tr;
  tagline: Tr; issues: Issue[];
}

const T = (ar: string, en: string): Tr => ({ ar, en });
const SEDAN = T('سيدان', 'Sedan'), SUV = T('SUV / كروس أوفر', 'SUV / Crossover'), HATCH = T('هاتشباك', 'Hatchback');

const CVT_ISSUE: Issue = { service: 'mechanics', title: T('رعشة أو تأخير في فتيس CVT', 'CVT judder or delay'), desc: T('غالباً من زيت الفتيس القديم أو محتاج برمجة — بنفحصه بالكمبيوتر قبل أي تغيير.', 'Usually old CVT fluid or a needed relearn — we check it by computer before replacing anything.') };
const AC_ISSUE: Issue = { service: 'ac', title: T('ضعف التكييف في الصيف', 'Weak A/C in summer'), desc: T('تسريب فريون أو كمبروسر أو مروحة — بنكشف التسريب بجهاز.', 'A refrigerant leak, compressor or fan — we detect leaks with equipment.') };
const SUSP_ISSUE: Issue = { service: 'suspension', title: T('صوت تخبيط في العفشة', 'Suspension knocking'), desc: T('جلب المقصات أو المساعدين — بنحدد القطعة بالظبط على الرافعة.', 'Control-arm bushings or shocks — we pinpoint the part on the lift.') };
const IDLE_ISSUE: Issue = { service: 'maintenance', title: T('رعشة في السلانسيه', 'Rough idle'), desc: T('ثروتل محتاج تنظيف أو بوجيهات وموبينة.', 'Dirty throttle body, spark plugs or ignition coil.') };

export const CAR_MODELS: CarModel[] = [
  { slug: 'sunny', name: 'Sunny', type: SEDAN, years: '2011 — 2026', engine: '1.5L', gearbox: T('عادي / أوتوماتيك', 'Manual / Automatic'),
    tagline: T('العربية الأكثر انتشاراً في مصر — وإحنا عارفينها حتة حتة.', 'Egypt\'s most popular sedan — and we know every part of it.'),
    issues: [SUSP_ISSUE, AC_ISSUE, IDLE_ISSUE] },
  { slug: 'sentra', name: 'Sentra', type: SEDAN, years: '2013 — 2026', engine: '1.6L / 2.0L', gearbox: T('CVT', 'CVT'),
    tagline: T('سيدان عملية ومريحة — محتاجة عناية خاصة بفتيس الـ CVT.', 'A comfortable, practical sedan — its CVT needs special care.'),
    issues: [CVT_ISSUE, AC_ISSUE, SUSP_ISSUE] },
  { slug: 'qashqai', name: 'Qashqai', type: SUV, years: '2014 — 2026', engine: '1.2T / 1.3T / 2.0L', gearbox: T('CVT', 'CVT'),
    tagline: T('كروس أوفر عائلي قوي — بنحافظ على أداء موتوره وفتيسه.', 'A strong family crossover — we keep its engine and gearbox at their best.'),
    issues: [CVT_ISSUE, SUSP_ISSUE, IDLE_ISSUE] },
  { slug: 'x-trail', name: 'X-Trail', type: SUV, years: '2014 — 2026', engine: '2.5L', gearbox: T('CVT', 'CVT'),
    tagline: T('SUV عائلي كبير — شغله محتاج خبرة في العفشة والفتيس.', 'A big family SUV — it needs suspension and gearbox expertise.'),
    issues: [CVT_ISSUE, SUSP_ISSUE, AC_ISSUE] },
  { slug: 'juke', name: 'Juke', type: SUV, years: '2012 — 2026', engine: '1.6L / 1.6T', gearbox: T('CVT', 'CVT'),
    tagline: T('شكل رياضي مميز — وموتور محتاج صيانة في ميعادها.', 'A distinctive sporty look — with an engine that needs on-time service.'),
    issues: [CVT_ISSUE, IDLE_ISSUE, AC_ISSUE] },
  { slug: 'tiida', name: 'Tiida', type: HATCH, years: '2008 — 2018', engine: '1.6L', gearbox: T('عادي / أوتوماتيك', 'Manual / Automatic'),
    tagline: T('عربية اقتصادية وعمرها طويل لو اتصانت صح.', 'Economical and long-lasting when serviced right.'),
    issues: [SUSP_ISSUE, IDLE_ISSUE, AC_ISSUE] },
  { slug: 'patrol', name: 'Patrol', type: SUV, years: '2010 — 2026', engine: '4.0L / 5.6L V8', gearbox: T('أوتوماتيك', 'Automatic'),
    tagline: T('ملك الطرق الصعبة — بنتعامل مع موتوره الكبير بخبرة.', 'King of rough roads — we handle its big engine with expertise.'),
    issues: [SUSP_ISSUE, AC_ISSUE, IDLE_ISSUE] },
  { slug: 'kicks', name: 'Kicks', type: SUV, years: '2017 — 2026', engine: '1.5L / 1.6L', gearbox: T('CVT', 'CVT'),
    tagline: T('كروس أوفر عملي للمدينة — اقتصادي ومريح.', 'A practical city crossover — economical and comfortable.'),
    issues: [CVT_ISSUE, AC_ISSUE, SUSP_ISSUE] },
];
