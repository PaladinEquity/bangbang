'use client';

import { useEffect, useState, useRef } from 'react';
import LoadingSpinner from './LoadingSpinner';
import { WallpaperSimulationProps } from '@/types/wallpaperUI';

export default function WallpaperSimulation({ imageUrl, onScaleChange, selectedRollSize = '396l-21w', onImageLoad }: WallpaperSimulationProps) {
  const [currentScaleFactor, setCurrentScaleFactor] = useState(1);
  const [patternImageUrl, setPatternImageUrl] = useState(imageUrl || '');
  const [error, setError] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [parentOrigin, setParentOrigin] = useState<string | null>(null);
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
  
  // Listen for messages from parent window (e.g., Wix)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.imageUrl) {
        setIsImageLoading(true);
        setPatternImageUrl(event.data.imageUrl);
        setError(null);
      }
      if (event.data.mySiteUrl) {
        setParentOrigin(event.data.mySiteUrl);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  useEffect(() => {
    if (!rollSizes[selectedRollSize]) {
      setError(`Invalid roll size selected: ${selectedRollSize}`);
      return;
    }
    setError(null);
  }, [selectedRollSize]);

  const changeScale = (scaleFactor: number) => {
    if (!containerRef.current) return;
    
    setCurrentScaleFactor(scaleFactor);
    if (onScaleChange) {
      onScaleChange(scaleFactor);
    }

    // Recalculate measurements
    const containerWidth = containerRef.current.clientWidth;
    const tileSizeInInches = fullScaleTileSizeInInches * scaleFactor;
    const adjustedPixelsPerInch = containerWidth / wallWidthInInches;
    const adjustedTileSizeInPixels = tileSizeInInches * adjustedPixelsPerInch;
    
    // Send scale change to parent window if available
    if (parentOrigin) {
      window.parent.postMessage(scaleFactor, parentOrigin);
    }
  };

  // Handle window resize with debounce
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        changeScale(currentScaleFactor);
      }, 150);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, [currentScaleFactor]);

  // Calculate measurements based on container width
  const getMeasurementStyle = () => {
    if (!containerRef.current) return {};
    
    const containerWidth = containerRef.current.clientWidth;
    const tileSizeInInches = fullScaleTileSizeInInches * currentScaleFactor;
    const adjustedPixelsPerInch = containerWidth / wallWidthInInches;
    const adjustedTileSizeInPixels = tileSizeInInches * adjustedPixelsPerInch;
    const maxWidth = containerWidth - 32;

    return {
      width: `${(fullScaleTileSizeInInches * currentScaleFactor * 100 / wallWidthInInches)}%`,
      maxWidth: `${Math.min(adjustedTileSizeInPixels, maxWidth)}px`
    };
  };

  return (
    <div className="max-w-[800px] mx-auto my-2 sm:my-5 px-2 sm:px-4">
      <h2 className="text-lg sm:text-xl md:text-2xl font-medium text-[#212121] text-center mb-2 sm:mb-4">Wallpaper Scale Simulation</h2>
      <p className="text-center text-gray-600 text-xs sm:text-sm md:text-base mb-2 sm:mb-4">Roll Size: {currentRollSize.width}" × {currentRollSize.length}"</p>

      {/* Scale adjustment buttons */}
      <div className="flex flex-col sm:flex-row justify-center items-center mb-3 sm:mb-4 gap-2 px-2 sm:px-0">
        <button
          onClick={() => changeScale(1)}
          className="bg-[#6200ea] text-white border-none rounded px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm cursor-pointer transition-all duration-300 hover:bg-[#3700b3] hover:shadow-md active:transform active:scale-95 flex-1 min-w-[100px] max-w-[120px] sm:max-w-[200px]"
        >
          Full Scale ({fullScaleTileSizeInInches}")
        </button>
        <button
          onClick={() => changeScale(0.5)}
          className="bg-[#6200ea] text-white border-none rounded px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm cursor-pointer transition-all duration-300 hover:bg-[#3700b3] hover:shadow-md active:transform active:scale-95 flex-1 min-w-[100px] max-w-[120px] sm:max-w-[200px]"
        >
          Half Scale ({(fullScaleTileSizeInInches * 0.5).toFixed(1)}")
        </button>
        <button
          onClick={() => changeScale(0.25)}
          className="bg-[#6200ea] text-white border-none rounded px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm cursor-pointer transition-all duration-300 hover:bg-[#3700b3] hover:shadow-md active:transform active:scale-95 flex-1 min-w-[100px] max-w-[120px] sm:max-w-[200px]"
        >
          Quarter ({(fullScaleTileSizeInInches * 0.25).toFixed(1)}")
        </button>
      </div>

      {/* Wallpaper simulation container */}
      <div 
        ref={containerRef}
        className="relative w-full max-w-[630px] mx-auto border border-[#e0e0e0] shadow-md overflow-hidden rounded-sm sm:rounded mt-1 sm:mt-2 mx-1 sm:mx-auto"
        style={{
          backgroundImage: 'url(/wallet_simulation.avif)',
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          aspectRatio: '3/2'
        }}
      >
        {/* Pattern overlay */}
        {isImageLoading && (
          <div className="absolute top-0 left-0 w-full h-[79.66%] flex items-center justify-center bg-gray-100 bg-opacity-50 z-10">
            <LoadingSpinner />
          </div>
        )}
        <div
          className="absolute top-0 left-0 w-full h-[79.66%] bg-repeat opacity-90"
          style={{
            backgroundImage: patternImageUrl ? `url(${patternImageUrl})` : 'none',
            backgroundSize: `${(fullScaleTileSizeInInches * currentScaleFactor * 100 / wallWidthInInches)}% auto`
          }}
        />

        {/* Tile measurement and line */}
        <div 
          className="absolute left-3 sm:left-4 bottom-12 border-b-[1.5px] border-dashed border-[#212121]"
          style={getMeasurementStyle()}
        />
        <div 
          className="absolute left-3 sm:left-4 bottom-4 text-center text-[10px] sm:text-xs font-medium text-[#212121] bg-white/80 px-1 sm:px-1.5 py-0.5 sm:py-1 rounded"
          style={getMeasurementStyle()}
        >
          Tile Width: {(fullScaleTileSizeInInches * currentScaleFactor).toFixed(1)}"
        </div>
      </div>

      {/* Wall measurement label */}
      <div className="w-full max-w-[630px] mx-auto mt-1 sm:mt-2">
        <div className="relative text-center text-xs sm:text-sm font-medium text-[#212121] flex items-center justify-center">
          <div className="flex-1 border-b-[1.5px] border-dashed border-[#212121] mx-1 sm:mx-2" />
          <span className="whitespace-nowrap px-1">Wall Width: 10.5 ft (126")</span>
          <div className="flex-1 border-b-[1.5px] border-dashed border-[#212121] mx-1 sm:mx-2" />
        </div>
      </div>
    </div>
  );
}