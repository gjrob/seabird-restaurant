'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const LEADS_TABLE = 'seabird_reservations'
const ACCENT = '#0d9488'
const ACCENT_TEXT = '#ffffff'

interface Lead {
  id: string
  name: string
  phone?: string
  party_size?: number
  date?: string
  status: string
  created_at: string
}

export default function Dashboard() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [stats, setStats] = useState({ today: 0, week: 0, total: 0 })
  const [loading, setLoading] = useState(true)
  const [overlayActive, setOverlayActive] = useState(false)
  const [overlayMsg, setOverlayMsg] = useState('')

  useEffect(() => {
    fetchLeads()
    const sub = supabase.channel('seabird-reservations')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: LEADS_TABLE },
        (payload) => {
          setLeads(prev => [payload.new as Lead, ...prev])
          setStats(prev => ({ ...prev, today: prev.today + 1, total: prev.total + 1 }))
        })
      .subscribe()
    return () => { supabase.removeChannel(sub) }
  }, [])

  async function fetchLeads() {
    const { data } = await supabase.from(LEADS_TABLE).select('*').order('created_at', { ascending: false }).limit(200)
    if (data) {
      setLeads(data)
      const now = new Date()
      const todayStr = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
      const weekStr = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7).toISOString()
      setStats({
        today: data.filter(l => l.created_at > todayStr).length,
        week: data.filter(l => l.created_at > weekStr).length,
        total: data.length,
      })
    }
    setLoading(false)
  }

  async function updateStatus(id: string, status: string) {
    await supabase.from(LEADS_TABLE).update({ status }).eq('id', id)
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l))
  }

  function exportCSV() {
    if (!leads.length) return
    const headers = Object.keys(leads[0]).join(',')
    const rows = leads.map(l => Object.values(l).map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([headers + '\n' + rows], { type: 'text/csv' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
    a.download = `seabird-reservations-${new Date().toISOString().split('T')[0]}.csv`; a.click()
  }

  const statusColor = (s: string) => (
    ({ pending: '#ffaa00', confirmed: '#39ff14', completed: '#00d4ff', cancelled: '#ff4444' } as Record<string, string>)[s] || '#666'
  )

  return (
    <div style={{ minHeight: '100vh', background: '#080b0f', color: '#f0f4f8', fontFamily: 'monospace' }}>
      {/* Header */}
      <div style={{ borderBottom: `2px solid ${ACCENT}`, padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '10px', color: ACCENT, letterSpacing: '.15em' }}>// DASHBOARD</div>
          <div style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '.05em' }}>SEABIRD RESTAURANT</div>
        </div>
        <button onClick={exportCSV} style={{ background: 'transparent', border: `1px solid ${ACCENT}`, color: ACCENT, padding: '8px 20px', cursor: 'pointer', fontFamily: 'monospace', fontSize: '11px', letterSpacing: '.1em' }}>
          EXPORT CSV
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1px', background: '#1a2332' }}>
        {[{ label: 'TODAY', value: stats.today }, { label: 'THIS WEEK', value: stats.week }, { label: 'ALL TIME', value: stats.total }].map(s => (
          <div key={s.label} style={{ background: '#080b0f', padding: '28px 32px' }}>
            <div style={{ fontSize: '10px', color: '#6b7a8d', letterSpacing: '.1em', marginBottom: '8px' }}>{s.label}</div>
            <div style={{ fontSize: '56px', fontWeight: 700, color: ACCENT, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: '10px', color: '#6b7a8d', marginTop: '4px' }}>RESERVATIONS</div>
          </div>
        ))}
      </div>

      {/* Overlay Control */}
      <div style={{ margin: '24px 32px', border: '1px solid #1a2332', padding: '20px' }}>
        <div style={{ fontSize: '10px', color: ACCENT, letterSpacing: '.15em', marginBottom: '12px' }}>// OVERLAY CONTROL</div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <input
            value={overlayMsg}
            onChange={e => setOverlayMsg(e.target.value)}
            placeholder="e.g. Oyster happy hour 5-7pm — walk-ins welcome"
            style={{ flex: 1, background: '#0f1419', border: '1px solid #1a2332', color: '#f0f4f8', padding: '10px 16px', fontFamily: 'monospace', fontSize: '13px', outline: 'none' }}
          />
          <button
            onClick={() => setOverlayActive(!overlayActive)}
            style={{ background: overlayActive ? '#ff4444' : ACCENT, color: ACCENT_TEXT, border: 'none', padding: '10px 28px', cursor: 'pointer', fontFamily: 'monospace', fontWeight: 700, fontSize: '12px', letterSpacing: '.1em' }}
          >
            {overlayActive ? 'STOP' : 'GO LIVE'}
          </button>
        </div>
        {overlayActive && (
          <div style={{ marginTop: '12px', padding: '10px 16px', background: 'rgba(13,148,136,.06)', border: `1px solid ${ACCENT}`, fontSize: '12px', color: ACCENT }}>
            ● LIVE — &quot;{overlayMsg || 'No message set'}&quot;
          </div>
        )}
      </div>

      {/* Table */}
      <div style={{ margin: '0 32px 48px' }}>
        <div style={{ fontSize: '10px', color: ACCENT, letterSpacing: '.15em', marginBottom: '12px' }}>// RESERVATIONS — REAL TIME</div>
        {loading ? (
          <div style={{ color: '#6b7a8d', padding: '48px', textAlign: 'center' }}>LOADING...</div>
        ) : leads.length === 0 ? (
          <div style={{ color: '#6b7a8d', padding: '48px', textAlign: 'center', border: '1px solid #1a2332' }}>NO RESERVATIONS YET</div>
        ) : (
          <div style={{ border: '1px solid #1a2332' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 0.75fr 1fr 1fr', padding: '10px 16px', background: '#0f1419', fontSize: '10px', color: '#6b7a8d', letterSpacing: '.1em', borderBottom: '1px solid #1a2332' }}>
              <span>NAME</span><span>PHONE</span><span>PARTY SIZE</span><span>DATE</span><span>STATUS</span>
            </div>
            {leads.map((lead, i) => (
              <div key={lead.id} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 0.75fr 1fr 1fr', padding: '14px 16px', fontSize: '12px', borderBottom: i < leads.length - 1 ? '1px solid #0d1117' : 'none', background: i % 2 === 0 ? '#080b0f' : '#0a0e13', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, color: '#f0f4f8' }}>{lead.name}</span>
                <span style={{ color: '#6b7a8d' }}>{lead.phone || '—'}</span>
                <span style={{ color: '#6b7a8d', textAlign: 'center' }}>{lead.party_size ?? '—'}</span>
                <span style={{ color: '#6b7a8d' }}>{lead.date || '—'}</span>
                <select
                  value={lead.status}
                  onChange={e => updateStatus(lead.id, e.target.value)}
                  style={{ background: '#0f1419', border: `1px solid ${statusColor(lead.status)}`, color: statusColor(lead.status), padding: '4px 8px', fontSize: '10px', fontFamily: 'monospace', cursor: 'pointer' }}
                >
                  <option value="pending">PENDING</option>
                  <option value="confirmed">CONFIRMED</option>
                  <option value="completed">COMPLETED</option>
                  <option value="cancelled">CANCELLED</option>
                </select>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
