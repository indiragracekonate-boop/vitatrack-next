import { getUser, getNotifCount } from '@/lib/actions'
import Layout from '@/components/Layout'
import CompteForm from './form'

export default async function ComptePage() {
  const user = await getUser()
  const notifCount = await getNotifCount(user.id)
  return (
    <Layout user={user} title="Mon compte" notifications={notifCount}>
      <CompteForm user={user} />
    </Layout>
  )
}
