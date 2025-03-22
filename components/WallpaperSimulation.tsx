'use client';

import { useEffect, useState, useRef } from 'react';
import LoadingSpinner from './LoadingSpinner';
import Image from 'next/image';

interface WallpaperSimulationProps {
  imageUrl?: string;
  onScaleChange?: (scale: number) => void;
  selectedRollSize?: string;
  onImageLoad?: () => void;
}

export default function WallpaperSimulation({ imageUrl, onScaleChange, selectedRollSize = '396l-21w', onImageLoad }: WallpaperSimulationProps) {
  const [currentScaleFactor, setCurrentScaleFactor] = useState(1);
  const [patternImageUrl, setPatternImageUrl] = useState(imageUrl || '');
  const [error, setError] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Roll size dimensions mapping
  const rollSizes: Record<string, { width: number; length: number }> = {
    'standard': { width: 21, length: 396 },
    '396l-21w': { width: 21, length: 396 },
    '396l-42w': { width: 42, length: 396 },
    '600l-42w': { width: 42, length: 600 },
    '1200l-42w': { width: 42, length: 1200 }
  };

  // Constants for real-life dimensions
  const wallWidthInInches = 126; // 10.5 feet
  const currentRollSize = rollSizes[selectedRollSize as string] || rollSizes['396l-21w'];
  const fullScaleTileSizeInInches = currentRollSize.width;

  useEffect(() => {
    if (imageUrl) {
      const img = new Image();
      img.onload = () => {
        setIsImageLoading(false);
        if (onImageLoad) onImageLoad();
      };
      img.onerror = () => {
        setIsImageLoading(false);
        setError('Failed to load image');
      };
      setIsImageLoading(true);
      img.src = imageUrl;
      setPatternImageUrl(imageUrl);
      setError(null);
    }
  }, [imageUrl, onImageLoad]);

  // Handle scale change
  const handleScaleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newScale = parseFloat(e.target.value);
    setCurrentScaleFactor(newScale);
    if (onScaleChange) {
      onScaleChange(newScale);
    }
  };

  // Calculate the number of tiles needed to fill the wall
  const calculateTilesNeeded = () => {
    const scaledTileWidthInInches = fullScaleTileSizeInInches * currentScaleFactor;
    return Math.ceil(wallWidthInInches / scaledTileWidthInInches);
  };

  const tilesNeeded = calculateTilesNeeded();

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h3 className="text-lg font-medium mb-2">Wallpaper Simulation</h3>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="mb-6">
        <label htmlFor="scale-slider" className="block text-sm font-medium text-gray-700 mb-1">
          Pattern Scale: {currentScaleFactor.toFixed(2)}x
        </label>
        <input
          id="scale-slider"
          type="range"
          min="0.5"
          max="2"
          step="0.1"
          value={currentScaleFactor}
          onChange={handleScaleChange}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Smaller</span>
          <span>Larger</span>
        </div>
      </div>
      
      <div 
        ref={containerRef}
        className="relative w-full h-64 sm:h-80 md:h-96 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shadow-inner"
      >
        {isImageLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <LoadingSpinner size="medium" text="Loading wallpaper preview..." />
          </div>
        ) : patternImageUrl ? (
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-white">
              {/* Create a grid of tiles to simulate wallpaper on a wall */}
              <div className="flex flex-wrap">
                {Array.from({ length: tilesNeeded * 3 }).map((_, index) => (
                  <div 
                    key={index}
                    className="relative"
                    style={{
                      width: `${100 / tilesNeeded}%`,
                      paddingBottom: `${(100 / tilesNeeded) * (currentRollSize.length / currentRollSize.width)}%`,
                      transform: `scale(${currentScaleFactor})`,
                      transformOrigin: 'top left'
                    }}
                  >
                    <div 
                      className="absolute inset-0 bg-cover bg-center border border-gray-100 opacity-90"
                      style={{ backgroundImage: `url(${patternImageUrl})` }}
                    />
                  </div>
                ))}
              </div>
              
              {/* Room perspective overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900 opacity-20" />
              <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-transparent opacity-10" />
            </div>
            
            {/* Room furniture silhouette for scale reference */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/3 h-1/4 bg-gray-800 opacity-10 rounded-t-lg" />
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-gray-500">No wallpaper selected</p>
          </div>
        )}
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <p>Selected roll size: {currentRollSize.width}" wide x {currentRollSize.length}" long</p>
        <p className="mt-1">Estimated tiles needed for a 10.5ft wall: {tilesNeeded}</p>
      </div>
    </div>
  );
}