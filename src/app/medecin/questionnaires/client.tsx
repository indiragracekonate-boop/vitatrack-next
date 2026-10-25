'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { dateFr } from '@/lib/utils'

export default function QuestionnairesClient({ questionnaires, patients }: {
  questionnaires: { id: string; created_at: string; patient_id: string; titre: string; patients: { nom: string; prenom: string } | null; reponses_suivi: { id: string; created_at: string }[] }[]
  patients: { id: string; nom: string; prenom: string }[]
}) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [patientId, setPatientId] = useState('')
  const [titre, setTitre] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await fetch('/api/medecin/questionnaires', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientId, titre }),
    })
    setLoading(false)
    setShowForm(false); setPatientId(''); setTitre('')
    router.refresh()
  }

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <button type="button" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Annuler' : '+ Nouveau questionnaire'}
        </button>
      </div>

      {showForm && (
        <div className="carte">
          <h3>Nouveau questionnaire</h3>
          <form onSubmit={handleCreate} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <select value={patientId} onChange={e => setPatientId(e.target.value)} required style={{ flex: '1 1 180px' }}>
              <option value="">Patient…</option>
              {patients.map(p => <option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>)}
            </select>
            <input value={titre} onChange={e => setTitre(e.target.value)} placeholder="Titre du questionnaire" required style={{ flex: '2 1 200px' }} />
            <button type="submit" disabled={loading}>Créer</button>
          </form>
        </div>
      )}

      <div className="carte">
        <table>
          <thead><tr><th>Date</th><th>Patient</th><th>Titre</th><th>Réponses</th></tr></thead>
          <tbody>
            {questionnaires.map(q => (
              <tr key={q.id}>
                <td>{dateFr(q.created_at)}</td>
                <td>{q.patients ? `${q.patients.prenom} ${q.patients.nom}` : '—'}</td>
                <td>{q.titre}</td>
                <td>{q.reponses_suivi?.length ?? 0} réponse(s)</td>
              </tr>
            ))}
            {!questionnaires.length && <tr><td colSpan={4} className="muted">Aucun questionnaire.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  )
}
