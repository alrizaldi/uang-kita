import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  // Create a Supabase client with the request and response
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet: any[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }: { name: string; value: string; options: CookieOptions }) =>
              req.cookies.set(name, value)
            )
            // Update response cookies
            cookiesToSet.forEach(({ name, value, options }) =>
              res.cookies.set(name, value, options)
            )
          } catch (error) {
            console.error('Error setting cookies:', error)
          }
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Protect routes that start with /dashboard, /transactions, etc.
  if (req.nextUrl.pathname.startsWith('/dashboard') ||
      req.nextUrl.pathname.startsWith('/transactions') ||
      req.nextUrl.pathname.startsWith('/accounts') ||
      req.nextUrl.pathname.startsWith('/budgets') ||
      req.nextUrl.pathname.startsWith('/goals')) {
    
    if (!session) {
      // Redirect to login page if not authenticated
      return NextResponse.redirect(new URL('/auth', req.url))
    }
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}