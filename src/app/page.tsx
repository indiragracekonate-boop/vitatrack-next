import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('auth_id', user.id)
    .single()

  if (profile?.role === 'admin') redirect('/admin/dashboard')
  if (profile?.role === 'medecin') redirect('/medecin/dashboard')
  if (profile?.role === 'patient') redirect('/patient/dashboard')

  redirect('/login')
}
