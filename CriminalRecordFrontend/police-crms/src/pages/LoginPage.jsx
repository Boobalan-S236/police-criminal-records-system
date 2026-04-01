import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

import AuthLayout from '../components/AuthLayout'
import FaceCapture from '../components/FaceCapture'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'

function StepIndicator({ currentStep }) {
  const circleBase = {
    width: 36,
    height: 36,
    borderRadius: 18,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 600,
  }

  const line = {
    height: 2,
    flex: 1,
    background: 'rgba(226,232,240,0.06)',
    margin: '0 12px',
  }

  const steps = [1, 2, 3]

  return (
    <div style={{display:'flex',alignItems:'center',marginBottom:'1.5rem'}}>
      {steps.map((s, idx) => {
        const done = idx < currentStep
        const active = idx === currentStep
        const bg = (done || active) ? '#fbbf24' : 'rgba(226,232,240,0.06)'
        const color = (done || active) ? '#020818' : '#e2e8f0'
        const content = done ? '✓' : String(s)

        return (
          <span key={s} style={{display:'flex',alignItems:'center',flex: (s===1||s===3)?'none':0}}>
            <div style={{...circleBase, background: bg, color}} aria-current={active ? 'step' : undefined}>
              {content}
            </div>
            {s !== steps.length && <div style={line} />}
          </span>
        )
      })}
    </div>
  )
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [currentStep, setCurrentStep] = useState(0)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [storedImageUrl, setStoredImageUrl] = useState(null)

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.post('/api/auth/login', { username, password })

      if (!res.data.success) {
        toast.error(res.data.message)
        return
      }

      // Save token for subsequent requests (send-otp requires Authorization header)
      localStorage.setItem('token', res.data.token)

      // Ask backend to send OTP to registered email
      await api.post('/api/auth/send-otp')

      toast.success('OTP sent to your registered email!')
      setCurrentStep(1)

    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleOtpSubmit = async () => {
    setLoading(true)
    try {
      const res = await api.post('/api/auth/verify-otp', { otp })

      if (!res.data.success) {
        toast.error(res.data.message)
        return
      }

      // Fetch stored face image as a blob so face-api can load it
      const faceRes = await api.get('/api/face/image', { responseType: 'blob' })

      // Revoke previous object URL if present
      if (storedImageUrl) {
        try { URL.revokeObjectURL(storedImageUrl) } catch (e) { /* ignore */ }
      }

      const imageUrl = URL.createObjectURL(faceRes.data)
      setStoredImageUrl(imageUrl)

      toast.success('OTP verified! Now verify your face.')
      setCurrentStep(2)

    } catch (err) {
      toast.error(err.response?.data?.message || 'OTP verification failed')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    setLoading(true)
    try {
      await api.post('/api/auth/send-otp')
      toast.info('OTP resent to your email!')
      setOtp('')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleFaceVerified = async (matched, matchScore) => {
    // matched: boolean, matchScore: number 0-1
    if (!matched) {
      toast.error('Face verification failed. Access denied.')
      // Reset to step 0 so user can try again
      setCurrentStep(0)
      setUsername('')
      setPassword('')
      setOtp('')
      if (storedImageUrl) {
        try { URL.revokeObjectURL(storedImageUrl) } catch (e) {}
      }
      setStoredImageUrl(null)
      return
    }

    try {
      const res = await api.post('/api/face/verify', {
        matched: true,
        matchScore: matchScore,
      })

      if (!res.data.success) {
        toast.error(res.data.message)
        return
      }

      const token = localStorage.getItem('token')

      // login() saves token to context state + localStorage
      login(token, {
        username: username,
        policeStation: '',
        adminId: null,
      })

      // Revoke stored image object URL to free memory
      if (storedImageUrl) {
        try { URL.revokeObjectURL(storedImageUrl) } catch (e) {}
      }

      toast.success('Access granted! Welcome, Officer.')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Face verification error')
    }
  }

  useEffect(() => {
    return () => {
      // Clean up object URL when component unmounts
      if (storedImageUrl) {
        try { URL.revokeObjectURL(storedImageUrl) } catch (e) {}
      }
    }
  }, [storedImageUrl])

  return (
    <AuthLayout title="Officer Login" subtitle="Secure three-factor authentication">
      <div style={{width:420,maxWidth:'92vw'}}>
        <StepIndicator currentStep={currentStep} />

        {currentStep === 0 && (
          <form onSubmit={handlePasswordSubmit}>
            <div style={{marginBottom:'1rem'}}>
              <label className="field-label">Username</label>
              <input
                className="input-field"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="officer_username"
                required
                autoFocus
              />
            </div>

            <div style={{marginBottom:'1.5rem'}}>
              <label className="field-label">Password</label>
              <input
                className="input-field"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
              />
            </div>

            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? (
                <span style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'0.5rem'}}>
                  <span className="spinner" /> Authenticating...
                </span>
              ) : (
                'Continue →'
              )}
            </button>

            <p style={{textAlign:'center',marginTop:'1.5rem',color:'rgba(226,232,240,0.4)',fontSize:'0.85rem'}}>
              No account?{' '}
              <Link to="/signup" style={{color:'#fbbf24',textDecoration:'none'}}>Register here</Link>
            </p>
          </form>
        )}

        {currentStep === 1 && (
          <div>
            <div style={{
              background:'rgba(251,191,36,0.06)', border:'1px solid rgba(251,191,36,0.15)',
              borderRadius:8, padding:'0.85rem 1rem', marginBottom:'1.5rem',
              display:'flex', alignItems:'flex-start', gap:'0.6rem'
            }}>
              <span style={{fontSize:'1rem', flexShrink:0}}>📧</span>
              <p style={{fontSize:'0.83rem', color:'rgba(226,232,240,0.6)', lineHeight:1.5, margin:0}}>
                OTP has been sent to your registered email address. Valid for 5 minutes.
              </p>
            </div>

            <div style={{marginBottom:'1.5rem'}}>
              <label className="field-label">One-Time Password</label>
              <input
                className="input-field"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0,6))}
                placeholder="000000"
                maxLength={6}
                required
                autoFocus
                style={{
                  textAlign:'center',
                  fontSize:'1.8rem',
                  letterSpacing:'0.6rem',
                  fontFamily:'IBM Plex Mono, monospace',
                  paddingLeft:'1.5rem'
                }}
              />
            </div>

            <div>
              <button
                type="button"
                className="btn-primary"
                disabled={loading || otp.length < 6}
                onClick={handleOtpSubmit}
              >
                {loading ? (
                  <span style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'0.5rem'}}>
                    <span className="spinner" /> Verifying...
                  </span>
                ) : (
                  'Verify OTP →'
                )}
              </button>

              <button
                type="button"
                className="btn-secondary"
                style={{marginTop:'0.75rem'}}
                disabled={loading}
                onClick={handleResendOtp}
              >
                Resend OTP
              </button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div>
            <p style={{
              textAlign:'center', marginBottom:'1.25rem',
              color:'rgba(226,232,240,0.5)', fontSize:'0.85rem', lineHeight:1.5
            }}>
              Look directly at the camera. Make sure your face is well-lit and clearly visible.
            </p>

            <FaceCapture
              mode="verify"
              storedImageUrl={storedImageUrl}
              onVerified={handleFaceVerified}
            />
          </div>
        )}
      </div>
    </AuthLayout>
  )
}
