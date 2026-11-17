/** Business constants shared across pages. */
export const SITE = {
  phone: '01080941711',
  phone2: '0114360461',
  whatsapp: '201080941711',
  maps: 'https://maps.app.goo.gl/oyDR7KsLevVQA5rG9',
  facebook: 'https://www.facebook.com/share/1C9Sm9a72Q/',
  mapEmbed: 'https://maps.google.com/maps?q=%D8%A3%D8%A8%D8%B1%D8%A7%D8%AC%20%D8%A7%D9%84%D9%81%D9%88%D8%B1%20%D8%B3%D9%8A%D8%B2%D9%88%D9%86%20%D8%A7%D9%84%D9%85%D8%B1%D9%8A%D9%88%D8%B7%D9%8A%D8%A9%20%D9%81%D9%8A%D8%B5%D9%84&z=15&output=embed',
  models: ['Sunny', 'Sentra', 'Qashqai', 'X-Trail', 'Juke', 'Tiida', 'Patrol', 'Kicks', 'Magnite'],
  /** Generations (chassis codes) shown as a dropdown in booking for these models. */
  generations: { Sunny: ['N15', 'N16'], Qashqai: ['J10', 'J11', 'J12'], Juke: ['F15', 'F16'], Tiida: ['C11', 'C12'] } as Record<string, string[]>,
};

/**
 * WhatsApp chat link. Uses api.whatsapp.com/send instead of the wa.me short link: wa.me's redirect
 * breaks emoji (👋 🚗 arrive as "�") on some WhatsApp apps, notably WhatsApp Web / Desktop.
 * `phone` empty = let the user pick the chat (used for "share").
 */
export const waLink = (text?: string, phone: string = SITE.whatsapp) => {
  const q = new URLSearchParams();
  if (phone) q.set('phone', phone);
  if (text) q.set('text', text);
  return `https://api.whatsapp.com/send?${q.toString().replace(/\+/g, '%20')}`;
};
