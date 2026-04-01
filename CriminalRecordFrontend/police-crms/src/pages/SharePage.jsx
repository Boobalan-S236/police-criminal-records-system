import { useState, useEffect, useRef } from 'react'
import { toast } from 'react-toastify'
import api from '../utils/api'

function formatFileSize(bytes) {
  if (!bytes) return '0 B'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

export default function SharePage() {
  const [officers, setOfficers]       = useState([])
  const [selectedOfficer, setSelectedOfficer] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [dragging, setDragging]       = useState(false)
  const [loading, setLoading]         = useState(false)
  const [loadingOfficers, setLoadingOfficers] = useState(true)
  const fileInputRef = useRef(null)

  useEffect(() => {
    api.get('/api/files/active-admins')
      .then(res => setOfficers(res.data.data || []))
      .catch(() => toast.error('Failed to load officers'))
      .finally(() => setLoadingOfficers(false))
  }, [])

  const handleDragOver  = (e) => { e.preventDefault(); setDragging(true) }
  const handleDragLeave = (e) => { e.preventDefault(); setDragging(false) }
  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) setSelectedFile(file)
  }
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) setSelectedFile(file)
  }

  const handleSubmit = async () => {
    if (!selectedFile)    { toast.warn('Please select a file');           return }
    if (!selectedOfficer) { toast.warn('Please select a recipient officer'); return }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('receiverUsername', selectedOfficer)

      // POST /api/files/share
      // Response: { success, message, data: fileId }
      const res = await api.post('/api/files/share', formData)

      if (res.data.success) {
        toast.success(res.data.message || 'File shared successfully!')
        setSelectedFile(null)
        setSelectedOfficer('')
        fileInputRef.current.value = ''
      } else {
        toast.error(res.data.message || 'Share failed')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Share failed')
    } finally {
      setLoading(false)
    }
  }

  const canSubmit = selectedFile && selectedOfficer && !loading

  return (
    <div className="animate-fade-up">

      {/* Page Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'Exo 2,sans-serif', fontWeight: 800, fontSize: '1.75rem', color: '#e2e8f0' }}>
          Share File
        </h1>
        <p style={{ fontSize: '0.88rem', color: 'rgba(226,232,240,0.4)', marginTop: '0.3rem' }}>
          Encrypt and share a file directly with another verified officer.
        </p>
      </div>

      <div className="card" style={{ padding: '2rem', maxWidth: 620 }}>

        {/* Step 1 — Select Officer */}
        <div style={{ marginBottom: '1.75rem' }}>
          <label className="field-label">Step 1 — Select Recipient Officer</label>

          {loadingOfficers ? (
            <div className="shimmer" style={{ height: 46, borderRadius: 8 }} />
          ) : (
            <select
              value={selectedOfficer}
              onChange={e => setSelectedOfficer(e.target.value)}
              className="input-field"
              style={{ cursor: 'pointer' }}
            >
              <option value="">— Choose an officer —</option>
              {officers.map(officer => (
                <option key={officer.adminId || officer.username} value={officer.username}>
                  {officer.username}
                  {officer.policeStation ? ` · ${officer.policeStation}` : ''}
                </option>
              ))}
            </select>
          )}

          {/* Selected officer badge */}
          {selectedOfficer && (
            <div style={{
              marginTop: '0.6rem', display: 'inline-flex',
              alignItems: 'center', gap: '0.5rem',
              background: 'rgba(251,191,36,0.1)',
              border: '1px solid rgba(251,191,36,0.25)',
              borderRadius: 100, padding: '0.25rem 0.85rem',
            }}>
              <span style={{ fontSize: '0.75rem' }}>👮</span>
              <span style={{
                fontFamily: 'IBM Plex Mono,monospace', fontSize: '0.78rem',
                color: '#fbbf24'
              }}>
                {selectedOfficer}
              </span>
            </div>
          )}
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'rgba(251,191,36,0.08)', marginBottom: '1.75rem' }} />

        {/* Step 2 — Select File */}
        <div style={{ marginBottom: '1.75rem' }}>
          <label className="field-label">Step 2 — Select File to Share</label>

          <div
            onClick={() => fileInputRef.current.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{
              border: dragging
                ? '2px solid rgba(251,191,36,0.8)'
                : selectedFile
                  ? '2px solid rgba(251,191,36,0.5)'
                  : '2px dashed rgba(251,191,36,0.25)',
              borderRadius: 10,
              padding: '2rem 1.5rem',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: dragging ? 'rgba(251,191,36,0.05)' : 'rgba(4,13,36,0.5)',
            }}
          >
            {!selectedFile ? (
              <>
                <div style={{ fontSize: '2.2rem', marginBottom: '0.6rem' }}>📎</div>
                <div style={{ fontFamily: 'Exo 2,sans-serif', fontWeight: 600, fontSize: '0.92rem', color: 'rgba(226,232,240,0.7)', marginBottom: '0.3rem' }}>
                  Drop file here or click to browse
                </div>
                <div style={{ fontSize: '0.76rem', color: 'rgba(226,232,240,0.3)', fontFamily: 'IBM Plex Mono,monospace' }}>
                  File will be encrypted before sending
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
                <div style={{ fontFamily: 'IBM Plex Mono,monospace', fontSize: '0.85rem', color: '#e2e8f0', marginBottom: '0.3rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 380, display: 'inline-block' }}>
                  {selectedFile.name}
                </div>
                <div style={{ fontSize: '0.76rem', color: 'rgba(251,191,36,0.7)', fontFamily: 'IBM Plex Mono,monospace', marginBottom: '0.6rem' }}>
                  {formatFileSize(selectedFile.size)}
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setSelectedFile(null); fileInputRef.current.value = '' }}
                  style={{ background: 'transparent', border: '1px solid rgba(248,113,113,0.3)', color: 'rgba(248,113,113,0.7)', borderRadius: 6, padding: '0.28rem 0.8rem', fontSize: '0.73rem', fontFamily: 'Exo 2,sans-serif', cursor: 'pointer', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}
                >
                  ✕ Remove
                </button>
              </>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </div>

        {/* Summary box — show when both selected */}
        {selectedFile && selectedOfficer && (
          <div style={{
            marginBottom: '1.5rem',
            background: 'rgba(251,191,36,0.05)',
            border: '1px solid rgba(251,191,36,0.15)',
            borderRadius: 8, padding: '1rem',
            display: 'flex', flexDirection: 'column', gap: '0.5rem'
          }}>
            <div style={{ fontFamily: 'Exo 2,sans-serif', fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(251,191,36,0.5)', marginBottom: '0.25rem' }}>
              Share Summary
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
              <span style={{ color: 'rgba(226,232,240,0.45)' }}>File</span>
              <span style={{ fontFamily: 'IBM Plex Mono,monospace', color: '#e2e8f0', maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {selectedFile.name}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
              <span style={{ color: 'rgba(226,232,240,0.45)' }}>Recipient</span>
              <span style={{ fontFamily: 'IBM Plex Mono,monospace', color: '#fbbf24' }}>
                {selectedOfficer}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
              <span style={{ color: 'rgba(226,232,240,0.45)' }}>Size</span>
              <span style={{ fontFamily: 'IBM Plex Mono,monospace', color: 'rgba(226,232,240,0.6)' }}>
                {formatFileSize(selectedFile.size)}
              </span>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          className="btn-primary"
          onClick={handleSubmit}
          disabled={!canSubmit}
        >
          {loading
            ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <span className="spinner" /> Sharing...
              </span>
            : '📤 Encrypt & Share'
          }
        </button>

        {/* Info box */}
        <div style={{ marginTop: '1.25rem', background: 'rgba(96,165,250,0.05)', border: '1px solid rgba(96,165,250,0.12)', borderRadius: 8, padding: '0.85rem 1rem', display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
          <span style={{ fontSize: '0.9rem', flexShrink: 0 }}>🔒</span>
          <p style={{ fontSize: '0.78rem', color: 'rgba(226,232,240,0.45)', lineHeight: 1.5, margin: 0 }}>
            The file is encrypted with the recipient's RSA public key. Only they can decrypt it using their private key.
          </p>
        </div>

      </div>
    </div>
  )
}