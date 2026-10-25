import { createClient } from '@/lib/supabase/server'
import { getUser, getNotifCount } from '@/lib/actions'
import Layout from '@/components/Layout'
import SignalementsClient from './client'

export default async function MedecinSignalements() {
  const user = await getUser()
  const notifCount = await getNotifCount(user.id)
  const supabase = await createClient()

  const { data: signalements } = await supabase
    .from('signalements')
    .select('*, patients(nom, prenom), signalement_actions(*)')
    .eq('medecin_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <Layout user={user} title="Signalements" notifications={notifCount}>
      <SignalementsClient signalements={signalements ?? []} />
    </Layout>
  )
}
