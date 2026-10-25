import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUser, journaliser } from '@/lib/actions'

export async function POST(req: Request) {
  const currentUser = await getUser()
  if (currentUser.role !== 'admin') return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 })

  const { nom, prenom, dateNaissance, sexe, telephone, email, adresse, medecinId } = await req.json()
  if (!nom || !prenom || !dateNaissance || !sexe) return NextResponse.json({ error: 'Champs requis manquants.' }, { status: 400 })

  const supabase = await createClient()

  const { data: patient, error } = await supabase
    .from('patients')
    .insert({
      nom, prenom,
      date_naissance: dateNaissance,
      sexe,
      telephone: telephone || null,
      email: email || null,
      adresse: adresse || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (medecinId) {
    await supabase.from('affectations_medecin').insert({
      patient_id: patient.id,
      medecin_id: medecinId,
      date_affectation: new Date().toISOString().split('T')[0],
    })
  }

  await journaliser(currentUser.id, 'create_patient', 'patients', patient.id, `${prenom} ${nom}`)

  return NextResponse.json({ ok: true, id: patient.id })
}
