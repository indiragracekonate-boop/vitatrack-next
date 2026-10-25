import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getUser, journaliser } from '@/lib/actions'
import crypto from 'crypto'

export async function POST(req: Request) {
  const currentUser = await getUser()
  if (currentUser.role !== 'admin') return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 })

  const { role, nom, prenom, email, telephone, specialite } = await req.json()
  if (!role || !nom || !prenom || !email) return NextResponse.json({ error: 'Champs requis manquants.' }, { status: 400 })

  const supabase = await createAdminClient()

  const { data: existing } = await supabase.from('users').select('id').eq('email', email).single()
  if (existing) return NextResponse.json({ error: 'Cet e-mail est déjà utilisé.' }, { status: 409 })

  const { data: newUser, error: uErr } = await supabase
    .from('users')
    .insert({ role, nom, prenom, email, telephone: telephone || null, actif: false })
    .select()
    .single()
  if (uErr) return NextResponse.json({ error: uErr.message }, { status: 500 })

  if (role === 'medecin' && specialite) {
    await supabase.from('medecins').insert({ user_id: newUser.id, specialite })
  }

  const token = crypto.randomBytes(32).toString('hex')
  const expireDate = new Date()
  expireDate.setDate(expireDate.getDate() + 7)

  await supabase.from('invitations').insert({
    user_id: newUser.id,
    token,
    expire_le: expireDate.toISOString(),
  })

  await journaliser(currentUser.id, 'create_user', 'users', newUser.id, `${prenom} ${nom} (${role})`)

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? `https://${req.headers.get('host')}`
  const activationUrl = `${baseUrl}/auth/activate?token=${token}`

  return NextResponse.json({ ok: true, activationUrl })
}
