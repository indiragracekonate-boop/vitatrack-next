'use client'
import { useState } from 'react'
import { User } from '@/lib/types'
import { KeyRound, Check } from 'lucide-react'

export default function CompteForm({ user }: { user: User }) {
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const roleLabel: Record<string, string> = {
    admin: 'Administrateur',
    medecin: 'Médecin',
    patient: 'Patient',
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setSuccess(false)
    if (newPassword !== confirm) { setError('Les mots de passe ne correspondent pas.'); return }
    if (newPassword.length < 8) { setError('Le mot de passe doit comporter au moins 8 caractères.'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      })
      const json = await res.json()
      if (!res.ok) { setError(json.error ?? 'Erreur.'); return }
      setSuccess(true)
      setNewPassword(''); setConfirm('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 560 }}>
      <div className="carte" style={{ marginBottom: 16 }}>
        <h2>Informations</h2>
        <div className="grille-2" style={{ marginTop: 12 }}>
          <div>
            <div className="aide">Prénom</div>
            <div style={{ fontWeight: 500 }}>{user.prenom}</div>
          </div>
          <div>
            <div className="aide">Nom</div>
            <div style={{ fontWeight: 500 }}>{user.nom}</div>
          </div>
          <div>
            <div className="aide">E-mail</div>
            <div style={{ fontWeight: 500 }}>{user.email}</div>
          </div>
          <div>
            <div className="aide">Rôle</div>
            <div style={{ fontWeight: 500 }}>{roleLabel[user.role] ?? user.role}</div>
          </div>
        </div>
      </div>

      <div className="carte">
        <h2>Changer de mot de passe</h2>
        {error && <div className="message erreur" style={{ marginTop: 12 }}>{error}</div>}
        {success && (
          <div className="message ok" style={{ marginTop: 12 }}>
            <Check size={16} /> Mot de passe modifié avec succès.
          </div>
        )}
        <form onSubmit={handleSubmit} style={{ marginTop: 16 }}>
          <div className="form-group">
            <label htmlFor="newPassword">Nouveau mot de passe</label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
              minLength={8}
              placeholder="Au moins 8 caractères"
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirm">Confirmer le nouveau mot de passe</label>
            <input
              id="confirm"
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
              minLength={8}
              placeholder="Répétez le nouveau mot de passe"
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Modification…' : <><KeyRound size={15} /> Modifier le mot de passe</>}
          </button>
        </form>
      </div>
    </div>
  )
}
