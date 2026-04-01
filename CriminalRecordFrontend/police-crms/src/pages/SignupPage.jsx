import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

import AuthLayout from '../components/AuthLayout'
import FaceCapture from '../components/FaceCapture'
import api from '../utils/api'

export default function SignupPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState('form')
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    username: '',
    email: '',
    policeStation: '',
    policeId: '',
    aadharId: '',
    password: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.post('/api/auth/signup', form)
      const token = res.data?.data?.token
      if (token) localStorage.setItem('token', token)
      toast.success(res.data?.message || 'Account created!')
      setStep('face')
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  const handleFaceCapture = async (imageBlob) => {
    try {
      const formData = new FormData()
      formData.append('faceImage', imageBlob, 'face.jpg')

      await api.post('/api/face/save', formData)

      toast.success('Face enrolled successfully!')
      setTimeout(() => navigate('/login'), 1500)
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || 'Face enrollment failed. Try again.')
    }
  }

  const currentStep = step === 'form' ? 0 : 1

  const StepIndicator = (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
      {/* Step 1 */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Exo 2', sans-serif",
            fontSize: '0.75rem',
            fontWeight: 700,
            background: currentStep >= 0 ? 'linear-gradient(135deg,#f59e0b,#fbbf24)' : 'rgba(255,255,255,0.07)',
            color: currentStep >= 0 ? '#020818' : 'rgba(226,232,240,0.3)',
            border: currentStep >= 0 ? 'none' : '1px solid rgba(255,255,255,0.1)',
          }}
        >
          1
        </div>
        <div style={{ marginTop: '0.3rem', fontFamily: "'Exo 2', sans-serif", fontSize: '0.68rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: currentStep >= 0 ? '#fbbf24' : 'rgba(226,232,240,0.3)' }}>
          Account Details
        </div>
      </div>

      <div style={{ flex: 1, height: 1, margin: '0 0.5rem', marginBottom: '0.5rem', background: currentStep > 0 ? 'rgba(251,191,36,0.4)' : 'rgba(255,255,255,0.08)' }} />

      {/* Step 2 */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Exo 2', sans-serif",
            fontSize: '0.75rem',
            fontWeight: 700,
            background: currentStep >= 1 ? 'linear-gradient(135deg,#f59e0b,#fbbf24)' : 'rgba(255,255,255,0.07)',
            color: currentStep >= 1 ? '#020818' : 'rgba(226,232,240,0.3)',
            border: currentStep >= 1 ? 'none' : '1px solid rgba(255,255,255,0.1)',
          }}
        >
          2
        </div>
        <div style={{ marginTop: '0.3rem', fontFamily: "'Exo 2', sans-serif", fontSize: '0.68rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: currentStep === 1 ? '#fbbf24' : 'rgba(226,232,240,0.3)' }}>
          Face Enrollment
        </div>
      </div>
    </div>
  )

  if (step === 'face') {
    return (
      <AuthLayout title="Enroll Your Face" subtitle="Look directly at the camera and capture your face">
        {StepIndicator}
        <FaceCapture mode="capture" onCaptureDone={handleFaceCapture} />
        <p style={{ textAlign: 'center', marginTop: '1rem', color: 'rgba(226,232,240,0.35)', fontSize: '0.78rem', fontFamily: "'IBM Plex Mono', monospace" }}>
          Your face image is encrypted and stored securely on the server.
        </p>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Create Account" subtitle="Register as a verified law enforcement officer">
      <form onSubmit={handleSubmit}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ gridColumn: 'span 1' }}>
            <label className="field-label">Username</label>
            <input
              className="input-field"
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="officer_sharma"
              required
            />
          </div>

          <div style={{ gridColumn: 'span 2' }}>
            <label className="field-label">Email Address</label>
            <input
              className="input-field"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="officer@police.gov.in"
              required
            />
          </div>

          <div style={{ gridColumn: 'span 2' }}>
            <label className="field-label">Police Station</label>
            <input
              className="input-field"
              type="text"
              name="policeStation"
              value={form.policeStation}
              onChange={handleChange}
              placeholder="Mumbai Central PS"
              required
            />
          </div>

          <div style={{ gridColumn: 'span 1' }}>
            <label className="field-label">Police ID</label>
            <input
              className="input-field"
              type="text"
              name="policeId"
              value={form.policeId}
              onChange={handleChange}
              placeholder="MH/MC/2024/001"
              required
            />
          </div>

          <div style={{ gridColumn: 'span 1' }}>
            <label className="field-label">Aadhar ID</label>
            <input
              className="input-field"
              type="text"
              name="aadharId"
              value={form.aadharId}
              onChange={handleChange}
              placeholder="XXXX XXXX XXXX"
              maxLength={12}
              required
            />
          </div>

          <div style={{ gridColumn: 'span 2' }}>
            <label className="field-label">Password</label>
            <input
              className="input-field"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Min 8 characters"
              required
            />
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <span className="spinner" /> Creating Account...
              </span>
            ) : (
              'Create Account & Enroll Face'
            )}
          </button>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'rgba(226,232,240,0.4)', fontSize: '0.85rem' }}>
            Already registered?{' '}
            <Link to="/login" style={{ color: '#fbbf24', textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  )
}

