'use client'
import { useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function PageViewTracker({ clientSlug }: { clientSlug: string }) {
  useEffect(() => {
    const sessionId = sessionStorage.getItem('btv_session') || crypto.randomUUID()
    sessionStorage.setItem('btv_session', sessionId)

    supabase.from('canonical_events').insert({
      event_type: 'page.view',
      client_slug: clientSlug,
      session_id: sessionId,
      device_type: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
      payload: { path: window.location.pathname, referrer: document.referrer },
      occurred_at: new Date().toISOString(),
    }).then(() => {})
  }, [clientSlug])

  return null
}
