/**
 * Picks the small icon shown for a category / product / offer / gallery photo from its name,
 * so the dashboard never asks the owner to choose one. First matching rule wins.
 */
const RULES: [RegExp, string][] = [
  [/زيت|زيوت|سوائل|\boil|lubric|fluid/i, 'oil'],
  [/تكييف|تبريد|كمبروسر|فريون|رادياتير|ردياتير|\ba\/?c\b|air ?con|cool|radiator|compressor/i, 'ac'],
  [/فرامل|فرملة|تيل|طنابير|ديسك|brake|pad|disc|rotor/i, 'susp'],
  [/عفشة|مساعد|مقص|كبالن|جلب|مساعدين|بلي|suspension|shock|strut|arm|bush/i, 'car'],
  [/كاوتش|كاوتشات|إطار|اطار|عجل|ترصيص|زوايا|جنط|جنوط|tire|tyre|wheel|align|balanc|rim/i, 'tire'],
  [/كهرب|بطاري|بوجي|كمبيوتر|فحص|حساس|سنسور|دينامو|مارش|electric|batter|spark|sensor|diagnos|scan|ecu|alternator|starter/i, 'cpu'],
  [/موتور|محرك|عمرة|توضيب|كاتينة|سير|engine|timing|belt|chain|overhaul|gearbox|فتيس|transmission|cvt/i, 'engine'],
  [/غسيل|تنظيف|تلميع|نانو|wash|clean|polish|detail/i, 'wash'],
  [/دوكو|دهان|سمكرة|رش|paint|body ?work|dent/i, 'paint'],
  [/فلتر|فلاتر|filter/i, 'parts'],
  [/ضمان|حماية|warranty|protect|guarantee/i, 'shield'],
  [/عرض|خصم|هدية|مجان|offer|discount|gift|free|sale/i, 'gift'],
  [/عربي|سيارة|car|vehicle|nissan|نيسان|صنى|صني|sunny|sentra|qashqai/i, 'car'],
];

export function autoIcon(text: string, fallback = 'parts'): string {
  for (const [re, icon] of RULES) if (re.test(text)) return icon;
  return fallback;
}

/** A short, unique, URL-safe link name: from the English text, or a code when there's none. */
export function autoSlug(en: string, prefix: string, used: Iterable<string>, slugify: (s: string) => string): string {
  const taken = new Set(used), base = slugify(en) || `${prefix}-${Date.now().toString(36)}`;
  let s = base;
  for (let n = 2; taken.has(s); n++) s = `${base}-${n}`;
  return s;
}
