'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Tag from '@/components/Tag'
import { dateFr, nomPatient, libelleStatutSignalement } from '@/lib/utils'
import Link from 'next/link'

export default function SignalementsClient({ signalements }: { signalements: {
  id: string; created_at: string; titre: string; description: string; niveau_urgence: string; statut: string;
  patient_id: string; patients: { nom: string; prenom: string } | null;
  signalement_actions: { id: string; action: string; created_at: string }[]
}[] }) {
  const router = useRouter()
  const [selected, setSelected] = useState<string | null>(null)
  const [action, setAction] = useState('')
  const [newStatut, setNewStatut] = useState('')
  const [loading, setLoading] = useState(false)

  const signalement = signalements.find(s => s.id === selected)

  async function addAction(e: React.FormEvent) {
    e.preventDefault()
    if (!selected) return
    setLoading(true)
    await fetch(`/api/medecin/signalements/${selected}/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, statut: newStatut || undefined }),
    })
    setLoading(false)
    setAction(''); setNewStatut('')
    router.refresh()
  }

  return (
    <div className="grille-2" style={{ alignItems: 'start' }}>
      <div className="carte">
        <table>
          <thead><tr><th>Date</th><th>Patient</th><th>Titre</th><th>Urgence</th><th>Statut</th></tr></thead>
          <tbody>
            {signalements.map(s => (
              <tr key={s.id} onClick={() => setSelected(s.id)} style={{ cursor: 'pointer', background: selected === s.id ? 'var(--fond)' : '' }}>
                <td>{dateFr(s.created_at)}</td>
                <td>{s.patients ? nomPatient(s.patients) : '—'}</td>
                <td>{s.titre}</td>
                <td><Tag statut={s.niveau_urgence} label={s.niveau_urgence} /></td>
                <td><Tag statut={s.statut} label={libelleStatutSignalement(s.statut)} /></td>
              </tr>
            ))}
            {!signalements.length && <tr><td colSpan={5} className="muted">Aucun signalement.</td></tr>}
          </tbody>
        </table>
      </div>

      {signalement && (
        <div className="carte">
          <h3>{signalement.titre}</h3>
          <p><strong>Patient :</strong> {signalement.patients ? nomPatient(signalement.patients) : '—'}</p>
          <p><strong>Urgence :</strong> <Tag statut={signalement.niveau_urgence} label={signalement.niveau_urgence} /></p>
          <p><strong>Statut :</strong> <Tag statut={signalement.statut} label={libelleStatutSignalement(signalement.statut)} /></p>
          <p>{signalement.description}</p>

          <h4>Historique des actions</h4>
          {signalement.signalement_actions.length ? (
            <ul className="liste-items">
              {signalement.signalement_actions.map(a => (
                <li key={a.id}><span className="muted">{dateFr(a.created_at)}</span> — {a.action}</li>
              ))}
            </ul>
          ) : <p className="muted">Aucune action.</p>}

          <form onSubmit={addAction} style={{ marginTop: 12 }}>
            <textarea value={action} onChange={e => setAction(e.target.value)} rows={3} placeholder="Action effectuée…" required style={{ width: '100%', marginBottom: 8 }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <select value={newStatut} onChange={e => setNewStatut(e.target.value)} style={{ flex: 1 }}>
                <option value="">Statut inchangé</option>
                <option value="en_cours">En cours</option>
                <option value="resolu">Résolu</option>
                <option value="ferme">Fermé</option>
              </select>
              <button type="submit" disabled={loading}>Enregistrer</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
