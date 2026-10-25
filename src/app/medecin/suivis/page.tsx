import { createClient } from '@/lib/supabase/server'
import { getUser, getNotifCount } from '@/lib/actions'
import Layout from '@/components/Layout'
import Tag from '@/components/Tag'
import { dateFr, statutSuivi, libelleStatutSuivi, nomPatient } from '@/lib/utils'
import Link from 'next/link'

export default async function MedecinSuivis() {
  const user = await getUser()
  const notifCount = await getNotifCount(user.id)
  const supabase = await createClient()

  const { data: suivis } = await supabase
    .from('suivis')
    .select('*, patients(nom, prenom)')
    .eq('medecin_id', user.id)
    .order('date_prevue', { ascending: false })

  return (
    <Layout user={user} title="Suivis" notifications={notifCount}>
      <div className="carte">
        <table>
          <thead>
            <tr><th>Date prévue</th><th>Patient</th><th>Type</th><th>Statut</th><th>Dossier</th></tr>
          </thead>
          <tbody>
            {suivis?.map(s => {
              const p = s.patients as { nom: string; prenom: string } | null
              const st = statutSuivi(s.date_prevue, s.effectue_le)
              return (
                <tr key={s.id}>
                  <td>{dateFr(s.date_prevue)}</td>
                  <td>{p ? nomPatient(p) : '—'}</td>
                  <td>{s.type_suivi}</td>
                  <td><Tag statut={st} label={libelleStatutSuivi(st)} /></td>
                  <td><Link href={`/medecin/dossier/${s.patient_id}`} className="btn secondaire petit">Dossier</Link></td>
                </tr>
              )
            })}
            {!suivis?.length && <tr><td colSpan={5} className="muted">Aucun suivi.</td></tr>}
          </tbody>
        </table>
      </div>
    </Layout>
  )
}
