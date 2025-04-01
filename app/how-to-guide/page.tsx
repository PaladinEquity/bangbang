'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function HowToGuide() {
  // Example wallpaper images for Primary Imagery section
  const primaryImageryExamples = [
    { id: 1, src: '/about_1.avif', alt: 'Eiffel Tower pattern wallpaper', style: 'Black and white Eiffel Tower pattern' },
    { id: 2, src: '/about_2.avif', alt: 'Damask pattern wallpaper', style: 'Classic damask pattern' },
    { id: 3, src: '/about_3.avif', alt: 'Mona Lisa pattern wallpaper', style: 'Artistic Mona Lisa pattern' },
    { id: 4, src: '/about_4.avif', alt: 'Starry Night pattern wallpaper', style: 'Van Gogh inspired pattern' },
  ];

  // Example wallpaper images for Design Style section
  const designStyleExamples = [
    { id: 1, src: '/about_1.avif', alt: 'Geometric pattern wallpaper', style: 'Geometric' },
    { id: 2, src: '/about_2.avif', alt: 'Damask pattern wallpaper', style: 'Damask' },
    { id: 3, src: '/about_3.avif', alt: 'Abstract pattern wallpaper', style: 'Abstract' },
    { id: 4, src: '/about_4.avif', alt: 'Floral pattern wallpaper', style: 'Floral' },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Primary Imagery & Design Style</h1>
        <h2 className="text-xl font-medium mb-4">Guide with Examples</h2>
      </div>

      {/* Step 1: Primary Imagery Section */}
      <div className="mb-12">
        <h3 className="text-xl font-semibold mb-4">Step 1: Input Primary Imagery</h3>
        
        <ul className="list-disc pl-6 mb-4">
          <li className="mb-2">Tips on what you'd like to see in Primary Imagery section.</li>
          <li className="mb-2">Examples: "Eiffel Tower", "Mona Lisa", or "City Skyline".</li>
        </ul>
        
        <div className="mb-4">
          <h4 className="font-medium mb-2">Examples:</h4>
          <p className="mb-4">Swipe over images below to see examples of primary imagery inputs. Examples include design style outputs which are explained below.</p>
        </div>
        
        {/* Primary Imagery Horizontal Slider */}
        <div className="relative overflow-x-auto pb-4">
          <div className="flex space-x-4 w-max">
            {primaryImageryExamples.map((example) => (
              <div key={example.id} className="flex-none w-64 md:w-72">
                <div className="border rounded-lg overflow-hidden">
                  <div className="relative h-64 w-full">
                    <Image 
                      src={example.src} 
                      alt={example.alt}
                      fill
                      style={{ objectFit: 'cover' }}
                      className="hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-3 bg-white">
                    <p className="text-sm font-medium">{example.style}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Step 2: Design Style Section */}
      <div className="mb-12">
        <h3 className="text-xl font-semibold mb-4">Step 2: Input Design Style</h3>
        
        <ul className="list-disc pl-6 mb-4">
          <li className="mb-2">Tips on what you'd like to see in Design Style text box.</li>
        </ul>
        
        <div className="mb-4">
          <h4 className="font-medium mb-2">Examples:</h4>
          <ul className="list-disc pl-6 mb-4">
            <li className="mb-1">Traditional Designs: "Geometric", "Damask", "Stripes", "Minimalist", "Floral", and so on...</li>
            <li className="mb-1">Cultural Designs: "African", "Scandinavian", "Hawaiian", and so on...</li>
          </ul>
          <p className="mb-4">Use in-depth descriptions to see examples of design style inputs. Features of specific design styles are displayed by clicking on images below.</p>
        </div>
        
        {/* Design Style Horizontal Slider */}
        <div className="relative overflow-x-auto pb-4">
          <div className="flex space-x-4 w-max">
            {designStyleExamples.map((example) => (
              <div key={example.id} className="flex-none w-64 md:w-72">
                <div className="border rounded-lg overflow-hidden">
                  <div className="relative h-64 w-full">
                    <Image 
                      src={example.src} 
                      alt={example.alt}
                      fill
                      style={{ objectFit: 'cover' }}
                      className="hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-3 bg-white">
                    <p className="text-sm font-medium">{example.style}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Try Me Button */}
      <div className="text-center mb-12">
        <Link href="/try-me">
          <button className="bg-black text-white px-8 py-3 rounded-md font-medium hover:bg-gray-800 transition-colors">
            Try Me
          </button>
        </Link>
      </div>

      {/* Footer Section */}
      <div className="border-t pt-8 mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Operations */}
          <div>
            <h4 className="font-semibold mb-3">Operations</h4>
            <p className="text-sm text-gray-600 mb-2">Mon - Fri 8 am - 6 pm</p>
            <h5 className="font-medium mb-2">Information</h5>
            <ul className="text-sm space-y-1">
              <li><Link href="/privacy-policy" className="hover:underline">Privacy Policy</Link></li>
              <li><Link href="/terms-conditions" className="hover:underline">Terms & Conditions</Link></li>
            </ul>
          </div>
          
          {/* Join the Community */}
          <div>
            <h4 className="font-semibold mb-3">Join the Community</h4>
            <div className="mb-4">
              <input 
                type="email" 
                placeholder="Email" 
                className="w-full p-2 border rounded mb-2"
              />
              <button className="w-full bg-black text-white p-2 rounded font-medium hover:bg-gray-800 transition-colors">
                Sign Up
              </button>
            </div>
          </div>
          
          {/* Write to Us */}
          <div>
            <h4 className="font-semibold mb-3">Write to US</h4>
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>contact@bangbangwallpaper.com</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}