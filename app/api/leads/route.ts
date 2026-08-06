import { NextResponse } from 'next/server'
import { db, leads } from '@/lib/db'
import { sendEmail, leadAlertEmail } from '@/lib/email/resend'
import { sendTelegramAlert, formatAlert } from '@/lib/notifications/telegram'
import { env } from '@/lib/env'
import { z } from 'zod'

const leadSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().max(255),
  phone: z.string().max(50).optional().or(z.literal('')),
  interest: z.string().max(200).optional().or(z.literal('')),
  message: z.string().max(5000).optional().or(z.literal('')),
  source: z.string().max(100).default('website'),
})

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = leadSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const { name, email, phone, interest, message, source } = parsed.data

  const [inserted] = await db
    .insert(leads)
    .values({
      name,
      email,
      phone: phone || null,
      interest: interest || null,
      message: message || null,
      source,
    })
    .returning({ id: leads.id })

  const alert = leadAlertEmail({ name, email, interest, message })
  await sendEmail({
    to: env.ALERT_EMAIL || env.CONTACT_EMAIL,
    subject: alert.subject,
    html: alert.html,
    text: alert.text,
  })

  await sendTelegramAlert(
    formatAlert({
      title: 'New lead captured',
      body: `${name} (${email})\nInterest: ${interest || 'n/a'}`,
      url: `${env.NEXT_PUBLIC_APP_URL}/admin/leads`,
    })
  )

  return NextResponse.json({ ok: true, id: inserted.id }, { status: 201 })
}
