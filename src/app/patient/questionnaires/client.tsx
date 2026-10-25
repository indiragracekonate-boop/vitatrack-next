'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { dateFr } from '@/lib/utils'

interface Question { id: string; libelle: string; type_reponse: string; ordre: number }
interface ReponseItem { question_id: string; valeur: string }
interface ReponseSuivi { id: string; created_at: string; reponses_items: ReponseItem[] }
interface Questionnaire {
  id: string; created_at: string; titre: string;
  questions: Question[] | null;
  reponses_suivi: ReponseSuivi[]
}

export default function QuestionnaireClient({ questionnaires }: { questionnaires: Questionnaire[] }) {
  const router = useRouter()
  const [selected, setSelected] = useState<string | null>(null)
  const [reponses, setReponses] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const q = questionnaires.find(q => q.id === selected)
  const dejaRepondu = q && q.reponses_suivi && q.reponses_suivi.length > 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selected) return
    setLoading(true)
    await fetch(`/api/patient/questionnaires/${selected}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reponses }),
    })
    setLoading(false)
    setSelected(null); setReponses({})
    router.refresh()
  }

  return (
    <div className="grille-2" style={{ alignItems: 'start' }}>
      <div className="carte">
        <h3>Mes questionnaires</h3>
        <ul className="liste-items">
          {questionnaires.map(q => (
            <li key={q.id} onClick={() => setSelected(q.id)} style={{ cursor: 'pointer', padding: '8px 0', borderBottom: '1px solid var(--bord)', background: selected === q.id ? 'var(--fond)' : '' }}>
              <strong>{q.titre}</strong><br />
              <span className="muted">{dateFr(q.created_at)}</span>
              {' '}
              {q.reponses_suivi?.length
                ? <span className="tag st-effectue">Rempli</span>
                : <span className="tag st-a_venir">À remplir</span>
              }
            </li>
          ))}
          {!questionnaires.length && <li className="muted">Aucun questionnaire.</li>}
        </ul>
      </div>

      {q && (
        <div className="carte">
          <h3>{q.titre}</h3>
          {dejaRepondu ? (
            <div>
              <p className="muted">Vous avez déjà répondu à ce questionnaire.</p>
              <h4>Vos réponses :</h4>
              {q.reponses_suivi[0].reponses_items.map(ri => {
                const question = q.questions?.find(qu => qu.id === ri.question_id)
                return (
                  <div key={ri.question_id} style={{ marginBottom: 8 }}>
                    <strong>{question?.libelle ?? ri.question_id}</strong>
                    <p>{ri.valeur}</p>
                  </div>
                )
              })}
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {q.questions?.sort((a, b) => a.ordre - b.ordre).map(qu => (
                <div key={qu.id} style={{ marginBottom: 12 }}>
                  <label>{qu.libelle}</label>
                  {qu.type_reponse === 'texte' ? (
                    <textarea
                      value={reponses[qu.id] ?? ''}
                      onChange={e => setReponses({ ...reponses, [qu.id]: e.target.value })}
                      rows={3}
                      style={{ width: '100%' }}
                    />
                  ) : qu.type_reponse === 'oui_non' ? (
                    <select value={reponses[qu.id] ?? ''} onChange={e => setReponses({ ...reponses, [qu.id]: e.target.value })}>
                      <option value="">—</option>
                      <option value="oui">Oui</option>
                      <option value="non">Non</option>
                    </select>
                  ) : (
                    <input
                      type={qu.type_reponse === 'nombre' ? 'number' : 'text'}
                      value={reponses[qu.id] ?? ''}
                      onChange={e => setReponses({ ...reponses, [qu.id]: e.target.value })}
                    />
                  )}
                </div>
              ))}
              <button type="submit" disabled={loading}>{loading ? 'Envoi…' : 'Soumettre'}</button>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
