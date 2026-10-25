import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUser, journaliser } from '@/lib/actions'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser()
  const { id } = await params
  const { reponses } = await req.json()
  const supabase = await createClient()

  const { data: patient } = await supabase.from('patients').select('id').eq('user_id', user.id).single()

  const { data: rep, error: repErr } = await supabase.from('reponses_suivi').insert({
    questionnaire_id: id,
    patient_id: patient?.id ?? null,
  }).select().single()

  if (repErr) return NextResponse.json({ error: repErr.message }, { status: 500 })

  const items = Object.entries(reponses as Record<string, string>).map(([questionId, valeur]) => ({
    reponse_id: rep.id,
    question_id: questionId,
    valeur,
  }))

  if (items.length) {
    const { error: itemErr } = await supabase.from('reponses_items').insert(items)
    if (itemErr) return NextResponse.json({ error: itemErr.message }, { status: 500 })
  }

  await journaliser(user.id, 'reponse_questionnaire', 'questionnaires', id)
  return NextResponse.json({ ok: true })
}
