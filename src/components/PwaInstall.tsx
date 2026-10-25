'use client'
import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function PwaInstall() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setPrompt(e as BeforeInstallPromptEvent)
      setVisible(true)
    }
    window.addEventListener('beforeinstallprompt', handler)

    window.addEventListener('appinstalled', () => setVisible(false))

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (!visible || !prompt) return null

  const install = async () => {
    await prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') setVisible(false)
  }

  return (
    <div style={{
      position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)',
      background: '#0d57a6', color: '#fff', borderRadius: 12, padding: '12px 20px',
      display: 'flex', alignItems: 'center', gap: 16, zIndex: 9999,
      boxShadow: '0 4px 20px rgba(0,0,0,0.25)', maxWidth: 420, width: 'calc(100% - 40px)',
    }}>
      <img src="/assets/images/logo.png" alt="" style={{ height: 36, borderRadius: 8 }} />
      <span style={{ flex: 1, fontSize: 14 }}>Installer <strong>VitaTrack</strong> sur votre bureau</span>
      <button
        onClick={install}
        style={{ background: '#fff', color: '#0d57a6', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
      >
        Installer
      </button>
      <button
        onClick={() => setVisible(false)}
        style={{ background: 'transparent', color: 'rgba(255,255,255,0.7)', border: 'none', cursor: 'pointer', fontSize: 20, lineHeight: 1, padding: 4 }}
        aria-label="Fermer"
      >
        ×
      </button>
    </div>
  )
}
