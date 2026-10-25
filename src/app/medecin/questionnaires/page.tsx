import { createClient } from '@/lib/supabase/server'
import { getUser, getNotifCount } from '@/lib/actions'
import Layout from '@/components/Layout'
import QuestionnairesClient from './client'

export default async function MedecinQuestionnaires() {
  const user = await getUser()
  const notifCount = await getNotifCount(user.id)
  const supabase = await createClient()

  const { data: affectations } = await supabase
    .from('affectations_medecin')
    .select('patient_id, patients(nom, prenom)')
    .eq('medecin_id', user.id)

  const patientIds = affectations?.map(a => a.patient_id) ?? []

  const { data: questionnaires } = await supabase
    .from('questionnaires')
    .select('*, patients(nom, prenom), reponses_suivi(id, created_at)')
    .in('patient_id', patientIds.length ? patientIds : ['00000000-0000-0000-0000-000000000000'])
    .order('created_at', { ascending: false })

  return (
    <Layout user={user} title="Questionnaires" notifications={notifCount}>
      <QuestionnairesClient
        questionnaires={questionnaires ?? []}
        patients={affectations?.map(a => {
          const p = a.patients as { nom: string; prenom: string } | { nom: string; prenom: string }[] | null
          const patient = Array.isArray(p) ? p[0] : p
          return { id: a.patient_id, nom: patient?.nom ?? '', prenom: patient?.prenom ?? '' }
        }) ?? []}
      />
    </Layout>
  )
}
