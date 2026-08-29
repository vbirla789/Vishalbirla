import type { Metadata } from "next";
import { Geist } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { colors } from "./theme";
import { Retune } from "retune";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Geist Pixel — display font, not on Google Fonts. Files come from
// github.com/vercel/geist-pixel-font (OFL 1.1); "Square" variant.
const geistPixel = localFont({
  src: "../public/fonts/GeistPixel-Square.woff2",
  variable: "--font-geist-pixel",
  display: "swap",
  weight: "400",
  style: "normal",
});

export const metadata: Metadata = {
  title: "Vishal Birla · Product Designer & Framer Expert",
  description:
    "Product designer based out of India, currently at noon. I shape how things look, then bring them to life with AI, and I'm a Framer expert too.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistPixel.variable} antialiased`}
    >
      <body
        className="min-h-screen"
        style={{ backgroundColor: colors.background, color: colors.primary }}
      >
        {children}
        {/* Visual tuning overlay — dev only. Press Option+D (Alt+D) to toggle. */}
        <Retune />
      </body>
    </html>
  );
}
