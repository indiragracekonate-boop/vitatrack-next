import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUser, journaliser } from '@/lib/actions'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const currentUser = await getUser()
  if (currentUser.role !== 'admin') return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 })

  const { id } = await params
  const { actif } = await req.json()
  const supabase = await createClient()

  const { error } = await supabase.from('users').update({ actif }).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await journaliser(currentUser.id, actif ? 'activate_user' : 'deactivate_user', 'users', id)

  return NextResponse.json({ ok: true })
}
