import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { isMember } from '@/lib/auth'

export default auth((req) => {
  const { nextUrl } = req
  const pathname = nextUrl.pathname
  const user = req.auth?.user

  const isAdminRoute = pathname.startsWith('/admin')
  const isMemberRoute = pathname.startsWith('/member')

  if (isAdminRoute && !user?.id) {
    const loginUrl = new URL('/login', nextUrl)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isMemberRoute && !isMember(user)) {
    const loginUrl = new URL('/login', nextUrl)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/admin/:path*', '/member/:path*', '/api/admin/:path*', '/api/member/:path*'],
}
