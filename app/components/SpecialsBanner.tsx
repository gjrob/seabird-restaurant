'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Special {
  title: string
  body: string
  type: 'banner' | 'ticker'
}

export default function SpecialsBanner({ clientSlug, accentColor = '#7dd3d4' }: { clientSlug: string; accentColor?: string }) {
  const [specials, setSpecials] = useState<Special[]>([])
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    supabase
      .from('specials')
      .select('title, body, type')
      .eq('client_slug', clientSlug)
      .then(({ data }) => { if (data) setSpecials(data) })
  }, [clientSlug])

  useEffect(() => {
    if (specials.length < 2) return
    const t = setInterval(() => setIdx(i => (i + 1) % specials.length), 4000)
    return () => clearInterval(t)
  }, [specials.length])

  if (!specials.length) return null

  const s = specials[idx]
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '10px',
      padding: '7px 16px',
      background: `rgba(${hexToRgb(accentColor)}, 0.08)`,
      border: `1px solid rgba(${hexToRgb(accentColor)}, 0.2)`,
      borderRadius: '4px',
      fontSize: '0.8rem',
      color: 'inherit',
      transition: 'opacity 0.4s',
    }}>
      <span style={{ color: accentColor, fontWeight: 700, whiteSpace: 'nowrap' }}>
        {s.title}
      </span>
      <span style={{ opacity: 0.7 }}>{s.body}</span>
    </div>
  )
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r},${g},${b}`
}
