import { HttpClient } from '@angular/common/http';
import { WritableSignal, signal } from '@angular/core';
import { retry, timeout } from 'rxjs';

/**
 * One list/object managed from the dashboard. It starts with the copy built into the site
 * (data/snapshot.ts, rebuilt on every dashboard change), so pages show it the moment they open,
 * then asks the API in the background and swaps in the live answer if anything changed since that build.
 * If the API doesn't answer, the built-in copy simply stays. The server may be waking up, so it waits
 * up to 20s and retries twice.
 */
export class Live<T> {
  readonly data: WritableSignal<T>;
  /** True once the server answered (or finally failed) for the first time. */
  readonly synced = signal(false);
  private busy = false;
  private last = 0;

  constructor(private readonly http: HttpClient, private readonly url: string, initial: T, private readonly map: (r: T) => T = r => r) {
    this.data = signal(initial);
    this.refresh();
  }

  /** Ask the server for the live data (at most once a minute, e.g. when a page opens). */
  refresh() {
    if (this.busy || Date.now() - this.last < 60000) return;
    this.busy = true; this.last = Date.now();
    this.http.get<T>(this.url).pipe(timeout(20000), retry({ count: 2, delay: 1500 })).subscribe({
      next: r => { this.busy = false; this.data.set(this.map(r)); this.synced.set(true); },
      error: () => { this.busy = false; this.last = 0; this.synced.set(true); },   // keep the built-in copy; try again on the next page
    });
  }
}

/** The API sends null for empty optional fields; the pages expect them to be absent. */
export function strip<T extends object>(o: T): T {
  return Object.fromEntries(Object.entries(o).filter(([, v]) => v !== null)) as T;
}
