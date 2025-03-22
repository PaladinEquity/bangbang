import type { Metadata } from "next";
import { Inter, Playfair_Display, Roboto_Mono } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ChatWidget from "../components/ChatWidget";
import PageTransition from "../components/PageTransition";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";

Amplify.configure(outputs);

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfairDisplay = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair-display" });
const robotoMono = Roboto_Mono({ subsets: ["latin"], variable: "--font-roboto-mono" });

export const metadata: Metadata = {
  title: "BangBang Wallpaper",
  description: "Custom wallpaper created by you",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfairDisplay.variable} ${robotoMono.variable} font-sans bg-neutral-50`}>
        <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500 z-50"></div>
        <Header />
        <main className="min-h-screen pt-24 md:pt-28 pb-24">
          <PageTransition transitionType="fade" duration={0.4}>{children}</PageTransition>
        </main>
        <Footer />
        <ChatWidget />
      </body>
    </html>
  );
}
