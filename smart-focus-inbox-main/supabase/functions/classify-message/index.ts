import { corsHeaders } from '@supabase/supabase-js/cors'
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'

const BodySchema = z.object({
  message: z.string().min(1).max(5000),
  sender: z.string().min(1).max(255).optional(),
  platform: z.enum(['email', 'whatsapp', 'linkedin']).optional(),
})

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const parsed = BodySchema.safeParse(await req.json())
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.flatten().fieldErrors }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { message, sender, platform } = parsed.data

    // Use keyword-based classification (ML simulation for demo)
    const result = classifyMessage(message, sender, platform)

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: unknown) {
    console.error('Classification error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

function classifyMessage(message: string, sender?: string, platform?: string) {
  const lower = message.toLowerCase()

  // High priority keywords
  const highKeywords = [
    'urgent', 'deadline', 'asap', 'immediately', 'emergency', 'critical',
    'submit by', 'due date', 'final', 'last date', 'important', 'overdue',
    'penalty', 'expiring', 'mandatory', 'required', 'exam', 'interview',
    'offer letter', 'acceptance', 'reject', 'terminated', 'fired',
  ]

  // Medium priority keywords
  const mediumKeywords = [
    'meeting', 'schedule', 'appointment', 'call me', 'follow up',
    'reminder', 'review', 'feedback', 'update', 'discuss', 'plan',
    'tomorrow', 'next week', 'register', 'confirm', 'rsvp',
    'job fair', 'study group', 'assignment', 'project',
  ]

  // Low priority keywords
  const lowKeywords = [
    'newsletter', 'promotion', 'sale', 'discount', 'subscribe',
    'follower', 'like', 'new release', 'trending', 'check out',
    'connection request', 'endorsed', 'congratulations', 'birthday',
    'sponsored', 'advertisement', 'unsubscribe',
  ]

  let highScore = 0, mediumScore = 0, lowScore = 0

  highKeywords.forEach(k => { if (lower.includes(k)) highScore += 2 })
  mediumKeywords.forEach(k => { if (lower.includes(k)) mediumScore += 1.5 })
  lowKeywords.forEach(k => { if (lower.includes(k)) lowScore += 1 })

  // Sender-based boosting
  if (sender) {
    const senderLower = sender.toLowerCase()
    if (senderLower.includes('prof') || senderLower.includes('dr.') || senderLower.includes('advisor') || senderLower.includes('boss')) {
      highScore += 3
    }
    if (senderLower.includes('hr') || senderLower.includes('recruiter')) {
      mediumScore += 2
    }
  }

  // Deadline detection
  const hasDeadline = /\b(by|before|due|deadline|until|submit)\b.*\b(\d{1,2}[\/-]\d{1,2}|\d{1,2}\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)|tomorrow|friday|monday|next week)\b/i.test(message)
  const hasDate = /\b\d{1,2}[\/-]\d{1,2}([\/-]\d{2,4})?\b|\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}\b/i.test(message)

  let priority: 'high' | 'medium' | 'low'
  if (highScore >= 2 || hasDeadline) {
    priority = 'high'
  } else if (mediumScore >= 1.5 || hasDate) {
    priority = 'medium'
  } else if (lowScore >= 1) {
    priority = 'low'
  } else {
    // Default based on message length and question marks
    const hasQuestion = message.includes('?')
    priority = hasQuestion ? 'medium' : 'low'
  }

  const confidence = Math.min(95, Math.max(60, Math.round(
    (Math.max(highScore, mediumScore, lowScore) / (highScore + mediumScore + lowScore + 0.1)) * 100
  )))

  return {
    priority,
    confidence,
    hasDeadline: hasDeadline || hasDate,
    reasoning: generateReasoning(priority, hasDeadline, hasDate, sender),
  }
}

function generateReasoning(priority: string, hasDeadline: boolean, hasDate: boolean, sender?: string) {
  const reasons: string[] = []
  if (priority === 'high') {
    reasons.push('Contains urgent or deadline-related keywords')
    if (hasDeadline) reasons.push('Deadline detected in message')
    if (sender && /prof|dr\.|advisor|boss/i.test(sender)) reasons.push('From an authority figure')
  } else if (priority === 'medium') {
    reasons.push('Contains scheduling or follow-up keywords')
    if (hasDate) reasons.push('Date reference found')
  } else {
    reasons.push('Appears to be informational or promotional content')
  }
  return reasons.join('. ') + '.'
}
