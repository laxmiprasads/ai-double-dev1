import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ClientAboutComponent } from './components/client-about/client-about.component';
import { ClientCouponsComponent } from './components/client-coupons/client-coupons.component';
import { ClientFaqComponent } from './components/client-faq/client-faq.component';
import { ClientHeroComponent } from './components/client-hero/client-hero.component';
import { ClientMcpComponent } from './components/client-mcp/client-mcp.component';
import { ClientMenuComponent } from './components/client-menu/client-menu.component';
import { ClientNavComponent } from './components/client-nav/client-nav.component';
import { ClientOrderModalComponent } from './components/client-order-modal/client-order-modal.component';
import { ClientReviewsComponent } from './components/client-reviews/client-reviews.component';
import { ClientServicesComponent } from './components/client-services/client-services.component';
import { ClientStatsRibbonComponent } from './components/client-stats-ribbon/client-stats-ribbon.component';
import { CLIENT_APP_BUSINESS, CLIENT_APP_FAQS, CLIENT_APP_MCP_ENDPOINTS, CLIENT_APP_REVIEWS } from './data/client-app.data';
import { ClientBusiness, ClientOrderDraft, ClientService } from './models/client-app.models';
import { ClientAppApiService } from './services/client-app-api.service';

type PanelId = 'services' | 'products' | 'coupons' | 'about' | 'reviews' | 'faq' | 'mcp';
type MenuLoadState = 'idle' | 'loading' | 'success' | 'error';
type CouponLoadState = 'idle' | 'loading' | 'success' | 'error';
type ServiceLoadState = 'idle' | 'loading' | 'success' | 'error';

@Component({
  selector: 'app-client-app',
  standalone: true,
  imports: [
    CommonModule,
    ClientNavComponent,
    ClientHeroComponent,
    ClientStatsRibbonComponent,
    ClientMenuComponent,
    ClientCouponsComponent,
    ClientServicesComponent,
    ClientAboutComponent,
    ClientReviewsComponent,
    ClientFaqComponent,
    ClientMcpComponent,
    ClientOrderModalComponent,
  ],
  templateUrl: './client-app.component.html',
  styleUrls: ['./client-app.component.scss'],
})
export class ClientAppComponent implements OnInit {
  readonly reviews = CLIENT_APP_REVIEWS;
  readonly faqs = CLIENT_APP_FAQS;
  readonly endpoints = CLIENT_APP_MCP_ENDPOINTS;
  readonly baseUrl = 'https://mcp.aidouble.ai/v1/kushi-indian-restaurant';
  readonly tabOrder: PanelId[] = ['services', 'products', 'coupons', 'about', 'reviews', 'faq', 'mcp'];

  activeSection: PanelId = 'services';
  activeCategory = 'all';
  modalOpen = false;
  orderSubmitted = false;
  orderSubmitting = false;
  confirmationCode = '';
  orderErrorMessage = '';
  selectedItem: any = null;
  draft: ClientOrderDraft = this.createDraft();
  menuItems: any[] = [];
  menuState: MenuLoadState = 'idle';
  menuStatusMessage: string = '';
  menuPageNumber = 1;
  menuPageSize = 10;
  menuTotalRecords = 0;
  coupons: any[] = [];
  couponState: CouponLoadState = 'idle';
  couponStatusMessage: string = '';
  couponPageNumber = 1;
  couponPageSize = 10;
  couponTotalRecords = 0;
  services: ClientService[] = [];
  serviceState: ServiceLoadState = 'idle';
  serviceStatusMessage: string = '';
  servicePageNumber = 1;
  servicePageSize = 10;
  serviceTotalRecords = 0;
  dataset: string = '';
  businessName: string = '';
  matchedInstance: any = null;
  businessExists: boolean = true;
  isCheckingBusiness: boolean = true;
  businessStatusMessage: string = '';
  currentjobinstanceid: string = '';
  currentBusinessEmail: string = '';
  @ViewChild('contentTop') contentTop?: ElementRef<HTMLElement>;

