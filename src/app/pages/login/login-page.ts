import {
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';

// TODO: Replace with the OAuth Web Client ID from
// https://console.cloud.google.com/apis/credentials
const GOOGLE_CLIENT_ID = '219118808458-eg2ofqri0e0adkvpj672ul6botrgt3om.apps.googleusercontent.com';

interface GooglePayload {
  email: string;
  name: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  sub: string;
  email_verified?: boolean;
}

declare const google: any;

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
  encapsulation: ViewEncapsulation.None,
})
export class LoginPage implements AfterViewInit {
  @ViewChild('googleBtn') googleBtn!: ElementRef<HTMLDivElement>;
  @ViewChild('leftPanel') leftPanel!: ElementRef<HTMLDivElement>;

  errorMessage = '';

  constructor(private router: Router, private zone: NgZone) {}

  ngAfterViewInit(): void {
    const left = this.leftPanel.nativeElement;
    left.style.opacity = '0';
    left.style.transform = 'translateX(-20px)';
    left.style.transition = 'opacity .6s ease, transform .6s ease';
    setTimeout(() => {
      left.style.opacity = '1';
      left.style.transform = 'none';
    }, 60);

    this.waitForGoogle().then(() => this.initGoogle());
  }

  private waitForGoogle(): Promise<void> {
    return new Promise((resolve) => {
      const tick = () => {
        if (typeof google !== 'undefined' && google.accounts?.id) {
          resolve();
        } else {
          setTimeout(tick, 50);
        }
      };
      tick();
    });
  }

  private initGoogle(): void {
    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response: { credential: string }) =>
        this.zone.run(() => this.handleCredential(response.credential)),
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    google.accounts.id.renderButton(this.googleBtn.nativeElement, {
      type: 'standard',
      theme: 'filled_white',
      size: 'large',
      text: 'continue_with',
      shape: 'rectangular',
      logo_alignment: 'left',
      width: 320,
    });
  }

  private handleCredential(jwt: string): void {
    const payload = this.decodeJwt(jwt);
    if (!payload) {
      this.errorMessage = 'Could not read Google response.';
      return;
    }

    const firstName = payload.given_name || payload.name.split(' ')[0] || 'user';
    const slug = this.slugify(firstName);

    localStorage.setItem(
      'aiDoubleUser',
      JSON.stringify({
        email: payload.email,
        name: payload.name,
        firstName,
        picture: payload.picture,
        sub: payload.sub,
        slug,
      }),
    );

    this.router.navigate(['/' + slug]);
  }

  private decodeJwt(token: string): GooglePayload | null {
    try {
      const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const json = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join(''),
      );
      return JSON.parse(json);
    } catch {
      return null;
    }
  }

  private slugify(s: string): string {
    return s
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
