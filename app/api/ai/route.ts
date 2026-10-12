import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { canAdmin } from '@/lib/admin/access'
import { db, directoryListings, events, leads, memberships, orders } from '@/lib/db'
import { eq, gte, sql } from 'drizzle-orm'
import { z } from 'zod'
import { logActivity } from '@/lib/admin/activity'

export const runtime = 'nodejs'
const intentSchema = z.object({ intent: z.string().trim().min(1).max(1000) })
const mutationWords = /\b(approve|activate|create|add|delete|publish|update|modify|waive|refund|remove|cancel|grant|revoke|change|edit|send)\b/i

/** Safe administrative reporting only; every write requires a separate audited UI flow. */
export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id || !(await canAdmin(session.user.id, 'ai.view'))) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 })
  }
  const body = await request.json().catch(() => null)
  const parsed = intentSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Enter a question under 1000 characters' }, { status: 400 })
  const intent = parsed.data.intent
  const prompt = intent.toLowerCase()
  let result = ''
  let action = 'read_only'
  try {
    if (mutationWords.test(prompt)) {
      result = 'No changes were made. For approvals, event changes, billing, and role assignments, open the relevant admin section and review the record before saving.'
      action = 'mutating_action_declined'
    } else if (/revenue|sales|payments|income/.test(prompt)) {
      const [r] = await db.select({ cents: sql<number>`coalesce(sum(${orders.totalCents}),0)` })
        .from(orders).where(eq(orders.status,'paid'))
      result = `Recorded paid orders total $${((r?.cents ?? 0)/100).toFixed(2)}. This is CRM order data, not a verified Square settlement or bank balance.`
      action = 'order_summary'
    } else if (/lead|inquir|follow.?up/.test(prompt)) {
      const start = new Date(Date.now()-7*86400000)
      const [week] = await db.select({ count: sql<number>`count(*)` }).from(leads).where(gte(leads.createdAt,start))
      const [open] = await db.select({ count: sql<number>`count(*)` }).from(leads).where(eq(leads.status,'new'))
      result = `There are ${week?.count ?? 0} leads received in the past 7 days and ${open?.count ?? 0} marked new. Open Leads to review records and assign follow-up.`
      action = 'lead_summary'
    } else if (/member|membership/.test(prompt)) {
      const [pending] = await db.select({ count: sql<number>`count(*)` }).from(memberships).where(eq(memberships.status,'pending'))
      result = `There are ${pending?.count ?? 0} pending memberships. Payment state must be confirmed through Square; status cannot be changed by this assistant.`
      action = 'membership_summary'
    } else if (/business|director|listing/.test(prompt)) {
      const [pending] = await db.select({ count: sql<number>`count(*)` }).from(directoryListings).where(eq(directoryListings.approved,false))
      result = `There are ${pending?.count ?? 0} business listings awaiting review. Open Directory to approve individual listings.`
      action = 'directory_summary'
    } else if (/event|training|networking/.test(prompt)) {
      const [upcoming] = await db.select({ count: sql<number>`count(*)` }).from(events)
        .where(gte(events.startAt,new Date()))
      result = `There are ${upcoming?.count ?? 0} scheduled upcoming events in the CRM. Open Events to review dates, publication state, and registrations.`
      action = 'events_summary'
    } else {
      result = 'I can summarize leads, pending memberships, business listings, upcoming events, and recorded orders. Administrative changes require a reviewed workflow.'
      action = 'help'
    }
    await logActivity({actorType:'user',actorId:session.user.id,action:'admin_insight_read',
      entityType:'admin_insight',metadata:{action,intent}})
    return NextResponse.json({ok:true,result,actions:[action],readOnly:true})
  } catch {
    return NextResponse.json({error:'The requested insight is currently unavailable. No records were changed.'},{status:503})
  }
}
