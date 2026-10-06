import type { Shop, Order, PricingConfig } from '../types';

const INITIAL_PRICING: PricingConfig = {
  a4: {
    bwSingle: 2,
    bwDouble: 3,
    colorSingle: 10,
    colorDouble: 15,
  },
  a3: {
    bwSingle: 5,
    bwDouble: 8,
    colorSingle: 20,
    colorDouble: 30,
  },
};

const INITIAL_SHOP: Shop = {
  id: 'shop_001',
  publicId: 'quickprint-central',
  name: 'QuickPrint Central & Stationery',
  isAcceptingOrders: true,
  contactNumber: '+91 98765 43210',
  address: 'Shop 4, Campus Arcade, University Road',
  pricing: INITIAL_PRICING,
  createdAt: new Date().toISOString(),
};

const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord_101',
    orderNumber: '1042',
    shopId: 'shop_001',
    shopPublicId: 'quickprint-central',
    shopName: 'QuickPrint Central & Stationery',
    accessToken: 'tok_live_1042_a8f9e',
    status: 'SUBMITTED',
    customerName: 'Rahul Verma',
    customerPhone: '9876543210',
    document: {
      originalName: 'Operating_Systems_Assignment_Final.pdf',
      fileSize: 2458000,
      totalPages: 18,
      downloadUrl: 'https://example.com/docs/signed/Operating_Systems_Assignment_Final.pdf',
    },
    config: {
      copies: 2,
      paperSize: 'A4',
      printType: 'BW',
      side: 'SINGLE',
      pageSelection: { type: 'RANGE', range: '1-5' },
    },
    calculatedPages: 5,
    estimatedPrice: 20,
    createdAt: new Date(Date.now() - 1000 * 60 * 4).toISOString(), // 4 mins ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
  },
  {
    id: 'ord_102',
    orderNumber: '1041',
    shopId: 'shop_001',
    shopPublicId: 'quickprint-central',
    shopName: 'QuickPrint Central & Stationery',
    accessToken: 'tok_live_1041_c4b2d',
    status: 'ACCEPTED',
    customerName: 'Priya Sharma',
    document: {
      originalName: 'Project_Design_Report_v2.pdf',
      fileSize: 4890000,
      totalPages: 24,
      downloadUrl: 'https://example.com/docs/signed/Project_Design_Report_v2.pdf',
    },
    config: {
      copies: 1,
      paperSize: 'A4',
      printType: 'COLOR',
      side: 'DOUBLE',
      pageSelection: { type: 'ALL' },
    },
    calculatedPages: 24,
    estimatedPrice: 180,
    createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(), // 18 mins ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
  },
  {
    id: 'ord_103',
    orderNumber: '1040',
    shopId: 'shop_001',
    shopPublicId: 'quickprint-central',
    shopName: 'QuickPrint Central & Stationery',
    accessToken: 'tok_live_1040_77a1e',
    status: 'PRINTING',
    customerName: 'Aditya Mehta',
    document: {
      originalName: 'Architectural_Floor_Plan_A3.pdf',
      fileSize: 8200000,
      totalPages: 4,
      downloadUrl: 'https://example.com/docs/signed/Architectural_Floor_Plan_A3.pdf',
    },
    config: {
      copies: 3,
      paperSize: 'A3',
      printType: 'COLOR',
      side: 'SINGLE',
      pageSelection: { type: 'ALL' },
    },
    calculatedPages: 4,
    estimatedPrice: 240,
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: 'ord_104',
    orderNumber: '1039',
    shopId: 'shop_001',
    shopPublicId: 'quickprint-central',
    shopName: 'QuickPrint Central & Stationery',
    accessToken: 'tok_live_1039_99f3c',
    status: 'COMPLETED',
    customerName: 'Neha Joshi',
    document: {
      originalName: 'Resume_2026.pdf',
      fileSize: 420000,
      totalPages: 2,
      downloadUrl: 'https://example.com/docs/signed/Resume_2026.pdf',
    },
    config: {
      copies: 5,
      paperSize: 'A4',
      printType: 'BW',
      side: 'SINGLE',
      pageSelection: { type: 'ALL' },
    },
    calculatedPages: 2,
    estimatedPrice: 20,
    createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
];

const STORAGE_KEYS = {
  SHOP: 'printflow_shop',
  ORDERS: 'printflow_orders',
};

class MockDatabase {
  private getShopData(): Shop {
    const raw = localStorage.getItem(STORAGE_KEYS.SHOP);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SHOP, JSON.stringify(INITIAL_SHOP));
      return INITIAL_SHOP;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_SHOP;
    }
  }

  private setShopData(shop: Shop) {
    localStorage.setItem(STORAGE_KEYS.SHOP, JSON.stringify(shop));
  }

  private getOrdersData(): Order[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
      return INITIAL_ORDERS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_ORDERS;
    }
  }

  private setOrdersData(orders: Order[]) {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }

  // Shop APIs
  getShopByPublicId(publicId: string): Shop | null {
    const shop = this.getShopData();
    if (shop.publicId.toLowerCase() === publicId.toLowerCase()) {
      return shop;
    }
    // Fallback for demo convenience so any custom slug can preview the shop
    return {
      ...shop,
      publicId,
      name: `${publicId.replace(/-/g, ' ').toUpperCase()} Print Store`,
    };
  }

  updateShop(updates: Partial<Shop>): Shop {
    const current = this.getShopData();
    const updated = { ...current, ...updates };
    this.setShopData(updated);
    return updated;
  }

  updatePricing(pricing: PricingConfig): Shop {
    return this.updateShop({ pricing });
  }

  toggleShopAcceptingOrders(accepting: boolean): Shop {
    return this.updateShop({ isAcceptingOrders: accepting });
  }

  // Orders APIs
  getOrders(): Order[] {
    return this.getOrdersData().sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  getOrderById(id: string): Order | null {
    const orders = this.getOrdersData();
    return orders.find((o) => o.id === id) || null;
  }

  getOrderByAccessToken(accessToken: string): Order | null {
    const orders = this.getOrdersData();
    return orders.find((o) => o.accessToken === accessToken) || null;
  }

  createOrder(order: Omit<Order, 'id' | 'orderNumber' | 'accessToken' | 'createdAt' | 'updatedAt'>): Order {
    const orders = this.getOrdersData();
    const nextNum = (Math.max(1042, ...orders.map((o) => parseInt(o.orderNumber, 10) || 1000)) + 1).toString();
    const newOrder: Order = {
      ...order,
      id: `ord_${Date.now()}`,
      orderNumber: nextNum,
      accessToken: `tok_${Math.random().toString(36).substring(2, 9)}_${Date.now().toString(36)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    orders.unshift(newOrder);
    this.setOrdersData(orders);
    return newOrder;
  }

  updateOrderStatus(id: string, status: Order['status'], notes?: string): Order | null {
    const orders = this.getOrdersData();
    const idx = orders.findIndex((o) => o.id === id);
    if (idx === -1) return null;

    orders[idx] = {
      ...orders[idx],
      status,
      statusNotes: notes || orders[idx].statusNotes,
      updatedAt: new Date().toISOString(),
    };
    this.setOrdersData(orders);
    return orders[idx];
  }

  resetToInitial() {
    localStorage.setItem(STORAGE_KEYS.SHOP, JSON.stringify(INITIAL_SHOP));
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
  }
}

export const mockDb = new MockDatabase();
