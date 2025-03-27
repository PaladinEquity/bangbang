'use client';

import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';

const client = generateClient<Schema>();

interface WallpaperDataInput {
  projectId: string;
  storageKey: string;
  mimeType: string;
  generationDescription: Record<string, any>; // JSON object for generation parameters
  userId: string;
  fileSize?: number;
  dimensions?: {
    width: number;
    height: number;
  };
  thumbnailKey?: string;
  status?: 'active' | 'deleted' | 'archived';
}

interface CartOrderInput {
  projectId: string;
  customerId: string;
  quantity: number;
  totalAmount: number;
  status?: 'pending' | 'completed' | 'cancelled';
}

export const databaseService = {
  // Wallpaper Methods
  async saveWallpaperData(data: WallpaperDataInput) {
    try {
      const result = await client.models.WallpaperData.create({
        ...data,
        status: data.status || 'active',
        createdDate: new Date().toISOString(),
      });
      return result.data;
    } catch (error) {
      throw new Error(`Save failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  async getWallpaperData(projectId: string) {
    try {
      const { data } = await client.models.WallpaperData.list({
        filter: { projectId: { eq: projectId } },
        limit: 1
      });
      return data[0] ?? null;
    } catch (error) {
      throw new Error(`Fetch failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
  
  async getWallpaperById(id: string) {
    try {
      const result = await client.models.WallpaperData.get({ id });
      return result.data;
    } catch (error) {
      throw new Error(`Fetch by ID failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  async updateWallpaperData(id: string, data: Partial<WallpaperDataInput>) {
    try {
      const result = await client.models.WallpaperData.update({
        id,
        ...data,
      });
      return result.data;
    } catch (error) {
      throw new Error(`Update failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  async deleteWallpaperData(id: string) {
    try {
      // Soft delete - update status to 'deleted'
      const result = await client.models.WallpaperData.update({
        id,
        status: 'deleted',
      });
      return result.data;
    } catch (error) {
      throw new Error(`Delete failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  async hardDeleteWallpaperData(id: string) {
    try {
      // Hard delete - remove from database
      const result = await client.models.WallpaperData.delete({ id });
      return result.data;
    } catch (error) {
      throw new Error(`Hard delete failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  async getUserWallpapers(userId: string, status: 'active' | 'deleted' | 'archived' = 'active') {
    try {
      const { data } = await client.models.WallpaperData.list({
        filter: { 
          userId: { eq: userId },
          status: { eq: status }
        }
      });
      return data;
    } catch (error) {
      throw new Error(`Fetch user wallpapers failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  // Cart/Order Methods
  async saveCartOrder(data: CartOrderInput) {
    try {
      const result = await client.models.CartOrder.create({
        ...data,
        status: data.status ?? 'pending',
        createdDate: new Date().toISOString(),
      });
      return result.data;
    } catch (error) {
      throw new Error(`Order save failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  async getCartOrder(projectId: string) {
    try {
      const { data } = await client.models.CartOrder.list({
        filter: { projectId: { eq: projectId } },
        limit: 1
      });
      return data[0] ?? null;
    } catch (error) {
      throw new Error(`Order fetch failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  async getCustomerOrders(customerId: string, status?: 'pending' | 'completed' | 'cancelled') {
    try {
      const filter: any = { customerId: { eq: customerId } };
      if (status) filter.status = { eq: status };
      
      const { data } = await client.models.CartOrder.list({ filter });
      return data;
    } catch (error) {
      throw new Error(`Orders fetch failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  async updateCartOrderStatus(id: string, status: 'pending' | 'completed' | 'cancelled') {
    try {
      const result = await client.models.CartOrder.update({
        id,
        status
      });
      return result.data;
    } catch (error) {
      throw new Error(`Status update failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
  
  async updateCartOrder(id: string, data: { quantity?: number; totalAmount?: number }) {
    try {
      const result = await client.models.CartOrder.update({
        id,
        ...data
      });
      return result.data;
    } catch (error) {
      throw new Error(`Order update failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
};