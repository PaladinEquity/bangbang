/**
 * Wallpaper related type definitions
 */

export type WallpaperData = {
  id?: string | null;
  imageData: string; // Base64 encoded image data
  description: string | null;
  primaryImagery: string | null;
  size: string | null;
  price: number;
  userId?: string | null; // Owner of the wallpaper
};