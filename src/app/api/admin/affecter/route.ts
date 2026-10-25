import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUser, journaliser } from '@/lib/actions'

export async function POST(req: Request) {
  const currentUser = await getUser()
  if (currentUser.role !== 'admin') return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 })

  const { patientId, medecinId } = await req.json()
  if (!patientId) return NextResponse.json({ error: 'Patient requis.' }, { status: 400 })

  const supabase = await createClient()

  await supabase.from('affectations_medecin').delete().eq('patient_id', patientId)

  if (medecinId) {
    await supabase.from('affectations_medecin').insert({
      patient_id: patientId,
      medecin_id: medecinId,
      date_affectation: new Date().toISOString().split('T')[0],
    })
  }

  await journaliser(currentUser.id, 'affecter_medecin', 'patients', patientId, medecinId ? `médecin ${medecinId}` : 'désaffecté')

  return NextResponse.json({ ok: true })
}
