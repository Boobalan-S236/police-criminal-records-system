 import { useState, useRef } from 'react'
import { toast } from 'react-toastify'
import api from '../utils/api'

function formatFileSize(bytes) {
  if (!bytes) return '0 B'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

export default function EncryptPage() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef(null)

  const handleDragOver = (e) => { e.preventDefault(); setDragging(true) }
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
    if (!selectedFile) { toast.warn('Please select a file first'); return }
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      const res = await api.post('/api/files/encrypt', formData)
      if (res.data.success) {
        toast.success(res.data.message || 'File encrypted successfully!')
        setSelectedFile(null)
        fileInputRef.current.value = ''
      } else {
        toast.error(res.data.message || 'Encryption failed')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Encryption failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-up">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'Exo 2,sans-serif', fontWeight: 800, fontSize: '1.75rem', color: '#e2e8f0' }}>
          Encrypt File
        </h1>
        <p style={{ fontSize: '0.88rem', color: 'rgba(226,232,240,0.4)', marginTop: '0.3rem' }}>
          Upload a file to encrypt it with AES-256 and store it securely.
        </p>
      </div>

      <div className="card" style={{ padding: '2rem', maxWidth: 600 }}>
        <label className="field-label">Select File</label>

        {/* Upload Zone */}
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
            padding: '2.5rem 1.5rem',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
            background: dragging ? 'rgba(251,191,36,0.05)' : 'rgba(4,13,36,0.5)',
            marginBottom: '1.5rem',
          }}
        >
          {!selectedFile ? (
            <>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📁</div>
              <div style={{ fontFamily: 'Exo 2,sans-serif', fontWeight: 600, fontSize: '0.95rem', color: 'rgba(226,232,240,0.7)', marginBottom: '0.35rem' }}>
                Drop file here or click to browse
              </div>
              <div style={{ fontSize: '0.78rem', color: 'rgba(226,232,240,0.3)', fontFamily: 'IBM Plex Mono,monospace' }}>
                All file types supported · Max size 50MB
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
              <div style={{ fontFamily: 'IBM Plex Mono,monospace', fontSize: '0.88rem', color: '#e2e8f0', marginBottom: '0.3rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 400, display: 'inline-block' }}>
                {selectedFile.name}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'rgba(251,191,36,0.7)', fontFamily: 'IBM Plex Mono,monospace', marginBottom: '0.75rem' }}>
                {formatFileSize(selectedFile.size)}
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setSelectedFile(null); fileInputRef.current.value = '' }}
                style={{ background: 'transparent', border: '1px solid rgba(248,113,113,0.3)', color: 'rgba(248,113,113,0.7)', borderRadius: 6, padding: '0.3rem 0.85rem', fontSize: '0.75rem', fontFamily: 'Exo 2,sans-serif', cursor: 'pointer', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}
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

        {/* Submit Button */}
        <button
          className="btn-primary"
          onClick={handleSubmit}
          disabled={!selectedFile || loading}
        >
          {loading
            ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <span className="spinner" /> Encrypting...
              </span>
            : '🔐 Encrypt & Upload'
          }
        </button>

        {/* Info Box */}
        <div style={{ marginTop: '1.25rem', background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.12)', borderRadius: 8, padding: '0.85rem 1rem', display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
          <span style={{ fontSize: '0.9rem', flexShrink: 0 }}>ℹ️</span>
          <p style={{ fontSize: '0.78rem', color: 'rgba(226,232,240,0.45)', lineHeight: 1.5, margin: 0 }}>
            Your file is encrypted with AES-256. The encryption key is secured using your RSA public key — only you can decrypt it.
          </p>
        </div>
      </div>
    </div>
  )
}