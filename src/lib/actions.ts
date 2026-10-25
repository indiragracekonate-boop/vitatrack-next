import { createClient } from '@/lib/supabase/server'
import { User } from '@/lib/types'
import { redirect } from 'next/navigation'

export async function getUser(): Promise<User> {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) redirect('/login')

  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('auth_id', authUser.id)
    .single()

  if (!data || !data.actif) redirect('/login')
  return data as User
}

export async function getNotifCount(userId: string): Promise<number> {
  const supabase = await createClient()
  const { count } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('destinataire_id', userId)
    .eq('statut_lecture', 'non_lue')
  return count ?? 0
}

export async function journaliser(
  userId: string | null,
  action: string,
  objetType?: string,
  objetId?: string,
  details?: string
) {
  const supabase = await createClient()
  await supabase.from('journal_actions').insert({
    user_id: userId,
    action,
    objet_type: objetType ?? null,
    objet_id: objetId ?? null,
    details: details ?? null,
  })
}

export async function notifier(
  destinataireId: string,
  message: string,
  lien?: string
) {
  const supabase = await createClient()
  await supabase.from('notifications').insert({
    destinataire_id: destinataireId,
    message,
    lien: lien ?? null,
  })
}
