import { createClient } from '@/lib/supabase/server'
import { getUser, getNotifCount } from '@/lib/actions'
import Layout from '@/components/Layout'
import { dateFr } from '@/lib/utils'
import QuestionnaireClient from './client'

export default async function PatientQuestionnaires() {
  const user = await getUser()
  const notifCount = await getNotifCount(user.id)
  const supabase = await createClient()

  const { data: patient } = await supabase.from('patients').select('id').eq('user_id', user.id).single()

  const { data: questionnaires } = patient
    ? await supabase
        .from('questionnaires')
        .select('*, questions(id, libelle, type_reponse, ordre), reponses_suivi(id, created_at, reponses_items(question_id, valeur))')
        .eq('patient_id', patient.id)
        .order('created_at', { ascending: false })
    : { data: [] }

  return (
    <Layout user={user} title="Mes questionnaires" notifications={notifCount}>
      <QuestionnaireClient questionnaires={questionnaires ?? []} />
    </Layout>
  )
}
