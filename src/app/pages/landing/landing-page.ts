import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewEncapsulation,
} from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
  encapsulation: ViewEncapsulation.None,
})
export class LandingPage implements AfterViewInit, OnDestroy {
  private observers: IntersectionObserver[] = [];

  constructor(private host: ElementRef<HTMLElement>) {}

  ngAfterViewInit(): void {
    const root = this.host.nativeElement;

    const revealObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            revealObs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.07 },
    );
    root.querySelectorAll('.reveal').forEach((el) => revealObs.observe(el));
    this.observers.push(revealObs);

    const heroLeft = root.querySelectorAll<HTMLElement>('.hero-left > *');
    heroLeft.forEach((el, i) => {
      el.style.cssText += `opacity:0;transform:translateY(22px);transition:opacity .65s ease ${i * 0.11}s,transform .65s ease ${i * 0.11}s`;
      requestAnimationFrame(() =>
        setTimeout(() => {
          el.style.opacity = '1';
          el.style.transform = 'none';
        }, 80),
      );
    });
    root.querySelectorAll<HTMLElement>('.hero-stat-card').forEach((el, i) => {
      el.style.cssText += `opacity:0;transform:translateX(20px);transition:opacity .55s ease ${0.3 + i * 0.1}s,transform .55s ease ${0.3 + i * 0.1}s`;
      requestAnimationFrame(() =>
        setTimeout(() => {
          el.style.opacity = '1';
          el.style.transform = 'none';
        }, 80),
      );
    });

    const barObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.querySelectorAll('.rb-fill').forEach((bar, i) => {
              setTimeout(() => bar.classList.add('go'), i * 180);
            });
            barObs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.3 },
    );
    root.querySelectorAll('.result-bars').forEach((el) => barObs.observe(el));
    this.observers.push(barObs);
  }

  ngOnDestroy(): void {
    this.observers.forEach((o) => o.disconnect());
  }
}
