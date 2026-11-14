import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { middlewareAuthorizationDecision } from '@/lib/middleware-policy'

export default auth((req) => {
  const { nextUrl } = req
  const decision = middlewareAuthorizationDecision(nextUrl.pathname, req.auth?.user)

  if (decision.type === 'redirect') {
    const loginUrl = new URL('/login', nextUrl)
    loginUrl.searchParams.set('callbackUrl', decision.callbackUrl)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/admin/:path*', '/member/:path*', '/api/admin/:path*', '/api/member/:path*'],
}
