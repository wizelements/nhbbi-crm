import { NextResponse, type NextRequest } from 'next/server'
import { isSameOriginMutation } from '@/lib/admin/request-integrity'
/**
 * Auth and authorization are enforced by protected server layouts and API
 * handlers; do not import Node.js bcrypt/DB-backed Auth.js into Edge middleware.
 * This middleware adds same-origin integrity checks on authenticated writes.
 */
export function middleware(request: NextRequest) {
  if (!isSameOriginMutation(request.method, request.headers.get('origin'), request.nextUrl.origin)) {
    return NextResponse.json({ error: 'Cross-origin changes are not permitted' }, { status: 403 })
  }
  return NextResponse.next()
}
export const config = {
  matcher: ['/api/admin/:path*', '/api/ai', '/api/members/:path*'],
}
