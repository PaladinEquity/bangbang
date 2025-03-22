import React from 'react';
import Link from 'next/link';

export default function HowToGuide() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">How To Create Your Custom Wallpaper</h1>
      
      <div className="bg-gray-50 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Start Guide</h2>
        <ol className="list-decimal pl-5 space-y-3">
          <li>Upload your primary image(s) in the <Link href="/" className="text-blue-600 hover:underline">Image Creation</Link> tool</li>
          <li>Select your design style and color preferences</li>
          <li>Add details about pattern structure, mood, and specific qualities</li>
          <li>Click the Create button to generate your custom wallpaper</li>
          <li>Review the preview and make adjustments if needed</li>
          <li>Proceed to checkout when you're satisfied with your design</li>
        </ol>
      </div>
      
      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. Uploading Your Images</h2>
          <p className="mb-3">The Primary Image input is where you'll upload the main image(s) that will inspire your wallpaper design. You can:</p>
          <ul className="list-disc pl-5 mb-3">
            <li>Drag and drop images directly into the upload area</li>
            <li>Click to browse and select files from your device</li>
            <li>Upload multiple images for our AI to work with</li>
          </ul>
          <p className="text-sm text-gray-600">High resolution images are recommended for best results, but our AI can enhance lower quality images if needed.</p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-3">2. Choosing Your Design Style</h2>
          <p className="mb-3">The Design Style field controls the overall theme of your wallpaper. You can specify styles such as:</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
            <div className="bg-white p-2 text-center rounded border">Art Deco</div>
            <div className="bg-white p-2 text-center rounded border">Minimalist</div>
            <div className="bg-white p-2 text-center rounded border">Victorian</div>
            <div className="bg-white p-2 text-center rounded border">Bauhaus</div>
            <div className="bg-white p-2 text-center rounded border">Futuristic</div>
            <div className="bg-white p-2 text-center rounded border">Bohemian</div>
          </div>
          <p className="text-sm text-gray-600">You can also specify color preferences in this section.</p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-3">3. Enhanced Image Creation</h2>
          <p className="mb-3">This section allows you to add specific details and effects to your wallpaper design:</p>
          <ul className="list-disc pl-5">
            <li><strong>Pattern Structure:</strong> Symmetrical, Asymmetrical, Repeating, Random, etc.</li>
            <li><strong>Mood-Ambience:</strong> Bright, Vibrant, Moody, Calm, Energetic, etc.</li>
            <li><strong>Specific Qualities:</strong> Textured, Handpainted, Sleek, Glossy, Matte, etc.</li>
            <li><strong>Basic Adjectives:</strong> Elegant, Whimsical, Playful, Sophisticated, etc.</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-3">4. Creating Your Wallpaper</h2>
          <p className="mb-3">Once you've filled in your preferences, click the Create button to generate your custom wallpaper design. Our AI will process your inputs and create a unique wallpaper based on your specifications.</p>
          <p className="mb-3">The preview will appear in the Preview Section. If you're not satisfied with the result, you can adjust your inputs and create a new design.</p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-3">5. Ordering Your Custom Wallpaper</h2>
          <p className="mb-3">When you're happy with your design, you can proceed to order your custom wallpaper:</p>
          <ol className="list-decimal pl-5">
            <li>Select your preferred size and material</li>
            <li>Add the design to your cart</li>
            <li>Proceed to checkout</li>
            <li>Enter your shipping and payment information</li>
            <li>Confirm your order</li>
          </ol>
          <p className="mt-3 text-sm text-gray-600">Your custom wallpaper will be professionally printed and shipped directly to your door.</p>
        </section>
      </div>
      
      <div className="mt-10 bg-gray-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-3">Need Help?</h2>
        <p className="mb-3">If you have any questions or need assistance with creating your custom wallpaper, our team is here to help.</p>
        <p className="font-medium">Contact us at: <span className="text-blue-600">hello@company.com</span></p>
        <p>Business hours: Monday-Friday, 8am-6pm PST</p>
      </div>
    </div>
  );
}