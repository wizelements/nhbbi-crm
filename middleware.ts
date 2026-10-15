import { NextResponse, type NextRequest } from 'next/server'
import { isSameOriginMutation } from '@/lib/admin/request-integrity'
import { canAccessPreviewPath, isReadOnlyPreview } from '@/lib/preview/read-only'
/**
 * Auth and authorization are enforced by protected server layouts and API
 * handlers; do not import Node.js bcrypt/DB-backed Auth.js into Edge middleware.
 * This middleware adds same-origin integrity checks on authenticated writes.
 */
export function middleware(request: NextRequest) {
  if (!canAccessPreviewPath(request.nextUrl.pathname, request.method)) {
    if (isReadOnlyPreview() && ['GET', 'HEAD'].includes(request.method.toUpperCase()) && !request.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.redirect(new URL('/preview', request.url))
    }
    return NextResponse.json({ error: 'This preview is read-only. Client accounts, administrative actions and payments are disabled.' }, { status: 503 })
  }
  if (!isSameOriginMutation(request.method, request.headers.get('origin'), request.nextUrl.origin)) {
    return NextResponse.json({ error: 'Cross-origin changes are not permitted' }, { status: 403 })
  }
  return NextResponse.next()
}
export const config = {
  matcher: ['/:path*'],
}
