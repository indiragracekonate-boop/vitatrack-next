import { createClient } from '@/lib/supabase/server'
import { getUser, getNotifCount } from '@/lib/actions'
import Layout from '@/components/Layout'
import Tag from '@/components/Tag'
import { datetimeFr, libelleStatutRdv, nomPatient } from '@/lib/utils'
import Link from 'next/link'

export default async function MedecinRdv() {
  const user = await getUser()
  const notifCount = await getNotifCount(user.id)
  const supabase = await createClient()

  const { data: rdvs } = await supabase
    .from('rendez_vous')
    .select('*, patients(nom, prenom)')
    .eq('medecin_id', user.id)
    .order('date_heure', { ascending: false })

  return (
    <Layout user={user} title="Rendez-vous" notifications={notifCount}>
      <div className="carte">
        <table>
          <thead>
            <tr><th>Date</th><th>Patient</th><th>Motif</th><th>Statut</th><th>Dossier</th></tr>
          </thead>
          <tbody>
            {rdvs?.map(r => {
              const p = r.patients as { nom: string; prenom: string } | null
              return (
                <tr key={r.id}>
                  <td style={{ whiteSpace: 'nowrap' }}>{datetimeFr(r.date_heure)}</td>
                  <td>{p ? nomPatient(p) : '—'}</td>
                  <td>{r.motif}</td>
                  <td><Tag statut={r.statut} label={libelleStatutRdv(r.statut)} /></td>
                  <td><Link href={`/medecin/dossier/${r.patient_id}`} className="btn secondaire petit">Dossier</Link></td>
                </tr>
              )
            })}
            {!rdvs?.length && <tr><td colSpan={5} className="muted">Aucun rendez-vous.</td></tr>}
          </tbody>
        </table>
      </div>
    </Layout>
  )
}
