import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { canAdmin } from '@/lib/admin/access'
import { db, orders, users } from '@/lib/db'
import { eq, sql } from 'drizzle-orm'

export async function GET(request: Request) {
  const session = await auth()
  if (!(await canAdmin(session?.user?.id, 'orders.view'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') as 'pending' | 'paid' | 'failed' | 'refunded' | null
  const type = searchParams.get('type') as 'membership' | 'event' | 'donation' | null

  let query = db
    .select({
      order: orders,
      user: users,
    })
    .from(orders)
    .leftJoin(users, eq(users.id, orders.userId))

  if (status) {
    query = query.where(eq(orders.status, status)) as typeof query
  }
  if (type) {
    query = query.where(eq(orders.type, type)) as typeof query
  }

  const rows = await query.orderBy(sql`${orders.createdAt} desc`).limit(200)
  return NextResponse.json({
    orders: rows.map((row) => ({
      ...row.order,
      userEmail: row.user?.email ?? null,
    })),
  })
}
