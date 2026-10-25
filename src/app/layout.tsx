import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'VitaTrack',
  description: 'Suivi des patients après hospitalisation',
  manifest: '/manifest.json',
  themeColor: '#0d57a6',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
