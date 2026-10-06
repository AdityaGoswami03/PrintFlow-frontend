import { apiClient } from './apiClient';
import type { Shop } from '../types';

export const shopService = {
  /**
   * Fetch public shop information by public identifier / slug
   * Endpoint: GET /api/v1/shops/public/:identifier
   */
  async getPublicShop(shopPublicId: string): Promise<Shop> {
    const rawShop = await apiClient<any>(
      `/shops/public/${encodeURIComponent(shopPublicId.trim())}`
    );

    return {
      id: rawShop._id || rawShop.id,
      _id: rawShop._id,
      publicId: rawShop.publicIdentifier || rawShop.slug || shopPublicId,
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
};
