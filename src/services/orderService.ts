import { apiClient } from './apiClient';
import type {
  CreateOrderPayload,
  Order,
  PriceEstimationRequest,
  PriceEstimationResponse,
  PrintConfiguration,
} from '../types';

/**
 * Normalizes backend order payload into standard frontend model
 */
export function normalizeOrder(raw: any, shopPublicId?: string, accessToken?: string): Order {
  const printConfig = raw.printConfig || {};
  const pricing = raw.pricing || {};
  const document = raw.document || {};

  const totalAmount =
    typeof pricing.totalAmount === 'number'
      ? pricing.totalAmount
      : typeof raw.estimatedPrice === 'number'
      ? raw.estimatedPrice
      : 0;

  const pagesToPrint =
    printConfig.pagesToPrintCount ||
    raw.calculatedPages ||
    document.totalPages ||
    1;

  const copies = printConfig.copies || raw.config?.copies || 1;
  const paperSize = printConfig.paperSize || raw.config?.paperSize || 'A4';
  const printType =
    printConfig.printType === 'BLACK_WHITE' || raw.config?.printType === 'BW'
      ? 'BW'
      : 'COLOR';
  const side = printConfig.printSides || raw.config?.side || 'SINGLE';

  const pageSelection = {
    type: printConfig.pageSelection?.type || raw.config?.pageSelection?.type || 'ALL',
    range:
      printConfig.pageSelection?.customValue ||
      raw.config?.pageSelection?.range ||
      undefined,
    customValue:
      printConfig.pageSelection?.customValue ||
      raw.config?.pageSelection?.customValue ||
      null,
  };

  const currentToken = accessToken || raw.customerAccessToken || raw.accessToken || '';

  return {
    id: raw._id || raw.id || raw.orderNumber,
    _id: raw._id,
    orderNumber: raw.orderNumber,
    shopId: raw.shopId || '',
    shopPublicId: shopPublicId || raw.shopPublicId || '',
    shopName: raw.shopName || 'Print Shop',
    accessToken: currentToken,
    customerAccessToken: currentToken,
    status: raw.status || 'SUBMITTED',
    customerPhone: raw.customerPhone || '',
    customerNotes: raw.customerNotes || '',
    customerName: raw.customerName || (raw.customerPhone ? `Customer (${raw.customerPhone})` : 'Walk-in Customer'),
    document: {
      storageKey: document.storageKey,
      originalName: document.originalName || 'document.pdf',
      fileSizeBytes: document.fileSizeBytes || document.fileSize || 0,
      fileSize: document.fileSizeBytes || document.fileSize || 0,
      totalPages: document.totalPages || 1,
      downloadUrl: document.downloadUrl,
      uploadedAt: document.uploadedAt,
      expiresAt: document.expiresAt,
      uploadStatus: document.uploadStatus || 'UPLOADED',
      isDeleted: document.isDeleted || false,
    },
    printConfig: {
      copies,
      paperSize,
      printType: printType === 'BW' ? 'BLACK_WHITE' : 'COLOR',
      printSides: side,
      pageSelection,
      pagesToPrintCount: pagesToPrint,
      pageNumbers: printConfig.pageNumbers,
    },
    pricing: {
      unitRates: pricing.unitRates,
      costPerCopy: pricing.costPerCopy || 0,
      totalAmount,
      currency: pricing.currency || 'INR',
    },
    statusHistory: raw.statusHistory || [],
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt,
    // UI Helpers
    calculatedPages: pagesToPrint,
    estimatedPrice: totalAmount,
    config: {
      copies,
      paperSize,
      printType,
      side,
      pageSelection,
    },
    statusNotes: raw.statusHistory?.[raw.statusHistory.length - 1]?.note,
  };
}

/**
 * Calculates page count from page selection configuration (client-side preview helper)
 */
export function calculateSelectedPages(
  totalPages: number,
  config: PrintConfiguration
): number {
  if (totalPages <= 0) return 0;
  const { type, range, customValue } = config.pageSelection;
  const targetRange = range || customValue;

  switch (type) {
    case 'ALL':
      return totalPages;

    case 'ODD':
      return Math.ceil(totalPages / 2);

    case 'EVEN':
      return Math.floor(totalPages / 2);

    case 'RANGE':
    case 'CUSTOM':
    case 'SPECIFIC': {
      if (!targetRange || !targetRange.trim()) return totalPages;
      const pageSet = new Set<number>();
      const parts = targetRange.split(',');

      for (const part of parts) {
        const trimmed = part.trim();
        if (trimmed.includes('-')) {
          const [startStr, endStr] = trimmed.split('-');
          const start = parseInt(startStr, 10);
          const end = parseInt(endStr, 10);
          if (!isNaN(start) && !isNaN(end)) {
            const min = Math.max(1, Math.min(start, end));
            const max = Math.min(totalPages, Math.max(start, end));
            for (let p = min; p <= max; p++) {
              pageSet.add(p);
            }
          }
        } else {
          const p = parseInt(trimmed, 10);
          if (!isNaN(p) && p >= 1 && p <= totalPages) {
            pageSet.add(p);
          }
        }
      }

      return pageSet.size > 0 ? pageSet.size : totalPages;
    }

    default:
      return totalPages;
  }
}

