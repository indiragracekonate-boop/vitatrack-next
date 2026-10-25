'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { User } from '@/lib/types'

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
