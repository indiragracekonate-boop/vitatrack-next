import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const { newPassword } = await req.json()
  if (!newPassword || newPassword.length < 8) {
    return NextResponse.json({ error: 'Le nouveau mot de passe doit comporter au moins 8 caractères.' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })

  const adminClient = await createAdminClient()
  const { error } = await adminClient.auth.admin.updateUserById(user.id, { password: newPassword })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
