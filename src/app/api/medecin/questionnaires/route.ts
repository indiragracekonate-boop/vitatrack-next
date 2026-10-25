import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUser, journaliser, notifier } from '@/lib/actions'

export async function POST(req: Request) {
  const user = await getUser()
  const supabase = await createClient()
  const { patientId, titre } = await req.json()

  const { data, error } = await supabase.from('questionnaires').insert({
    patient_id: patientId,
    medecin_id: user.id,
    titre,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: patient } = await supabase.from('patients').select('user_id, prenom').eq('id', patientId).single()
  if (patient?.user_id) {
    await notifier(patient.user_id, `Nouveau questionnaire à remplir : ${titre}`, '/patient/questionnaires')
  }

  await journaliser(user.id, 'create_questionnaire', 'questionnaires', data.id)
  return NextResponse.json({ ok: true })
}
