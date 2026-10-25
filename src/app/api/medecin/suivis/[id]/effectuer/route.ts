import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUser, journaliser } from '@/lib/actions'

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser()
  const { id } = await params
  const supabase = await createClient()

  const { error } = await supabase
    .from('suivis')
    .update({ effectue_le: new Date().toISOString().split('T')[0] })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  await journaliser(user.id, 'marquer_suivi_effectue', 'suivis', id)
  return NextResponse.json({ ok: true })
}
