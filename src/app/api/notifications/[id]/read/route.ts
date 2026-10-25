import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/actions'

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser()
  const { id } = await params
  const supabase = await createClient()
  await supabase
    .from('notifications')
    .update({ statut_lecture: 'lue' })
    .eq('id', id)
    .eq('destinataire_id', user.id)
  return NextResponse.json({ ok: true })
}
