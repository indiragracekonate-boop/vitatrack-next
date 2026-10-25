import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/actions'

export async function POST() {
  const user = await getUser()
  const supabase = await createClient()
  await supabase
    .from('notifications')
    .update({ statut_lecture: 'lue' })
    .eq('destinataire_id', user.id)
    .eq('statut_lecture', 'non_lue')
  return NextResponse.json({ ok: true })
}
