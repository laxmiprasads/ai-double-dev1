import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';

@Component({
  selector: 'app-login-page',
  standalone: true,
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
  encapsulation: ViewEncapsulation.None,
})
export class LoginPage implements AfterViewInit {
  @ViewChild('emailInput') emailInput!: ElementRef<HTMLInputElement>;
  @ViewChild('passwordInput') passwordInput!: ElementRef<HTMLInputElement>;
  @ViewChild('submitBtn') submitBtn!: ElementRef<HTMLButtonElement>;
  @ViewChild('errorBanner') errorBanner!: ElementRef<HTMLDivElement>;
  @ViewChild('leftPanel') leftPanel!: ElementRef<HTMLDivElement>;

  passwordVisible = false;

  ngAfterViewInit(): void {
    const left = this.leftPanel.nativeElement;
    left.style.opacity = '0';
    left.style.transform = 'translateX(-20px)';
    left.style.transition = 'opacity .6s ease, transform .6s ease';
    setTimeout(() => {
      left.style.opacity = '1';
      left.style.transform = 'none';
    }, 60);
  }

  togglePw(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  socialLogin(provider: string, ev: Event): void {
    const btn = ev.currentTarget as HTMLElement;
    btn.style.opacity = '0.6';
    btn.textContent = 'Connecting...';
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 1200);
  }

  doLogin(): void {
    const email = this.emailInput.nativeElement.value.trim();
    const password = this.passwordInput.nativeElement.value;
    const btn = this.submitBtn.nativeElement;
    const err = this.errorBanner.nativeElement;

    err.classList.remove('show');

    if (!email || !password) {
      err.textContent = 'Please enter your email and password.';
      err.classList.add('show');
      return;
    }

    btn.classList.add('loading');

    setTimeout(() => {
      btn.classList.remove('loading');
      window.location.href = 'dashboard.html';
    }, 1400);
  }

  @HostListener('window:keydown', ['$event'])
  onKeydown(e: KeyboardEvent): void {
    if (e.key === 'Enter') this.doLogin();
  }
}
