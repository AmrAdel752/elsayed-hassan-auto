import { Directive, ElementRef, OnDestroy, OnInit, inject, input } from '@angular/core';

/** Counts the host's text from 0 to `countUp` (ease-out) when it scrolls into view. */
@Directive({ selector: '[countUp]' })
export class CountUp implements OnInit, OnDestroy {
  readonly countUp = input.required<number>();
  readonly suffix = input('');
  private readonly el = inject(ElementRef<HTMLElement>);
  private io?: IntersectionObserver;

  ngOnInit() {
    const node = this.el.nativeElement;
    node.textContent = `0${this.suffix()}`;
    this.io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      this.io?.disconnect();
      const end = this.countUp(), start = performance.now(), dur = 1600;
      const tick = (now: number) => {
        const p = Math.min((now - start) / dur, 1);
        node.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + this.suffix();
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    this.io.observe(node);
  }

  ngOnDestroy() { this.io?.disconnect(); }
}
