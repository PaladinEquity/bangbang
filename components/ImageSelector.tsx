'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from './LoadingSpinner';
import Image from 'next/image';

interface ImageSelectorProps {
  images: string[];
  onImageSelect: (imageUrl: string) => void;
  isGenerating: boolean;
}

interface ImageUrlMap {
  gridImage: string;
  image1: string;
  image2: string;
  image3: string;
  image4: string;
  [key: string]: string;
}

const ImageSelector: React.FC<ImageSelectorProps> = ({ images, onImageSelect, isGenerating }) => {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');
  
  // Create an image URL map similar to the Wix project
  const imageUrlMap: ImageUrlMap = {
    gridImage: images.length > 0 ? images[0] : '',
    image1: images.length > 0 ? images[0] : '',
    image2: images.length > 1 ? images[1] : '',
    image3: images.length > 2 ? images[2] : '',
    image4: images.length > 3 ? images[3] : '',
  };

  // Handle image not yet ready
  const handleImageNotYetReadyToEnhance = () => {
    setStatusMessage('The optimized image is not yet ready. Give it a few seconds and try again');
    setTimeout(() => setStatusMessage(''), 3000);
  };

  // Handle image selection transitions
  const handleImageSelectButtonTransitions = (imageKey: string, imageUrl: string) => {
    setSelectedImage(imageUrl);
    setStatusMessage('Image selected. You can now customize and order this design.');
    onImageSelect(imageUrl);
  };

  // Image click handlers
  const image1_onclick = () => {
    if (imageUrlMap.image1) {
      handleImageSelectButtonTransitions('image1', imageUrlMap.image1);
    } else {
      handleImageNotYetReadyToEnhance();
    }
  };

  const image2_onclick = () => {
    if (imageUrlMap.image2) {
      handleImageSelectButtonTransitions('image2', imageUrlMap.image2);
    } else {
      handleImageNotYetReadyToEnhance();
    }
  };

  const image3_onclick = () => {
    if (imageUrlMap.image3) {
      handleImageSelectButtonTransitions('image3', imageUrlMap.image3);
    } else {
      handleImageNotYetReadyToEnhance();
    }
  };

  const image4_onclick = () => {
    if (imageUrlMap.image4) {
      handleImageSelectButtonTransitions('image4', imageUrlMap.image4);
    } else {
      handleImageNotYetReadyToEnhance();
    }
  };

  return (
    <div className="w-full">
      {isGenerating ? (
        <div className="flex flex-col items-center justify-center p-8">
          <LoadingSpinner size="large" text="Generating your wallpaper designs..." />
        </div>
      ) : (
        <div>
          {statusMessage && (
            <div className="text-center text-sm text-blue-600 mb-4 animate-fade-in">
              {statusMessage}
            </div>
          )}
          
          {images.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              <div 
                className={`relative aspect-square cursor-pointer overflow-hidden rounded-lg border-2 transition-all duration-300 ${selectedImage === imageUrlMap.image1 ? 'border-blue-500 shadow-lg' : 'border-gray-200 hover:border-gray-300'}`}
                onClick={image1_onclick}
              >
                {imageUrlMap.image1 ? (
                  <Image 
                    src={imageUrlMap.image1} 
                    alt="Generated wallpaper design 1" 
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gray-100">
                    <span className="text-gray-400">Loading...</span>
                  </div>
                )}
              </div>
              
              <div 
                className={`relative aspect-square cursor-pointer overflow-hidden rounded-lg border-2 transition-all duration-300 ${selectedImage === imageUrlMap.image2 ? 'border-blue-500 shadow-lg' : 'border-gray-200 hover:border-gray-300'}`}
                onClick={image2_onclick}
              >
                {imageUrlMap.image2 ? (
                  <Image 
                    src={imageUrlMap.image2} 
                    alt="Generated wallpaper design 2" 
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gray-100">
                    <span className="text-gray-400">Loading...</span>
                  </div>
                )}
              </div>
              
              <div 
                className={`relative aspect-square cursor-pointer overflow-hidden rounded-lg border-2 transition-all duration-300 ${selectedImage === imageUrlMap.image3 ? 'border-blue-500 shadow-lg' : 'border-gray-200 hover:border-gray-300'}`}
                onClick={image3_onclick}
              >
                {imageUrlMap.image3 ? (
                  <Image 
                    src={imageUrlMap.image3} 
                    alt="Generated wallpaper design 3" 
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gray-100">
                    <span className="text-gray-400">Loading...</span>
                  </div>
                )}
              </div>
              
              <div 
                className={`relative aspect-square cursor-pointer overflow-hidden rounded-lg border-2 transition-all duration-300 ${selectedImage === imageUrlMap.image4 ? 'border-blue-500 shadow-lg' : 'border-gray-200 hover:border-gray-300'}`}
                onClick={image4_onclick}
              >
                {imageUrlMap.image4 ? (
                  <Image 
                    src={imageUrlMap.image4} 
                    alt="Generated wallpaper design 4" 
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gray-100">
                    <span className="text-gray-400">Loading...</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 border border-dashed border-gray-300 rounded-lg">
              <p className="text-gray-500">No images generated yet. Start by entering a prompt and clicking generate.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageSelector;