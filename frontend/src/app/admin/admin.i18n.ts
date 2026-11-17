import { computed, inject } from '@angular/core';
import { I18n } from '../core/i18n.service';

/**
 * Dashboard texts. Kept out of i18n/ar.ts + en.ts so the public site doesn't download them;
 * they ship only inside the lazy /admin chunk.
 */
const AR = {
  title: 'لوحة التحكم', brand: 'السيد حسن أوتو', menu: 'القائمة', close: 'إغلاق', site: 'عرض الموقع', logout: 'خروج',
  role: { Owner: 'صاحب المركز', Staff: 'موظف' },
  nav: { home: 'الرئيسية', bookings: 'الحجوزات', slots: 'المواعيد', products: 'المنتجات', offers: 'العروض', reviews: 'آراء العملاء', gallery: 'المعرض' },
  loading: 'جاري التحميل...', failed: 'حصلت مشكلة — جرّب تاني.', retry: 'إعادة المحاولة',
  save: 'حفظ', saving: 'جاري الحفظ...', saved: 'اتحفظ', deleted: 'اتمسح', cancel: 'إلغاء', edit: 'تعديل', del: 'مسح',
  hide: 'إخفاء', show: 'إظهار', hidden: 'مخفي', slugTaken: 'الرابط ده مستخدم قبل كده — غيّره.',
  f: {
    nameAr: 'الاسم (عربي)', nameEn: 'الاسم (إنجليزي)', descAr: 'الوصف (عربي)', descEn: 'الوصف (إنجليزي)',
    slug: 'الرابط (slug)', slugHint: 'حروف إنجليزي صغيرة وأرقام وشرطة (-) بس.', icon: 'الأيقونة', sort: 'الترتيب',
    image: 'الصورة', active: 'ظاهر في الموقع', ar: 'عربي',
  },
  login: {
    h: 'تسجيل دخول الإدارة', p: 'الصفحة دي خاصة بإدارة السيد حسن أوتو.',
    user: 'اسم المستخدم', pass: 'كلمة المرور', show: 'إظهار', hide: 'إخفاء', submit: 'دخول', sending: 'جاري الدخول...',
    bad: 'اسم المستخدم أو كلمة المرور غلط.', many: 'محاولات كتير — استنى ربع ساعة وجرّب تاني.',
    down: 'مش قادرين نوصل للسيرفر — اتأكد من النت وجرّب تاني.', expired: 'الجلسة انتهت — سجّل دخول تاني.', back: 'رجوع للموقع',
  },
  home: {
    hi: 'أهلاً', p: 'ملخص النهارده وأقرب المواعيد.',
    stat: { today: 'حجوزات النهارده', new: 'مستنية تأكيد', week: 'خلال 7 أيام', done: 'خلصت النهارده' } as Record<string, string>,
    next: 'أقرب المواعيد', all: 'كل الحجوزات', none: 'مفيش مواعيد جاية.',
  },
  bookings: {
    h: 'الحجوزات',
    tabs: { today: 'النهارده', tomorrow: 'بكرة', week: 'الأسبوع ده', new: 'مستنية تأكيد', all: 'الكل' },
    search: 'ابحث بالاسم أو الموبايل أو رقم الحجز', filter: 'الحالة', anyStatus: 'كل الحالات',
    status: { New: 'جديد', Confirmed: 'مؤكد', Done: 'تم', Cancelled: 'ملغي', NoShow: 'ماجاش' },
    action: { New: 'جديد', Confirmed: 'تأكيد', Done: 'تم الانتهاء', Cancelled: 'إلغاء الحجز', NoShow: 'ماجاش' },
    empty: 'مفيش حجوزات هنا.', count: (n: number) => `${n} حجز`, more: 'عرض المزيد',
    car: 'العربية', services: 'الخدمات', notes: 'ملاحظات العميل', wa: 'واتساب',
    notePh: 'ملاحظة داخلية (مش بتظهر للعميل)', save: 'حفظ', slotFull: 'الساعة دي اتملت — مينفعش ترجّع الحجز فيها.',
  },
  slots: {
    h: 'المواعيد', rules: 'قواعد الحجز', rulesP: 'التغيير بيتطبق على الحجوزات الجديدة بس.', ownerOnly: 'صاحب المركز بس اللي يقدر يغيّر القواعد دي.',
    capacity: 'عدد العربيات في الساعة', open: 'أول ميعاد', close: 'وقت القفل', days: 'الحجز متاح لحد (يوم)',
    badHours: 'أول ميعاد لازم يكون قبل وقت القفل.',
    closedDays: 'أيام مقفولة', closedHours: 'ساعات مقفولة', date: 'اليوم', hour: 'الساعة', reason: 'السبب (اختياري)',
    closeBtn: 'قفل', reopen: 'فتح', noDays: 'مفيش أيام مقفولة.', noHours: 'مفيش ساعات مقفولة.',
    hasBookings: (n: number) => `اتقفل — خد بالك: فيه ${n} حجز موجود في الميعاد ده، كلّم أصحابهم.`,
    already: 'الميعاد ده مقفول قبل كده.',
  },
  confirm: {
    delTitle: 'متأكد إنك عايز تمسح ده؟', delMsg: 'المسح نهائي — مش هتقدر ترجّعه تاني.', delBtn: 'أيوه، امسح', keep: 'لا، رجوع',
    cancelTitle: 'متأكد إنك عايز تلغي الحجز؟', cancelMsg: 'كلّم العميل وعرّفه. تقدر ترجّع الحجز بعدين لو الميعاد لسه فاضي.',
    cancelBtn: 'أيوه، الغي الحجز', cancelKeep: 'لا، سيبه',
  },
  image: {
    pick: 'اختار صورة', change: 'تغيير الصورة', remove: 'شيل الصورة', uploading: 'جاري الرفع...',
    hint: 'JPG أو PNG أو WebP — بحد أقصى 5 ميجا.', tooBig: 'الصورة أكبر من 5 ميجا.', bad: 'الملف ده مش صورة مدعومة.',
  },
  products: {
    h: 'المنتجات', cats: 'الأقسام', add: 'إضافة', addH: 'منتج جديد', editH: 'تعديل المنتج',
    cat: 'القسم', brand: 'الماركة', price: 'السعر (ج.م)', oldPrice: 'السعر قبل الخصم (اختياري)',
    cost: 'سعر التكلفة (اختياري)', costHint: 'ليك إنت بس — مش بيظهر للعملاء في الموقع.', costIs: 'التكلفة', profit: 'المكسب',
    models: 'الموديلات المناسبة', allModels: 'الكل / ولا واحد', inStock: 'متوفر', outStock: 'غير متوفر', featured: 'مميز',
    badge: 'علامة على المنتج', badgeAr: 'العلامة (عربي)', badgeEn: 'العلامة (إنجليزي)',
    search: 'ابحث في المنتجات', allCats: 'كل الأقسام', empty: 'مفيش منتجات.',
    inCat: (n: number) => `${n} منتج`, badOld: 'السعر قبل الخصم لازم يكون أعلى من السعر.', catInUse: 'القسم ده فيه منتجات — انقلها أو امسحها الأول، أو اخفي القسم.',
  },
  offers: {
    h: 'العروض', add: 'إضافة', addH: 'عرض جديد', editH: 'تعديل العرض',
    titleAr: 'العنوان (عربي)', titleEn: 'العنوان (إنجليزي)', discountAr: 'نص الخصم (عربي)', discountEn: 'نص الخصم (إنجليزي)', discountPh: 'وفّر 18%',
    price: 'السعر (اختياري)', oldPrice: 'السعر قبل الخصم (اختياري)', endsAt: 'ينتهي في', service: 'الخدمة عند الحجز', noService: 'من غير خدمة محددة',
    includes: 'العرض بيشمل', addInclude: 'إضافة بند', until: 'لحد', expired: 'منتهي', live: 'شغال', empty: 'مفيش عروض.',
  },
  reviews: {
    h: 'آراء العملاء', add: 'إضافة رأي', addH: 'رأي جديد', editH: 'تعديل الرأي',
    summary: (shown: number, total: number, avg: string) => `${shown} ظاهر في الموقع من ${total} — متوسط التقييم ${avg} من 5`,
    nameAr: 'اسم العميل', nameEn: 'الاسم بالإنجليزي (اختياري)', textAr: 'الرأي', textEn: 'الرأي بالإنجليزي (اختياري)',
    enHint: 'لو سبتها فاضية، زوار النسخة الإنجليزي هيشوفوا النص العربي.',
    rating: 'التقييم', date: 'التاريخ', model: 'موديل العربية', year: 'سنة الصنع', service: 'الخدمة', none: 'غير محدد', empty: 'مفيش آراء لسه.',
  },
  gallery: {
    h: 'المعرض', tabs: { tiles: 'صور المعرض', pairs: 'قبل وبعد' },
    count: (shown: number, total: number) => `${shown} ظاهر في الموقع من ${total}`,
    addTile: 'إضافة صورة', addTileH: 'صورة جديدة', editTileH: 'تعديل الصورة',
    addPair: 'إضافة قبل وبعد', addPairH: 'قبل وبعد جديد', editPairH: 'تعديل قبل وبعد',
    titleAr: 'العنوان', titleEn: 'العنوان بالإنجليزي (اختياري)', descAr: 'الوصف', descEn: 'الوصف بالإنجليزي (اختياري)',
    enHint: 'لو سبتها فاضية، زوار النسخة الإنجليزي هيشوفوا النص العربي.',
    cat: 'القسم', cats: { workshop: 'الورشة', work: 'شغلنا', cars: 'عربيات العملاء' },
    tall: 'صورة طولية (بتاخد مساحة أكبر)', before: 'صورة قبل', after: 'صورة بعد',
    noImg: 'من غير صورة — بيظهر رسم مكانها', iconHint: 'بتظهر لو مفيش صورة.',
    emptyTiles: 'مفيش صور لسه.', emptyPairs: 'مفيش قبل وبعد لسه.',
  },
};

