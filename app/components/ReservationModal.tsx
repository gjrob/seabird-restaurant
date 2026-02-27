'use client'
import { useState } from 'react'

interface Props {
  isOpen: boolean
  onClose: () => void
}

const TIME_SLOTS = [
  '5:00 PM',  '5:30 PM',  '6:00 PM',  '6:30 PM',
  '7:00 PM',  '7:30 PM',  '8:00 PM',  '8:30 PM',
  '9:00 PM'
]

export default function ReservationModal({ isOpen, onClose }: Props) {
  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    party_size: '2', date: '', time: '', notes: ''
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  if (!isOpen) return null

  const today = new Date().toISOString().split('T')[0]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, party_size: parseInt(form.party_size) })
      })
      if (!res.ok) throw new Error()
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(125,211,212,0.2)',
    borderRadius: '8px',
    color: '#e8f4f4',
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'border-color 0.2s',
  }

  const labelStyle = {
    display: 'block' as const,
    color: '#7dd3d4',
    fontSize: '0.75rem',
    marginBottom: '6px',
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
  }

  return (
    <>
      {/* OVERLAY */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 50,
          background: 'rgba(6,14,26,0.88)',
          backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '16px',
        }}
      >
        {/* MODAL */}
        <div
          onClick={e => e.stopPropagation()}
          style={{
            background: 'linear-gradient(145deg, #0d1e30, #0a1620)',
            border: '1px solid rgba(125,211,212,0.15)',
            borderRadius: '16px',
            padding: '32px',
            width: '100%',
            maxWidth: '480px',
            maxHeight: '90vh',
            overflowY: 'auto',
            position: 'relative',
            boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 40px rgba(125,211,212,0.06)',
          }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: '16px', right: '16px',
              background: 'none', border: 'none',
              color: '#8faab0', fontSize: '1.3rem',
              cursor: 'pointer', lineHeight: 1,
            }}
          >✕</button>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ fontSize: '1.6rem', marginBottom: '4px' }}>
              🦪
            </div>
            <h2 style={{ color: '#e8f4f4', fontSize: '1.4rem', fontWeight: 600, margin: 0 }}>
              Reserve at Seabird
            </h2>
            <p style={{ color: '#8faab0', fontSize: '0.82rem', marginTop: '6px' }}>
              We'll confirm your reservation by phone · (910) 769-5996
            </p>
          </div>

          {status === 'success' ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>🦪</div>
              <h3 style={{ color: '#7dd3d4', fontSize: '1.2rem', marginBottom: '8px' }}>
                Request Received
              </h3>
              <p style={{ color: '#8faab0', fontSize: '0.85rem', lineHeight: 1.6 }}>
                Thank you! We'll call to confirm your reservation.
              </p>
              <button
                onClick={onClose}
                style={{
                  marginTop: '24px',
                  padding: '10px 28px',
                  background: '#7dd3d4',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#060e1a',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                }}
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Name */}
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Name *</label>
                <input
                  required
                  style={inputStyle}
                  placeholder="Your name"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>

              {/* Phone + Email row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={labelStyle}>Phone *</label>
                  <input
                    required
                    type="tel"
                    style={inputStyle}
                    placeholder="(910) 555-0000"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Email</label>
                  <input
                    type="email"
                    style={inputStyle}
                    placeholder="Optional"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  />
                </div>
              </div>

              {/* Party size + Date row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={labelStyle}>Party Size *</label>
                  <select
                    required
                    style={{ ...inputStyle, cursor: 'pointer' }}
                    value={form.party_size}
                    onChange={e => setForm(f => ({ ...f, party_size: e.target.value }))}
                  >
                    {[1,2,3,4,5,6,7,8,9,10].map(n => (
                      <option key={n} value={n} style={{ background: '#0d1e30' }}>
                        {n} {n === 1 ? 'guest' : 'guests'}
                      </option>
                    ))}
                    <option value="10+" style={{ background: '#0d1e30' }}>10+ guests</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Date *</label>
                  <input
                    required
                    type="date"
                    min={today}
                    style={{ ...inputStyle, colorScheme: 'dark' }}
                    value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  />
                </div>
              </div>

              {/* Time slots */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ ...labelStyle, marginBottom: '8px' }}>Time *</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {TIME_SLOTS.map(slot => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, time: slot }))}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        background: form.time === slot ? '#7dd3d4' : 'rgba(255,255,255,0.04)',
                        border: form.time === slot
                          ? '1px solid #7dd3d4'
                          : '1px solid rgba(125,211,212,0.2)',
                        color: form.time === slot ? '#060e1a' : '#8faab0',
                        fontWeight: form.time === slot ? 600 : 400,
                      }}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div style={{ marginBottom: '24px' }}>
                <label style={labelStyle}>Special Requests</label>
                <textarea
                  rows={2}
                  style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
                  placeholder="Allergies, celebrations, seating preferences..."
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                />
              </div>

              {status === 'error' && (
                <p style={{ color: '#f87171', fontSize: '0.82rem', marginBottom: '12px', textAlign: 'center' }}>
                  Something went wrong. Please call us at (910) 769-5996.
                </p>
              )}

              <button
                type="submit"
                disabled={status === 'loading' || !form.time}
                style={{
                  width: '100%',
                  padding: '13px',
                  background: status === 'loading' ? '#5aabac' : '#7dd3d4',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#060e1a',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s',
                  letterSpacing: '0.03em',
                }}
              >
                {status === 'loading' ? 'Sending...' : 'Request Reservation'}
              </button>

              <p style={{ textAlign: 'center', color: '#8faab0', fontSize: '0.72rem', marginTop: '12px' }}>
                We'll confirm by phone within a few hours.
              </p>
            </form>
          )}
        </div>
      </div>
    </>
  )
}
