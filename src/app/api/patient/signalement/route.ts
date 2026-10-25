import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUser, journaliser, notifier } from '@/lib/actions'

export async function POST(req: Request) {
  const user = await getUser()
  const supabase = await createClient()
  const { patientId, medecinId, titre, description, niveauUrgence } = await req.json()

  if (!patientId || !titre || !description) return NextResponse.json({ error: 'Champs requis.' }, { status: 400 })

  const { data, error } = await supabase.from('signalements').insert({
    patient_id: patientId,
    medecin_id: medecinId ?? null,
    titre,
    description,
    niveau_urgence: niveauUrgence ?? 'normal',
    statut: 'nouveau',
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (medecinId) {
    const { data: medUser } = await supabase.from('medecins').select('user_id').eq('user_id', medecinId).single()
    if (medUser?.user_id) {
      await notifier(medUser.user_id, `Nouveau signalement : ${titre}`, '/medecin/signalements')
    }
  }

  await journaliser(user.id, 'create_signalement', 'signalements', data.id, titre)
  return NextResponse.json({ ok: true })
}
