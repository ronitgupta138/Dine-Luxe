import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const roleRouteMap: Record<string, string[]> = {
  '/(admin)': ['admin'],
  '/(owner)': ['owner'],
  '/(staff)/manager': ['manager'],
  '/(staff)/host': ['host'],
  '/(staff)/waiter': ['waiter'],
  '/(staff)/chef': ['chef'],
  '/(staff)/cashier': ['cashier'],
}

const publicPaths = ['/', '/(auth)']

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const role = req.cookies.get('role')?.value

  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  if (!role) {
    return NextResponse.redirect(new URL('/(auth)/login', req.url))
  }

  for (const routePrefix of Object.keys(roleRouteMap)) {
    if (pathname.startsWith(routePrefix)) {
      if (!roleRouteMap[routePrefix].includes(role)) {
        return NextResponse.redirect(new URL('/(auth)/login', req.url))
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt).*)'],
}
