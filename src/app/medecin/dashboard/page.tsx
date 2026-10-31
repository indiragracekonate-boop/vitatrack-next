import { createClient } from '@/lib/supabase/server'
import { getUser, getNotifCount } from '@/lib/actions'
import Layout from '@/components/Layout'
import Tag from '@/components/Tag'
import { dateFr, datetimeFr, statutSuivi, libelleStatutSuivi, libelleStatutRdv, nomPatient } from '@/lib/utils'
import Link from 'next/link'
import { AlertTriangle, Calendar, ClipboardCheck, Bell } from 'lucide-react'

export default async function MedecinDashboard() {
  const user = await getUser()
  const notifCount = await getNotifCount(user.id)
  const supabase = await createClient()

  const today = new Date()

  const [
    { data: suivisEnRetard },
    { data: rdvAVenir },
    { data: signalements },
    { data: notifications },
    { data: rdvAujourdhui },
    { data: totalPatients },
  ] = await Promise.all([
    supabase
      .from('suivis')
      .select('*, patients(nom, prenom)')
      .eq('medecin_id', user.id)
      .is('effectue_le', null)
      .lt('date_prevue', today.toISOString().split('T')[0])
      .order('date_prevue')
      .limit(5),
    supabase
      .from('rendez_vous')
      .select('*, patients(nom, prenom)')
      .eq('medecin_id', user.id)
      .eq('statut', 'planifie')
      .gte('date_heure', today.toISOString())
      .order('date_heure')
      .limit(5),
    supabase
      .from('signalements')
      .select('*, patients(nom, prenom)')
      .eq('medecin_id', user.id)
      .in('statut', ['a_examiner', 'en_cours'])
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('notifications')
      .select('*')
      .eq('destinataire_id', user.id)
      .eq('statut_lecture', 'non_lue')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('rendez_vous')
      .select('id', { count: 'exact', head: true })
      .eq('medecin_id', user.id)
      .eq('statut', 'planifie')
      .gte('date_heure', today.toISOString().split('T')[0])
      .lt('date_heure', today.toISOString().split('T')[0] + 'T23:59:59'),
    supabase
      .from('affectations_medecin')
      .select('id', { count: 'exact', head: true })
      .eq('medecin_id', user.id),
  ])

  const stats = [
    {
      label: 'Patients suivis',
      value: (totalPatients as unknown as { count: number } | null)?.count ?? 0,
      icon: <ClipboardCheck size={20} />,
      color: 'bleu',
    },
    {
      label: 'RDV aujourd\'hui',
      value: (rdvAujourdhui as unknown as { count: number } | null)?.count ?? 0,
      icon: <Calendar size={20} />,
      color: 'vert',
    },
    {
      label: 'Signalements actifs',
      value: signalements?.length ?? 0,
      icon: <AlertTriangle size={20} />,
      color: signalements?.length ? 'orange' : 'vert',
    },
    {
      label: 'Suivis en retard',
      value: suivisEnRetard?.length ?? 0,
      icon: <Bell size={20} />,
      color: suivisEnRetard?.length ? 'rouge' : 'vert',
    },
  ]

  return (
    <Layout user={user} title="Tableau de bord" notifications={notifCount}>
      {/* Stats */}
      <div className="grille-stats">
        {stats.map(s => (
          <div key={s.label} className="stat">
            <div className={`stat-icon ${s.color}`}>{s.icon}</div>
            <div className="stat-label">{s.label}</div>
            <div className={`chiffre ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grille-2">
        {/* Suivis en retard */}
        <div className="carte">
          <div className="carte-titre">
            <h2>Suivis en retard</h2>
            <Link href="/medecin/suivis" className="bouton secondaire petit">Voir tous</Link>
          </div>
          {suivisEnRetard?.length ? (
            <ul className="liste-items">
              {suivisEnRetard.map(s => {
                const p = s.patients as { nom: string; prenom: string } | null
                const st = statutSuivi(s.date_prevue, s.effectue_le)
                return (
                  <li key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <div>
                      <Link href={`/medecin/dossier/${s.patient_id}`} style={{ fontWeight: 600 }}>
                        {p ? nomPatient(p) : '—'}
                      </Link>
                      <div className="aide">{dateFr(s.date_prevue)}</div>
                    </div>
                    <Tag statut={st} label={libelleStatutSuivi(st)} />
                  </li>
                )
              })}
            </ul>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--vert)' }}>
              <ClipboardCheck size={32} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.6 }} />
              <p className="muted">Aucun suivi en retard 🎉</p>
            </div>
          )}
        </div>

        {/* Prochains RDV */}
        <div className="carte">
          <div className="carte-titre">
            <h2>Prochains rendez-vous</h2>
            <Link href="/medecin/rendezvous" className="bouton secondaire petit">Voir tous</Link>
          </div>
          {rdvAVenir?.length ? (
            <ul className="liste-items">
              {rdvAVenir.map(r => {
                const p = r.patients as { nom: string; prenom: string } | null
                return (
                  <li key={r.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <div>
                      <Link href={`/medecin/dossier/${r.patient_id}`} style={{ fontWeight: 600 }}>
                        {p ? nomPatient(p) : '—'}
                      </Link>
                      <div className="aide">{datetimeFr(r.date_heure)}</div>
                    </div>
                    <Tag statut={r.statut} label={libelleStatutRdv(r.statut)} />
                  </li>
                )
              })}
            </ul>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <Calendar size={32} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.3 }} />
              <p className="muted">Aucun rendez-vous à venir.</p>
            </div>
          )}
        </div>

        {/* Signalements actifs */}
        {signalements && signalements.length > 0 && (
          <div className="carte">
            <div className="carte-titre">
              <h2>Signalements en attente</h2>
              <Link href="/medecin/signalements" className="bouton secondaire petit">Voir tous</Link>
            </div>
            <ul className="liste-items">
              {signalements.map(s => {
                const p = s.patients as { nom: string; prenom: string } | null
                return (
                  <li key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <div>
                      <span style={{ fontWeight: 600 }}>{p ? nomPatient(p) : '—'}</span>
                      <div className="aide">{s.titre}</div>
                    </div>
                    <Tag statut={s.niveau_urgence} label={s.niveau_urgence} />
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        {/* Notifications récentes */}
        {notifications && notifications.length > 0 && (
          <div className="carte">
            <div className="carte-titre">
              <h2>Notifications récentes</h2>
              <Link href="/notifications" className="bouton secondaire petit">Voir toutes</Link>
            </div>
            <ul className="liste-items">
              {notifications.map(n => (
                <li key={n.id}>
                  <span className="muted aide">{dateFr(n.created_at)}</span>
                  <div>{n.message}</div>
                  {n.lien && <Link href={n.lien} className="aide">Voir →</Link>}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Layout>
  )
}
