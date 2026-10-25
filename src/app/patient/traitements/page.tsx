import { createAdminClient } from '@/lib/supabase/server'
import { getUser, getNotifCount } from '@/lib/actions'
import Layout from '@/components/Layout'
import { dateFr } from '@/lib/utils'

export default async function PatientTraitements() {
  const user = await getUser()
  const notifCount = await getNotifCount(user.id)
  const supabase = await createAdminClient()

  const { data: patient } = await supabase.from('patients').select('id').eq('user_id', user.id).single()

  const { data: prescriptions } = patient
    ? await supabase
        .from('prescriptions')
        .select('*, lignes_prescription(*), users(prenom, nom)')
        .eq('patient_id', patient.id)
        .order('date_prescription', { ascending: false })
    : { data: [] }

  return (
    <Layout user={user} title="Mes traitements" notifications={notifCount}>
      {prescriptions?.map(p => {
        const m = p.users as { prenom: string; nom: string } | null
        return (
          <div key={p.id} className="carte" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <strong>{dateFr(p.date_prescription)}</strong>
              {m && <span className="muted">Dr. {m.prenom} {m.nom}</span>}
            </div>
            {p.notes && <p className="muted" style={{ marginBottom: 8 }}>{p.notes}</p>}
            <table>
              <thead><tr><th>Médicament</th><th>Posologie</th><th>Durée</th><th>Instructions</th></tr></thead>
              <tbody>
                {p.lignes_prescription?.map((l: { id: string; medicament: string; posologie: string; duree: string | null; instructions: string | null }) => (
                  <tr key={l.id}>
                    <td><strong>{l.medicament}</strong></td>
                    <td>{l.posologie}</td>
                    <td>{l.duree ?? '—'}</td>
                    <td className="muted">{l.instructions ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      })}
      {!prescriptions?.length && (
        <div className="carte"><p className="muted">Aucune prescription enregistrée.</p></div>
      )}
    </Layout>
  )
}
