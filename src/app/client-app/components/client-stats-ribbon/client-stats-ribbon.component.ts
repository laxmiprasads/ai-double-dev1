import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-client-stats-ribbon',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './client-stats-ribbon.component.html',
  styleUrls: ['./client-stats-ribbon.component.scss'],
})
export class ClientStatsRibbonComponent {
  @Input() currentBusiness: any;
  @Input() totalProducts: number = 0;

  get showsRoundedTotalProducts(): boolean {
    return this.totalProducts >= 10;
  }

  get roundedTotalProducts(): number {
    if (!this.showsRoundedTotalProducts) {
      return this.totalProducts;
    }

    return Math.floor(this.totalProducts / 10) * 10;
  }
}
