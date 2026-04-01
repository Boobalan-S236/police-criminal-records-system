import { useState, useEffect } from 'react'
import api from '../utils/api'

function formatDate(timestamp) {
  if (!timestamp) return '—'
  try {
    return new Date(timestamp).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    })
  } catch { return '—' }
}

function ActionBadge({ action }) {
  const map = { ENCRYPTED: 'badge-amber', SHARED: 'badge-blue', DECRYPTED: 'badge-green' }
  return <span className={`badge ${map[action] || 'badge-gray'}`}>{action || '—'}</span>
}

function StatCard({ icon, label, value }) {
  return (
    <div
      className="card"
      style={{ padding:'1.5rem', display:'flex', alignItems:'center', gap:'1.25rem', cursor:'default', transition:'transform 0.25s, border-color 0.25s, box-shadow 0.25s' }}
      onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.borderColor='rgba(251,191,36,0.35)'; e.currentTarget.style.boxShadow='0 8px 30px rgba(251,191,36,0.08)' }}
      onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.borderColor='rgba(251,191,36,0.15)'; e.currentTarget.style.boxShadow='none' }}
    >
      <div style={{ width:50, height:50, borderRadius:10, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(251,191,36,0.09)', border:'1px solid rgba(251,191,36,0.18)', fontSize:'1.4rem' }}>
        {icon}
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:'0.2rem' }}>
        <div style={{ fontFamily:'Exo 2,sans-serif', fontWeight:800, fontSize:'2.2rem', lineHeight:1, color:'#fbbf24' }}>{value ?? 0}</div>
        <div style={{ fontFamily:'Exo 2,sans-serif', fontSize:'0.68rem', fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(226,232,240,0.4)' }}>{label}</div>
      </div>
    </div>
  )
}

function ActivityTable({ history, loading }) {
  return (
    <div className="card" style={{ padding:'1.75rem' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.5rem' }}>
        <span style={{ fontFamily:'Exo 2,sans-serif', fontWeight:700, fontSize:'1.05rem', color:'#e2e8f0' }}>Recent Activity</span>
        <span style={{ background:'rgba(251,191,36,0.1)', border:'1px solid rgba(251,191,36,0.2)', borderRadius:100, padding:'0.2rem 0.75rem', fontFamily:'IBM Plex Mono,monospace', fontSize:'0.75rem', color:'#fbbf24' }}>
          {history.length} records
        </span>
      </div>

      {loading && (
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {[1,2,3].map(i => <div key={i} className="shimmer" style={{ height:44, borderRadius:6 }} />)}
        </div>
      )}

      {!loading && history.length === 0 && (
        <div style={{ textAlign:'center', padding:'3rem', fontFamily:'IBM Plex Mono,monospace', fontSize:'0.82rem', color:'rgba(226,232,240,0.25)' }}>
          No activity yet. Start by encrypting a file.
        </div>
      )}

      {!loading && history.length > 0 && (
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ borderBottom:'1px solid rgba(251,191,36,0.1)' }}>
                {['File Name','Action','Description','Date & Time'].map(h => (
                  <th key={h} style={{ fontFamily:'Exo 2,sans-serif', fontSize:'0.68rem', fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(251,191,36,0.5)', textAlign:'left', padding:'0.5rem 0.75rem', paddingBottom:'0.85rem' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {history.slice(0,8).map((row, i) => (
                <tr key={row.id || i}
                  style={{ borderBottom:'1px solid rgba(255,255,255,0.04)', transition:'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background='rgba(251,191,36,0.03)'}
                  onMouseLeave={e => e.currentTarget.style.background='transparent'}
                >
                  <td style={{ padding:'0.75rem', fontFamily:'IBM Plex Mono,monospace', fontSize:'0.82rem', color:'#e2e8f0', maxWidth:180, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {row.encryptedFile?.originalFileName || '—'}
                  </td>
                  <td style={{ padding:'0.75rem' }}>
                    <ActionBadge action={row.action} />
                  </td>
                  <td style={{ padding:'0.75rem', fontSize:'0.83rem', color:'rgba(226,232,240,0.55)', maxWidth:260, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {row.description || '—'}
                  </td>
                  <td style={{ padding:'0.75rem', fontFamily:'IBM Plex Mono,monospace', fontSize:'0.75rem', color:'rgba(226,232,240,0.4)', whiteSpace:'nowrap' }}>
                    {formatDate(row.timestamp)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default function DashboardHome() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/history/my')
      .then(res => setHistory(res.data.data || []))
      .catch(err => { console.error(err); setHistory([]) })
      .finally(() => setLoading(false))
  }, [])

  const encrypted = history.filter(h => h.action === 'ENCRYPTED').length
  const shared    = history.filter(h => h.action === 'SHARED').length
  const decrypted = history.filter(h => h.action === 'DECRYPTED').length
  const total     = history.length

  return (
    <div className="animate-fade-up">
      <div style={{ marginBottom:'2rem' }}>
        <h1 style={{ fontFamily:'Exo 2,sans-serif', fontWeight:800, fontSize:'1.75rem', color:'#e2e8f0' }}>Dashboard</h1>
        <p style={{ fontFamily:'IBM Plex Sans,sans-serif', fontSize:'0.88rem', color:'rgba(226,232,240,0.4)', marginTop:'0.3rem' }}>
          Criminal Records Management Overview
        </p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'1rem', marginBottom:'2.5rem' }}>
        <StatCard icon="🔐" label="Files Encrypted" value={encrypted} />
        <StatCard icon="📤" label="Files Shared"    value={shared}    />
        <StatCard icon="🔓" label="Decrypted"       value={decrypted} />
        <StatCard icon="📊" label="Total Actions"   value={total}     />
      </div>

      <ActivityTable history={history} loading={loading} />
    </div>
  )
}