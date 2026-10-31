import { createClient } from '@/lib/supabase/server'
import { getUser, getNotifCount } from '@/lib/actions'
import Layout from '@/components/Layout'
import { datetimeFr } from '@/lib/utils'
import Link from 'next/link'
import { Users, Stethoscope, UserCheck, Activity, UserPlus } from 'lucide-react'

export default async function AdminDashboard() {
  const user = await getUser()
  const notifCount = await getNotifCount(user.id)
  const supabase = await createClient()

  const [
    { count: nbUsers },
    { count: nbPatients },
    { count: nbMedecins },
    { count: nbActifs },
    { data: recentActions },
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('patients').select('*', { count: 'exact', head: true }),
    supabase.from('medecins').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('actif', true),
    supabase
      .from('journal_actions')
      .select('*, users(prenom, nom)')
      .order('created_at', { ascending: false })
      .limit(15),
  ])

  const stats = [
    { label: 'Comptes total',    value: nbUsers ?? 0,    icon: <Users size={20} />,       color: 'bleu' },
    { label: 'Comptes actifs',   value: nbActifs ?? 0,   icon: <UserCheck size={20} />,   color: 'vert' },
    { label: 'Patients',         value: nbPatients ?? 0, icon: <Activity size={20} />,    color: 'teal' },
    { label: 'Médecins',         value: nbMedecins ?? 0, icon: <Stethoscope size={20} />, color: 'violet' },
  ]

  return (
    <Layout user={user} title="Tableau de bord" notifications={notifCount}>
      {/* Stats */}
      <div className="grille-stats">
        {stats.map(s => (
          <div key={s.label} className="stat">
            <div className={`stat-icon ${s.color}`}>{s.icon}</div>
            <div className="stat-label">{s.label}</div>
            <div className={`chiffre ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Actions rapides admin */}
      <div className="carte" style={{ marginBottom: 20 }}>
        <h2>Actions rapides</h2>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link href="/admin/utilisateurs" className="bouton secondaire" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <UserPlus size={16} /> Gérer les comptes
          </Link>
          <Link href="/admin/patients" className="bouton secondaire" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Stethoscope size={16} /> Gérer les patients
          </Link>
          <Link href="/admin/journal" className="bouton secondaire" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Activity size={16} /> Journal complet
          </Link>
        </div>
      </div>

      {/* Journal des actions */}
      <div className="carte">
        <div className="carte-titre">
          <h2>Dernières actions</h2>
          <Link href="/admin/journal" className="bouton secondaire petit">Voir tout</Link>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Utilisateur</th>
                <th>Action</th>
                <th>Détails</th>
              </tr>
            </thead>
            <tbody>
              {recentActions?.map(a => {
                const u = a.users as { prenom: string; nom: string } | null
                return (
                  <tr key={a.id}>
                    <td style={{ whiteSpace: 'nowrap', fontSize: 12.5, color: 'var(--gris)' }}>{datetimeFr(a.created_at)}</td>
                    <td style={{ fontWeight: 500 }}>{u ? `${u.prenom} ${u.nom}` : '—'}</td>
                    <td><code style={{ fontSize: 12, background: 'var(--fond)', padding: '2px 6px', borderRadius: 4 }}>{a.action}</code></td>
                    <td className="muted" style={{ fontSize: 12.5 }}>{a.details ?? '—'}</td>
                  </tr>
                )
              })}
              {!recentActions?.length && (
                <tr>
                  <td colSpan={4} className="muted" style={{ textAlign: 'center', padding: '20px 0' }}>
                    Aucune action enregistrée.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}
