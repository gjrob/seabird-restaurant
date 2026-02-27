'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

type CustomerNote = {
  id: string
  note: string
  created_at: string
}

type Customer = {
  id: string
  name: string
  phone: string
  email: string | null
  visit_count: number
  created_at: string
  last_seen: string
  customer_notes: CustomerNote[]
}

const bg = '#060e1a'
const cardBg = '#0d1e30'
const border = 'rgba(125,211,212,0.1)'
const textPrimary = '#e2f0f0'
const textMuted = '#8faab0'
const accent = '#7dd3d4'

export default function SeabirdCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set())
  const [addingNote, setAddingNote] = useState<string | null>(null)
  const [noteText, setNoteText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const loadCustomers = useCallback(async () => {
    try {
      const data = await fetch('/api/crm/customers').then(r => r.json())
      setCustomers(Array.isArray(data) ? data : [])
    } catch {
      setCustomers([])
    }
    setLoading(false)
  }, [])

  useEffect(() => { loadCustomers() }, [loadCustomers])

  async function submitNote(customerId: string) {
    if (!noteText.trim() || submitting) return
    setSubmitting(true)
    try {
      await fetch('/api/crm/note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId, note: noteText }),
      })
      await loadCustomers()
      setNoteText('')
      setAddingNote(null)
    } catch {}
    setSubmitting(false)
  }

  function toggleNotes(id: string) {
    setExpandedNotes(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const totalCustomers = customers.length
  const newThisWeek = customers.filter(c => new Date(c.created_at) >= weekAgo).length
  const returning = customers.filter(c => c.visit_count > 1).length
  const totalNotes = customers.reduce((sum, c) => sum + (c.customer_notes?.length ?? 0), 0)

  if (loading) {
    return (
      <main style={{ background: bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', system-ui, sans-serif" }}>
        <div style={{ color: textMuted, fontSize: '0.85rem' }}>Loading…</div>
      </main>
    )
  }

  return (
    <main style={{ background: bg, minHeight: '100vh', fontFamily: "'Inter', system-ui, sans-serif", color: textPrimary, padding: '0 0 4rem' }}>
      {/* HEADER */}
      <header style={{ borderBottom: `1px solid ${border}`, padding: '1.5rem 2rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <Link href="/dashboard" style={{ fontSize: '0.72rem', color: accent, textDecoration: 'none', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            ← Dashboard
          </Link>
          <h1 style={{ fontSize: '1.1rem', fontWeight: 600, color: textPrimary, margin: '0.3rem 0 0' }}>
            Customer Book · Seabird
          </h1>
          <p style={{ fontSize: '0.72rem', color: textMuted, marginTop: '4px', letterSpacing: '0.05em' }}>
            Guests who&apos;ve made reservations · Powered by BlueTubeTV
          </p>
        </div>
        <div style={{ fontSize: '0.7rem', color: textMuted, textAlign: 'right' }}>
          <div>1 S. Front St · Wilmington, NC</div>
          <div style={{ marginTop: '2px' }}>(910) 769-5996</div>
        </div>
      </header>

      <div style={{ padding: '2rem' }}>
        {/* STAT CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
          {[
            { label: 'Total Guests', value: totalCustomers, accent },
            { label: 'New This Week', value: newThisWeek, accent: '#4ade80' },
            { label: 'Returning Guests', value: returning, accent },
            { label: 'Staff Notes', value: totalNotes, accent: '#f59e0b' },
          ].map((card, i) => (
            <div key={i} style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: '10px', padding: '1.25rem 1.5rem' }}>
              <div style={{ fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: textMuted, marginBottom: '0.5rem' }}>
                {card.label}
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: 700, color: card.accent, lineHeight: 1 }}>
                {card.value}
              </div>
            </div>
          ))}
        </div>

        {/* CUSTOMER LIST */}
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1.5fr 0.4fr 0.8fr 0.8fr auto', gap: '0.5rem', padding: '0 1rem 0.5rem', fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: textMuted, fontWeight: 600 }}>
            <span>Name</span>
            <span>Phone</span>
            <span>Email</span>
            <span style={{ textAlign: 'center' }}>Visits</span>
            <span>First Visit</span>
            <span>Last Visit</span>
            <span></span>
          </div>

          {customers.length === 0 ? (
            <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: '10px', padding: '2rem', textAlign: 'center', color: textMuted, fontSize: '0.85rem' }}>
              No guests yet — reservations will appear here automatically.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {customers.map(customer => (
                <div key={customer.id} style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: '10px', overflow: 'hidden' }}>
                  {/* Row */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1.5fr 0.4fr 0.8fr 0.8fr auto', alignItems: 'center', gap: '0.5rem', padding: '0.875rem 1rem', fontSize: '0.82rem' }}>
                    <div style={{ color: textPrimary, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{customer.name}</div>
                    <div style={{ color: textMuted }}>{customer.phone}</div>
                    <div style={{ color: textMuted, fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{customer.email ?? '—'}</div>
                    <div style={{ color: accent, fontWeight: 600, textAlign: 'center' }}>{customer.visit_count}</div>
                    <div style={{ color: textMuted, fontSize: '0.72rem' }}>{new Date(customer.created_at).toLocaleDateString()}</div>
                    <div style={{ color: textMuted, fontSize: '0.72rem' }}>{new Date(customer.last_seen).toLocaleDateString()}</div>
                    <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                      <button
                        onClick={() => toggleNotes(customer.id)}
                        style={{ padding: '4px 10px', borderRadius: '8px', border: `1px solid ${border}`, background: expandedNotes.has(customer.id) ? `rgba(125,211,212,0.1)` : 'transparent', color: accent, fontSize: '0.62rem', fontWeight: 600, letterSpacing: '0.06em', cursor: 'pointer', whiteSpace: 'nowrap' }}
                      >
                        Notes ({customer.customer_notes?.length ?? 0})
                      </button>
                      <button
                        onClick={() => { setAddingNote(addingNote === customer.id ? null : customer.id); setNoteText('') }}
                        style={{ padding: '4px 10px', borderRadius: '8px', border: '1px solid rgba(125,211,212,0.3)', background: addingNote === customer.id ? 'rgba(125,211,212,0.15)' : 'rgba(125,211,212,0.06)', color: accent, fontSize: '0.62rem', fontWeight: 600, letterSpacing: '0.06em', cursor: 'pointer', whiteSpace: 'nowrap' }}
                      >
                        + Note
                      </button>
                    </div>
                  </div>

                  {/* Add note form */}
                  {addingNote === customer.id && (
                    <div style={{ borderTop: `1px solid ${border}`, padding: '0.75rem 1rem', display: 'flex', gap: '0.5rem', alignItems: 'center', background: 'rgba(125,211,212,0.03)' }}>
                      <input
                        value={noteText}
                        onChange={e => setNoteText(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') submitNote(customer.id) }}
                        placeholder="Add a staff note…"
                        autoFocus
                        style={{ flex: 1, background: 'rgba(125,211,212,0.05)', border: `1px solid rgba(125,211,212,0.2)`, borderRadius: '8px', padding: '0.5rem 0.75rem', color: textPrimary, fontSize: '0.82rem', outline: 'none', fontFamily: 'inherit' }}
                      />
                      <button
                        onClick={() => submitNote(customer.id)}
                        disabled={submitting || !noteText.trim()}
                        style={{ padding: '0.5rem 1rem', borderRadius: '8px', background: accent, color: '#060e1a', fontSize: '0.75rem', fontWeight: 700, cursor: submitting || !noteText.trim() ? 'not-allowed' : 'pointer', border: 'none', opacity: submitting || !noteText.trim() ? 0.5 : 1, fontFamily: 'inherit' }}
                      >
                        Save
                      </button>
                      <button
                        onClick={() => { setAddingNote(null); setNoteText('') }}
                        style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', background: 'transparent', border: `1px solid ${border}`, color: textMuted, fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'inherit' }}
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  {/* Notes list */}
                  {expandedNotes.has(customer.id) && (
                    <div style={{ borderTop: `1px solid ${border}`, padding: '0.5rem 1rem' }}>
                      {!customer.customer_notes?.length ? (
                        <p style={{ color: textMuted, fontSize: '0.78rem', padding: '0.5rem 0' }}>No notes yet.</p>
                      ) : (
                        [...customer.customer_notes]
                          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                          .map(note => (
                            <div key={note.id} style={{ display: 'flex', gap: '0.75rem', padding: '0.4rem 0', borderBottom: `1px solid rgba(125,211,212,0.05)` }}>
                              <span style={{ fontSize: '0.65rem', color: textMuted, whiteSpace: 'nowrap', paddingTop: '2px', minWidth: '70px' }}>
                                {new Date(note.created_at).toLocaleDateString()}
                              </span>
                              <span style={{ fontSize: '0.82rem', color: textPrimary }}>{note.note}</span>
                            </div>
                          ))
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ textAlign: 'center', padding: '1.5rem', borderTop: `1px solid rgba(125,211,212,0.08)`, marginTop: '3rem' }}>
        <p style={{ color: textMuted, fontSize: '0.7rem', letterSpacing: '0.08em' }}>
          BlueTubeTV · Blue Ring Holdings LLC
        </p>
      </footer>
    </main>
  )
}
