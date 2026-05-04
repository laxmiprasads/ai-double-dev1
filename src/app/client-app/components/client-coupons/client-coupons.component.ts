import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';

type CouponLoadState = 'idle' | 'loading' | 'success' | 'error';

@Component({
  selector: 'app-client-coupons',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './client-coupons.component.html',
  styleUrls: ['./client-coupons.component.scss'],
})
export class ClientCouponsComponent implements OnDestroy {
  @Input() coupons: any[] = [];
  @Input() couponState: CouponLoadState = 'idle';
  @Input() statusMessage = '';
  @Input() pageNumber = 1;
  @Input() pageSize = 10;
  @Input() totalRecords = 0;
  @Output() retry = new EventEmitter<void>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();
  copiedId = '';
  copyMessage = '';
  isCopyError = false;
  readonly pageSizeOptions = [10, 20, 50];
  private copyResetTimer?: ReturnType<typeof setTimeout>;

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalRecords / this.pageSize));
  }

  get firstRecord(): number {
    return this.totalRecords ? (this.pageNumber - 1) * this.pageSize + 1 : 0;
  }

  get lastRecord(): number {
    return Math.min(this.pageNumber * this.pageSize, this.totalRecords);
  }

  goToPage(pageNumber: number): void {
    if (pageNumber < 1 || pageNumber > this.totalPages || pageNumber === this.pageNumber) {
      return;
    }

    this.pageChange.emit(pageNumber);
  }

  updatePageSize(event: Event): void {
    const pageSize = Number((event.target as HTMLSelectElement).value);
    this.pageSizeChange.emit(pageSize);
  }

  getCouponId(coupon: any): string {
    return String(coupon?.id ?? coupon?.jobInstanceId ?? coupon?.data?.['Coupon Code'] ?? '');
  }

  async copyCode(coupon: any): Promise<void> {
    const code = String(coupon?.data?.['Coupon Code'] ?? coupon?.code ?? '').trim();

    if (!code) {
      this.showCopyMessage('', 'Coupon code is not available.', true);
      return;
    }

    try {
      await navigator.clipboard.writeText(code);
      this.showCopyMessage(this.getCouponId(coupon), `${code} copied to clipboard`, false);
    } catch {
      this.showCopyMessage('', 'Unable to copy code. Please try again.', true);
    }
  }

  ngOnDestroy(): void {
    if (this.copyResetTimer) {
      clearTimeout(this.copyResetTimer);
    }
  }

  private showCopyMessage(copiedId: string, message: string, isError = false): void {
    this.copiedId = copiedId;
    this.copyMessage = message;
    this.isCopyError = isError;

    if (this.copyResetTimer) {
      clearTimeout(this.copyResetTimer);
    }

    this.copyResetTimer = setTimeout(() => {
      this.copiedId = '';
      this.copyMessage = '';
      this.isCopyError = false;
    }, 2200);
  }
}
