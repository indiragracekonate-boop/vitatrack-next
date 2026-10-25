import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUser, journaliser } from '@/lib/actions'

export async function POST(req: Request) {
  const user = await getUser()
  const supabase = await createClient()
  const { patientId, datePrevue, type, notes } = await req.json()

  const { data, error } = await supabase.from('suivis').insert({
    patient_id: patientId,
    medecin_id: user.id,
    date_prevue: datePrevue,
    type_suivi: type,
    notes: notes || null,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  await journaliser(user.id, 'create_suivi', 'suivis', data.id)
  return NextResponse.json({ ok: true })
}
