'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from './LoadingSpinner';

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
    if (!imageUrlMap.image1) {
      handleImageNotYetReadyToEnhance();
      return;
    }
    
    setSelectedImage('image1');
    handleImageSelectButtonTransitions('image1', imageUrlMap.image1);
  };

  const image2_onclick = () => {
    if (!imageUrlMap.image2) {
      handleImageNotYetReadyToEnhance();
      return;
    }
    
    setSelectedImage('image2');
    handleImageSelectButtonTransitions('image2', imageUrlMap.image2);
  };

  const image3_onclick = () => {
    if (!imageUrlMap.image3) {
      handleImageNotYetReadyToEnhance();
      return;
    }
    
    setSelectedImage('image3');
    handleImageSelectButtonTransitions('image3', imageUrlMap.image3);
  };

  const image4_onclick = () => {
    if (!imageUrlMap.image4) {
      handleImageNotYetReadyToEnhance();
      return;
    }
    
    setSelectedImage('image4');
    handleImageSelectButtonTransitions('image4', imageUrlMap.image4);
  };

  // Go back to product page
  const goToProductPage = () => {
    router.push('/product-page');
  };

  return (
    <div className="w-full">
      {statusMessage && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          {statusMessage}
        </div>
      )}
      
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {images.map((imageUrl, index) => {
          const imageKey = `image${index + 1}` as keyof ImageUrlMap;
          const onClick = {
            'image1': image1_onclick,
            'image2': image2_onclick,
            'image3': image3_onclick,
            'image4': image4_onclick,
          }[imageKey];
          
          return (
            <div 
              key={index} 
              className={`cursor-pointer border-2 rounded-lg overflow-hidden transition-all duration-300 transform hover:scale-105 ${selectedImage === imageKey ? 'border-black shadow-lg' : 'border-transparent'}`}
              onClick={onClick}
            >
              {isGenerating ? (
                <div className="w-full h-64 flex items-center justify-center bg-gray-100">
                  <img src="/loading.gif" alt="Loading..." className="w-24 h-24" />
                </div>
              ) : (
                <>
                  <img 
                    src={imageUrl} 
                    alt={`Generated wallpaper ${index + 1}`} 
                    className="w-full h-auto transition-opacity duration-300" 
                    onLoad={(e) => (e.target as HTMLImageElement).style.opacity = '1'}
                    style={{ opacity: 0 }}
                  />
                  <div className="p-2 text-center bg-white transition-colors duration-300">
                    <p>Image {index + 1}</p>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ImageSelector;