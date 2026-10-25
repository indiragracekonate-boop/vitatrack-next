import { createClient } from '@/lib/supabase/server'
import { getUser, getNotifCount } from '@/lib/actions'
import Layout from '@/components/Layout'
import Tag from '@/components/Tag'
import { dateFr, libelleStatutSignalement } from '@/lib/utils'
import SignalementClient from './client'

export default async function PatientSignalement() {
  const user = await getUser()
  const notifCount = await getNotifCount(user.id)
  const supabase = await createClient()

  const { data: patient } = await supabase
    .from('patients')
    .select('id, affectations_medecin(medecin_id)')
    .eq('user_id', user.id)
    .single()

  const { data: signalements } = patient
    ? await supabase
        .from('signalements')
        .select('*')
        .eq('patient_id', patient.id)
        .order('created_at', { ascending: false })
    : { data: [] }

  return (
    <Layout user={user} title="Signalements" notifications={notifCount}>
      <SignalementClient
        signalements={signalements ?? []}
        patientId={patient?.id ?? null}
        medecinId={(patient?.affectations_medecin as {medecin_id:string}[])?.[0]?.medecin_id ?? null}
      />
    </Layout>
  )
}