export const orderService = {
  /**
   * Request authoritative price calculation from backend
   * Endpoint: POST /api/v1/orders/calculate-price
   */
  async estimatePrice(req: PriceEstimationRequest): Promise<PriceEstimationResponse> {
    const printType = req.config.printType === 'BW' ? 'BLACK_WHITE' : req.config.printType;
    const pageSelectionType =
      req.config.pageSelection.type === 'SPECIFIC'
        ? 'RANGE'
        : req.config.pageSelection.type;

    const payload = {
      shopIdentifier: req.shopPublicId,
      totalDocPages: Math.max(1, req.totalPages),
      copies: Math.max(1, req.config.copies),
      paperSize: req.config.paperSize,
      printType,
      printSides: req.config.side,
      pageSelectionType,
      pageSelectionCustomValue: req.config.pageSelection.range || null,
    };

    const res = await apiClient<any>('/orders/calculate-price', {
      method: 'POST',
      body: payload,
    });

    return {
      calculatedPages: res.pagesToPrintCount,
      estimatedPrice: res.pricing?.totalAmount ?? 0,
      pricePerSheet: res.pricing?.unitRates?.single ?? 0,
      pageNumbers: res.pageNumbers,
      currency: res.pricing?.currency || 'INR',
    };
  },

  /**
   * Submit new print order with PDF file directly to backend
   * Endpoint: POST /api/v1/orders (multipart/form-data)
   */
  async submitOrder(payload: CreateOrderPayload): Promise<Order> {
    const formData = new FormData();
    formData.append('document', payload.documentFile);
    formData.append('shopIdentifier', payload.shopPublicId);
    formData.append('copies', String(payload.config.copies));
    formData.append('paperSize', payload.config.paperSize);
    formData.append(
      'printType',
      payload.config.printType === 'BW' ? 'BLACK_WHITE' : payload.config.printType
    );
    formData.append('printSides', payload.config.side);

    const pageType =
      payload.config.pageSelection.type === 'SPECIFIC'
        ? 'RANGE'
        : payload.config.pageSelection.type;
    formData.append('pageSelectionType', pageType);

    if (payload.config.pageSelection.range) {
      formData.append('pageSelectionCustomValue', payload.config.pageSelection.range);
    }

    if (payload.customerPhone) {
      formData.append('customerPhone', payload.customerPhone);
    }

    if (payload.customerNotes || payload.customerName) {
      formData.append(
        'customerNotes',
        [payload.customerName ? `Name: ${payload.customerName}` : '', payload.customerNotes || '']
          .filter(Boolean)
          .join(' | ')
      );
    }

    const rawOrder = await apiClient<any>('/orders', {
      method: 'POST',
      body: formData,
    });

    return normalizeOrder(rawOrder, payload.shopPublicId, rawOrder.customerAccessToken);
  },

  /**
   * Track order by order number and customerAccessToken
   * Endpoint: GET /api/v1/orders/track/:orderNumber?token=:customerAccessToken
   */
  async trackOrder(orderNumber: string, accessToken: string): Promise<Order> {
    const rawOrder = await apiClient<any>(
      `/orders/track/${encodeURIComponent(orderNumber.trim())}`,
      {
        params: { token: accessToken },
        orderToken: accessToken,
      }
    );

    return normalizeOrder(rawOrder, undefined, accessToken);
  },

  /**
   * Request temporary signed URL for customer document
   * Endpoint: GET /api/v1/orders/track/:orderNumber/document
   */
  async getCustomerDocumentUrl(
    orderNumber: string,
    accessToken: string
  ): Promise<{ downloadUrl: string; expiresInSeconds: number; originalName: string }> {
    return apiClient<{ downloadUrl: string; expiresInSeconds: number; originalName: string }>(
      `/orders/track/${encodeURIComponent(orderNumber.trim())}/document`,
      {
        params: { token: accessToken },
        orderToken: accessToken,
      }
    );
  },
};
