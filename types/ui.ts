/**
 * UI component related type definitions
 */

// Import wallpaper UI types from dedicated file
import { WallpaperDisplayData } from './wallpaperUI';

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

export interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

// Re-export WallpaperDisplayData for backward compatibility
export type { WallpaperDisplayData };