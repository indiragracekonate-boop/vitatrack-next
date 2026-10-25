import { createAdminClient } from '@/lib/supabase/server'
import { getUser, getNotifCount } from '@/lib/actions'
import Layout from '@/components/Layout'
import Tag from '@/components/Tag'
import { dateFr, datetimeFr, statutSuivi, libelleStatutSuivi, libelleStatutRdv } from '@/lib/utils'
import Link from 'next/link'

export default async function PatientDashboard() {
  const user = await getUser()
  const notifCount = await getNotifCount(user.id)
  const supabase = await createAdminClient()

  const { data: patientRow } = await supabase
    .from('patients')
    .select('id, nom, prenom, date_naissance')
    .eq('user_id', user.id)
    .single()

  if (!patientRow) {
    return (
      <Layout user={user} title="Tableau de bord" notifications={notifCount}>
        <div className="carte">
          <p className="muted">Votre dossier patient n&apos;est pas encore configuré. Contactez votre médecin.</p>
        </div>
      </Layout>
    )
  }

  const [{ data: rdvs }, { data: suivis }, { data: notifications }] = await Promise.all([
    supabase
      .from('rendez_vous')
      .select('*, users(prenom, nom)')
      .eq('patient_id', patientRow.id)
      .eq('statut', 'planifie')
      .gte('date_heure', new Date().toISOString())
      .order('date_heure')
      .limit(3),
    supabase
      .from('suivis')
      .select('*')
      .eq('patient_id', patientRow.id)
      .is('effectue_le', null)
      .order('date_prevue')
      .limit(3),
    supabase
      .from('notifications')
      .select('*')
      .eq('destinataire_id', user.id)
      .eq('statut_lecture', 'non_lue')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const age = Math.floor((new Date().getTime() - new Date(patientRow.date_naissance).getTime()) / (365.25 * 24 * 3600 * 1000))

  return (
    <Layout user={user} title="Mon espace santé" notifications={notifCount}>
      <div className="bandeau">
        <strong>{patientRow.prenom} {patientRow.nom}</strong>, {age} ans
      </div>

      <div className="grille-2">
        <div className="carte">
          <h2>Prochains rendez-vous</h2>
          {rdvs?.length ? (
            <ul className="liste-items">
              {rdvs.map(r => {
                const m = r.users as { prenom: string; nom: string } | null
                return (
                  <li key={r.id}>
                    <strong>{datetimeFr(r.date_heure)}</strong>
                    {m ? ` — Dr. ${m.prenom} ${m.nom}` : ''}<br />
                    <span className="muted">{r.motif}</span>
                    {' '}<Tag statut={r.statut} label={libelleStatutRdv(r.statut)} />
                  </li>
                )
              })}
            </ul>
          ) : <p className="muted">Aucun rendez-vous à venir.</p>}
          <Link href="/patient/rendezvous" className="btn secondaire" style={{ marginTop: 8 }}>Voir tous les RDV</Link>
        </div>

        <div className="carte">
          <h2>Mes suivis</h2>
          {suivis?.length ? (
            <ul className="liste-items">
              {suivis.map(s => {
                const st = statutSuivi(s.date_prevue, s.effectue_le)
                return (
                  <li key={s.id}>
                    <strong>{dateFr(s.date_prevue)}</strong> — {s.type_suivi}
                    {' '}<Tag statut={st} label={libelleStatutSuivi(st)} />
                  </li>
                )
              })}
            </ul>
          ) : <p className="muted">Aucun suivi planifié.</p>}
        </div>
      </div>

      {notifications && notifications.length > 0 && (
        <div className="carte">
          <h2>Notifications récentes</h2>
          <ul className="liste-items">
            {notifications.map(n => (
              <li key={n.id}>
                <span className="muted">{dateFr(n.created_at)}</span> — {n.message}
                {n.lien && <> · <Link href={n.lien}>Voir</Link></>}
              </li>
            ))}
          </ul>
          <Link href="/notifications" className="btn secondaire" style={{ marginTop: 8 }}>Toutes les notifications</Link>
        </div>
      )}
    </Layout>
  )
}
