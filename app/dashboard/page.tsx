import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getStats(supabase: any, clientSlug: string) {
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const [pvWeek, pvMonth, chatWeek, resWeek, pending] = await Promise.all([
    supabase
      .from('canonical_events').select('*', { count: 'exact', head: true })
      .eq('client_slug', clientSlug).eq('event_type', 'page.view').gte('occurred_at', weekAgo),
    supabase
      .from('canonical_events').select('*', { count: 'exact', head: true })
      .eq('client_slug', clientSlug).eq('event_type', 'page.view').gte('occurred_at', monthAgo),
    supabase
      .from('canonical_events').select('*', { count: 'exact', head: true })
      .eq('client_slug', clientSlug).eq('event_type', 'chat.message').gte('occurred_at', weekAgo),
    supabase
      .from('reservations').select('*', { count: 'exact', head: true })
      .eq('client_slug', clientSlug).gte('created_at', weekAgo),
    supabase
      .from('reservations').select('*')
      .eq('client_slug', clientSlug).eq('status', 'pending')
      .order('created_at', { ascending: false }).limit(10),
  ])

  return {
    pageViewsWeek: pvWeek.count ?? 0,
    pageViewsMonth: pvMonth.count ?? 0,
    chatWeek: chatWeek.count ?? 0,
    reservationsWeek: resWeek.count ?? 0,
    pendingReservations: pending.data ?? [],
  }
}

export default async function SeabirdDashboard() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key || url.includes('placeholder')) {
    return (
      <main style={{ background: '#060e1a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ color: '#8faab0', textAlign: 'center' }}>
          <p>Dashboard not configured.</p>
          <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>Set SUPABASE_SERVICE_ROLE_KEY in .env.local</p>
        </div>
      </main>
    )
  }

  const supabase = createClient(url, key)
  const stats = await getStats(supabase, 'seabird')

  const statCards = [
    { label: 'Page Views', sub: 'This Week', value: stats.pageViewsWeek, accent: '#7dd3d4' },
    { label: 'Page Views', sub: 'This Month', value: stats.pageViewsMonth, accent: '#7dd3d4' },
    { label: 'Chatbot Conversations', sub: 'This Week', value: stats.chatWeek, accent: '#4ade80' },
    { label: 'Reservation Requests', sub: 'This Week', value: stats.reservationsWeek, accent: '#f59e0b' },
  ]

  return (
    <main style={{ background: '#060e1a', minHeight: '100vh', fontFamily: "'Inter', system-ui, sans-serif", color: '#e2f0f0', padding: '0 0 4rem' }}>
      {/* HEADER */}
      <header style={{ borderBottom: '1px solid rgba(125,211,212,0.1)', padding: '1.5rem 2rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#e2f0f0', margin: 0 }}>
            Seabird Restaurant · Owner Dashboard
          </h1>
          <p style={{ fontSize: '0.72rem', color: '#8faab0', marginTop: '4px', letterSpacing: '0.05em' }}>
            Updated in real time · Powered by BlueTubeTV
          </p>
        </div>
        <div style={{ fontSize: '0.7rem', color: '#8faab0', textAlign: 'right' }}>
          <div>1 S. Front St · Wilmington, NC</div>
          <div style={{ marginTop: '2px' }}>(910) 769-5996</div>
        </div>
      </header>

      <div style={{ padding: '2rem' }}>
        {/* STAT CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
          {statCards.map((card, i) => (
            <div key={i} style={{ background: '#0d1e30', border: '1px solid rgba(125,211,212,0.1)', borderRadius: '10px', padding: '1.25rem 1.5rem' }}>
              <div style={{ fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8faab0', marginBottom: '0.5rem' }}>
                {card.label}<br/><span style={{ color: card.accent, fontSize: '0.6rem' }}>{card.sub}</span>
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: 700, color: card.accent, lineHeight: 1 }}>
                {card.value.toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        {/* PENDING RESERVATIONS */}
        <div>
          <h2 style={{ fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8faab0', marginBottom: '1rem', fontWeight: 600 }}>
            Pending Reservations
          </h2>
          {stats.pendingReservations.length === 0 ? (
            <div style={{ background: '#0d1e30', border: '1px solid rgba(125,211,212,0.1)', borderRadius: '10px', padding: '2rem', textAlign: 'center', color: '#8faab0', fontSize: '0.85rem' }}>
              No pending reservations
            </div>
          ) : (
            <div style={{ background: '#0d1e30', border: '1px solid rgba(125,211,212,0.1)', borderRadius: '10px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(125,211,212,0.1)' }}>
                    {['Name', 'Party', 'Date', 'Time', 'Phone', 'Notes', 'Status'].map(h => (
                      <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#8faab0', fontWeight: 600, fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stats.pendingReservations.map((r: any) => (
                    <tr key={r.id} style={{ borderBottom: '1px solid rgba(125,211,212,0.06)' }}>
                      <td style={{ padding: '0.75rem 1rem', color: '#e2f0f0' }}>{r.name}</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#7dd3d4', textAlign: 'center' }}>{r.party_size}</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#e2f0f0' }}>{r.date}</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#e2f0f0' }}>{r.time}</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#8faab0' }}>{r.phone}</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#8faab0', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.notes || '—'}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.06em', background: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.25)' }}>
                          PENDING
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ textAlign: 'center', padding: '1.5rem', borderTop: '1px solid rgba(125,211,212,0.08)', marginTop: '3rem' }}>
        <p style={{ color: '#8faab0', fontSize: '0.7rem', letterSpacing: '0.08em' }}>
          BlueTubeTV · Blue Ring Holdings LLC
        </p>
      </footer>
    </main>
  )
}
