'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ColorPicker from '@/components/ColorPicker';
import ImageSelector from '@/components/ImageSelector';
import WallpaperSimulation from '@/components/WallpaperSimulation';
import { generateImages, checkImageStatus, getImageResults } from '@/services/imageService';

export default function ImageCreation() {
  const router = useRouter();
  const [selectedSize, setSelectedSize] = useState('standard');
  const [prompt, setPrompt] = useState('');
  const [styleOption, setStyleOption] = useState('');
  const [patternOption, setPatternOption] = useState('');
  const [colorOption, setColorOption] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [progressValue, setProgressValue] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Enter a prompt to generate wallpaper designs');
  const [requestId, setRequestId] = useState<string | null>(null);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  // Function to handle color selection from the ColorPicker component
  const handleColorSelect = (color: string) => {
    console.log('Selected color:', color);
    // Add the color to the selected colors array if it's not already there
    if (!selectedColors.includes(color)) {
      setSelectedColors([...selectedColors, color]);
    }
  };

  // Function to remove a color from the selected colors array
  const removeColor = (colorToRemove: string) => {
    setSelectedColors(selectedColors.filter(color => color !== colorToRemove));
  };

  // Function to start image generation process
  const startImageGeneration = async () => {
    if (!prompt.trim()) {
      setStatusMessage('Please enter a prompt first');
      return;
    }

    try {
      setIsGenerating(true);
      setProgressValue(0);
      setStatusMessage('Starting image generation...');
      setGeneratedImages([]);
      setSelectedImage(null);

      // Generate images using our service
      const id = await generateImages(prompt, styleOption, selectedColors);
      setRequestId(id);
      
      // Start polling for status updates
      const statusInterval = setInterval(async () => {
        try {
          const statusData = await checkImageStatus(id);
          
          // Update progress based on status
          if (statusData.status === 'pending') {
            setStatusMessage(`Generating images... ${Math.round(statusData.progress * 100)}%`);
            setProgressValue(statusData.progress * 100);
          } else if (statusData.status === 'completed') {
            clearInterval(statusInterval);
            setStatusMessage('Images generated! Fetching results...');
            setProgressValue(100);
            
            // Get the generated images
            const results = await getImageResults(id);
            
            if (results.upscaled_urls && results.upscaled_urls.length > 0) {
              setGeneratedImages(results.upscaled_urls);
              setStatusMessage('Image generation complete! Select an image to customize.');
            } else {
              setStatusMessage('No images were generated. Please try again with a different prompt.');
            }
            
            setIsGenerating(false);
          } else if (statusData.status === 'failed') {
            clearInterval(statusInterval);
            setStatusMessage('Image generation failed. Please try again.');
            setIsGenerating(false);
          }
        } catch (error) {
          console.error('Error checking status:', error);
          clearInterval(statusInterval);
          setStatusMessage('Error checking image status. Please try again.');
          setIsGenerating(false);
        }
      }, 3000); // Check every 3 seconds
      
    } catch (error) {
      console.error('Error starting image generation:', error);
      setStatusMessage('Error starting image generation. Please try again.');
      setIsGenerating(false);
    }
  };

  const selectImage = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setStatusMessage('Image selected. You can now customize and order this design.');
    router.push(`/product/custom?image=${encodeURIComponent(imageUrl)}&size=${selectedSize}`);
  };

  const addToCart = () => {
    if (!selectedImage) return;
    
    // In a real implementation, this would add the product to cart via API
    setStatusMessage('Adding product to cart...');
    
    // Simulate API call
    setTimeout(() => {
      setStatusMessage('Product added to cart successfully!');
    }, 1000);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Create Your Custom Wallpaper</h1>
      
      {/* Prompt Input Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Describe Your Ideal Wallpaper</h2>
        <div className="mb-4">
          <textarea
            className="w-full p-3 border border-gray-300 rounded-md"
            rows={4}
            placeholder="Describe the pattern, colors, style, and mood you want for your wallpaper..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isGenerating}
          />
        </div>
        
        {/* Optional Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <input 
            type="text" 
            className="p-2 border border-gray-300 rounded-md" 
            placeholder="Style (e.g., Modern, Vintage)" 
            value={styleOption}
            onChange={(e) => setStyleOption(e.target.value)}
            disabled={isGenerating}
          />
          <input 
            type="text" 
            className="p-2 border border-gray-300 rounded-md" 
            placeholder="Pattern structure" 
            value={patternOption}
            onChange={(e) => setPatternOption(e.target.value)}
            disabled={isGenerating}
          />
          <input 
            type="text" 
            className="p-2 border border-gray-300 rounded-md" 
            placeholder="Mood/Ambiance" 
            value={colorOption}
            onChange={(e) => setColorOption(e.target.value)}
            disabled={isGenerating}
          />
        </div>
        
        {/* Selected Colors Display */}
        {selectedColors.length > 0 && (
          <div className="mb-4">
            <p className="mb-2 font-medium">Selected Colors:</p>
            <div className="flex flex-wrap gap-2">
              {selectedColors.map((color, index) => (
                <div 
                  key={index} 
                  className="flex items-center bg-gray-100 rounded-full px-3 py-1"
                >
                  <div 
                    className="w-4 h-4 rounded-full mr-2" 
                    style={{ backgroundColor: color }}
                  ></div>
                  <span className="text-sm">{color}</span>
                  <button 
                    className="ml-2 text-gray-500 hover:text-gray-700"
                    onClick={() => removeColor(color)}
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <button
          className="bg-black text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-400"
          onClick={startImageGeneration}
          disabled={isGenerating || !prompt.trim()}
        >
          {isGenerating ? 'Generating...' : 'Generate Images'}
        </button>
      </div>
      
      {/* Status and Progress */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <p className="mb-2">{statusMessage}</p>
        {isGenerating && (
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-black h-2.5 rounded-full" 
              style={{ width: `${progressValue}%` }}
            ></div>
          </div>
        )}
      </div>
      
      {/* Color Picker */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Choose Your Colors</h2>
        <p className="text-sm text-gray-600 mb-4">Select colors to include in your wallpaper design. These will be used as guidance for the AI image generator.</p>
        <ColorPicker onColorSelect={handleColorSelect} />
      </div>
      
      {/* Generated Images */}
      {generatedImages.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">Generated Designs</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {generatedImages.map((imageUrl, index) => (
              <div
                key={index}
                className="relative aspect-square cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => selectImage(imageUrl)}
              >
                <img
                  src={imageUrl}
                  alt={`Generated design ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            ))}
          </div>
          
          {/* Wallpaper Simulation */}
          {selectedImage && (
            <div className="mt-8">
              <WallpaperSimulation imageUrl={selectedImage} selectedRollSize={selectedSize} onScaleChange={(scale) => console.log('Scale changed:', scale)} />
            </div>
          )}
        </div>
      )}
      
      {/* Selected Image Customization */}
      {selectedImage && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">Customize Your Selection</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <img src={selectedImage} alt="Selected wallpaper design" className="w-full h-auto rounded-lg" />
            </div>
            <div>
              <h3 className="font-semibold mb-2">Options</h3>
              
              <div className="mb-4">
                <label className="block mb-1">Roll Size</label>
                <select className="w-full p-2 border border-gray-300 rounded-md">
                  <option value="396l-21w">396' l x 21' w</option>
                  <option value="396l-42w">396' l x 42' w</option>
                  <option value="600l-42w">600' l x 42' w</option>
                  <option value="1200l-42w">1200' l x 42' w</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block mb-1">Pattern Size</label>
                <select className="w-full p-2 border border-gray-300 rounded-md">
                  <option value="21-half">21" (half)</option>
                  <option value="10.5-quarter">10.5" (quarter)</option>
                </select>
              </div>
              
              {/* Color Picker */}
              <div className="mb-4">
                <label className="block mb-1">Color Customization</label>
                <div className="mt-2">
                  <ColorPicker 
                    onColorSelect={(color) => {
                      console.log('Selected color:', color);
                      // In a real implementation, this would update the wallpaper color
                    }}
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <p className="font-bold text-xl">$49.99</p>
                <p className="text-sm text-gray-600">Price varies based on selected options</p>
              </div>
              
              <button
                className="bg-black text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors w-full"
                onClick={addToCart}
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}