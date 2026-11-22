import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = { title: { default: 'NOVAPROJE', template: '%s | NOVAPROJE' }, robots: { index: false, follow: false }, icons: { icon: '/img/revmark.webp', apple: '/icons/apple-touch-icon.png' }, manifest: '/manifest.webmanifest', appleWebApp: { capable: true, title: 'NOVAPROJE', statusBarStyle: 'black-translucent' } };
export const viewport: Viewport = { themeColor: '#06110C', width: 'device-width', initialScale: 1, viewportFit: 'cover' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@100..125,400..900&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body>{children}<script src="/pwa.js?v=1" defer /></body>
    </html>
  );
}
