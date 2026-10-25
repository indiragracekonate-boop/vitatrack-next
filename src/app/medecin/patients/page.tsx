import { createClient } from '@/lib/supabase/server'
import { getUser, getNotifCount } from '@/lib/actions'
import Layout from '@/components/Layout'
import { dateFr, nomPatient } from '@/lib/utils'
import Link from 'next/link'

export default async function MedecinPatients() {
  const user = await getUser()
  const notifCount = await getNotifCount(user.id)
  const supabase = await createClient()

  const { data: affectations } = await supabase
    .from('affectations_medecin')
    .select('*, patients(*)')
    .eq('medecin_id', user.id)

  const patients = affectations?.map(a => a.patients as {
    id: string; nom: string; prenom: string; date_naissance: string; sexe: string; telephone: string | null
  }) ?? []

  return (
    <Layout user={user} title="Mes patients" notifications={notifCount}>
      <div className="carte">
        <table>
          <thead>
            <tr>
              <th>Nom</th>
              <th>Date de naissance</th>
              <th>Sexe</th>
              <th>Téléphone</th>
              <th>Dossier</th>
            </tr>
          </thead>
          <tbody>
            {patients.map(p => (
              <tr key={p.id}>
                <td><Link href={`/medecin/dossier/${p.id}`}>{nomPatient(p)}</Link></td>
                <td>{dateFr(p.date_naissance)}</td>
                <td>{p.sexe === 'M' ? 'Masculin' : 'Féminin'}</td>
                <td>{p.telephone ?? '—'}</td>
                <td><Link href={`/medecin/dossier/${p.id}`} className="btn secondaire petit">Ouvrir</Link></td>
              </tr>
            ))}
            {!patients.length && (
              <tr><td colSpan={5} className="muted">Aucun patient affecté.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  )
}
