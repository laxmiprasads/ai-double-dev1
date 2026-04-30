import { Component, computed, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

interface StoredUser {
  email: string;
  name: string;
  firstName: string;
  picture?: string;
  sub: string;
  slug: string;
}

@Component({
  selector: 'app-user-home-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './user-home-page.html',
  styleUrl: './user-home-page.css',
})
export class UserHomePage {
  readonly slug: string;
  readonly user = signal<StoredUser | null>(null);
  readonly displayName = computed(
    () => this.user()?.firstName ?? this.slug,
  );

  constructor(private route: ActivatedRoute, private router: Router) {
    this.slug = this.route.snapshot.paramMap.get('slug') ?? '';
    const raw = localStorage.getItem('aiDoubleUser');
    if (raw) {
      try {
        const parsed: StoredUser = JSON.parse(raw);
        if (parsed.slug === this.slug) {
          this.user.set(parsed);
        }
      } catch {
        // ignore
      }
    }
  }

  signOut(): void {
    localStorage.removeItem('aiDoubleUser');
    this.router.navigate(['/login']);
  }
}
