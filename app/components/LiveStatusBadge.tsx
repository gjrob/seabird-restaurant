'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface StatusRow {
  is_open: boolean
  status_label: string
}

export default function LiveStatusBadge({ clientSlug }: { clientSlug: string }) {
  const [status, setStatus] = useState<StatusRow | null>(null)

  useEffect(() => {
    supabase
      .from('venue_status')
      .select('is_open, status_label')
      .eq('client_slug', clientSlug)
      .single()
      .then(({ data }) => { if (data) setStatus(data) })

    const channel = supabase
      .channel(`status-${clientSlug}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'venue_status',
        filter: `client_slug=eq.${clientSlug}`,
      }, (payload) => {
        setStatus({ is_open: payload.new.is_open, status_label: payload.new.status_label })
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [clientSlug])

  if (!status) return null

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '0.72rem',
      fontWeight: 600,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      background: status.is_open ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)',
      border: `1px solid ${status.is_open ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)'}`,
      color: status.is_open ? '#4ade80' : '#f87171',
    }}>
      <span style={{
        width: '6px', height: '6px', borderRadius: '50%',
        background: status.is_open ? '#4ade80' : '#f87171',
        boxShadow: status.is_open ? '0 0 0 0 rgba(74,222,128,0.4)' : 'none',
        animation: status.is_open ? 'pulse-green 2s infinite' : 'none',
        display: 'inline-block',
      }} />
      {status.status_label}
    </span>
  )
}
