import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { canAdmin } from '@/lib/admin/access'
import { db, orders, users } from '@/lib/db'
import { sql, eq } from 'drizzle-orm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { OrdersTable } from '@/components/admin/orders-table'

async function getOrders() {
  const rows = await db
    .select({
      order: orders,
      user: users,
    })
    .from(orders)
    .leftJoin(users, eq(users.id, orders.userId))
    .orderBy(sql`${orders.createdAt} desc`)
    .limit(200)

  return rows.map((row) => ({
    ...row.order,
    userEmail: row.user?.email ?? null,
  }))
}

export default async function AdminOrdersPage() {
  const session = await auth()
  if (!(await canAdmin(session?.user?.id, 'orders.view'))) {
    redirect('/login?callbackUrl=/admin/orders')
  }

  const rows = await getOrders()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Orders</h2>
        <p className="text-muted-foreground">Payment and order history across memberships, events, and donations.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <OrdersTable orders={rows} />
        </CardContent>
      </Card>
    </div>
  )
}
