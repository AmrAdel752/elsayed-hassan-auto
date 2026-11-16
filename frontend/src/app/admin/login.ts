import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { Icon } from '../shared/icon';
import { adminTexts } from './admin.i18n';

@Component({
  selector: 'app-admin-login',
  imports: [FormsModule, RouterLink, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let T = t().login;
    <div class="min-h-dvh grid place-items-center px-4 py-10 bg-zinc-100 dark:bg-ink-900">
      <form (ngSubmit)="submit()" class="card relative overflow-hidden w-full max-w-md p-7 md:p-9 space-y-5">
        <div class="absolute -top-24 -end-24 w-60 h-60 rounded-full bg-brand-red/20 blur-3xl pointer-events-none"></div>
        <div class="relative text-center">
          <div class="ic-red w-14 h-14 rounded-2xl mx-auto mb-4 grid place-items-center"><app-icon name="shield" class="w-7 h-7" /></div>
          <h1 class="text-2xl font-black">{{ T.h }}</h1>
          <p class="muted text-sm mt-1">{{ T.p }}</p>
        </div>

        @if (err() || expired()) {
          <p class="relative rounded-xl border border-brand-red/40 bg-brand-red/10 text-brand-red2 p-3 text-sm font-bold" role="alert">{{ err() || T.expired }}</p>
        }

        <label class="relative block"><span class="lbl">{{ T.user }}</span>
          <input class="field" name="username" dir="ltr" autocomplete="username" autocapitalize="none" spellcheck="false" maxlength="50" required
                 [ngModel]="userName()" (ngModelChange)="userName.set($event)"></label>

        <label class="relative block"><span class="lbl">{{ T.pass }}</span>
          <span class="relative block">
            <input class="field pe-20" name="password" dir="ltr" autocomplete="current-password" maxlength="200" required
                   [type]="show() ? 'text' : 'password'" [ngModel]="password()" (ngModelChange)="password.set($event)">
            <button type="button" (click)="show.set(!show())" [attr.aria-pressed]="show()"
                    class="absolute inset-y-0 end-2 my-auto h-9 px-3 rounded-lg text-xs font-bold muted hover:text-brand-red2">{{ show() ? T.hide : T.show }}</button>
          </span>
        </label>

        <button type="submit" [disabled]="sending() || !userName().trim() || !password()"
                class="btn btn-red relative w-full justify-center !py-3.5 disabled:opacity-50 disabled:pointer-events-none">
          {{ sending() ? T.sending : T.submit }}</button>

        <a routerLink="/" class="relative block text-center text-sm font-bold muted hover:text-brand-red2">{{ T.back }}</a>
      </form>
    </div>
  `,
})
export class AdminLogin {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly t = adminTexts();

  /** `?returnUrl=/admin/...`: where the guard sent us from. */
  readonly returnUrl = input<string>();
  /** `?expired=1`: set when the session ended by itself. */
  readonly expired = input<string>();

  protected readonly userName = signal('');
  protected readonly password = signal('');
  protected readonly show = signal(false);
  protected readonly sending = signal(false);
  protected readonly err = signal('');

  protected async submit() {
    if (this.sending() || !this.userName().trim() || !this.password()) return;
    this.err.set(''); this.sending.set(true);
    try {
      await this.auth.login(this.userName().trim(), this.password());
      // only ever go back to a dashboard page (never an outside address from the query string)
      const back = this.returnUrl();
      await this.router.navigateByUrl(back?.startsWith('/admin') && !back.startsWith('/admin/login') ? back : '/admin');
    } catch (e) {
      const status = e instanceof HttpErrorResponse ? e.status : 0, T = this.t().login;
      this.err.set(status === 401 || status === 400 ? T.bad : status === 429 ? T.many : T.down);
      this.password.set('');
    } finally {
      this.sending.set(false);
    }
  }
}
