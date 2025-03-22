'use client';

import React, { useState, useRef, useEffect } from 'react';

interface ColorPickerProps {
  onColorSelect?: (color: string) => void;
  initialColor?: string;
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  onColorSelect,
  initialColor = '#ffffff' // Default to a pink color
}) => {
  const [currentColor, setCurrentColor] = useState(initialColor);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const colorWheelRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

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

  // State to track color selector position
  const [selectorPosition, setSelectorPosition] = useState({ x: 0, y: 0 });

  // Handle color wheel interaction
  const handleColorWheelInteraction = (e: React.MouseEvent<HTMLDivElement> | MouseEvent) => {
    if (!colorWheelRef.current) return;

    const rect = colorWheelRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate position relative to center
    let x = e.clientX - rect.left - centerX;
    let y = e.clientY - rect.top - centerY;

    // Constrain position to circle boundary
    const radius = Math.min(centerX, centerY);
    const distanceFromCenter = Math.sqrt(x * x + y * y);
    
    // If the distance exceeds the radius, normalize the coordinates
    if (distanceFromCenter > radius) {
      const ratio = radius / distanceFromCenter;
      x *= ratio;
      y *= ratio;
    }

    // Calculate angle and distance from center (for saturation)
    const angle = Math.atan2(y, x);
    const distance = Math.sqrt(x * x + y * y);
    const saturation = distance / radius;

    // Convert angle to hue (0-360)
    let hue = (angle * 180 / Math.PI + 360) % 360;
    
    // Check if the color is blue (around 240 degrees in HSV)
    if (hue >= 210 && hue <= 270) {
      // If blue is clicked, display yellow (complementary color at ~60 degrees)
      hue = 60;
    } 
    // Check if the color is yellow (around 60 degrees in HSV)
    else if (hue >= 30 && hue <= 90) {
      // If yellow is clicked, display blue (complementary color at ~240 degrees)
      hue = 240;
    }

    // Convert HSV to RGB with brightness from slider
    const hsv2rgb = (h: number, s: number, v: number) => {
      const f = (n: number, k = (n + h / 60) % 6) => v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
      const r = f(5);
      const g = f(3);
      const b = f(1);
      return `#${Math.round(r * 255).toString(16).padStart(2, '0')}${Math.round(g * 255).toString(16).padStart(2, '0')}${Math.round(b * 255).toString(16).padStart(2, '0')}`;
    };

    // Apply brightness from slider position
    const color = hsv2rgb(hue, saturation, sliderPosition);
    setCurrentColor(color);

    // Update selector position with constrained coordinates
    setSelectorPosition({ x, y });

    if (onColorSelect) {
      onColorSelect(color);
    }
  };

  // State to track slider position
  const [sliderPosition, setSliderPosition] = useState(1); // Default to middle

  // Handle slider interaction for brightness/saturation
  const handleSliderInteraction = (e: React.MouseEvent<HTMLDivElement> | MouseEvent) => {
    if (!sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const position = (e.clientX - rect.left) / rect.width;
    const clampedPosition = Math.max(0, Math.min(1, position));

    // Update slider position state
    setSliderPosition(clampedPosition);

    // Extract current color's RGB
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 0, g: 0, b: 0 };
    };

    // Adjust brightness based on slider position
    const rgb = hexToRgb(currentColor);
    const factor = clampedPosition * 2; // 0 to 2 range

    // Adjust RGB values based on brightness factor
    const adjustBrightness = (value: number) => {
      if (factor <= 1) {
        // Darken: multiply by factor (0 to 1)
        return Math.round(value * factor);
      } else {
        // Lighten: interpolate to white (255)
        return Math.round(value + (255 - value) * (factor - 1));
      }
    };

    const r = adjustBrightness(rgb.r);
    const g = adjustBrightness(rgb.g);
    const b = adjustBrightness(rgb.b);

    const newColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    setCurrentColor(newColor);

    if (onColorSelect) {
      onColorSelect(newColor);
    }
  };

  // Remove a color from selected colors
  const removeSelectedColor = (indexToRemove: number) => {
    setSelectedColors(selectedColors.filter((_, index) => index !== indexToRemove));
  };

  // Add current color to selected colors
  const addCurrentColor = () => {
    if (!selectedColors.includes(currentColor)) {
      setSelectedColors([...selectedColors, currentColor]);
    }
  };

  // Select a color from the palette
  const selectPaletteColor = (color: string) => {
    setCurrentColor(color);
    if (onColorSelect) {
      onColorSelect(color);
    }
  };

  // Set up event listeners for mouse movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (e.buttons !== 1) return; // Only track when mouse button is pressed

      if (e.target === colorWheelRef.current || colorWheelRef.current?.contains(e.target as Node)) {
        handleColorWheelInteraction(e);
      } else if (e.target === sliderRef.current || sliderRef.current?.contains(e.target as Node)) {
        handleSliderInteraction(e);
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [currentColor]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full" style={{maxWidth: "980px"}}>
      <h2 className="text-xl font-semibold mb-4 text-center">Color Picker</h2>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Color wheel and slider section */}
        <div className="flex-1">
          {/* IroColorPicker component */}
          <div className="IroColorPicker" style={{ display: "block" }}>
            {/* Color wheel */}
            <div
              ref={colorWheelRef}
              className="IroWheel mx-auto"
              style={{
                width: "min(280px, 100%)",
                height: "min(280px, 100vw)",
                position: "relative",
                overflow: "visible",
                display: "block"
              }}
              onMouseDown={handleColorWheelInteraction}
            >
              {/* Hue component */}
              <div
                className="IroWheelHue"
                style={{
                  position: "absolute",
                  top: "0px",
                  left: "0px",
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  boxSizing: "border-box",
                  background: "conic-gradient(red, magenta, blue, aqua, lime, yellow, red)"
                }}
              />

              {/* Saturation component */}
              <div
                className="IroWheelSaturation"
                style={{
                  position: "absolute",
                  top: "0px",
                  left: "0px",
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  boxSizing: "border-box",
                  background: "radial-gradient(circle closest-side, rgb(255, 255, 255), transparent)"
                }}
              />

              {/* Lightness component - hidden by default */}
              <div
                className="IroWheelLightness"
                style={{
                  position: "absolute",
                  top: "0px",
                  left: "0px",
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  boxSizing: "border-box",
                  background: "rgb(0, 0, 0)",
                  opacity: 1 - sliderPosition,
                  display: sliderPosition < 1 ? "block" : "none"
                }}
              />

              {/* Wheel border */}
              <div
                className="IroWheelBorder"
                style={{
                  position: "absolute",
                  top: "0px",
                  left: "0px",
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  boxSizing: "border-box",
                  border: "1px solid rgb(255, 255, 255)"
                }}
              />

              {/* Color selector handle */}
              <svg
                className="IroHandle IroHandle--0 IroHandle--isActive"
                style={{
                  transform: `translate(${selectorPosition.x + (colorWheelRef.current ? colorWheelRef.current.clientWidth / 2 : 140)}px, ${selectorPosition.y + (colorWheelRef.current ? colorWheelRef.current.clientHeight / 2 : 140)}px)`,
                  willChange: "transform",
                  top: "-8px",
                  left: "-8px",
                  width: "16px",
                  height: "16px",
                  position: "absolute",
                  overflow: "visible"
                }}
              >
                <circle cx="8" cy="8" r="8" fill="none" strokeWidth="2" stroke="#000"></circle>
                <circle cx="8" cy="8" r="6" fill={currentColor} strokeWidth="2" stroke="#fff"></circle>
              </svg>
            </div>

            {/* Brightness/Saturation slider */}
            <div
              ref={sliderRef}
              className="IroSlider mx-auto"
              style={{
                position: "relative",
                width: "min(280px, 100%)",
                height: "28px",
                borderRadius: "14px",
                background: "conic-gradient(rgb(204, 204, 204) 25%, rgb(255, 255, 255) 0deg, rgb(255, 255, 255) 50%, rgb(204, 204, 204) 0deg, rgb(204, 204, 204) 75%, rgb(255, 255, 255) 0deg) 0% 0% / 8px 8px",
                overflow: "visible",
                display: "block",
                marginTop: "12px"
              }}
              onMouseDown={handleSliderInteraction}
            >
              <div
                className="IroSliderGradient"
                style={{
                  position: "absolute",
                  top: "0px",
                  left: "0px",
                  width: "100%",
                  height: "100%",
                  borderRadius: "14px",
                  background: `linear-gradient(to right, rgb(0, 0, 0) 0%, ${currentColor} 100%)`,
                  boxSizing: "border-box",
                  border: "1px solid rgb(255, 255, 255)"
                }}
              />

              {/* Slider handle */}
              <svg
                className="IroHandle IroHandle--0 IroHandle--isActive"
                style={{
                  transform: `translate(${sliderPosition * (sliderRef.current ? sliderRef.current.clientWidth : 280)}px, 14px)`,
                  willChange: "transform",
                  top: "-8px",
                  left: "-8px",
                  width: "16px",
                  height: "16px",
                  position: "absolute",
                  overflow: "visible"
                }}
              >
                <circle cx="8" cy="8" r="8" fill="none" strokeWidth="2" stroke="#000"></circle>
                <circle cx="8" cy="8" r="6" fill="none" strokeWidth="2" stroke="#fff"></circle>
              </svg>
            </div>
          </div>
        </div>

        {/* Color palette and selected colors */}
        <div className="flex-1">

          {/* Color palette */}
          <div className="mb-4">
            <div className="px-3 py-3 sm:px-5 sm:py-5"
            style={{
              border: '2px solid #ccc',
              borderRadius: '10px',
            }}
            ><div className='mx-auto'
              style={{
                color: '#333',
                lineHeight: '150%',
                fontSize: '18px',
                fontFamily: "'Roboto', sans-serif",
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(28px, 1fr))',
                gridTemplateRows: 'repeat(5, 28px)',
                gridGap: '6px',
                width: '100%'
              }}
            >
                {colorPalette.map((color, index) => (
                  <div
                    key={index}
                    className="cursor-pointer"
                    style={{
                      backgroundColor: color,
                      width: '100%',
                      height: '100%',
                      borderRadius: '4px',
                      border: '1px solid #ddd'
                    }}
                    onClick={() => selectPaletteColor(color)}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Selected colors */}
          <div>
            {/* <p className="text-sm mb-1">Selected Colors:</p> */}
            <div className="flex flex-wrap gap-2 p-2 border border-gray-200 rounded min-h-10 w-full">
              {selectedColors.map((color, index) => (
                <div
                  key={index}
                  className="w-6 h-6 rounded cursor-pointer border border-gray-200"
                  style={{ backgroundColor: color }}
                  onClick={() => removeSelectedColor(index)}
                  title={`${color} (click to remove)`}
                />
              ))}
              {selectedColors.length === 0 && (
                <p className="text-gray-400 text-xs">No colors selected</p>
              )}
            </div>
          </div>
          {/* Current color display */}
          <div className="mb-4">
            <div className="flex items-center py-4">
              <p className="text-sm mb-1">Current Color:</p>
              <div
                className="w-8 h-8 rounded mx-2"
                style={{ backgroundColor: currentColor }}
              />
              {/* <span>{currentColor}</span> */}
              <button
                onClick={addCurrentColor}
                className="ml-auto bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded text-sm"
              >
                Add Color
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorPicker;