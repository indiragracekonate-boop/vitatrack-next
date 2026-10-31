'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Tag from '@/components/Tag'
import { dateFr, libelleStatutSignalement } from '@/lib/utils'
import { AlertTriangle, Plus, X, Send } from 'lucide-react'

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
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!patientId) return
    setError(''); setLoading(true); setSuccess(false)
    const res = await fetch('/api/patient/signalement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientId, medecinId, titre, description, niveauUrgence: urgence }),
    })
    const json = await res.json()
    setLoading(false)
    if (!res.ok) { setError(json.error ?? 'Erreur lors de l\'envoi.'); return }
    setSuccess(true)
    setShowForm(false); setTitre(''); setDescription(''); setUrgence('normal')
    router.refresh()
  }

  const urgenceOptions = [
    { value: 'faible',   label: 'Faible — pas urgent',        color: '#16A34A' },
    { value: 'normal',   label: 'Normal',                      color: '#2563EB' },
    { value: 'eleve',    label: 'Élevé — à signaler vite',     color: '#D97706' },
    { value: 'critique', label: 'Critique — urgence médicale', color: '#DC2626' },
  ]

  return (
    <>
      {success && (
        <div className="message ok" role="status">
          ✓ Votre signalement a bien été envoyé. Votre médecin en a été informé.
        </div>
      )}

      <div style={{ marginBottom: 16 }}>
        <button type="button" onClick={() => { setShowForm(!showForm); setError('') }}>
          {showForm ? <><X size={15} /> Annuler</> : <><Plus size={15} /> Nouveau signalement</>}
        </button>
      </div>

      {showForm && (
        <div className="carte">
          <h2>Signaler un symptôme ou problème</h2>
          <p className="aide" style={{ marginBottom: 16 }}>
            Ce formulaire permet d&apos;informer votre médecin. En cas d&apos;urgence vitale, appelez le <strong>15 (SAMU)</strong> ou le <strong>18 (Pompiers)</strong>.
          </p>
          {error && <div className="message erreur">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="titre">Titre du signalement</label>
              <input
                id="titre"
                value={titre}
                onChange={e => setTitre(e.target.value)}
                required
                placeholder="ex. Douleur thoracique depuis ce matin"
                maxLength={150}
              />
            </div>

            <div className="form-group">
              <label htmlFor="urgence">Niveau d&apos;urgence</label>
              <select id="urgence" value={urgence} onChange={e => setUrgence(e.target.value)}>
                {urgenceOptions.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <div className="aide" style={{ marginTop: 4, color: urgenceOptions.find(o => o.value === urgence)?.color }}>
                {urgenceOptions.find(o => o.value === urgence)?.label}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description détaillée</label>
              <textarea
                id="description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={5}
                required
                placeholder="Décrivez vos symptômes, leur intensité, depuis quand ils ont commencé, ce qui les aggrave ou les atténue…"
              />
            </div>

            <button type="submit" disabled={loading}>
              {loading ? 'Envoi en cours…' : <><Send size={15} /> Envoyer le signalement</>}
            </button>
          </form>
        </div>
      )}

      <div className="carte">
        <div className="carte-titre">
          <h2>Mes signalements</h2>
          <span className="aide">{signalements.length} signalement{signalements.length !== 1 ? 's' : ''}</span>
        </div>
        {signalements.length ? (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Titre</th>
                  <th>Urgence</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {signalements.map(s => (
                  <tr key={s.id}>
                    <td style={{ whiteSpace: 'nowrap', fontSize: 12.5, color: 'var(--gris)' }}>{dateFr(s.created_at)}</td>
                    <td style={{ fontWeight: 500 }}>{s.titre}</td>
                    <td><Tag statut={s.niveau_urgence} label={s.niveau_urgence} /></td>
                    <td><Tag statut={s.statut} label={libelleStatutSignalement(s.statut)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '32px 24px', color: 'var(--gris)' }}>
            <AlertTriangle size={32} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
            <p>Aucun signalement pour le moment.</p>
            <p className="aide">Utilisez le bouton ci-dessus si vous avez un symptôme à signaler à votre médecin.</p>
          </div>
        )}
      </div>
    </>
  )
}
