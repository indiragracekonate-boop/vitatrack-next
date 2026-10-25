'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
      if (authError) {
        setError('Identifiants incorrects. Vérifiez votre e-mail et mot de passe.')
        return
      }
      router.push('/')
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-connexion">
      <div className="connexion">
        <div className="marque" style={{ textAlign: 'center', marginBottom: 24 }}>
          <img src="/assets/images/logo.png" alt="VitaTrack" style={{ height: 56, margin: '0 auto' }} />
        </div>
        <div className="carte">
          <h1 style={{ textAlign: 'center', fontSize: 22, marginBottom: 20 }}>Connexion</h1>
          {error && <div className="message erreur">{error}</div>}
          <form onSubmit={handleSubmit}>
            <label htmlFor="email">Adresse e-mail</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="votre@email.com"
            />
            <label htmlFor="password">Mot de passe</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <button type="submit" disabled={loading} style={{ width: '100%', marginTop: 16 }}>
              {loading ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>
        </div>
        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--gris)', marginTop: 16 }}>
          VitaTrack — Suivi post-hospitalisation
        </p>
      </div>
    </div>
  )
}
