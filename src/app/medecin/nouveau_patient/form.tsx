'use client'
import { useState } from 'react'
import { UserPlus, Copy, Check } from 'lucide-react'

export default function NouveauPatientForm() {
  const [nom, setNom] = useState('')
  const [prenom, setPrenom] = useState('')
  const [dateNaissance, setDateNaissance] = useState('')
  const [sexe, setSexe] = useState('autre')
  const [telephone, setTelephone] = useState('')
  const [email, setEmail] = useState('')
  const [adresse, setAdresse] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activationUrl, setActivationUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setSuccess(''); setActivationUrl('')
    setLoading(true)
    try {
      const res = await fetch('/api/medecin/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom, prenom, dateNaissance, sexe, telephone, email, adresse, password: password || undefined }),
      })
      const json = await res.json()
      if (!res.ok) { setError(json.error ?? 'Erreur.'); return }
      if (json.activationUrl) {
        setActivationUrl(json.activationUrl)
        setSuccess("Patient créé. Lien d'activation à transmettre :")
      } else {
        setSuccess(email && password ? 'Patient créé avec compte. Il peut se connecter immédiatement.' : 'Patient créé avec succès.')
      }
      setNom(''); setPrenom(''); setDateNaissance(''); setSexe('autre')
      setTelephone(''); setEmail(''); setAdresse(''); setPassword('')
    } finally {
      setLoading(false)
    }
  }

  async function copyLink() {
    try { await navigator.clipboard.writeText(activationUrl); setCopied(true); setTimeout(() => setCopied(false), 2500) } catch {}
  }

  return (
    <div className="carte">
      <p className="aide" style={{ marginBottom: 16 }}>
        Ajoutez un patient à votre liste. Si vous renseignez son e-mail, vous pouvez lui créer un compte de connexion avec un mot de passe initial ou un lien d'activation.
      </p>
      {error && <div className="message erreur">{error}</div>}
      {success && (
        <div className="message ok" style={{ flexDirection: 'column', gap: 8 }}>
          <strong>✓ {success}</strong>
          {activationUrl && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <code style={{ background: 'rgba(0,0,0,0.08)', padding: '4px 8px', borderRadius: 6, fontSize: 12, wordBreak: 'break-all', flex: 1 }}>
                {activationUrl}
              </code>
              <button type="button" className="secondaire petit" onClick={copyLink}>
                {copied ? <><Check size={14} /> Copié</> : <><Copy size={14} /> Copier</>}
              </button>
            </div>
          )}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="grille-2">
          <div className="form-group">
            <label>Prénom *</label>
            <input value={prenom} onChange={e => setPrenom(e.target.value)} required placeholder="Prénom" />
          </div>
          <div className="form-group">
            <label>Nom *</label>
            <input value={nom} onChange={e => setNom(e.target.value)} required placeholder="Nom de famille" />
          </div>
          <div className="form-group">
            <label>Date de naissance *</label>
            <input type="date" value={dateNaissance} onChange={e => setDateNaissance(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Sexe *</label>
            <select value={sexe} onChange={e => setSexe(e.target.value)}>
              <option value="masculin">Masculin</option>
              <option value="feminin">Féminin</option>
              <option value="autre">Autre</option>
            </select>
          </div>
          <div className="form-group">
            <label>Téléphone</label>
            <input value={telephone} onChange={e => setTelephone(e.target.value)} placeholder="06 00 00 00 00" />
          </div>
          <div className="form-group">
            <label>E-mail <span className="aide">(pour un compte de connexion)</span></label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="patient@exemple.com" />
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label>Adresse</label>
            <input value={adresse} onChange={e => setAdresse(e.target.value)} placeholder="Adresse complète" />
          </div>
          {email && (
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Mot de passe initial <span className="aide">(optionnel — min. 8 car., sinon lien d'activation)</span></label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Laisser vide pour générer un lien d'activation" minLength={8} />
            </div>
          )}
        </div>
        <button type="submit" disabled={loading} style={{ marginTop: 8 }}>
          {loading ? 'Création…' : <><UserPlus size={15} /> Créer le patient</>}
        </button>
      </form>
    </div>
  )
}
