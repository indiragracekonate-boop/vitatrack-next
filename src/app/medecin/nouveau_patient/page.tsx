import { getUser, getNotifCount } from '@/lib/actions'
import Layout from '@/components/Layout'
import NouveauPatientForm from './form'

export default async function NouveauPatientPage() {
  const user = await getUser()
  const notifCount = await getNotifCount(user.id)
  return (
    <Layout user={user} title="Nouveau patient" notifications={notifCount}>
      <NouveauPatientForm />
    </Layout>
  )
}
