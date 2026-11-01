import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getUser, journaliser } from '@/lib/actions'

export async function POST(req: Request) {
  const currentUser = await getUser()
  if (currentUser.role !== 'medecin' && currentUser.role !== 'admin') {
    return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 })
  }

  const { nom, prenom, dateNaissance, sexe, telephone, email, adresse, password } = await req.json()
  if (!nom || !prenom || !dateNaissance || !sexe) {
    return NextResponse.json({ error: 'Champs requis manquants.' }, { status: 400 })
  }
  if (password && password.length < 8) {
    return NextResponse.json({ error: 'Le mot de passe doit comporter au moins 8 caractères.' }, { status: 400 })
  }

  const supabase = await createAdminClient()

  // Créer le dossier patient
  const { data: patient, error: pErr } = await supabase
    .from('patients')
    .insert({ nom, prenom, date_naissance: dateNaissance, sexe, telephone: telephone || null, email: email || null, adresse: adresse || null })
    .select()
    .single()
  if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 })

  // Affecter au médecin courant
  const { data: medecinRow } = await supabase
    .from('medecins')
    .select('id')
    .eq('user_id', currentUser.id)
    .single()

  if (medecinRow) {
    await supabase.from('affectations_medecin').insert({
      patient_id: patient.id,
      medecin_id: medecinRow.id,
      date_affectation: new Date().toISOString().split('T')[0],
    })
  }

  let activationUrl: string | undefined

  // Si email fourni + mot de passe → créer compte utilisateur
  if (email && password) {
    const { data: existingUser } = await supabase.from('users').select('id').eq('email', email).single()
    if (!existingUser) {
      const { data: authUser, error: authErr } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      })
      if (!authErr && authUser) {
        await supabase
          .from('users')
          .insert({ role: 'patient', nom, prenom, email, telephone: telephone || null, actif: true, auth_id: authUser.user.id })
      }
    }
  } else if (email && !password) {
    // Lien d'activation
    const { data: existingUser } = await supabase.from('users').select('id').eq('email', email).single()
    if (!existingUser) {
      const { data: newUser } = await supabase
        .from('users')
        .insert({ role: 'patient', nom, prenom, email, telephone: telephone || null, actif: false })
        .select()
        .single()
      if (newUser) {
        const crypto = await import('crypto')
        const token = crypto.randomBytes(32).toString('hex')
        const expireDate = new Date()
        expireDate.setDate(expireDate.getDate() + 7)
        await supabase.from('invitations').insert({ user_id: newUser.id, token, expire_le: expireDate.toISOString() })
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? `https://${req.headers.get('host')}`
        activationUrl = `${baseUrl}/auth/activate?token=${token}`
      }
    }
  }

  await journaliser(currentUser.id, 'create_patient', 'patients', patient.id, `${prenom} ${nom}`)

  return NextResponse.json({ ok: true, id: patient.id, activationUrl })
}
