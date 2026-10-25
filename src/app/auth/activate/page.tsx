'use client'
import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ActivatePage() {
  const params = useSearchParams()
  const router = useRouter()
  const token = params.get('token')
  const supabase = createClient()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [valid, setValid] = useState<boolean | null>(null)
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    if (!token) { setValid(false); return }
    supabase
      .from('invitations')
      .select('user_id, expire_le, users(email)')
      .eq('token', token)
      .single()
      .then(({ data }) => {
        if (!data || new Date(data.expire_le) < new Date()) {
          setValid(false)
        } else {
          setValid(true)
          const u = data.users as unknown as { email: string }
          setUserEmail(u?.email ?? '')
        }
      })
  }, [token])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== confirm) { setError('Les mots de passe ne correspondent pas.'); return }
    if (password.length < 8) { setError('Le mot de passe doit comporter au moins 8 caractères.'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const json = await res.json()
      if (!res.ok) { setError(json.error ?? 'Erreur.'); return }
      setSuccess(true)
      setTimeout(() => router.push('/login'), 3000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-connexion">
      <div className="connexion">
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <img src="/assets/images/logo.png" alt="VitaTrack" style={{ height: 56, margin: '0 auto' }} />
        </div>
        <div className="carte">
          <h1 style={{ fontSize: 22, marginBottom: 16 }}>Activation du compte</h1>
          {valid === null && <p>Vérification du lien…</p>}
          {valid === false && <div className="message erreur">Ce lien est invalide ou a expiré.</div>}
          {valid === true && !success && (
            <>
              {userEmail && <p className="muted" style={{ marginBottom: 12 }}>Compte : {userEmail}</p>}
              {error && <div className="message erreur">{error}</div>}
              <form onSubmit={handleSubmit}>
                <label htmlFor="password">Nouveau mot de passe</label>
                <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} />
                <label htmlFor="confirm">Confirmer le mot de passe</label>
                <input id="confirm" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required minLength={8} />
                <button type="submit" disabled={loading} style={{ width: '100%', marginTop: 16 }}>
                  {loading ? 'Activation…' : 'Activer mon compte'}
                </button>
              </form>
            </>
          )}
          {success && <div className="message ok">Compte activé ! Redirection vers la connexion…</div>}
        </div>
      </div>
    </div>
  )
}
