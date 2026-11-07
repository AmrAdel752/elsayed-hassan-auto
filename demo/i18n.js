const G = s => `<span class="gold-text">${s}</span>`;
const R = s => `<span class="text-brand-red2">${s}</span>`;

const T = {
  ar: {
    top1: 'مفتوح يومياً من 10 صباحاً حتى 10 مساءً — طوال أيام الأسبوع',
    top2: 'نزلة دائري المريوطية فيصل — داخل أبراج الفور سيزون',
    b1: 'السيد حسن', b2: 'أوتو',
    n1: 'الرئيسية', n2: 'خدماتنا', n3: 'ليه إحنا', n4: 'احجز موعد', n5: 'تواصل معنا',
    bookNow: 'احجز الآن', badge: 'متخصصين نيسان فقط', badgeSub: 'صيانة • قطع غيار • تشخيص كمبيوتر',
    h1: `عربيتك ${G('النيسان')}<br>في ${R('إيد أمينة')}`,
    lead: 'مركز صيانة متكامل لسيارات نيسان — ميكانيكا، صيانات دورية، عفشة، تكييف، قطع غيار وزيوت أصلية. خبرة متخصصة وأجهزة حديثة تحت سقف واحد.',
    ctaWa: 'احجز عبر واتساب',
    s1: 'متخصصين نيسان', s2: 'أيام في الأسبوع', s3: 'ساعة عمل يومياً',
    c1t: 'قطع غيار أصلية', c1s: 'ضمان على الشغل', c2t: 'فحص كمبيوتر', c2s: 'أجهزة تشخيص حديثة',
    svTag: '— خدماتنا —', svH: `كل اللي عربيتك ${G('محتاجاه')}`, svP: 'خدمات صيانة متكاملة لكل موديلات نيسان بأيدي فنيين متخصصين',
    more: 'اعرف أكتر',
    services: [
      ['ميكانيكا', 'إصلاح وصيانة الموتور والفتيس بدقة عالية وتشخيص دقيق للأعطال.'],
      ['صيانات دورية', 'صيانة الكيلومترات حسب جدول نيسان للحفاظ على أداء عربيتك وعمرها.'],
      ['عفشة', 'فحص وإصلاح العفشة والمساعدين وضبط الزوايا لثبات وراحة في السواقة.'],
      ['تكييف', 'شحن فريون وصيانة كاملة لدورة التكييف علشان صيفك يبقى أبرد.'],
      ['قطع غيار', 'قطع غيار نيسان أصلية ومضمونة متوفرة لأغلب الموديلات.'],
      ['زيوت', 'تغيير زيت وفلاتر بأفضل أنواع الزيوت المناسبة لموتور عربيتك.'],
    ],
    whTag: '— ليه السيد حسن أوتو —', whH: `خبرة ${R('نيسان')} بس..<br>وده سر ${G('تميزنا')}`,
    feats: [
      ['تخصص نيسان 100%', 'بنشتغل على نيسان بس، فبنعرف كل تفصيلة في عربيتك.'],
      ['أجهزة فحص حديثة', 'تشخيص بالكمبيوتر يحدد العطل بدقة من غير تخمين.'],
      ['أسعار واضحة', 'بنقولك التكلفة قبل ما نبدأ.. من غير أي مفاجآت.'],
      ['مواعيد مرنة', 'مفتوحين 12 ساعة يومياً طوال أيام الأسبوع.'],
    ],
    nsBadge: 'بنخدم كل موديلات نيسان', nsSub: 'من صني لحد باترول', nsH: `من ${G('صني')} لـ ${G('قشقاي')}..<br>عربيتك عندنا في أمان`,
    nsP: 'فريق فني متخصص على كل موديلات نيسان المنتشرة في السوق المصري.',
    stTag: '— احجز في دقيقة —', stH: `حجزك ${G('أسهل')} من أي وقت`, stP: 'املا البيانات وهتتفتحلك رسالة واتساب جاهزة — من غير ما تكتب حاجة',
    fmH: 'احجز موعدك', fName: 'الاسم', phName: 'اكتب اسمك', fModel: 'موديل العربية', fService: 'الخدمة',
    fDate: 'اليوم المناسب', fNotes: 'ملاحظات (اختياري)', phNotes: 'اوصف المشكلة باختصار...',
    fSubmit: 'ابعت الحجز على واتساب', fHint: 'هنرد عليك فوراً لتأكيد الميعاد', choose: 'اختار...', other: 'موديل آخر',
    msg: (d) => `مرحباً السيد حسن أوتو 👋\nعايز أحجز موعد 🚗\n\nالاسم: ${d.name}\nالعربية: نيسان ${d.model}\nالخدمة: ${d.service}\nاليوم: ${d.date}${d.notes ? `\nملاحظات: ${d.notes}` : ''}`,
    steps: [
      ['املا الفورم', 'اختار موديل عربيتك والخدمة'],
      ['حدد ميعادك', 'اختار الوقت اللي يناسبك'],
      ['فحص وتشخيص', 'نفحص ونقولك التكلفة الأول'],
      ['استلم عربيتك', 'جاهزة ومتظبطة على أكمل وجه'],
    ],
    rvTag: '— آراء عملائنا —', rvH: `ثقة عملائنا ${G('أهم حاجة')}`,
    reviews: [
      ['أحسن مركز تعاملت معاه في نيسان، شغل محترم وأسعار كويسة وصراحة في كل حاجة.', 'أحمد محمود', 'نيسان صني 2019'],
      ['عملت الصيانة الدورية والتكييف، العربية رجعت أحسن من الأول. شكراً يا هندسة.', 'محمد علي', 'نيسان قشقاي 2021'],
      ['العفشة كانت عاملة صوت وكذا مكان مافهمش، هنا عرفوا المشكلة من أول مرة.', 'كريم حسن', 'نيسان سنترا 2020'],
    ],
    ctTag: '— تواصل معنا —', ctH: `زورنا أو ${G('كلمنا')}`, ctInfo: 'بيانات التواصل',
    addrL: 'العنوان', addr: 'نزلة دائري المريوطية فيصل — أمام الموقف الجديد — داخل أبراج الفور سيزون، الجيزة',
    waL: 'واتساب للحجز (الرقم الأساسي)', phL: 'رقم إضافي', hrL: 'مواعيد العمل',
    hours: 'من 10 ص إلى 10 م — طوال أيام الأسبوع', openNow: 'مفتوح الآن', openMap: 'افتح اللوكيشن',
    fH: 'عربيتك محتاجة صيانة؟', fP: 'احجز دلوقتي عبر واتساب وهنرد عليك فوراً', fBtn: 'احجز عبر واتساب — 01080941711',
    about: 'مركز صيانة متخصص في سيارات نيسان فقط. خبرة، أمانة، وقطع غيار أصلية.',
    fsv: 'خدماتنا', fl: 'روابط سريعة', days: 'السبت — الجمعة',
    rights: '© 2026 السيد حسن أوتو — جميع الحقوق محفوظة',
    marquee: ['ميكانيكا', 'صيانات دورية', 'عفشة', 'تكييف', 'قطع غيار', 'زيوت', 'متخصصين نيسان'],
    langBtn: 'EN', title: 'السيد حسن أوتو | متخصصين نيسان',
  },
  en: {
    top1: 'Open daily from 10 AM to 10 PM — 7 days a week',
    top2: 'Al-Mariouteya Ring Road exit, Faisal — inside Four Seasons Towers',
    b1: 'El Sayed Hassan', b2: 'Auto',
    n1: 'Home', n2: 'Services', n3: 'Why Us', n4: 'Book', n5: 'Contact',
    bookNow: 'Book Now', badge: 'Nissan Specialists Only', badgeSub: 'Service • Parts • Computer Diagnostics',
    h1: `Your ${G('Nissan')}<br>in ${R('Safe Hands')}`,
    lead: 'A complete service center for Nissan cars — mechanics, periodic maintenance, suspension, A/C, genuine parts and oils. Specialist expertise and modern equipment under one roof.',
    ctaWa: 'Book on WhatsApp',
    s1: 'Nissan specialists', s2: 'Days a week', s3: 'Working hours daily',
    c1t: 'Genuine Parts', c1s: 'Warranty on work', c2t: 'Computer Diagnostics', c2s: 'Modern scan tools',
    svTag: '— OUR SERVICES —', svH: `Everything your car ${G('needs')}`, svP: 'Complete maintenance services for every Nissan model by specialist technicians',
    more: 'Learn more',
    services: [
      ['Mechanics', 'Precise engine and gearbox repair with accurate fault diagnosis.'],
      ['Periodic Maintenance', 'Mileage services per Nissan schedule to keep your car performing longer.'],
      ['Suspension', 'Suspension and shock inspection, repair and wheel alignment for a smooth ride.'],
      ['Air Conditioning', 'Refrigerant recharge and full A/C system service for a cooler summer.'],
      ['Spare Parts', 'Genuine, guaranteed Nissan parts available for most models.'],
      ['Oils', 'Oil and filter changes with the best oils suited to your engine.'],
    ],
    whTag: '— WHY EL SAYED HASSAN AUTO —', whH: `Only ${R('Nissan')} expertise..<br>that's our ${G('edge')}`,
    feats: [
      ['100% Nissan Focus', 'We work on Nissan only, so we know every detail of your car.'],
      ['Modern Diagnostics', 'Computer diagnostics pinpoint the fault with no guesswork.'],
      ['Clear Pricing', 'We tell you the cost before we start — no surprises.'],
      ['Flexible Hours', 'Open 12 hours a day, every day of the week.'],
    ],
    nsBadge: 'We service every Nissan model', nsSub: 'From Sunny to Patrol', nsH: `From ${G('Sunny')} to ${G('Qashqai')}..<br>your car is safe with us`,
    nsP: 'A technical team specialized in every Nissan model on the Egyptian market.',
    stTag: '— BOOK IN A MINUTE —', stH: `Booking is ${G('easier')} than ever`, stP: 'Fill in the details and a ready WhatsApp message opens — no typing needed',
    fmH: 'Book your visit', fName: 'Name', phName: 'Your name', fModel: 'Car model', fService: 'Service',
    fDate: 'Preferred day', fNotes: 'Notes (optional)', phNotes: 'Briefly describe the issue...',
    fSubmit: 'Send booking on WhatsApp', fHint: "We'll reply right away to confirm", choose: 'Choose...', other: 'Other model',
    msg: (d) => `Hello El Sayed Hassan Auto 👋\nI'd like to book a visit 🚗\n\nName: ${d.name}\nCar: Nissan ${d.model}\nService: ${d.service}\nDay: ${d.date}${d.notes ? `\nNotes: ${d.notes}` : ''}`,
    steps: [
      ['Fill the form', 'Pick your car model and service'],
      ['Pick a time', 'Choose the slot that suits you'],
      ['Inspection', 'We diagnose and quote before any work'],
      ['Drive away', 'Your car is ready and tuned up'],
    ],
    rvTag: '— TESTIMONIALS —', rvH: `Our customers' trust ${G('comes first')}`,
    reviews: [
      ['The best Nissan center I have dealt with — honest work, fair prices and full transparency.', 'Ahmed Mahmoud', 'Nissan Sunny 2019'],
      ['Did the periodic service and A/C, the car came back better than ever. Thank you!', 'Mohamed Ali', 'Nissan Qashqai 2021'],
      ['Suspension noise nobody could fix — they found the problem on the first visit.', 'Karim Hassan', 'Nissan Sentra 2020'],
    ],
    ctTag: '— CONTACT US —', ctH: `Visit us or ${G('call us')}`, ctInfo: 'Contact details',
    addrL: 'Address', addr: 'Al-Mariouteya Ring Road exit, Faisal — opposite the new station — inside Four Seasons Towers, Giza',
    waL: 'WhatsApp booking (main number)', phL: 'Other number', hrL: 'Working hours',
    hours: '10 AM to 10 PM — every day', openNow: 'Open now', openMap: 'Open location',
    fH: 'Does your car need service?', fP: 'Book now on WhatsApp and we will reply right away', fBtn: 'Book on WhatsApp — 01080941711',
    about: 'A service center specialized in Nissan cars only. Expertise, honesty and genuine parts.',
    fsv: 'Services', fl: 'Quick links', days: 'Saturday — Friday',
    rights: '© 2026 El Sayed Hassan Auto — All rights reserved',
    marquee: ['Mechanics', 'Periodic Maintenance', 'Suspension', 'Air Conditioning', 'Spare Parts', 'Oils', 'Nissan Specialists'],
    langBtn: 'ع', title: 'El Sayed Hassan Auto | Nissan Specialists',
  },
};

