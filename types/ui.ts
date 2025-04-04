/**
 * UI component related type definitions
 */

export interface ColorPickerProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
}

export interface TabProps {
  id: string;
  label: string;
  content: React.ReactNode;
}

export interface AccountTabsProps {
  tabs: TabProps[];
}

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
}

export interface AuthButtonsProps {
  showLogin?: boolean;
  showRegister?: boolean;
  showLogout?: boolean;
  className?: string;
}

export interface PageTransitionProps {
  children: React.ReactNode;
}

export interface ImageSelectorProps {
  onImageSelect: (imageUrl: string) => void;
  selectedImage?: string;
  images: string[] | ImageUrlMap;
}

export interface ImageUrlMap {
  [key: string]: string;
}

export interface WallpaperSimulationProps {
  wallpaperUrl: string;
  roomType?: 'living' | 'bedroom' | 'office';
}

export interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

export interface Wallpaper {
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
}

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