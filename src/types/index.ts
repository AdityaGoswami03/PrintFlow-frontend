export type OrderStatus =
  | 'SUBMITTED'
  | 'ACCEPTED'
  | 'PRINTING'
  | 'COMPLETED'
  | 'REJECTED'
  | 'CANCELLED';

export type PaperSize = 'A4' | 'A3' | 'LEGAL' | 'LETTER';
export type PrintType = 'BLACK_WHITE' | 'COLOR' | 'BW';
export type PrintSide = 'SINGLE' | 'DOUBLE';
export type PageSelectionType = 'ALL' | 'RANGE' | 'CUSTOM' | 'ODD' | 'EVEN' | 'SPECIFIC';

export interface PageSelection {
  type: PageSelectionType;
  range?: string; // Frontend helper mapped to customValue
  customValue?: string | null;
}

export interface PrintConfiguration {
  copies: number;
  paperSize: PaperSize;
  printType: 'BLACK_WHITE' | 'COLOR' | 'BW';
  side: PrintSide; // Mapped to printSides in API
  pageSelection: PageSelection;
}

export interface RatePair {
  single: number;
  double: number;
}

export interface SizePricing {
  BLACK_WHITE: RatePair;
  COLOR: RatePair;
}

export interface BackendPricingConfig {
  A4: SizePricing;
  A3: SizePricing;
}

// Flat convenience structure for UI display
export interface PricingRate {
  bwSingle: number;
  bwDouble: number;
  colorSingle: number;
  colorDouble: number;
}

export interface PricingConfig {
  a4: PricingRate;
  a3: PricingRate;
}

export interface ShopAddress {
  street?: string;
  city?: string;
  landmark?: string;
}

export interface Shop {
  id: string;
  _id?: string;
  publicId: string;
  slug: string;
  publicIdentifier: string;
  name: string;
  isOpen: boolean;
  isAcceptingOrders: boolean; // Alias for isOpen
  contactNumber?: string;
  address?: ShopAddress | string;
  pricing: BackendPricingConfig;
  createdAt?: string;
}

export interface OrderDocument {
  storageKey?: string;
  originalName: string;
  mimeType?: string;
  fileSizeBytes: number;
  fileSize?: number;
  totalPages: number;
  downloadUrl?: string;
  uploadedAt?: string;
  expiresAt?: string;
  uploadStatus?: 'PENDING' | 'UPLOADED' | 'DELETED';
  isDeleted?: boolean;
}

export interface OrderPrintConfig {
  copies: number;
  paperSize: PaperSize;
  printType: 'BLACK_WHITE' | 'COLOR';
  printSides: PrintSide;
  pageSelection: {
    type: PageSelectionType;
    customValue?: string | null;
  };
  pagesToPrintCount: number;
  pageNumbers?: number[];
}

export interface OrderPricing {
  unitRates?: {
    single: number;
    double: number;
  };
  costPerCopy: number;
  totalAmount: number;
  currency: string;
}

export interface StatusHistoryEntry {
  status: OrderStatus;
  changedAt: string;
  changedBy?: string;
  note?: string;
}

export interface Order {
  id: string;
  _id?: string;
  orderNumber: string;
  shopId?: string;
  shopPublicId?: string;
  shopName?: string;
  accessToken?: string;
  customerAccessToken?: string;
  status: OrderStatus;
  customerPhone?: string;
  customerNotes?: string;
  customerName?: string;
  document: OrderDocument;
  printConfig: OrderPrintConfig;
  pricing: OrderPricing;
  statusHistory?: StatusHistoryEntry[];
  createdAt: string;
  updatedAt?: string;
  // UI helper computed fields
  calculatedPages: number;
  estimatedPrice: number;
  config: PrintConfiguration;
  statusNotes?: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role?: string;
  shopId?: string;
  shopName?: string;
  shopPublicId?: string;
  token: string;
}

export interface CreateOrderPayload {
  shopPublicId: string;
  customerPhone?: string;
  customerNotes?: string;
  customerName?: string;
  documentFile: File;
  config: PrintConfiguration;
}

export interface PriceEstimationRequest {
  shopPublicId: string;
  totalPages: number;
  config: PrintConfiguration;
}

export interface PriceEstimationResponse {
  calculatedPages: number;
  estimatedPrice: number;
  pricePerSheet: number;
  pageNumbers?: number[];
  currency?: string;
}

export interface ApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}

export interface OrdersListResponse {
  orders: Order[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
