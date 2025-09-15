import type { Metadata } from 'next';
import { Blinker } from 'next/font/google';
import './globals.css';
import Script from 'next/script';
import { AuthProvider } from '@/context/AuthContext';
import Navigation from '@/components/Navigation';
import ErrorBoundary from '@/components/ErrorBoundary';

const blinker = Blinker({ 
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '600', '700', '800', '900']
});

export const metadata: Metadata = {
  title: 'Fanpit Spaces',
  description: 'Book event spaces, co-working areas, and more',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="afterInteractive"
        />
      </head>
      <body className={blinker.className}>
        <ErrorBoundary>
          <AuthProvider>
            <Navigation />
            <main>{children}</main>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}