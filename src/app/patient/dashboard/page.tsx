import { createAdminClient } from '@/lib/supabase/server'
import { getUser, getNotifCount } from '@/lib/actions'
import Layout from '@/components/Layout'
import Tag from '@/components/Tag'
import { dateFr, datetimeFr, statutSuivi, libelleStatutSuivi, libelleStatutRdv } from '@/lib/utils'
import Link from 'next/link'
import { Calendar, ClipboardCheck, Bell, Activity, ChevronRight } from 'lucide-react'

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
      <Layout user={user} title="Mon espace santé" notifications={notifCount}>
        <div className="carte" style={{ textAlign: 'center', padding: '40px 24px' }}>
          <Activity size={40} style={{ margin: '0 auto 16px', display: 'block', color: 'var(--gris-clair)' }} />
          <h2>Dossier non configuré</h2>
          <p className="muted">Votre dossier patient n&apos;est pas encore configuré. Contactez votre médecin ou l&apos;établissement.</p>
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
      {/* Bandeau patient */}
      <div className="bandeau" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="grand">Bonjour, {patientRow.prenom} {patientRow.nom} 👋</div>
          <div className="sub">{age} ans · Bienvenue dans votre espace santé</div>
        </div>
        <Link href="/patient/passeport" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
          Mon passeport <ChevronRight size={14} />
        </Link>
      </div>

      {/* Stats rapides */}
      <div className="grille-3" style={{ marginBottom: 20 }}>
        <div className="stat">
          <div className="stat-icon bleu"><Calendar size={20} /></div>
          <div className="stat-label">Prochains RDV</div>
          <div className="chiffre bleu">{rdvs?.length ?? 0}</div>
        </div>
        <div className="stat">
          <div className="stat-icon orange"><ClipboardCheck size={20} /></div>
          <div className="stat-label">Suivis à venir</div>
          <div className="chiffre orange">{suivis?.length ?? 0}</div>
        </div>
        <div className="stat">
          <div className="stat-icon rouge"><Bell size={20} /></div>
          <div className="stat-label">Notifications</div>
          <div className="chiffre rouge">{notifCount}</div>
        </div>
      </div>

      <div className="grille-2">
        {/* RDV */}
        <div className="carte">
          <div className="carte-titre">
            <h2>Prochains rendez-vous</h2>
            <Link href="/patient/rendezvous" className="bouton secondaire petit">Voir tous</Link>
          </div>
          {rdvs?.length ? (
            <ul className="liste-items">
              {rdvs.map(r => {
                const m = r.users as { prenom: string; nom: string } | null
                return (
                  <li key={r.id}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>{datetimeFr(r.date_heure)}</div>
                        {m ? <div className="aide">Dr. {m.prenom} {m.nom}</div> : null}
                        {r.motif ? <div className="aide muted">{r.motif}</div> : null}
                      </div>
                      <Tag statut={r.statut} label={libelleStatutRdv(r.statut)} />
                    </div>
                  </li>
                )
              })}
            </ul>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <Calendar size={28} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.3 }} />
              <p className="muted">Aucun rendez-vous à venir.</p>
            </div>
          )}
        </div>

        {/* Suivis */}
        <div className="carte">
          <div className="carte-titre">
            <h2>Mes suivis planifiés</h2>
          </div>
          {suivis?.length ? (
            <ul className="liste-items">
              {suivis.map(s => {
                const st = statutSuivi(s.date_prevue, s.effectue_le)
                return (
                  <li key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{dateFr(s.date_prevue)}</div>
                      <div className="aide">{s.type_suivi}</div>
                    </div>
                    <Tag statut={st} label={libelleStatutSuivi(st)} />
                  </li>
                )
              })}
            </ul>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <ClipboardCheck size={28} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.3 }} />
              <p className="muted">Aucun suivi planifié.</p>
            </div>
          )}
        </div>
      </div>

      {/* Notifications */}
      {notifications && notifications.length > 0 && (
        <div className="carte">
          <div className="carte-titre">
            <h2>Notifications non lues</h2>
            <Link href="/notifications" className="bouton secondaire petit">Toutes</Link>
          </div>
          <ul className="liste-items">
            {notifications.map(n => (
              <li key={n.id} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                <div>
                  <span className="aide muted">{dateFr(n.created_at)}</span>
                  <div>{n.message}</div>
                </div>
                {n.lien && <Link href={n.lien} className="aide" style={{ flexShrink: 0 }}>Voir →</Link>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions rapides */}
      <div className="carte">
        <h2>Actions rapides</h2>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link href="/patient/signalement" className="bouton secondaire">
            Signaler un symptôme
          </Link>
          <Link href="/patient/questionnaires" className="bouton secondaire">
            Mes questionnaires
          </Link>
          <Link href="/patient/traitements" className="bouton secondaire">
            Mes traitements
          </Link>
        </div>
      </div>
    </Layout>
  )
}
