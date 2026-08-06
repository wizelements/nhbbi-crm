'use client'

import { formatCurrency, formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import type { orders } from '@/lib/db'

type Order = typeof orders.$inferSelect & { userEmail: string | null }

export function OrdersTable({ orders }: { orders: Order[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b">
          <tr className="text-left text-muted-foreground">
            <th className="pb-3 font-medium">Order ID</th>
            <th className="pb-3 font-medium">Customer</th>
            <th className="pb-3 font-medium">Type</th>
            <th className="pb-3 font-medium">Total</th>
            <th className="pb-3 font-medium">Status</th>
            <th className="pb-3 font-medium">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {orders.map((order) => (
            <tr key={order.id}>
              <td className="py-3 font-mono text-xs">{order.squareOrderId}</td>
              <td className="py-3">{order.userEmail || 'Guest'}</td>
              <td className="py-3 capitalize">{order.type}</td>
              <td className="py-3 font-medium">{formatCurrency(order.totalCents)}</td>
              <td className="py-3">
                <Badge
                  variant={
                    order.status === 'paid'
                      ? 'navy'
                      : order.status === 'refunded'
                      ? 'outline'
                      : 'secondary'
                  }
                >
                  {order.status}
                </Badge>
              </td>
              <td className="py-3">{order.createdAt ? formatDate(order.createdAt) : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
