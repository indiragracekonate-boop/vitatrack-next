import type { Metadata, Viewport } from 'next'
import './globals.css'
import PwaInstall from '@/components/PwaInstall'

export const metadata: Metadata = {
  title: 'VitaTrack',
  description: 'Suivi des patients après hospitalisation',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/assets/images/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/assets/images/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/assets/images/icon-192.png',
    shortcut: '/assets/images/icon-192.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'VitaTrack',
  },
}

export const viewport: Viewport = {
  themeColor: '#0d57a6',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="apple-touch-icon" href="/assets/images/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body>
        {children}
        <PwaInstall />
      </body>
    </html>
  )
}
