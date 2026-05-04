import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ClientFaq } from '../../models/client-app.models';

@Component({
  selector: 'app-client-faq',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './client-faq.component.html',
  styleUrls: ['./client-faq.component.scss'],
})
export class ClientFaqComponent {
  @Input() faqs: ClientFaq[] = [];
  openIndex = 0;

  toggle(index: number): void {
    this.openIndex = this.openIndex === index ? -1 : index;
  }
}
