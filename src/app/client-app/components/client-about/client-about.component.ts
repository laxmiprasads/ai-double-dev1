import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ClientBusiness } from '../../models/client-app.models';

@Component({
  selector: 'app-client-about',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './client-about.component.html',
  styleUrls: ['./client-about.component.scss'],
})
export class ClientAboutComponent {
  @Input({ required: true }) business!: ClientBusiness;

  get todayName(): string {
    return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()];
  }
}
