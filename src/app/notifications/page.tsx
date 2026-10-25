import { createClient } from '@/lib/supabase/server'
import { getUser, getNotifCount } from '@/lib/actions'
import Layout from '@/components/Layout'
import { datetimeFr } from '@/lib/utils'
import Link from 'next/link'
import NotificationsClient from './client'

export default async function Notifications() {
  const user = await getUser()
  const notifCount = await getNotifCount(user.id)
  const supabase = await createClient()

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('destinataire_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <Layout user={user} title="Notifications" notifications={notifCount}>
      <NotificationsClient notifications={notifications ?? []} />
    </Layout>
  )
}
