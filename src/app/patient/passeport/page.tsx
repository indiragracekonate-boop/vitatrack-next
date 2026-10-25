import { createClient } from '@/lib/supabase/server'
import { getUser, getNotifCount } from '@/lib/actions'
import Layout from '@/components/Layout'
import { dateFr } from '@/lib/utils'

export default async function PatientPasseport() {
  const user = await getUser()
  const notifCount = await getNotifCount(user.id)
  const supabase = await createClient()

  const { data: patient } = await supabase
    .from('patients')
    .select('*, affectations_medecin(medecin_id, users(prenom, nom, medecins(specialite)))')
    .eq('user_id', user.id)
    .single()

  const { data: sorties } = patient
    ? await supabase.from('sorties_hospitalieres').select('*').eq('patient_id', patient.id).order('date_entree', { ascending: false })
    : { data: [] }

  if (!patient) {
    return (
      <Layout user={user} title="Mon passeport médical" notifications={notifCount}>
        <div className="carte"><p className="muted">Dossier non configuré.</p></div>
      </Layout>
    )
  }

  const age = Math.floor((new Date().getTime() - new Date(patient.date_naissance).getTime()) / (365.25 * 24 * 3600 * 1000))
  const medecin = patient.affectations_medecin?.[0]?.users as { prenom: string; nom: string; medecins: { specialite: string } | null } | null

  return (
    <Layout user={user} title="Mon passeport médical" notifications={notifCount}>
      <div className="grille-2">
        <div className="carte">
          <h2>Informations personnelles</h2>
          <table><tbody>
            <tr><td><strong>Nom</strong></td><td>{patient.prenom} {patient.nom}</td></tr>
            <tr><td><strong>Date de naissance</strong></td><td>{dateFr(patient.date_naissance)} ({age} ans)</td></tr>
            <tr><td><strong>Sexe</strong></td><td>{patient.sexe === 'M' ? 'Masculin' : 'Féminin'}</td></tr>
            <tr><td><strong>Téléphone</strong></td><td>{patient.telephone ?? '—'}</td></tr>
            <tr><td><strong>E-mail</strong></td><td>{patient.email ?? '—'}</td></tr>
            <tr><td><strong>Adresse</strong></td><td>{patient.adresse ?? '—'}</td></tr>
          </tbody></table>
        </div>

        <div className="carte">
          <h2>Médecin référent</h2>
          {medecin ? (
            <div>
              <p><strong>Dr. {medecin.prenom} {medecin.nom}</strong></p>
              {medecin.medecins?.specialite && <p className="muted">{medecin.medecins.specialite}</p>}
            </div>
          ) : <p className="muted">Aucun médecin assigné.</p>}
        </div>
      </div>

      <div className="carte">
        <h2>Historique des hospitalisations</h2>
        <table>
          <thead><tr><th>Entrée</th><th>Sortie</th><th>Motif</th><th>Diagnostic</th></tr></thead>
          <tbody>
            {sorties?.map(s => (
              <tr key={s.id}>
                <td>{dateFr(s.date_entree)}</td>
                <td>{s.date_sortie ? dateFr(s.date_sortie) : <span className="muted">En cours</span>}</td>
                <td>{s.motif}</td>
                <td className="muted">{s.diagnostic ?? '—'}</td>
              </tr>
            ))}
            {!sorties?.length && <tr><td colSpan={4} className="muted">Aucune hospitalisation enregistrée.</td></tr>}
          </tbody>
        </table>
      </div>
    </Layout>
  )
}
