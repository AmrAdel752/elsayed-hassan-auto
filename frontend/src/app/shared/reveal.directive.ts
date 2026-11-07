import { Directive, ElementRef, OnDestroy, OnInit, inject, input } from '@angular/core';

/** Fades/slides the host in when it scrolls into view. Optional delay in seconds. */
@Directive({ selector: '[reveal]', host: { class: 'reveal' } })
export class Reveal implements OnInit, OnDestroy {
  readonly reveal = input<number | ''>('');
  private readonly el = inject(ElementRef<HTMLElement>);
  private io?: IntersectionObserver;

  ngOnInit() {
    const node = this.el.nativeElement;
    if (this.reveal()) node.style.transitionDelay = `${this.reveal()}s`;
    this.io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      node.classList.add('in');
      this.io?.disconnect();
    }, { threshold: 0.15 });
    this.io.observe(node);
  }

  ngOnDestroy() { this.io?.disconnect(); }
}
