import { NextResponse } from 'next/server'
import { db, contacts } from '@/lib/db'
import { sendEmail, contactConfirmationEmail, leadAlertEmail } from '@/lib/email/resend'
import { sendTelegramAlert, formatAlert } from '@/lib/notifications/telegram'
import { env } from '@/lib/env'
import { z } from 'zod'

const contactSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().max(255),
  subject: z.string().max(200).optional().or(z.literal('')),
  message: z.string().min(1).max(5000),
})

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = contactSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const { name, email, subject, message } = parsed.data

  const [inserted] = await db
    .insert(contacts)
    .values({
      name,
      email,
      subject: subject || null,
      message,
    })
    .returning({ id: contacts.id })

  const confirmation = contactConfirmationEmail({ name })
  await sendEmail({
    to: email,
    subject: confirmation.subject,
    html: confirmation.html,
    text: confirmation.text,
  })

  const alert = leadAlertEmail({ name, email, interest: subject || 'Contact form', message })
  await sendEmail({
    to: env.ALERT_EMAIL || env.CONTACT_EMAIL,
    subject: alert.subject,
    html: alert.html,
    text: alert.text,
  })

  await sendTelegramAlert(
    formatAlert({
      title: 'New contact form submission',
      body: `${name} (${email})\n${subject || 'No subject'}`,
      url: `${env.NEXT_PUBLIC_APP_URL}/admin/leads`,
    })
  )

  return NextResponse.json({ ok: true, id: inserted.id }, { status: 201 })
}
