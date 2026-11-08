/**
 * Repair-tracking data — mock orders plus bookings saved in this browser,
 * until the .NET API provides real job status.
 */
import type { Tr } from './catalog';

export const STAGES = ['booked', 'received', 'inspection', 'approval', 'repair', 'quality', 'ready'] as const;
export type Stage = typeof STAGES[number];

export interface Job {
  code: string; model: string; year: number; services: string[];
  /** Appointment day (YYYY-MM-DD) and hour, used to count bookings per slot. */
  date?: string; hour?: number;
  stage: number;
  /** ISO time each reached stage was completed/started, index-aligned with STAGES. */
  times: string[];
  eta?: string; note?: Tr; tech?: Tr;
}

const KEY = 'sha-bookings';
const ago = (h: number) => new Date(Date.now() - h * 3600_000).toISOString();
const ahead = (h: number) => new Date(Date.now() + h * 3600_000).toISOString();

const MOCK: Job[] = [
  { code: 'SHA-10234', model: 'Sunny', year: 2019, services: ['maintenance', 'oils'], stage: 4,
    times: [ago(30), ago(5), ago(4.5), ago(3.8), ago(3.5)], eta: ahead(2),
    tech: { ar: 'م/ كريم', en: 'Eng. Karim' },
    note: { ar: 'تم تغيير الزيت والفلاتر، جاري تغيير البوجيهات.', en: 'Oil and filters done, replacing spark plugs now.' } },
  { code: 'SHA-20518', model: 'Qashqai', year: 2021, services: ['ac'], stage: 6,
    times: [ago(50), ago(26), ago(25), ago(24.5), ago(24), ago(3), ago(1)],
    tech: { ar: 'م/ أحمد', en: 'Eng. Ahmed' },
    note: { ar: 'تم إصلاح تسريب الفريون وشحن التكييف — العربية جاهزة.', en: 'Refrigerant leak fixed and A/C recharged — car is ready.' } },
  { code: 'SHA-30777', model: 'Sentra', year: 2020, services: ['suspension'], stage: 2,
    times: [ago(20), ago(1.5), ago(1)], eta: ahead(6),
    note: { ar: 'العربية على الرافعة لفحص العفشة.', en: 'Car is on the lift for suspension inspection.' } },
];

export const SAMPLE_CODES = MOCK.map(j => j.code);

export function saveBooking(job: Omit<Job, 'stage' | 'times'>) {
  try {
    const all: Job[] = JSON.parse(localStorage.getItem(KEY) || '[]');
    all.push({ ...job, stage: 0, times: [new Date().toISOString()] });
    localStorage.setItem(KEY, JSON.stringify(all.slice(-20)));
  } catch {}
}

export function findJob(code: string): Job | undefined {
  const c = code.trim().toUpperCase();
  let saved: Job[] = [];
  try { saved = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch {}
  return [...saved, ...MOCK].find(j => j.code === c);
}

/** Bookings saved in this browser for a given day + hour (the API will count all customers later). */
export function savedInSlot(date: string, hour: number): number {
  try {
    const all: Job[] = JSON.parse(localStorage.getItem(KEY) || '[]');
    return all.filter(j => j.date === date && j.hour === hour).length;
  } catch { return 0; }
}