const EN: typeof AR = {
  title: 'Dashboard', brand: 'El Sayed Hassan Auto', menu: 'Menu', close: 'Close', site: 'View website', logout: 'Sign out',
  role: { Owner: 'Owner', Staff: 'Staff' },
  nav: { home: 'Home', bookings: 'Bookings', slots: 'Time slots', products: 'Products', offers: 'Offers', reviews: 'Reviews', gallery: 'Gallery' },
  loading: 'Loading...', failed: 'Something went wrong — try again.', retry: 'Retry',
  save: 'Save', saving: 'Saving...', saved: 'Saved', deleted: 'Deleted', cancel: 'Cancel', edit: 'Edit', del: 'Delete',
  hide: 'Hide', show: 'Show', hidden: 'Hidden', slugTaken: 'This link is already used — change it.',
  f: {
    nameAr: 'Name (Arabic)', nameEn: 'Name (English)', descAr: 'Description (Arabic)', descEn: 'Description (English)',
    slug: 'Link (slug)', slugHint: 'Lower-case letters, digits and dashes (-) only.', icon: 'Icon', sort: 'Order',
    image: 'Image', active: 'Visible on the website', ar: 'Arabic',
  },
  login: {
    h: 'Admin sign in', p: 'This page is for El Sayed Hassan Auto staff only.',
    user: 'User name', pass: 'Password', show: 'Show', hide: 'Hide', submit: 'Sign in', sending: 'Signing in...',
    bad: 'Wrong user name or password.', many: 'Too many attempts — wait 15 minutes and try again.',
    down: "Can't reach the server — check your connection and try again.", expired: 'Your session ended — please sign in again.', back: 'Back to the website',
  },
  home: {
    hi: 'Welcome', p: "Today's summary and the next appointments.",
    stat: { today: "Today's bookings", new: 'Waiting for confirmation', week: 'Next 7 days', done: 'Done today' },
    next: 'Next appointments', all: 'All bookings', none: 'No upcoming appointments.',
  },
  bookings: {
    h: 'Bookings',
    tabs: { today: 'Today', tomorrow: 'Tomorrow', week: 'This week', new: 'To confirm', all: 'All' },
    search: 'Search by name, mobile or booking number', filter: 'Status', anyStatus: 'Any status',
    status: { New: 'New', Confirmed: 'Confirmed', Done: 'Done', Cancelled: 'Cancelled', NoShow: 'No-show' },
    action: { New: 'New', Confirmed: 'Confirm', Done: 'Mark done', Cancelled: 'Cancel booking', NoShow: 'No-show' },
    empty: 'No bookings here.', count: (n: number) => `${n} booking${n === 1 ? '' : 's'}`, more: 'Show more',
    car: 'Car', services: 'Services', notes: 'Customer notes', wa: 'WhatsApp',
    notePh: 'Internal note (never shown to the customer)', save: 'Save', slotFull: "This hour is full now — the booking can't be restored there.",
  },
  slots: {
    h: 'Time slots', rules: 'Booking rules', rulesP: 'Changes apply to new bookings only.', ownerOnly: 'Only the owner can change these rules.',
    capacity: 'Cars per hour', open: 'First slot', close: 'Closing time', days: 'Book ahead up to (days)',
    badHours: 'The first slot must be before the closing time.',
    closedDays: 'Closed days', closedHours: 'Closed hours', date: 'Day', hour: 'Hour', reason: 'Reason (optional)',
    closeBtn: 'Close', reopen: 'Reopen', noDays: 'No closed days.', noHours: 'No closed hours.',
    hasBookings: (n: number) => `Closed — note: ${n} booking${n === 1 ? '' : 's'} already exist${n === 1 ? 's' : ''} there, please call the customer${n === 1 ? '' : 's'}.`,
    already: 'This time is already closed.',
  },
  confirm: {
    delTitle: 'Delete this for good?', delMsg: "This can't be undone.", delBtn: 'Yes, delete', keep: 'No, go back',
    cancelTitle: 'Cancel this booking?', cancelMsg: 'Let the customer know. You can restore it later if the hour is still free.',
    cancelBtn: 'Yes, cancel it', cancelKeep: 'No, keep it',
  },
  image: {
    pick: 'Choose image', change: 'Change image', remove: 'Remove image', uploading: 'Uploading...',
    hint: 'JPG, PNG or WebP — up to 5 MB.', tooBig: 'The image is larger than 5 MB.', bad: 'This file is not a supported image.',
  },
  products: {
    h: 'Products', cats: 'Categories', add: 'Add', addH: 'New product', editH: 'Edit product',
    cat: 'Category', brand: 'Brand', price: 'Price (EGP)', oldPrice: 'Price before discount (optional)',
    cost: 'Cost price (optional)', costHint: 'For you only — never shown to customers on the website.', costIs: 'Cost', profit: 'Profit',
    models: 'Fits models', allModels: 'All / none', inStock: 'In stock', outStock: 'Out of stock', featured: 'Featured',
    badge: 'Badge on the product', badgeAr: 'Badge (Arabic)', badgeEn: 'Badge (English)',
    search: 'Search products', allCats: 'All categories', empty: 'No products.',
    inCat: (n: number) => `${n} product${n === 1 ? '' : 's'}`, badOld: 'The price before discount must be higher than the price.', catInUse: 'This category still has products — move or delete them first, or hide the category.',
  },
  offers: {
    h: 'Offers', add: 'Add', addH: 'New offer', editH: 'Edit offer',
    titleAr: 'Title (Arabic)', titleEn: 'Title (English)', discountAr: 'Discount text (Arabic)', discountEn: 'Discount text (English)', discountPh: 'وفّر 18%',
    price: 'Price (optional)', oldPrice: 'Price before discount (optional)', endsAt: 'Ends at', service: 'Service when booking', noService: 'No specific service',
    includes: 'The offer includes', addInclude: 'Add item', until: 'until', expired: 'Ended', live: 'Live', empty: 'No offers.',
  },
  reviews: {
    h: 'Customer reviews', add: 'Add review', addH: 'New review', editH: 'Edit review',
    summary: (shown: number, total: number, avg: string) => `${shown} of ${total} shown on the website — average rating ${avg} of 5`,
    nameAr: 'Customer name', nameEn: 'Name in English (optional)', textAr: 'Review', textEn: 'Review in English (optional)',
    enHint: 'If left empty, English visitors see the Arabic text.',
    rating: 'Rating', date: 'Date', model: 'Car model', year: 'Model year', service: 'Service', none: 'Not set', empty: 'No reviews yet.',
  },
  gallery: {
    h: 'Gallery', tabs: { tiles: 'Gallery photos', pairs: 'Before & after' },
    count: (shown: number, total: number) => `${shown} of ${total} shown on the website`,
    addTile: 'Add photo', addTileH: 'New photo', editTileH: 'Edit photo',
    addPair: 'Add before & after', addPairH: 'New before & after', editPairH: 'Edit before & after',
    titleAr: 'Title', titleEn: 'Title in English (optional)', descAr: 'Description', descEn: 'Description in English (optional)',
    enHint: 'If left empty, English visitors see the Arabic text.',
    cat: 'Section', cats: { workshop: 'Workshop', work: 'Our work', cars: 'Customer cars' },
    tall: 'Tall photo (takes more space)', before: 'Before photo', after: 'After photo',
    noImg: 'No photo — a drawing is shown instead', iconHint: 'Shown when there is no photo.',
    emptyTiles: 'No photos yet.', emptyPairs: 'No before & after yet.',
  },
};

/** Current-language dashboard texts (call in an injection context). */
export const adminTexts = () => {
  const i = inject(I18n);
  return computed(() => (i.isAr() ? AR : EN));
};
