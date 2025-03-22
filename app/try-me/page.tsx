import React from 'react';
import Link from 'next/link';

export default function TryMe() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Try Our Wallpaper Creator</h1>
      
      <div className="bg-gray-50 p-6 rounded-lg mb-8 text-center">
        <h2 className="text-xl font-semibold mb-4">Experience Our AI-Powered Wallpaper Design Tool</h2>
        <p className="mb-6">Create a sample wallpaper design without any commitment. See how our technology transforms your ideas into beautiful wallpaper patterns.</p>
        <Link 
          href="/"
          className="bg-gray-800 text-white px-6 py-3 rounded inline-block hover:bg-gray-700 transition-colors"
        >
          Start Designing Now
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-3">How It Works</h3>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Upload an image or describe your idea</li>
            <li>Our AI generates a custom wallpaper design</li>
            <li>Preview your design in a virtual room setting</li>
            <li>Make adjustments until you're satisfied</li>
            <li>If you like it, proceed to order the real thing!</li>
          </ol>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-3">Why Try Our Tool?</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>See exactly what your custom wallpaper will look like</li>
            <li>Experiment with different styles and colors</li>
            <li>No design experience needed</li>
            <li>No obligation to purchase</li>
            <li>Save your designs for future reference</li>
          </ul>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-10">
        <h3 className="text-lg font-semibold mb-3">Sample Designs</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="aspect-square bg-gray-100 rounded flex items-center justify-center">
              <span className="text-gray-400 text-sm">Sample {item}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-3">Ready to create your own design?</h3>
        <Link 
          href="/"
          className="bg-gray-800 text-white px-6 py-3 rounded inline-block hover:bg-gray-700 transition-colors"
        >
          Try It Now
        </Link>
      </div>
    </div>
  );
}