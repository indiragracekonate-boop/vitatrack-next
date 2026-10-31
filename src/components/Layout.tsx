'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@/lib/types'
import {
  LayoutDashboard, Users, Calendar, AlertTriangle, ClipboardList,
  UserPlus, Bell, LogOut, Download, BookOpen, FileText, Stethoscope,
  ShieldCheck, Activity, Clipboard, ClipboardCheck, Heart, Pill,
  ChevronRight, Menu, X,
} from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

type MenuItem = { href: string; label: string; icon: React.ReactNode; match?: 'exact' | 'prefix' }

const menus: Record<string, MenuItem[]> = {
  admin: [
    { href: '/admin/dashboard',    label: 'Tableau de bord',       icon: <LayoutDashboard size={18} /> },
    { href: '/admin/utilisateurs', label: 'Comptes utilisateurs',   icon: <Users size={18} /> },
    { href: '/admin/patients',     label: 'Patients & affectations',icon: <Stethoscope size={18} /> },
    { href: '/admin/journal',      label: 'Journal des actions',    icon: <BookOpen size={18} /> },
  ],
  medecin: [
    { href: '/medecin/dashboard',      label: 'Tableau de bord',     icon: <LayoutDashboard size={18} /> },
    { href: '/medecin/patients',       label: 'Mes patients',        icon: <Users size={18} /> },
    { href: '/medecin/rendezvous',     label: 'Rendez-vous',         icon: <Calendar size={18} /> },
    { href: '/medecin/signalements',   label: 'Signalements',        icon: <AlertTriangle size={18} /> },
    { href: '/medecin/suivis',         label: 'Suivis en retard',    icon: <ClipboardCheck size={18} /> },
    { href: '/medecin/questionnaires', label: 'Questionnaires',      icon: <ClipboardList size={18} /> },
    { href: '/medecin/nouveau_patient',label: 'Nouveau patient',     icon: <UserPlus size={18} /> },
  ],
  patient: [
    { href: '/patient/dashboard',      label: 'Mon espace santé',   icon: <Heart size={18} /> },
    { href: '/patient/passeport',      label: 'Passeport de sortie',icon: <FileText size={18} /> },
    { href: '/patient/traitements',    label: 'Mes traitements',    icon: <Pill size={18} /> },
    { href: '/patient/rendezvous',     label: 'Mes rendez-vous',    icon: <Calendar size={18} /> },
    { href: '/patient/signalement',    label: 'Signaler un symptôme',icon: <AlertTriangle size={18} /> },
    { href: '/patient/questionnaires', label: 'Questionnaires',     icon: <ClipboardList size={18} /> },
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
  const [mobileOpen, setMobileOpen] = useState(false)

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
      alert("Pour installer :\n• Chrome/Edge : menu ⋮ → « Installer VitaTrack »\n• Safari iOS : partager → « Sur l'écran d'accueil »")
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const menuItems = menus[user.role] ?? []
  const initiales = `${user.prenom?.[0] ?? ''}${user.nom?.[0] ?? ''}`.toUpperCase()

  const isActive = (item: MenuItem) =>
    item.match === 'exact'
      ? pathname === item.href
      : pathname === item.href || pathname.startsWith(item.href + '/')

  const navContent = (
    <div className="menu-section">
      {menuItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={isActive(item) ? 'actif' : ''}
          onClick={() => setMobileOpen(false)}
        >
          {item.icon}
          {item.label}
          {isActive(item) && <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.5 }} />}
        </Link>
      ))}
    </div>
  )

  return (
    <div className={`role-${user.role}`} style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header */}
      <header className="haut">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            type="button"
            className="fantome btn-icon"
            style={{ display: 'none' }}
            id="menu-toggle"
            onClick={() => setMobileOpen(v => !v)}
            aria-label="Menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <Link className="marque" href="/" style={{ textDecoration: 'none' }}>
            <Activity size={22} color="var(--bleu)" />
            <span className="marque-nom">VitaTrack</span>
          </Link>
        </div>

        <div className="haut-droite">
          {!installed && (
            <button
              type="button"
              className="fantome petit"
              onClick={handleInstall}
              title="Installer l'application"
            >
              <Download size={15} />
              <span style={{ display: 'none' }} id="install-label">Installer</span>
            </button>
          )}
          <Link className="cloche" href="/notifications" aria-label={`${notifications} notifications non lues`}>
            <Bell size={18} />
            {notifications > 0 && <span className="badge">{notifications > 9 ? '9+' : notifications}</span>}
          </Link>
          <div className="profil-chip">
            <span className="avatar">{initiales}</span>
            <div className="profil-info">
              <div className="profil-nom">{user.prenom} {user.nom}</div>
              <div className="profil-role">{roleLabel[user.role]}</div>
            </div>
          </div>
          <button className="btn-logout" type="button" onClick={handleLogout}>
            <LogOut size={15} />
            <span>Déconnexion</span>
          </button>
        </div>
      </header>

      {/* Corps */}
      <div className="corps">
        {/* Sidebar desktop */}
        <nav className="menu" aria-label="Navigation principale">
          {navContent}
        </nav>

        {/* Overlay mobile */}
        {mobileOpen && (
          <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 40 }}
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Sidebar mobile slide */}
        <nav
          className="menu"
          style={{
            position: 'fixed',
            top: 'var(--header-h)',
            left: mobileOpen ? 0 : '-260px',
            height: 'calc(100vh - var(--header-h))',
            zIndex: 45,
            transition: 'left 0.2s ease',
          }}
          aria-label="Navigation mobile"
        >
          {navContent}
        </nav>

        <main className="contenu fade-in">
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
        VitaTrack — application médicale. Données fictives de démonstration. Ce n&apos;est pas un service d&apos;urgence.
      </footer>
    </div>
  )
}
