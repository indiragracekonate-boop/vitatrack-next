import { createClient } from '@/lib/supabase/server'
import { getUser, getNotifCount } from '@/lib/actions'
import Layout from '@/components/Layout'
import AdminPatientsClient from './client'

export default async function AdminPatients() {
  const user = await getUser()
  const notifCount = await getNotifCount(user.id)
  const supabase = await createClient()

  const [{ data: patients }, { data: medecins }] = await Promise.all([
    supabase
      .from('patients')
      .select('*, affectations_medecin(medecin_id, users(prenom, nom))')
      .order('nom'),
    supabase
      .from('users')
      .select('id, prenom, nom, medecins(specialite)')
      .eq('role', 'medecin')
      .eq('actif', true)
      .order('nom'),
  ])

  return (
    <Layout user={user} title="Gestion des patients" notifications={notifCount}>
      <AdminPatientsClient patients={patients ?? []} medecins={medecins ?? []} />
    </Layout>
  )
}
