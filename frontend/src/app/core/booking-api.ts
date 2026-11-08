import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, timeout } from 'rxjs';
import { environment } from '../../environments/environment';

/** One day from `GET /api/slots`; `left` = places left (0 = full, closed or past). */
export interface SlotDay { date: string; closed: boolean; hours: { hour: number; left: number }[]; }

export interface NewBooking {
  name: string; phone: string; model: string; generation?: string; year?: number; km?: string;
  services: string[]; date: string; hour: number; notes?: string;
  /** Honeypot: hidden field, must stay empty. */
  website?: string;
}

export interface BookingCreated { code: string; date: string; hour: number; }

/** Bookings API (backend/ElSayedHassan.Api). */
@Injectable({ providedIn: 'root' })
export class BookingApi {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  slots(days = 14): Observable<SlotDay[]> {
    return this.http.get<SlotDay[]>(`${this.base}/api/slots`, { params: { days } }).pipe(timeout(10000));
  }

  /** 201 → code; 409 = slot just filled / already booked; 400 = validation; 429 = too many. */
  create(b: NewBooking): Observable<BookingCreated> {
    return this.http.post<BookingCreated>(`${this.base}/api/bookings`, b).pipe(timeout(15000));
  }
}
