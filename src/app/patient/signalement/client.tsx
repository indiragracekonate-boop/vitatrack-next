'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Tag from '@/components/Tag'
import { dateFr, libelleStatutSignalement } from '@/lib/utils'

export default function SignalementClient({ signalements, patientId, medecinId }: {
  signalements: { id: string; created_at: string; titre: string; description: string; niveau_urgence: string; statut: string }[]
  patientId: string | null
  medecinId: string | null
}) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [titre, setTitre] = useState('')
  const [description, setDescription] = useState('')
  const [urgence, setUrgence] = useState('normal')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!patientId) return
    setError(''); setLoading(true)
    const res = await fetch('/api/patient/signalement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientId, medecinId, titre, description, niveauUrgence: urgence }),
    })
    const json = await res.json()
    setLoading(false)
    if (!res.ok) { setError(json.error ?? 'Erreur.'); return }
    setShowForm(false); setTitre(''); setDescription(''); setUrgence('normal')
    router.refresh()
  }

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <button type="button" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Annuler' : '+ Nouveau signalement'}
        </button>
      </div>

      {showForm && (
        <div className="carte">
          <h3>Nouveau signalement</h3>
          {error && <div className="message erreur">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div>
              <label>Titre</label>
              <input value={titre} onChange={e => setTitre(e.target.value)} required />
            </div>
            <div style={{ marginTop: 8 }}>
              <label>Niveau d&apos;urgence</label>
              <select value={urgence} onChange={e => setUrgence(e.target.value)}>
                <option value="faible">Faible</option>
                <option value="normal">Normal</option>
                <option value="eleve">Élevé</option>
                <option value="critique">Critique</option>
              </select>
            </div>
            <div style={{ marginTop: 8 }}>
              <label>Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} required style={{ width: '100%' }} />
            </div>
            <button type="submit" disabled={loading} style={{ marginTop: 8 }}>{loading ? 'Envoi…' : 'Envoyer'}</button>
          </form>
        </div>
      )}

      <div className="carte">
        <table>
          <thead><tr><th>Date</th><th>Titre</th><th>Urgence</th><th>Statut</th></tr></thead>
          <tbody>
            {signalements.map(s => (
              <tr key={s.id}>
                <td>{dateFr(s.created_at)}</td>
                <td>{s.titre}</td>
                <td><Tag statut={s.niveau_urgence} label={s.niveau_urgence} /></td>
                <td><Tag statut={s.statut} label={libelleStatutSignalement(s.statut)} /></td>
              </tr>
            ))}
            {!signalements.length && <tr><td colSpan={4} className="muted">Aucun signalement.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  )
}
