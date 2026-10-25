import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUser, journaliser, notifier } from '@/lib/actions'

export async function POST(req: Request) {
  const user = await getUser()
  const supabase = await createClient()
  const { patientId, dateHeure, motif } = await req.json()

  const { data, error } = await supabase.from('rendez_vous').insert({
    patient_id: patientId,
    medecin_id: user.id,
    date_heure: dateHeure,
    motif,
    statut: 'planifie',
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: patient } = await supabase.from('patients').select('user_id').eq('id', patientId).single()
  if (patient?.user_id) {
    await notifier(patient.user_id, `Nouveau rendez-vous le ${new Date(dateHeure).toLocaleDateString('fr-FR')} — ${motif}`, '/patient/rendezvous')
  }

  await journaliser(user.id, 'create_rdv', 'rendez_vous', data.id)
  return NextResponse.json({ ok: true })
}
