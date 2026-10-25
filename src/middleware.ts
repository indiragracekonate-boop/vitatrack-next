import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  // Pages publiques
  if (pathname.startsWith('/login') || pathname.startsWith('/auth/activate') || pathname === '/') {
    if (user && !pathname.startsWith('/auth')) {
      // Redirige vers le bon espace selon le rôle
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('auth_id', user.id)
        .single()
      if (profile?.role === 'admin') return NextResponse.redirect(new URL('/admin/dashboard', request.url))
      if (profile?.role === 'medecin') return NextResponse.redirect(new URL('/medecin/dashboard', request.url))
      if (profile?.role === 'patient') return NextResponse.redirect(new URL('/patient/dashboard', request.url))
    }
    return supabaseResponse
  }

  // Pages protégées — non connecté
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Contrôle d'accès par espace
  const { data: profile } = await supabase
    .from('users')
    .select('role, actif')
    .eq('auth_id', user.id)
    .single()

  if (!profile || !profile.actif) {
    await supabase.auth.signOut()
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const role = profile.role
  if (pathname.startsWith('/admin') && role !== 'admin') {
    return NextResponse.redirect(new URL(`/${role}/dashboard`, request.url))
  }
  if (pathname.startsWith('/medecin') && role !== 'medecin') {
    return NextResponse.redirect(new URL(`/${role}/dashboard`, request.url))
  }
  if (pathname.startsWith('/patient') && role !== 'patient') {
    return NextResponse.redirect(new URL(`/${role}/dashboard`, request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|assets|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
