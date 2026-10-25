'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { dateFr } from '@/lib/utils'

interface UserRow {
  id: string
  nom: string
  prenom: string
  email: string
  telephone: string | null
  role: string
  actif: boolean
  created_at: string
  medecins?: { specialite: string } | null
}

export default function AdminUtilisateursClient({
  users,
  currentUserId,
}: {
  users: UserRow[]
  medecins: { id: string; nom: string; prenom: string }[]
  currentUserId: string
}) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [role, setRole] = useState<'admin' | 'medecin'>('medecin')
  const [nom, setNom] = useState('')
  const [prenom, setPrenom] = useState('')
  const [email, setEmail] = useState('')
  const [telephone, setTelephone] = useState('')
  const [specialite, setSpecialite] = useState('')
  const [activationLink, setActivationLink] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/admin/utilisateurs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, nom, prenom, email, telephone, specialite }),
      })
      const json = await res.json()
      if (!res.ok) { setError(json.error ?? 'Erreur.'); return }
      setActivationLink(json.activationUrl)
      setNom(''); setPrenom(''); setEmail(''); setTelephone(''); setSpecialite('')
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  async function toggleActif(id: string, actif: boolean) {
    await fetch(`/api/admin/utilisateurs/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actif: !actif }),
    })
    router.refresh()
  }

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <button type="button" onClick={() => { setShowForm(!showForm); setActivationLink('') }}>
          {showForm ? 'Annuler' : '+ Créer un compte'}
        </button>
      </div>

      {showForm && (
        <div className="carte">
          <h2>Nouveau compte</h2>
          {error && <div className="message erreur">{error}</div>}
          {activationLink && (
            <div className="message ok">
              <strong>Compte créé.</strong> Lien d&apos;activation (valable 7 jours) :<br />
              <a href={activationLink} target="_blank" rel="noopener">{activationLink}</a>
            </div>
          )}
          <form onSubmit={handleCreate}>
            <div className="grille-2">
              <div>
                <label>Rôle</label>
                <select value={role} onChange={e => setRole(e.target.value as 'admin' | 'medecin')}>
                  <option value="medecin">Médecin</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>
              <div>
                <label>Spécialité {role !== 'medecin' && '(non applicable)'}</label>
                <input value={specialite} onChange={e => setSpecialite(e.target.value)} disabled={role !== 'medecin'} placeholder="Cardiologie…" />
              </div>
              <div>
                <label>Nom</label>
                <input value={nom} onChange={e => setNom(e.target.value)} required />
              </div>
              <div>
                <label>Prénom</label>
                <input value={prenom} onChange={e => setPrenom(e.target.value)} required />
              </div>
              <div>
                <label>E-mail</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div>
                <label>Téléphone</label>
                <input value={telephone} onChange={e => setTelephone(e.target.value)} />
              </div>
            </div>
            <button type="submit" disabled={loading}>{loading ? 'Création…' : 'Créer le compte'}</button>
          </form>
        </div>
      )}

      <div className="carte">
        <table>
          <thead>
            <tr>
              <th>Nom</th>
              <th>E-mail</th>
              <th>Rôle</th>
              <th>Spécialité</th>
              <th>Créé le</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.prenom} {u.nom}</td>
                <td>{u.email}</td>
                <td>{u.role === 'admin' ? 'Administrateur' : 'Médecin'}</td>
                <td>{u.medecins?.specialite ?? '—'}</td>
                <td>{dateFr(u.created_at)}</td>
                <td>
                  <span className={`tag ${u.actif ? 'st-effectue' : 'st-annule'}`}>
                    {u.actif ? 'Actif' : 'Inactif'}
                  </span>
                </td>
                <td>
                  {u.id !== currentUserId && (
                    <button
                      type="button"
                      className="secondaire petit"
                      onClick={() => toggleActif(u.id, u.actif)}
                    >
                      {u.actif ? 'Désactiver' : 'Activer'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {!users.length && (
              <tr><td colSpan={7} className="muted">Aucun compte.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
