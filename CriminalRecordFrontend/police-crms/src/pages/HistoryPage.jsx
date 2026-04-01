import { useState, useEffect } from 'react'
import api from '../utils/api'
import { toast } from 'react-toastify'

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
  const map = {
    ENCRYPTED: 'badge-amber',
    SHARED:    'badge-blue',
    DECRYPTED: 'badge-green',
  }
  return (
    <span className={`badge ${map[action] || 'badge-gray'}`}>
      {action || '—'}
    </span>
  )
}

export default function HistoryPage() {
  const [history, setHistory]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [actionFilter, setActionFilter] = useState('ALL')
  const [currentPage, setCurrentPage]   = useState(1)
  const PER_PAGE = 10

  useEffect(() => {
    api.get('/api/history/my')
      .then(res => setHistory(res.data.data || []))
      .catch(() => toast.error('Failed to load history'))
      .finally(() => setLoading(false))
  }, [])

  // Client-side filter
  const filtered = history.filter(row => {
    const matchSearch =
      !search ||
      row.encryptedFile?.originalFileName?.toLowerCase().includes(search.toLowerCase()) ||
      row.description?.toLowerCase().includes(search.toLowerCase())
    const matchAction =
      actionFilter === 'ALL' || row.action === actionFilter
    return matchSearch && matchAction
  })

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paginated  = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE)

  const handleFilterChange = (f) => {
    setActionFilter(f)
    setCurrentPage(1)
  }

  const handleSearch = (e) => {
    setSearch(e.target.value)
    setCurrentPage(1)
  }

  const FILTERS = ['ALL', 'ENCRYPTED', 'SHARED', 'DECRYPTED']

  return (
    <div className="animate-fade-up">

      {/* Page Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'Exo 2,sans-serif', fontWeight: 800, fontSize: '1.75rem', color: '#e2e8f0' }}>
          Audit History
        </h1>
        <p style={{ fontSize: '0.88rem', color: 'rgba(226,232,240,0.4)', marginTop: '0.3rem' }}>
          Complete log of all file operations performed by your account.
        </p>
      </div>

      {/* Search + Filter Bar */}
      <div style={{
        display: 'flex', gap: '1rem', marginBottom: '1.5rem',
        flexWrap: 'wrap', alignItems: 'center'
      }}>
        {/* Search input */}
        <input
          className="input-field"
          style={{ maxWidth: 320, flex: 1 }}
          type="text"
          placeholder="Search by filename or description..."
          value={search}
          onChange={handleSearch}
        />

        {/* Action filter pills */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => handleFilterChange(f)}
              style={{
                fontFamily: 'Exo 2,sans-serif', fontWeight: 600,
                fontSize: '0.72rem', letterSpacing: '0.08em',
                textTransform: 'uppercase', cursor: 'pointer',
                padding: '0.4rem 0.9rem', borderRadius: 100,
                border: actionFilter === f
                  ? '1px solid rgba(251,191,36,0.7)'
                  : '1px solid rgba(255,255,255,0.1)',
                background: actionFilter === f
                  ? 'rgba(251,191,36,0.12)'
                  : 'transparent',
                color: actionFilter === f
                  ? '#fbbf24'
                  : 'rgba(226,232,240,0.4)',
                transition: 'all 0.2s',
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Record count */}
        <span style={{
          marginLeft: 'auto',
          fontFamily: 'IBM Plex Mono,monospace',
          fontSize: '0.75rem',
          color: 'rgba(226,232,240,0.3)',
        }}>
          {filtered.length} records
        </span>
      </div>

      {/* Table Card */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>

        {/* Loading shimmer */}
        {loading && (
          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[1,2,3,4,5].map(i => (
              <div key={i} className="shimmer" style={{ height: 44, borderRadius: 6 }} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '4rem 2rem',
            fontFamily: 'IBM Plex Mono,monospace',
            fontSize: '0.82rem', color: 'rgba(226,232,240,0.25)'
          }}>
            {history.length === 0
              ? 'No activity yet. Start by encrypting a file.'
              : 'No records match your search.'}
          </div>
        )}

        {/* Table */}
        {!loading && filtered.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{
                  borderBottom: '1px solid rgba(251,191,36,0.1)',
                  background: 'rgba(4,13,36,0.6)'
                }}>
                  {['#', 'File Name', 'Action', 'Description', 'Date & Time'].map(h => (
                    <th key={h} style={{
                      fontFamily: 'Exo 2,sans-serif', fontSize: '0.65rem',
                      fontWeight: 600, letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: 'rgba(251,191,36,0.5)',
                      textAlign: 'left',
                      padding: '0.85rem 1.25rem',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((row, i) => (
                  <tr
                    key={row.id || i}
                    style={{
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(251,191,36,0.03)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* Row number */}
                    <td style={{
                      padding: '0.85rem 1.25rem',
                      fontFamily: 'IBM Plex Mono,monospace',
                      fontSize: '0.72rem',
                      color: 'rgba(226,232,240,0.25)',
                    }}>
                      {(currentPage - 1) * PER_PAGE + i + 1}
                    </td>

                    {/* File name */}
                    <td style={{
                      padding: '0.85rem 1.25rem',
                      fontFamily: 'IBM Plex Mono,monospace',
                      fontSize: '0.82rem', color: '#e2e8f0',
                      maxWidth: 200, overflow: 'hidden',
                      textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {row.encryptedFile?.originalFileName || '—'}
                    </td>

                    {/* Action badge */}
                    <td style={{ padding: '0.85rem 1.25rem' }}>
                      <ActionBadge action={row.action} />
                    </td>

                    {/* Description */}
                    <td style={{
                      padding: '0.85rem 1.25rem',
                      fontSize: '0.82rem',
                      color: 'rgba(226,232,240,0.5)',
                      maxWidth: 280, overflow: 'hidden',
                      textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {row.description || '—'}
                    </td>

                    {/* Timestamp */}
                    <td style={{
                      padding: '0.85rem 1.25rem',
                      fontFamily: 'IBM Plex Mono,monospace',
                      fontSize: '0.75rem',
                      color: 'rgba(226,232,240,0.35)',
                      whiteSpace: 'nowrap',
                    }}>
                      {formatDate(row.timestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 1.25rem',
            borderTop: '1px solid rgba(251,191,36,0.08)',
          }}>
            <span style={{
              fontFamily: 'IBM Plex Mono,monospace',
              fontSize: '0.75rem', color: 'rgba(226,232,240,0.3)'
            }}>
              Page {currentPage} of {totalPages}
            </span>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(251,191,36,0.2)',
                  color: currentPage === 1 ? 'rgba(226,232,240,0.2)' : '#fbbf24',
                  borderRadius: 6, padding: '0.35rem 0.85rem',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  fontFamily: 'Exo 2,sans-serif', fontSize: '0.78rem',
                  fontWeight: 600,
                }}
              >
                ← Prev
              </button>

              {/* Page number pills */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .reduce((acc, p, idx, arr) => {
                  if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...')
                  acc.push(p)
                  return acc
                }, [])
                .map((p, idx) => p === '...'
                  ? <span key={`dots-${idx}`} style={{ color: 'rgba(226,232,240,0.25)', padding: '0 0.25rem', fontSize: '0.78rem' }}>…</span>
                  : <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      style={{
                        background: currentPage === p ? 'linear-gradient(135deg,#f59e0b,#fbbf24)' : 'transparent',
                        border: currentPage === p ? 'none' : '1px solid rgba(251,191,36,0.2)',
                        color: currentPage === p ? '#020818' : 'rgba(226,232,240,0.5)',
                        borderRadius: 6, padding: '0.35rem 0.65rem',
                        cursor: 'pointer',
                        fontFamily: 'Exo 2,sans-serif',
                        fontSize: '0.78rem', fontWeight: 700,
                        minWidth: 32,
                      }}
                    >{p}</button>
                )
              }

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(251,191,36,0.2)',
                  color: currentPage === totalPages ? 'rgba(226,232,240,0.2)' : '#fbbf24',
                  borderRadius: 6, padding: '0.35rem 0.85rem',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  fontFamily: 'Exo 2,sans-serif', fontSize: '0.78rem',
                  fontWeight: 600,
                }}
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}