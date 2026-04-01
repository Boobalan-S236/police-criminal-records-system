import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import api from '../utils/api'
import FaceCapture from '../components/FaceCapture'

function formatFileSize(bytes) {
  if (!bytes) return '0 B'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function formatDate(timestamp) {
  if (!timestamp) return '—'
  try {
    return new Date(timestamp).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    })
  } catch { return '—' }
}

export default function DecryptPage() {
  const [myFiles, setMyFiles]         = useState([])
  const [receivedFiles, setReceivedFiles] = useState([])
  const [loading, setLoading]         = useState(true)
  const [showModal, setShowModal]     = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [storedImageUrl, setStoredImageUrl] = useState(null)
  const [verifying, setVerifying]     = useState(false)

  useEffect(() => {
    fetchFiles()
  }, [])

  const fetchFiles = async () => {
    setLoading(true)
    try {
      const [myRes, recRes] = await Promise.all([
        api.get('/api/files/my-files'),
        api.get('/api/files/received'),
      ])
      setMyFiles(myRes.data.data || [])
      setReceivedFiles(recRes.data.data || [])
    } catch (err) {
      toast.error('Failed to load files')
    } finally {
      setLoading(false)
    }
  }

  const handleDecryptClick = async (file) => {
    setSelectedFile(file)
    setVerifying(true)
    try {
      const faceRes = await api.get('/api/face/image', { responseType: 'blob' })
      const url = URL.createObjectURL(faceRes.data)
      setStoredImageUrl(url)
      setShowModal(true)
    } catch (err) {
      toast.error('Could not load face data. Try again.')
    } finally {
      setVerifying(false)
    }
  }

  const handleFaceVerified = async (matched, matchScore) => {
    if (!matched) {
      toast.error('Face verification failed. Access denied.')
      closeModal()
      return
    }
    try {
      await api.post('/api/face/verify', { matched: true, matchScore })

      // Download the decrypted file as blob
      const res = await api.get(`/api/files/decrypt/${selectedFile.id}`, {
        responseType: 'blob'
      })

      // Auto-download
      const url = URL.createObjectURL(res.data)
      const a = document.createElement('a')
      a.href = url
      a.download = selectedFile.originalFileName || 'decrypted-file'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success('File decrypted and downloaded!')
      closeModal()

      // Remove file from list (backend deletes it after download)
      setMyFiles(prev => prev.filter(f => f.id !== selectedFile.id))
      setReceivedFiles(prev => prev.filter(f => f.id !== selectedFile.id))

    } catch (err) {
      toast.error(err.response?.data?.message || 'Decryption failed')
      closeModal()
    }
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedFile(null)
    if (storedImageUrl) URL.revokeObjectURL(storedImageUrl)
    setStoredImageUrl(null)
  }

  const FileCard = ({ file }) => (
    <div
      className="card"
      style={{
        padding: '1.25rem 1.5rem',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: '1rem',
        marginBottom: '0.75rem',
        transition: 'border-color 0.2s',
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(251,191,36,0.3)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(251,191,36,0.15)'}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: 0 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 8, flexShrink: 0,
          background: 'rgba(251,191,36,0.09)',
          border: '1px solid rgba(251,191,36,0.18)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.1rem'
        }}>🔐</div>
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontFamily: 'IBM Plex Mono,monospace', fontSize: '0.85rem',
            color: '#e2e8f0', overflow: 'hidden',
            textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 280
          }}>
            {file.originalFileName || 'Unknown file'}
          </div>
          <div style={{
            fontSize: '0.72rem', color: 'rgba(226,232,240,0.35)',
            fontFamily: 'IBM Plex Mono,monospace', marginTop: '0.2rem'
          }}>
            {formatDate(file.uploadedAt)} · {formatFileSize(file.fileSize)}
          </div>
        </div>
      </div>

      <button
        onClick={() => handleDecryptClick(file)}
        disabled={verifying}
        style={{
          background: 'linear-gradient(135deg,#f59e0b,#fbbf24)',
          color: '#020818', border: 'none', borderRadius: 7,
          padding: '0.5rem 1.1rem', cursor: 'pointer',
          fontFamily: 'Exo 2,sans-serif', fontWeight: 700,
          fontSize: '0.78rem', letterSpacing: '0.06em',
          textTransform: 'uppercase', flexShrink: 0,
          transition: 'box-shadow 0.2s',
          opacity: verifying ? 0.6 : 1,
        }}
        onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 18px rgba(251,191,36,0.45)'}
        onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
      >
        🔓 Decrypt
      </button>
    </div>
  )

  const SectionHeader = ({ title, count }) => (
    <div style={{
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', marginBottom: '1rem'
    }}>
      <h2 style={{
        fontFamily: 'Exo 2,sans-serif', fontWeight: 700,
        fontSize: '1.05rem', color: '#e2e8f0'
      }}>{title}</h2>
      <span style={{
        background: 'rgba(251,191,36,0.1)',
        border: '1px solid rgba(251,191,36,0.2)',
        borderRadius: 100, padding: '0.2rem 0.75rem',
        fontFamily: 'IBM Plex Mono,monospace',
        fontSize: '0.75rem', color: '#fbbf24'
      }}>{count} files</span>
    </div>
  )

  return (
    <div className="animate-fade-up">
      {/* Page Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'Exo 2,sans-serif', fontWeight: 800, fontSize: '1.75rem', color: '#e2e8f0' }}>
          Decrypt Files
        </h1>
        <p style={{ fontSize: '0.88rem', color: 'rgba(226,232,240,0.4)', marginTop: '0.3rem' }}>
          Face verification required to decrypt and download files.
        </p>
      </div>

      {/* Loading shimmer */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1,2,3].map(i => (
            <div key={i} className="shimmer"
              style={{ height: 72, borderRadius: 10 }} />
          ))}
        </div>
      )}

      {!loading && (
        <>
          {/* My Files Section */}
          <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <SectionHeader title="My Encrypted Files" count={myFiles.length} />
            {myFiles.length === 0
              ? <div style={{ textAlign: 'center', padding: '2rem', fontFamily: 'IBM Plex Mono,monospace', fontSize: '0.82rem', color: 'rgba(226,232,240,0.25)' }}>
                  No encrypted files yet. Go to Encrypt to upload files.
                </div>
              : myFiles.map(file => <FileCard key={file.id} file={file} />)
            }
          </div>

          {/* Received Files Section */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <SectionHeader title="Received Files" count={receivedFiles.length} />
            {receivedFiles.length === 0
              ? <div style={{ textAlign: 'center', padding: '2rem', fontFamily: 'IBM Plex Mono,monospace', fontSize: '0.82rem', color: 'rgba(226,232,240,0.25)' }}>
                  No files received yet.
                </div>
              : receivedFiles.map(file => <FileCard key={file.id} file={file} />)
            }
          </div>
        </>
      )}

      {/* Face Verify Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(2,8,24,0.92)',
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1rem'
        }}>
          <div className="card animate-fade-up" style={{
            width: '100%', maxWidth: 520,
            padding: '2rem', textAlign: 'center'
          }}>
            {/* Modal Header */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔓</div>
              <h2 style={{ fontFamily: 'Exo 2,sans-serif', fontWeight: 800, fontSize: '1.3rem', color: '#e2e8f0', marginBottom: '0.4rem' }}>
                Face Verification Required
              </h2>
              <p style={{ fontSize: '0.83rem', color: 'rgba(226,232,240,0.45)', lineHeight: 1.5 }}>
                Verify your identity to decrypt:
                <span style={{ display: 'block', fontFamily: 'IBM Plex Mono,monospace', color: '#fbbf24', marginTop: '0.3rem', fontSize: '0.82rem' }}>
                  {selectedFile?.originalFileName}
                </span>
              </p>
            </div>

            <FaceCapture
              mode="verify"
              storedImageUrl={storedImageUrl}
              onVerified={handleFaceVerified}
            />

            {/* Cancel Button */}
            <button
              onClick={closeModal}
              style={{
                marginTop: '1rem', background: 'transparent',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(226,232,240,0.4)', borderRadius: 7,
                padding: '0.5rem 1.5rem', cursor: 'pointer',
                fontFamily: 'Exo 2,sans-serif', fontSize: '0.78rem',
                fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}