import { createClient } from '@/lib/supabase/server'
import { getUser, getNotifCount } from '@/lib/actions'
import Layout from '@/components/Layout'
import Tag from '@/components/Tag'
import { datetimeFr, libelleStatutRdv } from '@/lib/utils'

export default async function PatientRdv() {
  const user = await getUser()
  const notifCount = await getNotifCount(user.id)
  const supabase = await createClient()

  const { data: patient } = await supabase.from('patients').select('id').eq('user_id', user.id).single()

  const { data: rdvs } = patient
    ? await supabase
        .from('rendez_vous')
        .select('*, users(prenom, nom)')
        .eq('patient_id', patient.id)
        .order('date_heure', { ascending: false })
    : { data: [] }

  return (
    <Layout user={user} title="Mes rendez-vous" notifications={notifCount}>
      <div className="carte">
        <table>
          <thead>
            <tr><th>Date</th><th>Médecin</th><th>Motif</th><th>Statut</th></tr>
          </thead>
          <tbody>
            {rdvs?.map(r => {
              const m = r.users as { prenom: string; nom: string } | null
              return (
                <tr key={r.id}>
                  <td style={{ whiteSpace: 'nowrap' }}>{datetimeFr(r.date_heure)}</td>
                  <td>{m ? `Dr. ${m.prenom} ${m.nom}` : '—'}</td>
                  <td>{r.motif}</td>
                  <td><Tag statut={r.statut} label={libelleStatutRdv(r.statut)} /></td>
                </tr>
              )
            })}
            {!rdvs?.length && <tr><td colSpan={4} className="muted">Aucun rendez-vous.</td></tr>}
          </tbody>
        </table>
      </div>
    </Layout>
  )
}
