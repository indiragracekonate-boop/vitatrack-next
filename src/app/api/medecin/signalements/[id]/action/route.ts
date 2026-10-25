import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUser, journaliser } from '@/lib/actions'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser()
  const { id } = await params
  const { action, statut } = await req.json()
  const supabase = await createClient()

  await supabase.from('signalement_actions').insert({
    signalement_id: id,
    user_id: user.id,
    action,
  })

  if (statut) {
    await supabase.from('signalements').update({ statut }).eq('id', id)
  }

  await journaliser(user.id, 'action_signalement', 'signalements', id, action.slice(0, 80))
  return NextResponse.json({ ok: true })
}
