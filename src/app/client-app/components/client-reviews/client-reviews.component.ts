import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ClientReview } from '../../models/client-app.models';

@Component({
  selector: 'app-client-reviews',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './client-reviews.component.html',
  styleUrls: ['./client-reviews.component.scss'],
})
export class ClientReviewsComponent {
  @Input() reviews: ClientReview[] = [];

  readonly ratingRows = [
    { label: '5*', value: 62 },
    { label: '4*', value: 15 },
    { label: '3*', value: 15 },
    { label: '2*', value: 8 },
    { label: '1*', value: 0 },
  ];
}
