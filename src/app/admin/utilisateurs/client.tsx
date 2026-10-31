'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { dateFr } from '@/lib/utils'
import { UserPlus, Copy, Check, X, ToggleLeft, ToggleRight } from 'lucide-react'

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
  const [copied, setCopied] = useState(false)

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

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(activationLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // fallback: select the text
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

  const roleLabel = (r: string) => r === 'admin' ? 'Administrateur' : r === 'medecin' ? 'Médecin' : 'Patient'

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <button type="button" onClick={() => { setShowForm(!showForm); setActivationLink(''); setError('') }}>
          {showForm ? <><X size={15} /> Annuler</> : <><UserPlus size={15} /> Créer un compte</>}
        </button>
      </div>

      {showForm && (
        <div className="carte">
          <h2>Nouveau compte utilisateur</h2>
          <p className="aide" style={{ marginBottom: 16 }}>
            Un lien d&apos;activation sera généré. Transmettez-le à la personne concernée pour qu&apos;elle définisse son mot de passe.
          </p>
          {error && <div className="message erreur">{error}</div>}
          {activationLink && (
            <div className="message ok" style={{ flexDirection: 'column', gap: 8 }}>
              <strong>✓ Compte créé avec succès.</strong>
              <span>Lien d&apos;activation (valable 7 jours) :</span>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <code style={{ background: 'rgba(0,0,0,0.08)', padding: '4px 8px', borderRadius: 6, fontSize: 12, wordBreak: 'break-all', flex: 1 }}>
                  {activationLink}
                </code>
                <button type="button" className="secondaire petit" onClick={copyLink} style={{ flexShrink: 0 }}>
                  {copied ? <><Check size={14} /> Copié</> : <><Copy size={14} /> Copier</>}
                </button>
              </div>
            </div>
          )}
          <form onSubmit={handleCreate}>
            <div className="grille-2">
              <div className="form-group">
                <label>Rôle</label>
                <select value={role} onChange={e => setRole(e.target.value as 'admin' | 'medecin')}>
                  <option value="medecin">Médecin</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>
              <div className="form-group">
                <label>Spécialité {role !== 'medecin' && <span className="aide">(non applicable)</span>}</label>
                <input value={specialite} onChange={e => setSpecialite(e.target.value)} disabled={role !== 'medecin'} placeholder="ex. Cardiologie" />
              </div>
              <div className="form-group">
                <label>Prénom</label>
                <input value={prenom} onChange={e => setPrenom(e.target.value)} required placeholder="ex. Marie" />
              </div>
              <div className="form-group">
                <label>Nom</label>
                <input value={nom} onChange={e => setNom(e.target.value)} required placeholder="ex. Dupont" />
              </div>
              <div className="form-group">
                <label>Adresse e-mail</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="marie.dupont@exemple.com" />
              </div>
              <div className="form-group">
                <label>Téléphone <span className="aide">(optionnel)</span></label>
                <input value={telephone} onChange={e => setTelephone(e.target.value)} placeholder="06 00 00 00 00" />
              </div>
            </div>
            <button type="submit" disabled={loading}>
              {loading ? 'Création en cours…' : <><UserPlus size={15} /> Créer le compte</>}
            </button>
          </form>
        </div>
      )}

      <div className="carte">
        <div className="carte-titre">
          <h2>Comptes utilisateurs</h2>
          <span className="aide">{users.length} compte{users.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Identité</th>
                <th>E-mail</th>
                <th>Rôle</th>
                <th>Spécialité</th>
                <th>Créé le</th>
                <th>Statut</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 500 }}>{u.prenom} {u.nom}</td>
                  <td><a href={`mailto:${u.email}`} style={{ color: 'var(--gris)' }}>{u.email}</a></td>
                  <td>{roleLabel(u.role)}</td>
                  <td className="muted">{u.medecins?.specialite ?? '—'}</td>
                  <td className="muted">{dateFr(u.created_at)}</td>
                  <td>
                    <span className={`tag ${u.actif ? 'st-effectue' : 'st-annule'}`}>
                      {u.actif ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td>
                    {u.id !== currentUserId && (
                      <button
                        type="button"
                        className={`secondaire petit`}
                        onClick={() => toggleActif(u.id, u.actif)}
                        title={u.actif ? 'Désactiver ce compte' : 'Activer ce compte'}
                      >
                        {u.actif
                          ? <><ToggleRight size={14} /> Désactiver</>
                          : <><ToggleLeft size={14} /> Activer</>
                        }
                      </button>
                    )}
                    {u.id === currentUserId && <span className="aide muted">Vous</span>}
                  </td>
                </tr>
              ))}
              {!users.length && (
                <tr><td colSpan={7} className="muted" style={{ textAlign: 'center', padding: '20px 0' }}>Aucun compte trouvé.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
