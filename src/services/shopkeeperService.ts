import { apiClient } from './apiClient';
import type {
  AuthUser,
  BackendPricingConfig,
  Order,
  OrderStatus,
  OrdersListResponse,
  PricingConfig,
  Shop,
} from '../types';
import { normalizeOrder } from './orderService';

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface RegisterShopkeeperPayload {
  name: string;
  email: string;
  password: string;
  shopName: string;
  contactNumber?: string;
  address?: {
    street?: string;
    city?: string;
    landmark?: string;
  };
}

export const shopkeeperService = {
  /**
   * Shopkeeper registration / onboarding
   * Endpoint: POST /api/v1/auth/register
   */
  async register(payload: RegisterShopkeeperPayload): Promise<AuthUser> {
    const data = await apiClient<any>('/auth/register', {
      method: 'POST',
      body: {
        name: payload.name.trim(),
        email: payload.email.trim(),
        password: payload.password,
        shopName: payload.shopName.trim(),
        contactNumber: payload.contactNumber?.trim() || '',
        address: payload.address || {},
      },
    });

    const user = data.user || {};
    const shop = data.shop || {};

    return {
      id: user.id || user._id,
      name: user.name || payload.name,
      email: user.email || payload.email,
      role: user.role,
      shopId: shop.id || shop._id,
      shopName: shop.name || payload.shopName,
      shopPublicId: shop.publicIdentifier || shop.slug || '',
      token: data.token,
    };
  },

  /**
   * Shopkeeper authentication
   * Endpoint: POST /api/v1/auth/login
   */
  async login(credentials: LoginCredentials): Promise<AuthUser> {
    const data = await apiClient<any>('/auth/login', {
      method: 'POST',
      body: {
        email: credentials.email.trim(),
        password: credentials.password,
      },
    });

    const user = data.user || {};
    const shop = data.shop || {};

    return {
      id: user.id || user._id,
      name: user.name || 'Shopkeeper',
      email: user.email,
      role: user.role,
      shopId: shop.id || shop._id,
      shopName: shop.name || 'My Print Shop',
      shopPublicId: shop.publicIdentifier || shop.slug || '',
      token: data.token,
    };
  },

  /**
   * Fetch current authenticated shopkeeper profile
   * Endpoint: GET /api/v1/auth/me
   */
  async getCurrentUser(token: string): Promise<AuthUser> {
    const data = await apiClient<any>('/auth/me', { token });
    const user = data.user || {};
    const shop = data.shop || {};

    return {
      id: user.id || user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      shopId: shop._id || shop.id,
      shopName: shop.name,
      shopPublicId: shop.publicIdentifier || shop.slug,
      token,
    };
  },

  /**
   * Logout shopkeeper
   * Endpoint: POST /api/v1/auth/logout
   */
  async logout(token?: string): Promise<void> {
    try {
      await apiClient('/auth/logout', { method: 'POST', token });
    } catch {
      // Ignore network errors on logout
    }
  },

  /**
   * Fetch incoming & filtered orders for the shopkeeper
   * Endpoint: GET /api/v1/orders
   */
  async getOrders(
    token?: string,
    statusFilter?: OrderStatus,
    search?: string,
    page = 1,
    limit = 50
  ): Promise<OrdersListResponse> {
    const params: Record<string, string | number | undefined> = {
      page,
      limit,
    };
    if (statusFilter) params.status = statusFilter;
    if (search) params.search = search.trim();

    const data = await apiClient<any>('/orders', {
      token,
      params,
    });

    const rawOrders: any[] = data.orders || (Array.isArray(data) ? data : []);
    const orders = rawOrders.map((o) => normalizeOrder(o));

    return {
      orders,
      pagination: data.pagination || {
        total: orders.length,
        page,
        limit,
        totalPages: 1,
      },
    };
  },

  /**
   * Get single order details by ID
   * Endpoint: GET /api/v1/orders/:id
   */
  async getOrderById(orderId: string, token?: string): Promise<Order> {
    const data = await apiClient<any>(`/orders/${encodeURIComponent(orderId)}`, { token });
    return normalizeOrder(data);
  },

  /**
   * Update order status with state machine verification
   * Endpoint: PATCH /api/v1/orders/:id/status
   */
  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    note?: string,
    token?: string
  ): Promise<Order> {
    await apiClient(`/orders/${encodeURIComponent(orderId)}/status`, {
      method: 'PATCH',
      token,
      body: { status, note: note || '' },
    });

    // Re-fetch complete normalized order
    return this.getOrderById(orderId, token);
  },

  /**
   * Get temporary signed download/preview URL for customer PDF
   * Endpoint: GET /api/v1/orders/:id/document
   */
  async getDocumentSignedUrl(
    orderId: string,
    token?: string
  ): Promise<{ downloadUrl: string; expiresInSeconds: number; originalName: string; fileSizeBytes?: number }> {
    return apiClient<{
      downloadUrl: string;
      expiresInSeconds: number;
      originalName: string;
      fileSizeBytes?: number;
    }>(`/orders/${encodeURIComponent(orderId)}/document`, { token });
  },

  /**
   * Fetch current shop profile, pricing, and operating status
   * Endpoint: GET /api/v1/shops/my-shop
   */
  async getShopDetails(token?: string): Promise<Shop> {
    const rawShop = await apiClient<any>('/shops/my-shop', { token });

    return {
      id: rawShop._id || rawShop.id,
      _id: rawShop._id,
      publicId: rawShop.publicIdentifier || rawShop.slug,
      slug: rawShop.slug,
      publicIdentifier: rawShop.publicIdentifier,
      name: rawShop.name,
      isOpen: rawShop.isOpen !== false,
      isAcceptingOrders: rawShop.isOpen !== false,
      contactNumber: rawShop.contactNumber || '',
      address: rawShop.address || '',
      pricing: rawShop.pricing,
      createdAt: rawShop.createdAt,
    };
  },

  /**
   * Update shop pricing rates
   * Endpoint: PUT /api/v1/shops/my-shop/pricing
   */
  async updatePricing(
    pricing: BackendPricingConfig | PricingConfig,
    token?: string
  ): Promise<BackendPricingConfig> {
    // Convert flat UI pricing to backend nested sizePricing structure if necessary
    let payload: BackendPricingConfig;
    if ('a4' in pricing) {
      const flat = pricing as PricingConfig;
      payload = {
        A4: {
          BLACK_WHITE: { single: flat.a4.bwSingle, double: flat.a4.bwDouble },
          COLOR: { single: flat.a4.colorSingle, double: flat.a4.colorDouble },
        },
        A3: {
          BLACK_WHITE: { single: flat.a3.bwSingle, double: flat.a3.bwDouble },
          COLOR: { single: flat.a3.colorSingle, double: flat.a3.colorDouble },
        },
      };
    } else {
      payload = pricing as BackendPricingConfig;
    }

    return apiClient<BackendPricingConfig>('/shops/my-shop/pricing', {
      method: 'PUT',
      token,
      body: payload,
    });
  },

  /**
   * Update shop accepting orders status
   * Endpoint: PATCH /api/v1/shops/my-shop/status
   */
  async toggleAcceptingOrders(isOpen: boolean, token?: string): Promise<{ isOpen: boolean }> {
    return apiClient<{ isOpen: boolean }>('/shops/my-shop/status', {
      method: 'PATCH',
      token,
      body: { isOpen },
    });
  },
};
