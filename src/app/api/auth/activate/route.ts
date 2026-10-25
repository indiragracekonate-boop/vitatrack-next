import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  const { token, password } = await req.json()
  if (!token || !password || password.length < 8) {
    return NextResponse.json({ error: 'Paramètres invalides.' }, { status: 400 })
  }

  const { data: inv } = await supabase
    .from('invitations')
    .select('user_id, expire_le')
    .eq('token', token)
    .single()

  if (!inv || new Date(inv.expire_le) < new Date()) {
    return NextResponse.json({ error: 'Lien invalide ou expiré.' }, { status: 400 })
  }

  const { data: userRow } = await supabase
    .from('users')
    .select('email, auth_id')
    .eq('id', inv.user_id)
    .single()

  if (!userRow) return NextResponse.json({ error: 'Utilisateur introuvable.' }, { status: 404 })

  let authId = userRow.auth_id
  if (!authId) {
    const { data: created, error: createErr } = await supabase.auth.admin.createUser({
      email: userRow.email,
      password,
      email_confirm: true,
    })
    if (createErr) return NextResponse.json({ error: createErr.message }, { status: 500 })
    authId = created.user.id
    await supabase.from('users').update({ auth_id: authId, actif: true }).eq('id', inv.user_id)
  } else {
    const { error: updateErr } = await supabase.auth.admin.updateUserById(authId, { password })
    if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 })
    await supabase.from('users').update({ actif: true }).eq('id', inv.user_id)
  }

  await supabase.from('invitations').delete().eq('token', token)

  return NextResponse.json({ ok: true })
}
