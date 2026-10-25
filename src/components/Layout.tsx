'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@/lib/types'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const menus: Record<string, Array<[string, string]>> = {
  admin: [
    ['/admin/dashboard', 'Tableau de bord'],
    ['/admin/utilisateurs', 'Comptes utilisateurs'],
    ['/admin/patients', 'Patients et affectations'],
    ['/admin/journal', 'Journal des actions'],
  ],
  medecin: [
    ['/medecin/dashboard', 'Tableau de bord'],
    ['/medecin/patients', 'Mes patients'],
    ['/medecin/rendezvous', 'Rendez-vous'],
    ['/medecin/signalements', 'Signalements'],
    ['/medecin/suivis', 'Suivis en retard'],
    ['/medecin/questionnaires', 'Questionnaires'],
    ['/medecin/nouveau_patient', '+ Nouveau patient'],
  ],
  patient: [
    ['/patient/dashboard', 'Accueil'],
    ['/patient/passeport', 'Mon passeport de sortie'],
    ['/patient/traitements', 'Mes traitements'],
    ['/patient/rendezvous', 'Mes rendez-vous'],
    ['/patient/signalement', 'Signaler un symptôme'],
    ['/patient/questionnaires', 'Mes questionnaires'],
  ],
}

const roleLabel: Record<string, string> = {
  admin: 'Administrateur',
  medecin: 'Médecin',
  patient: 'Patient',
}

interface Props {
  user: User
  title: string
  notifications?: number
  children: React.ReactNode
  flash?: { type: 'ok' | 'erreur'; message: string } | null
}

export default function Layout({ user, title, notifications = 0, children, flash }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {})
    const handler = (e: Event) => {
      e.preventDefault()
      deferredPrompt.current = e as BeforeInstallPromptEvent
    }
    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => setInstalled(true))
    setInstalled(window.matchMedia('(display-mode: standalone)').matches)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  async function handleInstall() {
    if (deferredPrompt.current) {
      await deferredPrompt.current.prompt()
      const { outcome } = await deferredPrompt.current.userChoice
      if (outcome === 'accepted') { setInstalled(true); deferredPrompt.current = null }
    } else {
      alert("Pour installer l'application :\n• Chrome/Edge : menu ⋮ → « Installer VitaTrack »\n• Safari iOS : partager → « Sur l'écran d'accueil »")
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const menuItems = menus[user.role] ?? []

  return (
    <div className={`role-${user.role}`}>
      <header className="haut">
        <a className="marque" href="/">
          <img src="/assets/images/logo.png" alt="VitaTrack" />
        </a>
        <div className="haut-droite">
          {!installed && (
            <button
              type="button"
              onClick={handleInstall}
              title="Installer l'application sur votre bureau"
              style={{ background: '#fff', color: '#0d57a6', border: 'none', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }}
            >
              ⬇ Installer
            </button>
          )}
          <Link className="cloche" href="/notifications" aria-label={`Notifications : ${notifications} non lues`}>
            🔔{notifications > 0 && <span className="badge">{notifications}</span>}
          </Link>
          <span className="profil">
            {user.prenom} {user.nom} · {roleLabel[user.role]}
          </span>
          <button className="secondaire" type="button" onClick={handleLogout} style={{ marginTop: 0 }}>
            Déconnexion
          </button>
        </div>
      </header>
      <div className="corps">
        <nav className="menu" aria-label="Menu principal">
          {menuItems.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className={pathname === href || pathname.startsWith(href + '/') ? 'actif' : ''}
            >
              {label}
            </Link>
          ))}
        </nav>
        <main className="contenu">
          {flash && (
            <div className={`message ${flash.type}`} role="status">
              {flash.message}
            </div>
          )}
          <h1>{title}</h1>
          {children}
        </main>
      </div>
      <footer className="pied">
        VitaTrack : prototype de démonstration avec des données fictives. Ce n&apos;est pas un service d&apos;urgence.
      </footer>
    </div>
  )
}
