import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';

@Component({
  selector: 'app-preloader',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 z-[100] grid place-items-center bg-zinc-50 dark:bg-ink-900 transition-all duration-700"
         [class.opacity-0]="done()" [class.invisible]="done()">
      <div class="absolute inset-0 bg-[radial-gradient(500px_300px_at_50%_50%,rgba(220,47,54,.25),transparent_70%)]"></div>
      <div class="relative w-44 h-44">
        <div class="absolute -inset-3 rounded-full border-4 border-brand-red/15 border-t-brand-red2 animate-spin"></div>
        <div class="absolute -inset-6 rounded-full border border-brand-gold/30 border-b-brand-gold animate-[spin_2s_linear_infinite_reverse]"></div>
        <img src="logo.jpg" alt="" class="w-full h-full rounded-full shadow-[0_0_60px_rgba(220,47,54,.5)] transition-transform duration-700" [class.scale-125]="done()">
      </div>
    </div>
  `,
})
export class Preloader implements OnInit {
  protected readonly done = signal(false);

  // keep it ~1.2s so the logo moment registers
  ngOnInit() { setTimeout(() => this.done.set(true), 1200); }
}
