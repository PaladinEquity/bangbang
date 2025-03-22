'use client';
import Image from 'next/image';

export default function About() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <div className="flex flex-col justify-center">
          <h1 className="text-3xl font-bold mb-8 text-center">ABOUT US</h1>
          <p className="mb-6 text-base leading-relaxed">
            Brentwood, California - 2024. Luxury homes, yet bland walls. A developer craved more. What if AI could paint them with the soul of your story? Thus, BangBang was born. We use cutting edge AI to craft bespoke wallpapers, transforming your space into a reflection of you. No more uniformity, just your unique narrative, whispered on every wall. This isn't wallpaper, its a canvas for you.
          </p>
        </div>
        <div>
          <Image
            src="/about_1.avif"
            alt="BangBang Wallpaper Interior"
            width={600}
            height={400}
            className="w-full h-auto rounded-md shadow-lg"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <div className="md:order-2 flex flex-col justify-center">
          <h2 className="text-xl font-semibold mb-4">Beyond walls, into your imagination.</h2>
        </div>
        <div className="md:order-1">
          <Image
            src="/about_2.avif"
            alt="BangBang Wallpaper Lifestyle"
            width={600}
            height={400}
            className="w-full h-auto rounded-md shadow-lg"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <div className="flex flex-col justify-center">
          <h2 className="text-xl font-semibold mb-4">The intersection of luxury & tech.</h2>
        </div>
        <div>
          <Image
            src="/about_3.avif"
            alt="BangBang Wallpaper Design"
            width={600}
            height={400}
            className="w-full h-auto rounded-md shadow-lg"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <div className="md:order-2 flex flex-col justify-center">
          <h2 className="text-xl font-semibold mb-4">BangBang Wallpaper.</h2>
        </div>
        <div className="md:order-1">
          <Image
            src="/about_4.avif"
            alt="BangBang Wallpaper Product"
            width={600}
            height={400}
            className="w-full h-auto rounded-md shadow-lg"
          />
        </div>
      </div>
      {/* 
      <div className="mt-12 text-center">
        <h3 className="text-xl font-semibold mb-4">Contact Us</h3>
        <p className="mb-2">
          <strong>Email:</strong> hello@bangbangwallpaper.com
        </p>
        <p className="mb-2">
          <strong>Phone:</strong> (555) 123-4567
        </p>
        <p className="mb-2">
          <strong>Hours:</strong> Monday-Friday, 9am-5pm PST
        </p>
      </div> */}
    </div>
  );
}