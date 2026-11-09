import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Check dev session cookie first
  const devSessionCookie = request.cookies.get('harkat_dev_session')
  let devUser: any = null
  if (devSessionCookie?.value) {
    try {
      devUser = JSON.parse(devSessionCookie.value)
    } catch {
      // ignore parsing error
    }
  }

  let user: any = null
  let userRole: string | undefined = undefined

  if (devUser) {
    user = {
      id: devUser.id || 'dev-user-001',
      email: devUser.email || 'admin@harkat.com',
      app_metadata: { role: devUser.role || 'administrator' },
      user_metadata: { role: devUser.role || 'administrator', username: devUser.username || 'Admin Harkat' }
    }
    userRole = devUser.role || 'administrator'
  } else {
    try {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll()
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
              supabaseResponse = NextResponse.next({
                request,
              })
              cookiesToSet.forEach(({ name, value, options }) =>
                supabaseResponse.cookies.set(name, value, options)
              )
            },
          },
        }
      )

      const { data } = await supabase.auth.getUser()
      user = data.user
      userRole = (user?.app_metadata?.role || user?.user_metadata?.role) as string | undefined
    } catch {
      // Supabase host unreachable or network error
    }
  }

  // Basic route protection
  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register')
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard') || request.nextUrl.pathname.startsWith('/creator-dashboard') || request.nextUrl.pathname.startsWith('/admin') || request.nextUrl.pathname.startsWith('/create') || request.nextUrl.pathname.startsWith('/studio')

  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // Role-based access control
  const pathname = request.nextUrl.pathname
  if (user) {
    if (pathname.startsWith('/admin') && userRole !== 'administrator') {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
    if (pathname.startsWith('/creator-dashboard') && userRole !== 'creator' && userRole !== 'administrator') {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
