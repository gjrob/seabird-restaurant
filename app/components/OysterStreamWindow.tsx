'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Phase = 'closed' | 'opening' | 'pearl' | 'expanding' | 'stream'

export default function OysterStreamWindow({ clientSlug }: { clientSlug: string }) {
  const [phase, setPhase] = useState<Phase>('closed')
  const [streamUrl, setStreamUrl] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from('client_config')
      .select('is_streaming, stream_url')
      .eq('slug', clientSlug)
      .single()
      .then(({ data }) => {
        if (data?.is_streaming && data?.stream_url) {
          setStreamUrl(data.stream_url)
          setPhase('stream')
        }
      })

    const channel = supabase
      .channel(`oyster-${clientSlug}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'client_config',
        filter: `slug=eq.${clientSlug}`,
      }, (payload) => {
        if (payload.new.is_streaming && payload.new.stream_url) {
          setStreamUrl(payload.new.stream_url)
          triggerOpen()
        } else {
          setPhase('closed')
          setStreamUrl(null)
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [clientSlug])

  function triggerOpen() {
    setPhase('opening')
    setTimeout(() => setPhase('pearl'), 800)
    setTimeout(() => setPhase('expanding'), 1800)
    setTimeout(() => setPhase('stream'), 2600)
  }

  if (phase === 'closed') {
    return (
      <section style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 24px', gap: '24px' }}>
        <OysterShellClosed />
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#8faab0', fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Live from Seabird
          </p>
          <p style={{ color: '#e8f4f4', fontSize: '1rem', fontFamily: 'Georgia, serif', fontStyle: 'italic', marginTop: '6px', opacity: 0.55 }}>
            The pearl opens when the kitchen does
          </p>
        </div>
      </section>
    )
  }

  if (phase === 'opening') {
    return (
      <section style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 24px', gap: '24px' }}>
        <OysterShellOpening />
        <p style={{ color: '#7dd3d4', fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', animation: 'fadeIn 0.5s ease' }}>
          Opening...
        </p>
      </section>
    )
  }

  if (phase === 'pearl') {
    return (
      <section style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 24px', gap: '24px' }}>
        <OysterShellOpen />
        <p style={{ color: '#4ade80', fontSize: '0.75rem', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 600 }}>
          ● LIVE
        </p>
      </section>
    )
  }

  if (phase === 'expanding') {
    return (
      <section style={{ display: 'flex', justifyContent: 'center', overflow: 'hidden', padding: '40px 0' }}>
        <div style={{
          width: '44px', height: '44px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, #e8f4f4 0%, #7dd3d4 40%, #0a1a2e 100%)',
          animation: 'pearlExpand 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
          boxShadow: '0 0 60px rgba(125,211,212,0.5)',
        }} />
      </section>
    )
  }

  return (
    <section style={{ animation: 'fadeIn 0.5s ease' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 20px',
        background: 'rgba(125,211,212,0.05)',
        borderBottom: '1px solid rgba(125,211,212,0.1)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            width: '7px', height: '7px', borderRadius: '50%',
            background: '#4ade80',
            display: 'inline-block',
            animation: 'pulse-green 2s infinite',
          }} />
          <span style={{ color: '#4ade80', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em' }}>
            LIVE FROM SEABIRD
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#8faab0', fontSize: '0.7rem' }}>
          <span>🦪</span>
          <span>1 S. Front St · Wilmington</span>
        </div>
      </div>
      <div style={{ width: '100%', aspectRatio: '16/9', background: '#060e1a', position: 'relative' }}>
        {streamUrl ? (
          <iframe
            src={streamUrl}
            style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
            allow="autoplay; fullscreen"
            allowFullScreen
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8faab0', fontSize: '0.85rem' }}>
            Connecting to stream...
          </div>
        )}
      </div>
    </section>
  )
}

function OysterShellClosed() {
  return (
    <svg width="180" height="140" viewBox="0 0 180 140" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ filter: 'drop-shadow(0 8px 24px rgba(125,211,212,0.15))' }}>
      <ellipse cx="90" cy="95" rx="78" ry="38" fill="#1a3040" stroke="rgba(125,211,212,0.3)" strokeWidth="1.5"/>
      <ellipse cx="90" cy="95" rx="62" ry="28" fill="#142b38" stroke="rgba(125,211,212,0.15)" strokeWidth="1"/>
      {[0,1,2,3,4].map(i => (
        <line key={i} x1={90} y1={70} x2={25 + i * 32} y2={118} stroke="rgba(125,211,212,0.1)" strokeWidth="1"/>
      ))}
      <path d="M 18 90 Q 90 40 162 90 Q 90 75 18 90 Z" fill="#1e3a4a" stroke="rgba(125,211,212,0.3)" strokeWidth="1.5"/>
      <path d="M 30 88 Q 90 50 150 88 Q 90 68 30 88 Z" fill="#162e3d" stroke="rgba(125,211,212,0.1)" strokeWidth="1"/>
      <circle cx="90" cy="90" r="5" fill="#2a4a5a" stroke="rgba(125,211,212,0.4)" strokeWidth="1.5"/>
      <ellipse cx="70" cy="80" rx="18" ry="6" fill="rgba(255,255,255,0.04)" transform="rotate(-15 70 80)"/>
    </svg>
  )
}

function OysterShellOpening() {
  return (
    <svg width="180" height="160" viewBox="0 0 180 160" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ filter: 'drop-shadow(0 8px 32px rgba(125,211,212,0.25))' }}>
      <defs>
        <radialGradient id="pearlGrad" cx="40%" cy="35%">
          <stop offset="0%" stopColor="#ffffff"/>
          <stop offset="40%" stopColor="#e8f4f4"/>
          <stop offset="100%" stopColor="#7dd3d4"/>
        </radialGradient>
      </defs>
      <ellipse cx="90" cy="110" rx="78" ry="38" fill="#1a3040" stroke="rgba(125,211,212,0.3)" strokeWidth="1.5"/>
      <ellipse cx="90" cy="110" rx="62" ry="28" fill="#142b38" stroke="rgba(125,211,212,0.15)" strokeWidth="1"/>
      {[0,1,2,3,4].map(i => (
        <line key={i} x1={90} y1={85} x2={25 + i * 32} y2={133} stroke="rgba(125,211,212,0.1)" strokeWidth="1"/>
      ))}
      <circle cx="90" cy="100" r="10" fill="url(#pearlGrad)"/>
      <circle cx="86" cy="96" r="3" fill="rgba(255,255,255,0.6)"/>
      <g transform="rotate(-25, 90, 108)">
        <path d="M 18 105 Q 90 55 162 105 Q 90 90 18 105 Z" fill="#1e3a4a" stroke="rgba(125,211,212,0.4)" strokeWidth="1.5"/>
        <path d="M 30 103 Q 90 65 150 103 Q 90 83 30 103 Z" fill="#162e3d"/>
      </g>
      <ellipse cx="90" cy="108" rx="30" ry="10" fill="rgba(125,211,212,0.12)" style={{ animation: 'pearlGlow 1s ease infinite alternate' }}/>
      <circle cx="90" cy="108" r="5" fill="#2a4a5a" stroke="rgba(125,211,212,0.5)" strokeWidth="1.5"/>
    </svg>
  )
}

function OysterShellOpen() {
  return (
    <svg width="220" height="180" viewBox="0 0 220 180" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ filter: 'drop-shadow(0 12px 40px rgba(125,211,212,0.4))' }}>
      <defs>
        <radialGradient id="pearlFull" cx="38%" cy="32%">
          <stop offset="0%" stopColor="#ffffff"/>
          <stop offset="30%" stopColor="#f0fafa"/>
          <stop offset="70%" stopColor="#b2e4e6"/>
          <stop offset="100%" stopColor="#7dd3d4"/>
        </radialGradient>
        <radialGradient id="pearlGlowFull" cx="50%" cy="50%">
          <stop offset="0%" stopColor="rgba(125,211,212,0.4)"/>
          <stop offset="100%" stopColor="rgba(125,211,212,0)"/>
        </radialGradient>
      </defs>
      <ellipse cx="110" cy="130" rx="88" ry="42" fill="#1a3040" stroke="rgba(125,211,212,0.35)" strokeWidth="1.5"/>
      <ellipse cx="110" cy="130" rx="70" ry="30" fill="#142b38"/>
      {[0,1,2,3,4,5].map(i => (
        <line key={i} x1={110} y1={100} x2={30 + i * 32} y2={158} stroke="rgba(125,211,212,0.1)" strokeWidth="1"/>
      ))}
      <circle cx="110" cy="118" r="32" fill="url(#pearlGlowFull)"/>
      <circle cx="110" cy="118" r="22" fill="url(#pearlFull)" style={{ filter: 'drop-shadow(0 0 12px rgba(125,211,212,0.6))' }}/>
      <ellipse cx="103" cy="111" rx="7" ry="4" fill="rgba(255,255,255,0.55)" transform="rotate(-20 103 111)"/>
      <circle cx="118" cy="125" r="2.5" fill="rgba(255,255,255,0.2)"/>
      <g transform="rotate(-55, 110, 125)">
        <path d="M 28 120 Q 110 62 192 120 Q 110 104 28 120 Z" fill="#1e3a4a" stroke="rgba(125,211,212,0.4)" strokeWidth="1.5"/>
        <path d="M 42 118 Q 110 72 178 118 Q 110 96 42 118 Z" fill="#162e3d"/>
        <ellipse cx="95" cy="105" rx="22" ry="7" fill="rgba(125,211,212,0.08)" transform="rotate(-10 95 105)"/>
      </g>
      <circle cx="110" cy="125" r="6" fill="#2a4a5a" stroke="rgba(125,211,212,0.5)" strokeWidth="2"/>
    </svg>
  )
}
