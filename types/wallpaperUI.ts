/**
 * Wallpaper UI component related type definitions
 */

// Interface for wallpaper simulation component props
export interface WallpaperSimulationProps {
  imageUrl?: string;
  onScaleChange?: (scale: number) => void;
  selectedRollSize?: string;
  onImageLoad?: () => void;
}

// Interface for image selector component props
export interface ImageSelectorProps {
  images: string[];
  onImageSelect: (imageUrl: string) => void;
  isGenerating: boolean;
}

// Interface for image URL mapping
export interface ImageUrlMap {
  gridImage: string;
  image1: string;
  image2: string;
  image3: string;
  image4: string;
  [key: string]: string;
}

// Type for wallpaper display in UI components
export type WallpaperDisplayData = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  tags: string[];
  dimensions?: {
    width: number;
    height: number;
  };
  rating?: number;
  reviews?: number;
};