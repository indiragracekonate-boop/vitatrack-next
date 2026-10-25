import { createClient } from '@/lib/supabase/server'
import { getUser, getNotifCount } from '@/lib/actions'
import Layout from '@/components/Layout'
import { dateFr } from '@/lib/utils'
import AdminUtilisateursClient from './client'

export default async function AdminUtilisateurs() {
  const user = await getUser()
  const notifCount = await getNotifCount(user.id)
  const supabase = await createClient()

  const { data: users } = await supabase
    .from('users')
    .select('*, medecins(specialite)')
    .in('role', ['admin', 'medecin'])
    .order('created_at', { ascending: false })

  const { data: medecins } = await supabase
    .from('users')
    .select('id, nom, prenom')
    .eq('role', 'medecin')
    .eq('actif', true)

  return (
    <Layout user={user} title="Comptes utilisateurs" notifications={notifCount}>
      <AdminUtilisateursClient
        users={users ?? []}
        medecins={medecins ?? []}
        currentUserId={user.id}
      />
    </Layout>
  )
}
