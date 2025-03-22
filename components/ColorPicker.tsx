'use client';

import React, { useState, useRef, useEffect } from 'react';

interface ColorPickerProps {
  onColorSelect?: (color: string) => void;
  initialColor?: string;
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  onColorSelect,
  initialColor = '#ffffff' // Default to white color
}) => {
  const [currentColor, setCurrentColor] = useState(initialColor);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  
  // Predefined color palette
  const colorPalette = [
    // Row 1
    '#CD853F', '#C0C0C0', '#FFFFFF', '#808080', '#000000', '#FFFACD', '#FFFFF0', '#DEB887', '#A52A2A', '#FF69B4',
    // Row 2
    '#800080', '#FF00FF', '#FFC0CB', '#8B008B', '#F0F8FF', '#4B0082', '#483D8B', '#000080', '#00FFFF', '#AFEEEE',
    // Row 3
    '#E0FFFF', '#00008B', '#0000FF', '#00FFFF', '#008080', '#F0FFFF', '#008B8B', '#00FFFF', '#8FBC8F', '#556B2F',
    // Row 4
    '#00FF00', '#98FB98', '#006400', '#008000', '#FFFF00', '#FFFAF0', '#B8860B', '#FFFF00', '#FFE4B5', '#FFDEAD',
    // Row 5
    '#FFA500', '#FF8C00', '#8B0000', '#FF0000', '#DC143C', '#FF1493', '#FFB6C1', '#FFA07A', '#8B0000', '#FF0000'
  ];

  // Handle color selection from palette
  const handleColorClick = (color: string) => {
    setCurrentColor(color);
    if (onColorSelect) {
      onColorSelect(color);
    }
  };

  // Add selected color to the list
  const addSelectedColor = () => {
    if (!selectedColors.includes(currentColor)) {
      setSelectedColors([...selectedColors, currentColor]);
    }
  };

  // Remove color from selected colors
  const removeColor = (colorToRemove: string) => {
    setSelectedColors(selectedColors.filter(color => color !== colorToRemove));
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-4">
        <div 
          className="w-full h-16 rounded-lg border border-gray-300 mb-2"
          style={{ backgroundColor: currentColor }}
        />
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">{currentColor}</span>
          <button 
            onClick={addSelectedColor}
            className="px-3 py-1 bg-gray-800 text-white text-sm rounded hover:bg-gray-700 transition-colors"
          >
            Add Color
          </button>
        </div>
      </div>

      {/* Color palette */}
      <div className="grid grid-cols-10 gap-1 mb-6">
        {colorPalette.map((color, index) => (
          <button
            key={index}
            className={`w-full aspect-square rounded-sm border ${color === currentColor ? 'border-black ring-2 ring-gray-400' : 'border-gray-300'}`}
            style={{ backgroundColor: color }}
            onClick={() => handleColorClick(color)}
            aria-label={`Select color ${color}`}
          />
        ))}
      </div>

      {/* Selected colors */}
      {selectedColors.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2">Selected Colors:</h3>
          <div className="flex flex-wrap gap-2">
            {selectedColors.map((color, index) => (
              <div key={index} className="relative group">
                <div 
                  className="w-8 h-8 rounded-full border border-gray-300"
                  style={{ backgroundColor: color }}
                />
                <button
                  onClick={() => removeColor(color)}
                  className="absolute -top-1 -right-1 bg-white rounded-full w-4 h-4 flex items-center justify-center border border-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label={`Remove color ${color}`}
                >
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorPicker;