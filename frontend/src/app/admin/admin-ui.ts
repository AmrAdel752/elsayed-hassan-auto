import { HttpErrorResponse } from '@angular/common/http';
import { BookingStatus } from './admin-api';

const pad = (n: number) => String(n).padStart(2, '0');
/** Local yyyy-mm-dd, `offset` days from today. */
export const isoDay = (offset = 0) => {
  const d = new Date(); d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const fmtHour = (h: number, ar: boolean) => `${h % 12 || 12}:00 ${h < 12 ? (ar ? 'ص' : 'AM') : (ar ? 'م' : 'PM')}`;

/** "الأحد 9 نوفمبر" / "Sunday 9 November" from yyyy-mm-dd. */
export const fmtDay = (iso: string, ar: boolean) =>
  new Date(`${iso}T00:00`).toLocaleDateString(ar ? 'ar-EG-u-nu-latn' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

/** Badge colours per booking status. */
export const STATUS_CLASS: Record<BookingStatus, string> = {
  New: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/40',
  Confirmed: 'bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-500/40',
  Done: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/40',
  Cancelled: 'bg-zinc-500/15 text-zinc-600 dark:text-zinc-400 border-zinc-500/40',
  NoShow: 'bg-brand-red/10 text-brand-red2 border-brand-red/40',
};

/** "nissan-5w30-4l" from "Nissan 5W-30 — 4L". */
export const slugify = (s: string) =>
  s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 90);

/** The API's ProblemDetails `title` (e.g. "slug_taken") or the first validation message; '' when the server is unreachable. */
export function apiError(e: unknown): { status: number; code: string; message: string } {
  if (!(e instanceof HttpErrorResponse)) return { status: 0, code: '', message: '' };
  const body = e.error as { title?: string; detail?: string; errors?: Record<string, string[]> } | null;
  const first = body?.errors ? Object.entries(body.errors)[0] : undefined;
  return {
    status: e.status,
    code: body?.title ?? '',
    message: first ? `${first[0]}: ${first[1][0]}` : body?.detail ?? '',
  };
}
