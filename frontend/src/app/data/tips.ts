/** Car-care articles (static until the dashboard can publish them). */
import type { Tr } from './catalog';

export interface Tip {
  slug: string; icon: string; service: string; date: string; minutes: number;
  title: Tr; excerpt: Tr; sections: { h: Tr; p: Tr }[]; points: Tr[];
}

const T = (ar: string, en: string): Tr => ({ ar, en });

export const TIPS: Tip[] = [
  {
    slug: 'oil-change-interval', icon: 'oil', service: 'oils', date: '2026-10-20', minutes: 3,
    title: T('امتى تغير زيت عربيتك النيسان؟', 'When should you change your Nissan\'s oil?'),
    excerpt: T('الزيت هو دم الموتور — واختيار الميعاد والنوع الصح بيفرق في عمر عربيتك.', 'Oil is your engine\'s lifeblood — the right timing and type make a real difference.'),
    sections: [
      { h: T('الميعاد المناسب', 'The right interval'), p: T('أغلب عربيات نيسان محتاجة تغيير زيت كل 5,000 لـ 10,000 كم حسب نوع الزيت. في زحمة القاهرة والحر، الأفضل تقرّب الميعاد.', 'Most Nissan cars need an oil change every 5,000–10,000 km depending on the oil. In Cairo traffic and heat, it is better to go sooner.') },
      { h: T('نوع الزيت', 'Which oil'), p: T('الزيت التخليقي الكامل بيستحمل أكتر ومناسب للموتورات الحديثة، والنص تخليقي مناسب للعربيات اللي عدت 100 ألف كم.', 'Fully synthetic lasts longer and suits modern engines; semi-synthetic suits cars above 100,000 km.') },
      { h: T('متنساش الفلتر', 'Do not skip the filter'), p: T('تغيير الزيت من غير الفلتر بيخلي الزيت الجديد يتوسخ بسرعة. غير الاتنين مع بعض دايماً.', 'Changing oil without the filter dirties the new oil quickly. Always change both together.') },
    ],
    points: [T('كل 5–10 آلاف كم أو 6 شهور', 'Every 5–10k km or 6 months'), T('قرّب الميعاد في الزحمة والحر', 'Go sooner in traffic and heat'), T('غير الفلتر مع كل تغيير زيت', 'Change the filter every time')],
  },
  {
    slug: 'cvt-care', icon: 'engine', service: 'mechanics', date: '2026-10-08', minutes: 4,
    title: T('إزاي تحافظ على فتيس CVT في عربيتك؟', 'How to look after your CVT gearbox'),
    excerpt: T('فتيس الـ CVT في سنترا وقشقاي وإكس تريل محتاج طريقة سواقة وصيانة مختلفة.', 'The CVT in the Sentra, Qashqai and X-Trail needs a different driving style and maintenance.'),
    sections: [
      { h: T('غير الزيت في ميعاده', 'Change the fluid on time'), p: T('زيت الـ CVT بيتغير غالباً كل 40–60 ألف كم. الزيت القديم هو أكتر سبب للرعشة والتأخير.', 'CVT fluid is usually changed every 40–60k km. Old fluid is the top cause of judder and delay.') },
      { h: T('اسوق بهدوء', 'Drive smoothly'), p: T('الدوس المفاجئ على البنزين من الوقوف بيجهد الفتيس. ابدأ بهدوء وخلي السرعة تزيد تدريجياً.', 'Flooring it from a stop strains the gearbox. Pull away gently and build speed gradually.') },
      { h: T('متتجاهلش العلامات', 'Do not ignore the signs'), p: T('رعشة، صوت صفير، أو تأخير في السحب — كلها علامات لازم تفحصها بالكمبيوتر بدري قبل ما المشكلة تكبر.', 'Judder, whining or delayed pickup are signs to check by computer early, before the problem grows.') },
    ],
    points: [T('زيت CVT كل 40–60 ألف كم', 'CVT fluid every 40–60k km'), T('ابدأ الحركة بهدوء', 'Pull away gently'), T('افحص أي رعشة بدري', 'Check any judder early')],
  },
  {
    slug: 'summer-ac', icon: 'ac', service: 'ac', date: '2026-09-15', minutes: 3,
    title: T('جهز تكييف عربيتك قبل الصيف', 'Get your A/C ready before summer'),
    excerpt: T('كام حاجة بسيطة تعملها دلوقتي توفر عليك تكييف ضعيف ومصاريف كبيرة في عز الحر.', 'A few simple checks now save you a weak A/C and big bills in peak heat.'),
    sections: [
      { h: T('غير فلتر التكييف', 'Replace the cabin filter'), p: T('الفلتر المسدود بيضعّف الهوا وبيعمل ريحة وحشة. غيره كل 15–20 ألف كم.', 'A clogged filter weakens airflow and causes bad smells. Replace it every 15–20k km.') },
      { h: T('اكشف على الفريون', 'Check the refrigerant'), p: T('لو الفريون بيخلص بسرعة يبقى فيه تسريب. الشحن من غير ما تصلح التسريب فلوس على الفاضي.', 'If refrigerant runs out fast there is a leak. Recharging without fixing it wastes money.') },
      { h: T('شغله في الشتا', 'Run it in winter too'), p: T('تشغيل التكييف دقايق كل أسبوع حتى في الشتا بيحافظ على الكمبروسر والجوانات.', 'Running the A/C a few minutes weekly, even in winter, protects the compressor and seals.') },
    ],
    points: [T('فلتر التكييف كل 15–20 ألف كم', 'Cabin filter every 15–20k km'), T('صلح التسريب قبل الشحن', 'Fix leaks before recharging'), T('شغله كل أسبوع في الشتا', 'Run it weekly in winter')],
  },
  {
    slug: 'suspension-signs', icon: 'susp', service: 'suspension', date: '2026-08-28', minutes: 4,
    title: T('علامات إن عفشة عربيتك محتاجة كشف', 'Signs your suspension needs a check'),
    excerpt: T('العفشة مش بس راحة — دي أمان. اعرف العلامات اللي متتجاهلهاش.', 'Suspension is not just comfort — it is safety. Know the signs not to ignore.'),
    sections: [
      { h: T('أصوات في المطبات', 'Noises over bumps'), p: T('صوت تخبيط أو زيكة في المطبات غالباً من جلب المقصات أو المساعدين أو المساميك.', 'Knocks or squeaks over bumps usually come from control-arm bushings, shocks or links.') },
      { h: T('العربية بتشد أو بتميل', 'Pulling or leaning'), p: T('لو العربية بتشد يمين أو شمال أو بتميل في الدوران، يبقى محتاج تفحص العفشة وتضبط الزوايا.', 'If the car pulls to one side or leans in corners, check the suspension and alignment.') },
      { h: T('تآكل الكاوتش', 'Uneven tire wear'), p: T('تآكل الكاوتش من جنب واحد علامة على زوايا مش مظبوطة أو قطعة عفشة بايظة.', 'Wear on one edge of the tires signals bad alignment or a failing suspension part.') },
    ],
    points: [T('أي صوت في المطبات = كشف', 'Any bump noise = check'), T('اضبط الزوايا كل 10 آلاف كم', 'Align every 10k km'), T('بص على الكاوتش كل شهر', 'Inspect tires monthly')],
  },
];
