import { createClient } from '@/lib/supabase/server'
import { getUser, getNotifCount } from '@/lib/actions'
import Layout from '@/components/Layout'
import { datetimeFr } from '@/lib/utils'

export default async function AdminJournal({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const user = await getUser()
  const notifCount = await getNotifCount(user.id)
  const supabase = await createClient()
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page ?? '1'))
  const pageSize = 50
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data: actions, count } = await supabase
    .from('journal_actions')
    .select('*, users(prenom, nom)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  const totalPages = Math.ceil((count ?? 0) / pageSize)

  return (
    <Layout user={user} title="Journal des actions" notifications={notifCount}>
      <div className="carte">
        <p className="muted" style={{ marginBottom: 12 }}>
          {count ?? 0} action{(count ?? 0) > 1 ? 's' : ''} enregistrée{(count ?? 0) > 1 ? 's' : ''}
        </p>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Utilisateur</th>
              <th>Action</th>
              <th>Objet</th>
              <th>Détails</th>
            </tr>
          </thead>
          <tbody>
            {actions?.map(a => {
              const u = a.users as { prenom: string; nom: string } | null
              return (
                <tr key={a.id}>
                  <td style={{ whiteSpace: 'nowrap' }}>{datetimeFr(a.created_at)}</td>
                  <td>{u ? `${u.prenom} ${u.nom}` : '—'}</td>
                  <td>{a.action}</td>
                  <td className="muted">{a.objet_type ? `${a.objet_type}${a.objet_id ? ` #${a.objet_id.slice(0, 8)}` : ''}` : '—'}</td>
                  <td className="muted">{a.details ?? '—'}</td>
                </tr>
              )
            })}
            {!actions?.length && (
              <tr><td colSpan={5} className="muted">Aucune action enregistrée.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'center' }}>
          {page > 1 && <a href={`?page=${page - 1}`} className="btn secondaire">← Précédent</a>}
          <span className="muted" style={{ lineHeight: '36px' }}>Page {page} / {totalPages}</span>
          {page < totalPages && <a href={`?page=${page + 1}`} className="btn secondaire">Suivant →</a>}
        </div>
      )}
    </Layout>
  )
}
