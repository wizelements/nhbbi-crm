'use client'

import { useState, type FormEvent } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Loader2, Send, Bot, User, CheckCircle, AlertCircle } from 'lucide-react'

interface AgentMessage {
  role: 'user' | 'agent'
  content: string
  actions?: string[]
  error?: boolean
}

export default function AiAgentPage() {
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<AgentMessage[]>([
    {
      role: 'agent',
      content:
        'I can summarize NHBBI CRM leads, member requests, business directory reviews, events and recorded payments. For safety, I never change records from chat.',
    },
  ])
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setHistory((prev) => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intent: userMessage }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Agent request failed')

      setHistory((prev) => [
        ...prev,
        {
          role: 'agent',
          content: data.result || 'Done.',
          actions: data.actions,
        },
      ])
    } catch (err) {
      setHistory((prev) => [
        ...prev,
        {
          role: 'agent',
          content: err instanceof Error ? err.message : 'Unknown error',
          error: true,
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AI Agent Console</h1>
        <p className="text-muted-foreground">Read-only operational insights. Changes require individual review in the admin workspace.</p>
      </div>

      <Card className="min-h-[400px] flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-gold" /> NHBBI CRM Agent
          </CardTitle>
          <CardDescription>Try: “Summarize new leads”, “How many pending member requests?”, or “Show recorded revenue”. This assistant is read-only.</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 space-y-4">
          <div className="space-y-4">
            {history.map((msg, idx) => (
              <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                <div
                  className={`rounded-lg px-4 py-3 max-w-[80%] ${
                    msg.role === 'user'
                      ? 'bg-navy text-white'
                      : msg.error
                      ? 'bg-destructive/10 text-destructive'
                      : 'bg-muted'
                  }`}
                >
                  <div className="mb-1 flex items-center gap-2 text-xs opacity-80">
                    {msg.role === 'user' ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
                    {msg.role === 'user' ? 'You' : 'Agent'}
                  </div>
                  <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {msg.actions.map((action) => (
                        <Badge key={action} variant="outline" className="text-xs">
                          <CheckCircle className="mr-1 h-3 w-3" /> {action}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Agent is thinking...
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="mt-auto flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask the agent to perform a safe CRM action..."
              className="min-h-[80px] flex-1 resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit(e)
                }
              }}
            />
            <Button type="submit" disabled={loading || !input.trim()} className="self-end">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
