import { createClient } from '@/lib/supabase/server'
import { getUser, getNotifCount } from '@/lib/actions'
import Layout from '@/components/Layout'
import DossierClient from './client'
import { notFound } from 'next/navigation'

export default async function DossierPatient({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getUser()
  const notifCount = await getNotifCount(user.id)
  const supabase = await createClient()

  const { data: patient } = await supabase
    .from('patients')
    .select('*')
    .eq('id', id)
    .single()

  if (!patient) notFound()

  const [
    { data: sorties },
    { data: suivis },
    { data: rdvs },
    { data: prescriptions },
    { data: signalements },
    { data: questionnaires },
  ] = await Promise.all([
    supabase.from('sorties_hospitalieres').select('*').eq('patient_id', id).order('date_entree', { ascending: false }),
    supabase.from('suivis').select('*, users(prenom, nom)').eq('patient_id', id).order('date_prevue', { ascending: false }),
    supabase.from('rendez_vous').select('*, users(prenom, nom)').eq('patient_id', id).order('date_heure', { ascending: false }),
    supabase.from('prescriptions').select('*, lignes_prescription(*), users(prenom, nom)').eq('patient_id', id).order('date_prescription', { ascending: false }),
    supabase.from('signalements').select('*').eq('patient_id', id).order('created_at', { ascending: false }),
    supabase.from('questionnaires').select('*, reponses_suivi(*, reponses_items(*))').eq('patient_id', id).order('created_at', { ascending: false }),
  ])

  return (
    <Layout user={user} title={`Dossier — ${patient.prenom} ${patient.nom}`} notifications={notifCount}>
      <DossierClient
        patient={patient}
        sorties={sorties ?? []}
        suivis={suivis ?? []}
        rdvs={rdvs ?? []}
        prescriptions={prescriptions ?? []}
        signalements={signalements ?? []}
        questionnaires={questionnaires ?? []}
        medecinUserId={user.id}
      />
    </Layout>
  )
}
