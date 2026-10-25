import { createClient } from '@/lib/supabase/server'
import { getUser, getNotifCount } from '@/lib/actions'
import Layout from '@/components/Layout'
import Tag from '@/components/Tag'
import { dateFr, datetimeFr, statutSuivi, libelleStatutSuivi, libelleStatutRdv, nomPatient } from '@/lib/utils'
import Link from 'next/link'

export default async function MedecinDashboard() {
  const user = await getUser()
  const notifCount = await getNotifCount(user.id)
  const supabase = await createClient()

  const [
    { data: suivisEnRetard },
    { data: rdvAVenir },
    { data: signalements },
    { data: notifications },
  ] = await Promise.all([
    supabase
      .from('suivis')
      .select('*, patients(nom, prenom)')
      .eq('medecin_id', user.id)
      .is('effectue_le', null)
      .lt('date_prevue', new Date().toISOString().split('T')[0])
      .order('date_prevue')
      .limit(5),
    supabase
      .from('rendez_vous')
      .select('*, patients(nom, prenom)')
      .eq('medecin_id', user.id)
      .eq('statut', 'planifie')
      .gte('date_heure', new Date().toISOString())
      .order('date_heure')
      .limit(5),
    supabase
      .from('signalements')
      .select('*, patients(nom, prenom)')
      .eq('medecin_id', user.id)
      .in('statut', ['nouveau', 'en_cours'])
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('notifications')
      .select('*')
      .eq('destinataire_id', user.id)
      .eq('statut_lecture', 'non_lue')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  return (
    <Layout user={user} title="Tableau de bord" notifications={notifCount}>
      <div className="grille-stats">
        <div className="stat">
          <div className="muted" style={{ fontSize: 13 }}>Suivis en retard</div>
          <div className="chiffre rouge">{suivisEnRetard?.length ?? 0}</div>
        </div>
        <div className="stat">
          <div className="muted" style={{ fontSize: 13 }}>RDV à venir</div>
          <div className="chiffre">{rdvAVenir?.length ?? 0}</div>
        </div>
        <div className="stat">
          <div className="muted" style={{ fontSize: 13 }}>Signalements actifs</div>
          <div className="chiffre orange">{signalements?.length ?? 0}</div>
        </div>
        <div className="stat">
          <div className="muted" style={{ fontSize: 13 }}>Notifications</div>
          <div className="chiffre">{notifications?.length ?? 0}</div>
        </div>
      </div>

      <div className="grille-2">
        <div className="carte">
          <h2>Suivis en retard</h2>
          {suivisEnRetard?.length ? (
            <ul className="liste-items">
              {suivisEnRetard.map(s => {
                const p = s.patients as { nom: string; prenom: string } | null
                const st = statutSuivi(s.date_prevue, s.effectue_le)
                return (
                  <li key={s.id}>
                    <Link href={`/medecin/dossier/${s.patient_id}`}>
                      <strong>{p ? nomPatient(p) : '—'}</strong>
                    </Link>
                    <br /><span className="muted">{dateFr(s.date_prevue)}</span>{' '}
                    <Tag statut={st} label={libelleStatutSuivi(st)} />
                  </li>
                )
              })}
            </ul>
          ) : <p className="muted">Aucun suivi en retard.</p>}
        </div>

        <div className="carte">
          <h2>Prochains rendez-vous</h2>
          {rdvAVenir?.length ? (
            <ul className="liste-items">
              {rdvAVenir.map(r => {
                const p = r.patients as { nom: string; prenom: string } | null
                return (
                  <li key={r.id}>
                    <Link href={`/medecin/dossier/${r.patient_id}`}>
                      <strong>{p ? nomPatient(p) : '—'}</strong>
                    </Link>
                    <br /><span className="muted">{datetimeFr(r.date_heure)}</span>{' '}
                    <Tag statut={r.statut} label={libelleStatutRdv(r.statut)} />
                  </li>
                )
              })}
            </ul>
          ) : <p className="muted">Aucun rendez-vous à venir.</p>}
        </div>
      </div>
    </Layout>
  )
}