const ICONS = ['engine', 'cal', 'susp', 'ac', 'parts', 'oil'];
const FEAT_ICONS = ['shield', 'cpu', 'tag', 'clock'];
const root = document.documentElement;

function store(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

function render(lang) {
  const t = T[lang];
  root.lang = lang; root.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.title = t.title;
  document.querySelectorAll('[data-i]').forEach(el => { el.innerHTML = t[el.dataset.i]; });
  document.getElementById('langBtn').textContent = t.langBtn;

  document.getElementById('services-grid').innerHTML = t.services.map(([h, p], i) => `
    <div style="transition-delay:${(i % 3) * .12}s" class="reveal card group relative p-8 overflow-hidden transition duration-300 hover:-translate-y-2 hover:border-brand-red/50">
      <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-[radial-gradient(400px_200px_at_100%_0,rgba(220,47,54,.15),transparent_70%)]"></div>
      <span class="absolute end-6 top-4 text-[56px] font-black text-zinc-300 dark:text-zinc-500">0${i + 1}</span>
      <div class="ic-red relative w-16 h-16 rounded-[18px] mb-5"><svg class="w-[30px] h-[30px]"><use href="#i-${ICONS[i]}"/></svg></div>
      <h3 class="relative text-[22px] font-extrabold mb-2">${h}</h3>
      <p class="relative muted text-[15px] mb-4">${p}</p>
      <a href="#" class="relative inline-flex items-center gap-1.5 text-sm font-bold text-brand-dgold dark:text-brand-gold">${t.more}<svg class="w-4 h-4 rtl:rotate-180"><use href="#i-arrow"/></svg></a>
    </div>`).join('');

  document.getElementById('feats').innerHTML = t.feats.map(([h, p], i) => `
    <div class="flex gap-4 py-5 border-b last:border-0 border-zinc-200 dark:border-ink-600">
      <div class="shrink-0 w-[52px] h-[52px] rounded-[14px] grid place-items-center border border-brand-gold/40 bg-brand-gold/10 text-brand-dgold dark:text-brand-gold"><svg class="w-6 h-6"><use href="#i-${FEAT_ICONS[i]}"/></svg></div>
      <div><h4 class="text-lg font-extrabold">${h}</h4><p class="muted text-[15px]">${p}</p></div>
    </div>`).join('');

  document.getElementById('steps-grid').innerHTML = t.steps.map(([h, p], i) => `
    <li class="relative flex gap-4 items-start">
      ${i < 3 ? '<span class="absolute top-14 start-6 h-[calc(100%-32px)] border-s-2 border-dashed border-brand-red/40"></span>' : ''}
      <div class="shrink-0 w-12 h-12 rounded-full grid place-items-center text-lg font-black text-brand-red2 bg-zinc-50 dark:bg-ink-900 border-2 border-brand-red shadow-[0_0_24px_rgba(220,47,54,.35)]">${i + 1}</div>
      <div><h4 class="text-lg font-extrabold">${h}</h4><p class="muted text-[15px]">${p}</p></div>
    </li>`).join('');

  document.querySelectorAll('[data-ph]').forEach(el => { el.placeholder = t[el.dataset.ph]; });
  const opts = list => `<option value="" disabled selected>${t.choose}</option>` + list.map(s => `<option>${s}</option>`).join('');
  document.getElementById('selModel').innerHTML = opts([...MODELS, t.other]);
  document.getElementById('selService').innerHTML = opts(t.services.map(s => s[0]));

  document.getElementById('reviews').innerHTML = t.reviews.map(([txt, name, car], i) => `
    <div style="transition-delay:${i * .12}s" class="reveal card p-8">
      <div class="flex gap-1 text-brand-gold mb-3">${'<svg class="w-[18px] h-[18px]"><use href="#i-star"/></svg>'.repeat(5)}</div>
      <p class="text-zinc-700 dark:text-zinc-300 mb-5">${txt}</p>
      <div class="flex items-center gap-3">
        <div class="w-11 h-11 rounded-full grid place-items-center font-extrabold text-white bg-gradient-to-br from-brand-red2 to-[#8f1a20]">${name[0]}</div>
        <div><b>${name}</b><small class="muted block text-[13px]">${car}</small></div>
      </div>
    </div>`).join('');

  const items = [...t.marquee, ...t.marquee].map(s => `<span>${s}</span><svg class="w-5 h-5 self-center shrink-0 text-brand-gold2"><use href="#i-spark"/></svg>`).join('');
  document.getElementById('marquee').innerHTML = items;

  document.getElementById('f-services').innerHTML = t.services.slice(0, 4)
    .map(([h]) => `<li><a href="#services" class="hover:text-brand-red2">${h}</a></li>`).join('');

  document.querySelectorAll('.reveal:not(.in)').forEach(el => io.observe(el));
}

// scroll reveal + stat counters
const io = new IntersectionObserver(entries => entries.forEach(e => {
  if (!e.isIntersecting) return;
  e.target.classList.add('in');
  e.target.querySelectorAll('[data-count]').forEach(countUp);
  io.unobserve(e.target);
}), { threshold: .15 });

function countUp(el) {
  const end = +el.dataset.count, start = performance.now(), dur = 1600;
  const tick = now => {
    const p = Math.min((now - start) / dur, 1);
    el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + el.dataset.suffix;
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

const MODELS = ['Sunny', 'Sentra', 'Qashqai', 'X-Trail', 'Juke', 'Tiida', 'Patrol', 'Kicks'];

let lang = root.lang === 'en' ? 'en' : 'ar';
render(lang);

document.getElementById('langBtn').onclick = () => {
  lang = lang === 'ar' ? 'en' : 'ar';
  store('sha-lang', lang);
  render(lang);
};
document.getElementById('themeBtn').onclick = () => {
  const dark = root.classList.toggle('dark');
  store('sha-theme', dark ? 'dark' : 'light');
};

// booking form -> prefilled WhatsApp message
const bkDate = document.getElementById('bkDate');
bkDate.min = new Date().toISOString().slice(0, 10);
document.getElementById('bookForm').onsubmit = e => {
  e.preventDefault();
  const d = Object.fromEntries(new FormData(e.target));
  window.open(`https://wa.me/201080941711?text=${encodeURIComponent(T[lang].msg(d))}`, '_blank');
};

// preloader: keep it at least ~1.2s so the logo moment registers
const shown = performance.now();
addEventListener('load', () => setTimeout(() => {
  document.getElementById('loader').classList.add('done');
}, Math.max(0, 1200 - (performance.now() - shown))));
