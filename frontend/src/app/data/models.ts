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

/** Arabic model names, the way people type them in search ("صيانة نيسان صني"). */
export const MODEL_AR: Record<string, string> = {
  Sunny: 'صني', Sentra: 'سنترا', Qashqai: 'قشقاي', 'X-Trail': 'إكس تريل', Juke: 'جوك', Tiida: 'تيدا', Patrol: 'باترول', Kicks: 'كيكس', Magnite: 'ماجنايت',
  Navara: 'نافارا', Pathfinder: 'باثفايندر', Altima: 'ألتيما', Maxima: 'ماكسيما', Murano: 'مورانو',
};

/** Other ways people spell the model name in search (for the page keywords). */
export const MODEL_ALT: Record<string, string[]> = {
  Sunny: ['صنى', 'صاني'], Sentra: ['سينترا'], Qashqai: ['كاشكاي', 'قاشقاي'], 'X-Trail': ['اكس تريل', 'اكستريل', 'إكستريل'],
  Juke: ['جوك نيسان'], Tiida: ['تيدا نيسان', 'تييدا'], Patrol: ['باترول نيسان'], Kicks: ['كيكس نيسان'], Magnite: ['ماجنيت', 'ماجنايت'],
  Navara: ['نافارا نيسان', 'نيسان دبل كابينة'], Pathfinder: ['باث فايندر'], Altima: ['التيما'], Maxima: ['ماكسيما نيسان'], Murano: ['مورانو نيسان'],
};

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
  { slug: 'magnite', name: 'Magnite', type: SUV, years: '2021 — 2026', engine: '1.0L / 1.0T', gearbox: T('عادي / CVT', 'Manual / CVT'),
    tagline: T('أصغر SUV من نيسان — اقتصادي، وموتوره التيربو محتاج زيت مظبوط في ميعاده.', 'Nissan\'s smallest SUV — economical, and its turbo engine needs the right oil on time.'),
    issues: [CVT_ISSUE, IDLE_ISSUE, AC_ISSUE] },
  { slug: 'navara', name: 'Navara', type: T('بيك أب دبل كابينة', 'Double-cab pickup'), years: '2015 — 2026', engine: '2.5L', gearbox: T('عادي / أوتوماتيك', 'Manual / Automatic'),
    tagline: T('بيك أب شغل وتحمّل — بنهتم بعفشته وفرامله علشان الحمولة.', 'A tough work pickup — we look after its suspension and brakes for the load.'),
    issues: [SUSP_ISSUE, IDLE_ISSUE, AC_ISSUE] },
  { slug: 'pathfinder', name: 'Pathfinder', type: SUV, years: '2013 — 2026', engine: '3.5L V6', gearbox: T('CVT / أوتوماتيك', 'CVT / Automatic'),
    tagline: T('SUV عائلي 7 ركاب بموتور V6 — محتاج خبرة في الفتيس والتبريد.', 'A 7-seat family SUV with a V6 — it needs gearbox and cooling expertise.'),
    issues: [CVT_ISSUE, AC_ISSUE, SUSP_ISSUE] },
  { slug: 'altima', name: 'Altima', type: SEDAN, years: '2013 — 2026', engine: '2.5L', gearbox: T('CVT', 'CVT'),
    tagline: T('سيدان كبيرة مريحة — فتيسها الـ CVT عايز زيت وبرمجة صح.', 'A roomy, comfortable sedan — its CVT needs the right fluid and relearn.'),
    issues: [CVT_ISSUE, SUSP_ISSUE, AC_ISSUE] },
  { slug: 'maxima', name: 'Maxima', type: SEDAN, years: '2009 — 2023', engine: '3.5L V6', gearbox: T('CVT', 'CVT'),
    tagline: T('سيدان فاخرة بموتور V6 قوي — بنحافظ على أداءها زي ما هو.', 'A premium V6 sedan — we keep its performance as it should be.'),
    issues: [CVT_ISSUE, IDLE_ISSUE, AC_ISSUE] },
  { slug: 'murano', name: 'Murano', type: SUV, years: '2015 — 2026', engine: '3.5L V6', gearbox: T('CVT', 'CVT'),
    tagline: T('كروس أوفر فاخر — صيانته الدورية في ميعادها بتطوّل عمره.', 'A premium crossover — on-time service keeps it going for years.'),
    issues: [CVT_ISSUE, SUSP_ISSUE, AC_ISSUE] },
];

/**
 * Questions people ask about one model ("فين أقرب مركز صيانة نيسان صني؟"), shown on the model page
 * and in its search-engine copy. `addr` / `hours` come from the dictionary so they stay in one place.
 */
export function modelFaq(m: CarModel, ar: boolean, addr: string, hours: string): [string, string][] {
  const n = ar ? `نيسان ${MODEL_AR[m.name] ?? m.name}` : `Nissan ${m.name}`;
  const cvt = m.gearbox.en.includes('CVT');
  return ar ? [
    [`فين أقرب مركز صيانة ${n}؟`, `السيد حسن أوتو — مركز متخصص في نيسان بس: ${addr}. ${hours}. احجز من الموقع أو على واتساب 01080941711.`],
    [`إنتو توكيل ${n}؟`, `لأ، إحنا مش التوكيل الرسمي — إحنا مركز صيانة مستقل متخصص في نيسان بس، بنصلّح ${n} بقطع أصلية نيسان أو بديل معتمد حسب اختيارك، وبنقولك التكلفة قبل أي شغل.`],
    [`إمتى أعمل صيانة دورية لـ ${n}؟`, `غيّر الزيت والفلتر كل 10,000 كم (أو كل 5,000 كم لو أغلب سواقتك في الزحمة والحر) واعمل فحص شامل في نفس الميعاد${cvt ? '، وزيت فتيس الـ CVT كل حوالي 60,000 كم' : ''}. احسب جدول عربيتك من حاسبة الصيانة.`],
    [`بتوفروا قطع غيار ${n} أصلية؟`, `أيوه، بنوفر قطع غيار أصلية نيسان وبديل معتمد لـ ${n}، وبنقولك فرق السعر قبل التركيب.`],
  ] : [
    [`Where is a ${n} service center near me?`, `El Sayed Hassan Auto — a Nissan-only center: ${addr}. ${hours}. Book on the site or on WhatsApp 01080941711.`],
    [`Are you the ${n} dealer?`, `No, we are not the official dealer — we are an independent Nissan-only service center. We repair the ${n} with genuine Nissan or approved parts, your choice, and tell you the cost before any work.`],
    [`When does the ${n} need periodic service?`, `Change the oil and filter every 10,000 km (or every 5,000 km if you mostly drive in traffic and heat) with a full inspection at the same time${cvt ? ', and the CVT fluid about every 60,000 km' : ''}. Work out your car's schedule with the maintenance calculator.`],
    [`Do you have genuine ${n} parts?`, `Yes, we supply genuine Nissan and approved parts for the ${n}, and tell you the price difference before fitting.`],
  ];
}
