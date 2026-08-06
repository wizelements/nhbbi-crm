'use client'

import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

export function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'ok' | 'error'>('idle')

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('submitting')
    // Stub: wire to /api/contact when backend is ready.
    await new Promise((resolve) => setTimeout(resolve, 800))
    setStatus('ok')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="subject">Subject</Label>
        <Input id="subject" name="subject" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" name="message" rows={5} required />
      </div>
      <Button
        type="submit"
        variant="navy"
        disabled={status === 'submitting'}
        className="w-full sm:w-auto"
      >
        {status === 'submitting' ? 'Sending...' : 'Send Message'}
      </Button>
      {status === 'ok' && (
        <p className="text-sm text-green-600">Thank you — your message has been received.</p>
      )}
      {status === 'error' && (
        <p className="text-sm text-destructive">Something went wrong. Please try again.</p>
      )}
    </form>
  )
}
