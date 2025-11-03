import './critical.css';
import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Roboto } from 'next/font/google';
import MainNavServer from '@/components/main-nav-server';
import { Footer } from '@/components/footer';
import Script from 'next/script';
import ClientLayout from '@/components/ClientLayout';

// Optimize font loading to reduce CLS
const roboto = Roboto({ 
  subsets: ['latin'],
  display: 'swap', // Use 'swap' to prevent text from being invisible while the font loads
  variable: '--font-roboto',
  weight: ['300', '400', '500', '700'], // Include common weights
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#000000',
};

export const metadata: Metadata = {
  title: 'Radioo Music - Official Website',
  description: 'Experience the fusion of classical rock and modern elements',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={roboto.variable}>
      <head>
        {/* Preload critical assets */}
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="icon" type="image/png" href="/radioo.jpg" />
      </head>
      <body className={roboto.className}>
        <ClientLayout>
          <MainNavServer />
          <div className="pt-16">
            {children}
          </div>
          <Footer />
        </ClientLayout>
        <Script
          src="https://unpkg.com/interactjs/dist/interact.min.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}