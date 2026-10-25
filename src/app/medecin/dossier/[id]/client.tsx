'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Tag from '@/components/Tag'
import { dateFr, datetimeFr, statutSuivi, libelleStatutSuivi, libelleStatutRdv } from '@/lib/utils'

type Tab = 'resume' | 'sorties' | 'suivis' | 'rdv' | 'prescriptions' | 'signalements' | 'questionnaires'

export default function DossierClient({ patient, sorties, suivis, rdvs, prescriptions, signalements, questionnaires, medecinUserId }: {
  patient: { id: string; nom: string; prenom: string; date_naissance: string; sexe: string; telephone: string | null; email: string | null; adresse: string | null }
  sorties: unknown[]
  suivis: unknown[]
  rdvs: unknown[]
  prescriptions: unknown[]
  signalements: unknown[]
  questionnaires: unknown[]
  medecinUserId: string
}) {
  const [tab, setTab] = useState<Tab>('resume')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Forms state
  const [rdvDate, setRdvDate] = useState('')
  const [rdvMotif, setRdvMotif] = useState('')
  const [suiviDate, setSuiviDate] = useState('')
  const [suiviType, setSuiviType] = useState('consultation')
  const [suiviNotes, setSuiviNotes] = useState('')

  async function marquerSuivi(suiviId: string) {
    setLoading(true)
    await fetch(`/api/medecin/suivis/${suiviId}/effectuer`, { method: 'POST' })
    setLoading(false)
    router.refresh()
  }

  async function ajouterRdv(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await fetch('/api/medecin/rendezvous', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientId: patient.id, dateHeure: rdvDate, motif: rdvMotif }),
    })
    setLoading(false)
    setRdvDate(''); setRdvMotif('')
    router.refresh()
  }

  async function ajouterSuivi(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await fetch('/api/medecin/suivis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientId: patient.id, datePrevue: suiviDate, type: suiviType, notes: suiviNotes }),
    })
    setLoading(false)
    setSuiviDate(''); setSuiviType('consultation'); setSuiviNotes('')
    router.refresh()
  }

  const age = Math.floor((new Date().getTime() - new Date(patient.date_naissance).getTime()) / (365.25 * 24 * 3600 * 1000))

  return (
    <>
      <div className="bandeau">
        <div><strong>{patient.prenom} {patient.nom}</strong> · {age} ans · {patient.sexe === 'M' ? 'Masculin' : 'Féminin'}</div>
        <div className="muted">{dateFr(patient.date_naissance)}{patient.telephone ? ` · ${patient.telephone}` : ''}{patient.email ? ` · ${patient.email}` : ''}</div>
      </div>

      <div className="onglets">
        {(['resume', 'sorties', 'suivis', 'rdv', 'prescriptions', 'signalements', 'questionnaires'] as Tab[]).map(t => (
          <button key={t} type="button" className={tab === t ? 'actif' : ''} onClick={() => setTab(t)}>
            {t === 'resume' ? 'Résumé' : t === 'rdv' ? 'Rendez-vous' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'resume' && (
        <div className="grille-2">
          <div className="carte">
            <h3>Informations</h3>
            <table><tbody>
              <tr><td><strong>Nom</strong></td><td>{patient.prenom} {patient.nom}</td></tr>
              <tr><td><strong>Naissance</strong></td><td>{dateFr(patient.date_naissance)} ({age} ans)</td></tr>
              <tr><td><strong>Sexe</strong></td><td>{patient.sexe === 'M' ? 'Masculin' : 'Féminin'}</td></tr>
              <tr><td><strong>Tél.</strong></td><td>{patient.telephone ?? '—'}</td></tr>
              <tr><td><strong>Email</strong></td><td>{patient.email ?? '—'}</td></tr>
              <tr><td><strong>Adresse</strong></td><td>{patient.adresse ?? '—'}</td></tr>
            </tbody></table>
          </div>
          <div className="carte">
            <h3>Statistiques</h3>
            <div className="grille-stats">
              <div className="stat"><div className="muted">Sorties</div><div className="chiffre">{(sorties as unknown[]).length}</div></div>
              <div className="stat"><div className="muted">Suivis</div><div className="chiffre">{(suivis as unknown[]).length}</div></div>
              <div className="stat"><div className="muted">RDV</div><div className="chiffre">{(rdvs as unknown[]).length}</div></div>
              <div className="stat"><div className="muted">Prescriptions</div><div className="chiffre">{(prescriptions as unknown[]).length}</div></div>
            </div>
          </div>
        </div>
      )}

      {tab === 'sorties' && (
        <div className="carte">
          <table>
            <thead><tr><th>Entrée</th><th>Sortie</th><th>Motif</th><th>Diagnostic</th></tr></thead>
            <tbody>
              {(sorties as {id:string;date_entree:string;date_sortie:string|null;motif:string;diagnostic:string|null}[]).map(s => (
                <tr key={s.id}>
                  <td>{dateFr(s.date_entree)}</td>
                  <td>{s.date_sortie ? dateFr(s.date_sortie) : <span className="muted">En cours</span>}</td>
                  <td>{s.motif}</td>
                  <td className="muted">{s.diagnostic ?? '—'}</td>
                </tr>
              ))}
              {!sorties.length && <tr><td colSpan={4} className="muted">Aucune sortie.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'suivis' && (
        <>
          <div className="carte">
            <h3>Planifier un suivi</h3>
            <form onSubmit={ajouterSuivi} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <input type="date" value={suiviDate} onChange={e => setSuiviDate(e.target.value)} required style={{ flex: '1 1 140px' }} />
              <select value={suiviType} onChange={e => setSuiviType(e.target.value)} style={{ flex: '1 1 140px' }}>
                <option value="consultation">Consultation</option>
                <option value="examen">Examen</option>
                <option value="traitement">Traitement</option>
                <option value="autre">Autre</option>
              </select>
              <input value={suiviNotes} onChange={e => setSuiviNotes(e.target.value)} placeholder="Notes (optionnel)" style={{ flex: '2 1 200px' }} />
              <button type="submit" disabled={loading}>Ajouter</button>
            </form>
          </div>
          <div className="carte">
            <table>
              <thead><tr><th>Date prévue</th><th>Type</th><th>Notes</th><th>Statut</th><th>Action</th></tr></thead>
              <tbody>
                {(suivis as {id:string;date_prevue:string;type_suivi:string;notes:string|null;effectue_le:string|null}[]).map(s => {
                  const st = statutSuivi(s.date_prevue, s.effectue_le)
                  return (
                    <tr key={s.id}>
                      <td>{dateFr(s.date_prevue)}</td>
                      <td>{s.type_suivi}</td>
                      <td className="muted">{s.notes ?? '—'}</td>
                      <td><Tag statut={st} label={libelleStatutSuivi(st)} /></td>
                      <td>{!s.effectue_le && <button type="button" className="secondaire petit" onClick={() => marquerSuivi(s.id)} disabled={loading}>Marquer effectué</button>}</td>
                    </tr>
                  )
                })}
                {!suivis.length && <tr><td colSpan={5} className="muted">Aucun suivi.</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'rdv' && (
        <>
          <div className="carte">
            <h3>Nouveau rendez-vous</h3>
            <form onSubmit={ajouterRdv} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <input type="datetime-local" value={rdvDate} onChange={e => setRdvDate(e.target.value)} required style={{ flex: '1 1 180px' }} />
              <input value={rdvMotif} onChange={e => setRdvMotif(e.target.value)} placeholder="Motif" required style={{ flex: '2 1 200px' }} />
              <button type="submit" disabled={loading}>Créer</button>
            </form>
          </div>
          <div className="carte">
            <table>
              <thead><tr><th>Date</th><th>Motif</th><th>Statut</th></tr></thead>
              <tbody>
                {(rdvs as {id:string;date_heure:string;motif:string;statut:string}[]).map(r => (
                  <tr key={r.id}>
                    <td>{datetimeFr(r.date_heure)}</td>
                    <td>{r.motif}</td>
                    <td><Tag statut={r.statut} label={libelleStatutRdv(r.statut)} /></td>
                  </tr>
                ))}
                {!rdvs.length && <tr><td colSpan={3} className="muted">Aucun rendez-vous.</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'prescriptions' && (
        <div className="carte">
          <table>
            <thead><tr><th>Date</th><th>Médicaments</th><th>Notes</th></tr></thead>
            <tbody>
              {(prescriptions as {id:string;date_prescription:string;notes:string|null;lignes_prescription:{id:string;medicament:string;posologie:string}[]}[]).map(p => (
                <tr key={p.id}>
                  <td>{dateFr(p.date_prescription)}</td>
                  <td>{p.lignes_prescription?.map(l => `${l.medicament} (${l.posologie})`).join(', ') ?? '—'}</td>
                  <td className="muted">{p.notes ?? '—'}</td>
                </tr>
              ))}
              {!prescriptions.length && <tr><td colSpan={3} className="muted">Aucune prescription.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'signalements' && (
        <div className="carte">
          <table>
            <thead><tr><th>Date</th><th>Titre</th><th>Urgence</th><th>Statut</th></tr></thead>
          <tbody>
            {(signalements as {id:string;created_at:string;titre:string;niveau_urgence:string;statut:string}[]).map(s => (
              <tr key={s.id}>
                <td>{dateFr(s.created_at)}</td>
                <td>{s.titre}</td>
                <td><Tag statut={s.niveau_urgence} label={s.niveau_urgence} /></td>
                <td><Tag statut={s.statut} label={s.statut} /></td>
              </tr>
            ))}
            {!signalements.length && <tr><td colSpan={4} className="muted">Aucun signalement.</td></tr>}
          </tbody>
          </table>
        </div>
      )}

      {tab === 'questionnaires' && (
        <div className="carte">
          {(questionnaires as {id:string;created_at:string;reponses_suivi:{id:string;created_at:string;reponses_items:{id:string;valeur:string}[]}[]}[]).map(q => (
            <div key={q.id} style={{ marginBottom: 16, borderBottom: '1px solid var(--bord)', paddingBottom: 12 }}>
              <p className="muted">{dateFr(q.created_at)}</p>
              {q.reponses_suivi?.length ? <p>Réponses : {q.reponses_suivi.length}</p> : <p className="muted">Pas encore rempli.</p>}
            </div>
          ))}
          {!questionnaires.length && <p className="muted">Aucun questionnaire.</p>}
        </div>
      )}
    </>
  )
}
