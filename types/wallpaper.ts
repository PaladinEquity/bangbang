/**
 * Wallpaper related type definitions
 */

// Main wallpaper data type used across the application
export type WallpaperData = {
  id?: string | null;
  imageData: string; // Base64 encoded image data
  description: string | null;
  primaryImagery: string | null;
  size: string | null;
  price: number;
  ranking?: number | null; // Position in display order (lower number = higher rank)
  userId?: string | null; // Owner of the wallpaper
  createdAt?: string; // Creation timestamp
};

// Type for wallpaper with ranking information (used in admin service)
export type WallpaperWithRanking = WallpaperData & {
  ranking: number;
  createdAt: string;
};

// Type for wallpaper filters used in API calls
export type WallpaperFilters = {
  primaryImagery?: string;
  searchTerm?: string;
  priceMin?: number;
  priceMax?: number;
};

// Type for pagination parameters in wallpaper listing
export type WallpaperPaginationParams = {
  filters?: WallpaperFilters;
  limit?: number;
  nextToken?: string | null;
  sortBy?: 'ranking' | 'price' | 'date';
  sortOrder?: 'asc' | 'desc';
};

// Type for wallpaper listing response
export type WallpaperListResponse = {
  wallpapers: WallpaperWithRanking[];
  nextToken?: string | null;
};

// Type for ranking control component props
export type RankingControlProps = { 
  wallpaperId: string; 
  currentRanking: number; 
  onUpdateRanking: (id: string, newRanking: number) => Promise<void>;
};

// Type for status badge component props
export type StatusBadgeProps = {
  status: string;
};