  constructor(
    private route: ActivatedRoute,
    private clientAppApiService: ClientAppApiService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.dataset = 'Business';
      this.businessName = params.get('slug') ?? '';
      void this.initializeBusiness();
    });
  }

  get business(): ClientBusiness {
    return {
      ...CLIENT_APP_BUSINESS,
      menuCountLabel: `${this.menuItems.length}+`,
    };
  }

  get menuCategories(): string[] {
    const categories = this.menuItems.map((item) => item['data']['Product SubCategory']).filter(Boolean);
    return [...new Set(categories)];
  }

  get filteredMenuItems(): any[] {
    if (this.activeCategory === 'all') {
      return this.menuItems;
    }
    return this.menuItems.filter((item) => item['data']['Product SubCategory'] === this.activeCategory);
  }

  get openStatus(): string {
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours() + now.getMinutes() / 60;
    const isOpen =
      (day === 0 && (hour >= 8.5 || hour < 0.5)) ||
      (day >= 1 && day <= 4 && hour >= 10 && hour < 23.5) ||
      (day === 5 && hour >= 10) ||
      (day === 6 && hour >= 8.5);

    return isOpen ? 'Open Now' : 'Currently Closed';
  }

  setActiveSection(section: string): void {
    const normalizedSection = section === 'menu' ? 'products' : section;

    if (this.tabOrder.includes(normalizedSection as PanelId)) {
      this.activeSection = normalizedSection as PanelId;
      this.scrollToSectionContent();
    }
  }

  setActiveCategory(category: string): void {
    this.activeCategory = category;
  }

  openOrder(selectedItem?: any): void {
    this.selectedItem = selectedItem ?? null;
    this.modalOpen = true;
    this.orderSubmitted = false;
    this.orderSubmitting = false;
    this.confirmationCode = '';
    this.orderErrorMessage = '';
    this.draft = this.createDraft(this.selectedItem);
  }

  closeOrder(): void {
    if (this.orderSubmitting) {
      return;
    }
    this.modalOpen = false;
  }

  async loadMenu(): Promise<void> {
    this.menuState = 'loading';
    this.menuStatusMessage = 'Fetching menu from API...';

    try {
      const result = await this.clientAppApiService.loadMenu(
        this.currentBusinessEmail,
        this.menuPageNumber,
        this.menuPageSize,
      );
      this.menuItems = result.items;
      this.menuTotalRecords = result.totalRecords;
      this.activeCategory = 'all';
      this.menuState = 'success';
      this.menuStatusMessage = `Menu loaded from API with ${this.menuItems.length} items.`;
    } catch (error) {
      this.menuItems = [];
      this.activeCategory = 'all';
      this.menuState = 'error';
      this.menuStatusMessage = this.clientAppApiService.getErrorMessage(error, 'Unable to load menu from API.');
    } finally {
      this.cdr.markForCheck();
    }
  }

  async loadCoupons(): Promise<void> {
    this.couponState = 'loading';
    this.couponStatusMessage = 'Fetching coupons from API...';

    try {
      const result = await this.clientAppApiService.loadCoupons(
        this.currentBusinessEmail,
        this.couponPageNumber,
        this.couponPageSize,
      );
      this.coupons = result.items;
      this.couponTotalRecords = result.totalRecords;
      this.couponState = 'success';
      this.couponStatusMessage = this.coupons.length
        ? `Coupons loaded from API: ${this.coupons.length}.`
        : 'No coupons available right now.';
    } catch (error) {
      this.coupons = [];
      this.couponState = 'error';
      this.couponStatusMessage = this.clientAppApiService.getErrorMessage(error, 'Unable to load coupons from API.');
    } finally {
      this.cdr.markForCheck();
    }
  }

  async loadServices(): Promise<void> {
    this.serviceState = 'loading';
    this.serviceStatusMessage = 'Fetching services from API...';

    try {
      const result = await this.clientAppApiService.loadServices(
        this.currentBusinessEmail,
        this.servicePageNumber,
        this.servicePageSize,
      );
      this.services = result.items;
      this.serviceTotalRecords = result.totalRecords;
      this.serviceState = 'success';
    } catch (error) {
      this.services = [];
      this.serviceState = 'error';
      this.serviceStatusMessage = this.clientAppApiService.getErrorMessage(error, 'Unable to load services from API.');
    } finally {
      this.cdr.markForCheck();
    }
  }

  onMenuPageChange(pageNumber: number): void {
    this.menuPageNumber = pageNumber;
    void this.loadMenu();
  }

  onMenuPageSizeChange(pageSize: number): void {
    this.menuPageSize = pageSize;
    this.menuPageNumber = 1;
    void this.loadMenu();
  }

  onCouponPageChange(pageNumber: number): void {
    this.couponPageNumber = pageNumber;
    void this.loadCoupons();
  }

  onCouponPageSizeChange(pageSize: number): void {
    this.couponPageSize = pageSize;
    this.couponPageNumber = 1;
    void this.loadCoupons();
  }

  onServicePageChange(pageNumber: number): void {
    this.servicePageNumber = pageNumber;
    void this.loadServices();
  }

  onServicePageSizeChange(pageSize: number): void {
    this.servicePageSize = pageSize;
    this.servicePageNumber = 1;
    void this.loadServices();
  }

  async submitOrder(): Promise<void> {
    if (
      !this.draft.customerName.trim() ||
      !this.draft.customerEmail.trim() ||
      !this.draft.customerPhone.trim()
    ) {
      this.orderErrorMessage = 'Please enter your name, email, and phone number.';
      return;
    }

    if (this.draft.fulfilment !== 'pickup' && !this.draft.deliveryAddress.trim()) {
      this.orderErrorMessage = 'Please enter a delivery address for delivery orders.';
      return;
    }

    this.orderSubmitting = true;
    this.orderSubmitted = false;
    this.orderErrorMessage = '';

    try {
      this.confirmationCode = await this.clientAppApiService.submitOrder(this.selectedItem, this.draft);
      this.orderSubmitted = true;
    } catch (error) {
      this.orderErrorMessage = this.clientAppApiService.getErrorMessage(
        error,
        'Unable to place your order right now. Please try again.',
      );
    } finally {
      this.orderSubmitting = false;
      this.cdr.markForCheck();
    }
  }

  private createDraft(item?: any): ClientOrderDraft {
    return {
      itemId: item?.id ?? null,
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      deliveryAddress: '',
      fulfilment: 'pickup',
      spiceLevel: item?.spiceLevel ?? 2,
      quantity: 1,
    };
  }

  private async initializeBusiness(): Promise<void> {
    this.isCheckingBusiness = true;
    this.businessExists = true;
    this.businessStatusMessage = '';
    this.matchedInstance = null;
    this.resetPaginationState();

    if (!this.dataset.trim() || !this.businessName.trim()) {
      this.businessExists = false;
      this.businessStatusMessage = 'Business not exist.';
      this.resetContentState();
      this.isCheckingBusiness = false;
      return;
    }

    try {
      const business = await this.clientAppApiService.findInstanceByName(this.dataset, this.businessName);
      if (!business) {
        this.businessExists = false;
        this.businessStatusMessage = 'Business not exist.';
        this.resetContentState();
        return;
      }

      this.matchedInstance = business;
      this.currentjobinstanceid = this.matchedInstance['jobInstanceId'];
      this.currentBusinessEmail = this.matchedInstance.data['Work Email'];
      this.businessExists = true;
      await Promise.all([
        this.loadServices(),
        this.loadMenu(),
        this.loadCoupons(),
      ]);
    } catch (error) {
      this.businessExists = false;
      this.businessStatusMessage = this.clientAppApiService.getErrorMessage(
        error,
        'Unable to verify business details.',
      );
      this.resetContentState();
    } finally {
      this.isCheckingBusiness = false;
      this.cdr.markForCheck();
    }
  }

  private resetContentState(): void {
    this.menuItems = [];
    this.coupons = [];
    this.services = [];
    this.menuTotalRecords = 0;
    this.couponTotalRecords = 0;
    this.serviceTotalRecords = 0;
    this.matchedInstance = null;
    this.menuState = 'idle';
    this.couponState = 'idle';
    this.serviceState = 'idle';
    this.menuStatusMessage = '';
    this.couponStatusMessage = '';
    this.serviceStatusMessage = '';
  }

  private resetPaginationState(): void {
    this.menuPageNumber = 1;
    this.couponPageNumber = 1;
    this.servicePageNumber = 1;
    this.menuTotalRecords = 0;
    this.couponTotalRecords = 0;
    this.serviceTotalRecords = 0;
  }

  private scrollToSectionContent(): void {
    const target = this.contentTop?.nativeElement;
    if (!target) {
      return;
    }

    const stickyOffset = 96;
    const top = Math.max(0, window.scrollY + target.getBoundingClientRect().top - stickyOffset);
    window.scrollTo({ top, behavior: 'smooth' });
  }
}
