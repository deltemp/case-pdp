import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { PerformanceProvider } from "@/components/PerformanceProvider";
import "./globals.css";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'),
  title: {
    template: '%s | Your E-commerce Store',
    default: 'Your E-commerce Store - Quality Products Online',
  },
  description: 'Discover quality products at competitive prices. Fast shipping, excellent customer service, and satisfaction guaranteed.',
  keywords: ['e-commerce', 'online shopping', 'quality products', 'fast shipping', 'electronics', 'gadgets'],
  authors: [{ name: 'Your Store Team' }],
  creator: 'Your E-commerce Store',
  publisher: 'Your E-commerce Store',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001',
    siteName: 'Your E-commerce Store',
    title: 'Your E-commerce Store - Quality Products Online',
    description: 'Discover quality products at competitive prices.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Your E-commerce Store',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Your E-commerce Store',
    description: 'Discover quality products at competitive prices.',
    images: ['/twitter-image.jpg'],
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Canonical link will be handled by individual page metadata */}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <PerformanceProvider>
          {children}
        </PerformanceProvider>
      </body>
    </html>
  );
}
