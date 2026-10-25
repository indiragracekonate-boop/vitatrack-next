'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { dateFr } from '@/lib/utils'

interface PatientRow {
  id: string
  nom: string
  prenom: string
  date_naissance: string
  sexe: string
  telephone: string | null
  email: string | null
  adresse: string | null
  affectations_medecin?: Array<{
    medecin_id: string
    users: { prenom: string; nom: string } | null
  }>
}

interface MedecinRow {
  id: string
  prenom: string
  nom: string
  medecins: { specialite: string }[]
}

export default function AdminPatientsClient({
  patients,
  medecins,
}: {
  patients: PatientRow[]
  medecins: MedecinRow[]
}) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [nom, setNom] = useState('')
  const [prenom, setPrenom] = useState('')
  const [dateNaissance, setDateNaissance] = useState('')
  const [sexe, setSexe] = useState('M')
  const [telephone, setTelephone] = useState('')
  const [email, setEmail] = useState('')
  const [adresse, setAdresse] = useState('')
  const [medecinId, setMedecinId] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/admin/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom, prenom, dateNaissance, sexe, telephone, email, adresse, medecinId }),
      })
      const json = await res.json()
      if (!res.ok) { setError(json.error ?? 'Erreur.'); return }
      setShowForm(false)
      setNom(''); setPrenom(''); setDateNaissance(''); setSexe('M')
      setTelephone(''); setEmail(''); setAdresse(''); setMedecinId('')
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  async function handleAffecter(patientId: string, mId: string) {
    await fetch('/api/admin/affecter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientId, medecinId: mId }),
    })
    router.refresh()
  }

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <button type="button" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Annuler' : '+ Nouveau patient'}
        </button>
      </div>

      {showForm && (
        <div className="carte">
          <h2>Nouveau patient</h2>
          {error && <div className="message erreur">{error}</div>}
          <form onSubmit={handleCreate}>
            <div className="grille-2">
              <div>
                <label>Nom</label>
                <input value={nom} onChange={e => setNom(e.target.value)} required />
              </div>
              <div>
                <label>Prénom</label>
                <input value={prenom} onChange={e => setPrenom(e.target.value)} required />
              </div>
              <div>
                <label>Date de naissance</label>
                <input type="date" value={dateNaissance} onChange={e => setDateNaissance(e.target.value)} required />
              </div>
              <div>
                <label>Sexe</label>
                <select value={sexe} onChange={e => setSexe(e.target.value)}>
                  <option value="M">Masculin</option>
                  <option value="F">Féminin</option>
                </select>
              </div>
              <div>
                <label>Téléphone</label>
                <input value={telephone} onChange={e => setTelephone(e.target.value)} />
              </div>
              <div>
                <label>E-mail</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div className="col-2">
                <label>Adresse</label>
                <input value={adresse} onChange={e => setAdresse(e.target.value)} />
              </div>
              <div>
                <label>Médecin référent</label>
                <select value={medecinId} onChange={e => setMedecinId(e.target.value)}>
                  <option value="">— Aucun —</option>
                  {medecins.map(m => (
                    <option key={m.id} value={m.id}>{m.prenom} {m.nom}</option>
                  ))}
                </select>
              </div>
            </div>
            <button type="submit" disabled={loading}>{loading ? 'Création…' : 'Créer le patient'}</button>
          </form>
        </div>
      )}

      <div className="carte">
        <table>
          <thead>
            <tr>
              <th>Nom</th>
              <th>Date de naissance</th>
              <th>Sexe</th>
              <th>Contact</th>
              <th>Médecin référent</th>
              <th>Affecter</th>
            </tr>
          </thead>
          <tbody>
            {patients.map(p => {
              const aff = p.affectations_medecin?.[0]
              return (
                <tr key={p.id}>
                  <td>{p.prenom} {p.nom}</td>
                  <td>{dateFr(p.date_naissance)}</td>
                  <td>{p.sexe === 'M' ? 'M' : 'F'}</td>
                  <td>{p.telephone ?? p.email ?? '—'}</td>
                  <td>{aff?.users ? `${aff.users.prenom} ${aff.users.nom}` : <span className="muted">Non affecté</span>}</td>
                  <td>
                    <select
                      defaultValue={aff?.medecin_id ?? ''}
                      onChange={e => handleAffecter(p.id, e.target.value)}
                      style={{ fontSize: 13 }}
                    >
                      <option value="">— Changer —</option>
                      {medecins.map(m => (
                        <option key={m.id} value={m.id}>{m.prenom} {m.nom}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              )
            })}
            {!patients.length && (
              <tr><td colSpan={6} className="muted">Aucun patient.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
