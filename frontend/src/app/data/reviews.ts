/**
 * SAMPLE reviews for the demo — must be replaced with real customer reviews
 * (e.g. from Google Maps) before the site goes live.
 */
import type { Tr } from './catalog';

export interface Review { id: number; name: Tr; model: string; year: number; service: string; rating: number; date: string; text: Tr; }

export const REVIEWS: Review[] = [
  { id: 1, name: { ar: 'أحمد محمود', en: 'Ahmed Mahmoud' }, model: 'Sunny', year: 2019, service: 'maintenance', rating: 5, date: '2026-10-28',
    text: { ar: 'أحسن مركز تعاملت معاه في نيسان، شغل محترم وأسعار كويسة وصراحة في كل حاجة.', en: 'The best Nissan center I have dealt with — honest work, fair prices and full transparency.' } },
  { id: 2, name: { ar: 'محمد علي', en: 'Mohamed Ali' }, model: 'Qashqai', year: 2021, service: 'ac', rating: 5, date: '2026-10-21',
    text: { ar: 'عملت الصيانة الدورية والتكييف، العربية رجعت أحسن من الأول. شكراً يا هندسة.', en: 'Did the periodic service and A/C, the car came back better than ever. Thank you!' } },
  { id: 3, name: { ar: 'كريم حسن', en: 'Karim Hassan' }, model: 'Sentra', year: 2020, service: 'suspension', rating: 5, date: '2026-10-15',
    text: { ar: 'العفشة كانت عاملة صوت وكذا مكان مافهمش، هنا عرفوا المشكلة من أول مرة.', en: 'Suspension noise nobody could fix — they found the problem on the first visit.' } },
  { id: 4, name: { ar: 'مصطفى عادل', en: 'Mostafa Adel' }, model: 'Sentra', year: 2018, service: 'mechanics', rating: 5, date: '2026-10-09',
    text: { ar: 'الفتيس CVT كان بيرعش، اتعمله صيانة واتبرمج وبقى زي الفل. فهموني كل حاجة قبل ما يبدأوا.', en: 'My CVT was juddering — serviced and relearned, now perfect. They explained everything first.' } },
  { id: 5, name: { ar: 'هشام سمير', en: 'Hesham Samir' }, model: 'X-Trail', year: 2017, service: 'oils', rating: 4, date: '2026-10-02',
    text: { ar: 'تغيير زيت سريع ومحترم، استنيت شوية بسبب الزحمة بس الشغل ممتاز.', en: 'Quick, professional oil change. Waited a bit because it was busy, but great work.' } },
  { id: 6, name: { ar: 'عمرو فتحي', en: 'Amr Fathy' }, model: 'Juke', year: 2016, service: 'parts', rating: 5, date: '2026-09-25',
    text: { ar: 'جابولي قطعة أصلية مكنتش لاقيها في أي حتة في يومين بس، وركبوها في نفس اليوم.', en: 'They found a genuine part I could not get anywhere in just two days and fitted it the same day.' } },
  { id: 7, name: { ar: 'إسلام ناصر', en: 'Eslam Nasser' }, model: 'Sunny', year: 2015, service: 'suspension', rating: 4, date: '2026-09-17',
    text: { ar: 'غيرت المساعدين وضبطت الزوايا، العربية بقت ثابتة جداً. الأسعار معقولة.', en: 'Replaced shocks and did alignment — the car is very stable now. Reasonable prices.' } },
  { id: 8, name: { ar: 'طارق يوسف', en: 'Tarek Youssef' }, model: 'Patrol', year: 2019, service: 'maintenance', rating: 5, date: '2026-09-08',
    text: { ar: 'صيانة الـ 60 ألف اتعملت بالظبط حسب جدول نيسان، وأخدت تقرير مكتوب بكل حاجة.', en: 'The 60k service was done exactly per the Nissan schedule, with a written report of everything.' } },
  { id: 9, name: { ar: 'شريف منير', en: 'Sherif Mounir' }, model: 'Kicks', year: 2022, service: 'ac', rating: 5, date: '2026-08-30',
    text: { ar: 'التكييف كان بيطلع هوا سخن، لقوا التسريب بالجهاز وصلحوه. ضمير في الشغل.', en: 'A/C was blowing warm air — they found the leak with their detector and fixed it. Honest work.' } },
];
