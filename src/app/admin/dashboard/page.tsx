import { createClient } from '@/lib/supabase/server'
import { getUser, getNotifCount } from '@/lib/actions'
import Layout from '@/components/Layout'
import { datetimeFr } from '@/lib/utils'

export default async function AdminDashboard() {
  const user = await getUser()
  const notifCount = await getNotifCount(user.id)
  const supabase = await createClient()

  const [
    { count: nbUsers },
    { count: nbPatients },
    { count: nbMedecins },
    { data: recentActions },
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('patients').select('*', { count: 'exact', head: true }),
    supabase.from('medecins').select('*', { count: 'exact', head: true }),
    supabase
      .from('journal_actions')
      .select('*, users(prenom, nom)')
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  return (
    <Layout user={user} title="Tableau de bord" notifications={notifCount}>
      <div className="grille-stats">
        <div className="stat">
          <div className="muted" style={{ fontSize: 13 }}>Comptes utilisateurs</div>
          <div className="chiffre">{nbUsers ?? 0}</div>
        </div>
        <div className="stat">
          <div className="muted" style={{ fontSize: 13 }}>Patients</div>
          <div className="chiffre">{nbPatients ?? 0}</div>
        </div>
        <div className="stat">
          <div className="muted" style={{ fontSize: 13 }}>Médecins</div>
          <div className="chiffre">{nbMedecins ?? 0}</div>
        </div>
        <div className="stat">
          <div className="muted" style={{ fontSize: 13 }}>Actions récentes</div>
          <div className="chiffre">{recentActions?.length ?? 0}</div>
        </div>
      </div>

      <div className="carte">
        <h2>Dernières actions</h2>
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
            {recentActions?.map(a => (
              <tr key={a.id}>
                <td>{datetimeFr(a.created_at)}</td>
                <td>{a.users ? `${(a.users as {prenom:string;nom:string}).prenom} ${(a.users as {prenom:string;nom:string}).nom}` : '—'}</td>
                <td>{a.action}</td>
                <td className="muted">{a.details ?? '—'}</td>
              </tr>
            ))}
            {!recentActions?.length && (
              <tr><td colSpan={4} className="muted">Aucune action enregistrée.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  )
}
