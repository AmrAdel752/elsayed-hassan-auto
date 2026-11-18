import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router';

/**
 * A thin red bar on top of the screen while a page is opening (its code is downloaded the first
 * time it's opened). Only shown when opening takes a moment, so fast clicks don't flicker.
 */
@Component({
  selector: 'app-nav-progress',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `@if (show()) { <div class="nav-bar" role="progressbar" aria-label="Loading"></div> }`,
})
export class NavProgress {
  protected readonly show = signal(false);
  private timer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    inject(Router).events.subscribe(e => {
      if (e instanceof NavigationStart) {
        clearTimeout(this.timer);
        this.timer = setTimeout(() => this.show.set(true), 150);
      } else if (e instanceof NavigationEnd || e instanceof NavigationCancel || e instanceof NavigationError) {
        clearTimeout(this.timer);
        this.show.set(false);
      }
    });
  }
}
