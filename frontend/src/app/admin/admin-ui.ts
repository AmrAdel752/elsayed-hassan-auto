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

/**
 * Move item `id` one place up (-1) or down (+1) next to its neighbour in `visible` (the list as shown, maybe
 * filtered), then number the whole list 0..n-1. Returns only the items whose order changed (copies with the
 * new sortOrder) — save those. [] = it can't move that way.
 */
export function moveItem<T extends { id: number; sortOrder: number }>(all: T[], visible: T[], id: number, dir: -1 | 1): T[] {
  const vi = visible.findIndex(x => x.id === id), other = visible[vi + dir];
  if (vi < 0 || !other) return [];
  const list = bySortOrder(all);
  const from = list.findIndex(x => x.id === id), to = list.findIndex(x => x.id === other.id);
  const [it] = list.splice(from, 1);
  list.splice(to, 0, it);
  return list.flatMap((x, i) => (x.sortOrder === i ? [] : [{ ...x, sortOrder: i }]));
}

/** Copy of the list in display order (sortOrder, then oldest first). */
export const bySortOrder = <T extends { sortOrder: number; id: number }>(l: T[]) => [...l].sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);

/** Put the changed copies back into the list, in display order. */
export const withChanges = <T extends { sortOrder: number; id: number }>(l: T[], changed: T[]) =>
  bySortOrder(l.map(x => changed.find(c => c.id === x.id) ?? x));

/** Order for a new item: after the last one. */
export const nextSortOrder = (l: { sortOrder: number }[]) => (l.length ? Math.max(...l.map(x => x.sortOrder)) + 1 : 0);
