import { useEffect, useRef, useState } from 'react'

// Module-level face-api loader state
let modelsLoaded = false
let faceapi = null

async function loadModels() {
  if (modelsLoaded && faceapi) return faceapi
  const fa = await import('face-api.js')
  faceapi = fa
  const CDN = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model'
  await Promise.all([
    fa.nets.tinyFaceDetector.loadFromUri(CDN),
    fa.nets.faceLandmark68Net.loadFromUri(CDN),
    fa.nets.faceRecognitionNet.loadFromUri(CDN),
  ])
  modelsLoaded = true
  return fa
}

export default function FaceCapture({ mode = 'capture', onCaptureDone, storedImageUrl, onVerified }) {
  const [status, setStatus] = useState('')
  const [faceDetected, setFaceDetected] = useState(false)
  const [actionDone, setActionDone] = useState(false)
  const [loading, setLoading] = useState(false)

  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const intervalRef = useRef(null)

  useEffect(() => {
    let mounted = true
    async function start() {
      try {
        setStatus('Loading face models...')
        const fa = await loadModels()

        if (!mounted) return
        setStatus('Starting camera...')

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: 'user' },
        })
        streamRef.current = stream

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await new Promise((res) => {
            const v = videoRef.current
            const onLoaded = () => {
              v.removeEventListener('loadedmetadata', onLoaded)
              res()
            }
            v.addEventListener('loadedmetadata', onLoaded)
          })
          try {
            await videoRef.current.play()
          } catch (e) {
            // some browsers require user interaction
          }
        }

        if (!mounted) return
        setStatus('Position your face in the frame')

        // detection loop
        intervalRef.current = setInterval(() => {
          ;(async () => {
            try {
              if (actionDone) return
              const v = videoRef.current
              if (!v || v.readyState < 2) return
              const detections = await fa
                .detectAllFaces(v, new fa.TinyFaceDetectorOptions())
                .withFaceLandmarks()
                .withFaceDescriptors()

              setFaceDetected(detections && detections.length > 0)

              const dims = { width: v.videoWidth, height: v.videoHeight }
              if (canvasRef.current && dims.width && dims.height) {
                fa.matchDimensions(canvasRef.current, dims)
                const resized = fa.resizeResults(detections, dims)
                const ctx = canvasRef.current.getContext('2d')
                ctx.clearRect(0, 0, dims.width, dims.height)
                fa.draw.drawDetections(canvasRef.current, resized)
              }
            } catch (err) {
              // ignore transient detection errors
            }
          })()
        }, 300)
      } catch (err) {
        setStatus('Camera or model error')
        console.error(err)
      }
    }

    start()

    return () => {
      mounted = false
      try {
        clearInterval(intervalRef.current)
      } catch (e) {}
      try {
        streamRef.current?.getTracks().forEach((t) => t.stop())
      } catch (e) {}
    }
  }, [actionDone])

  const handleAction = async () => {
    setLoading(true)
    try {
      const fa = await loadModels()

      if (mode === 'capture') {
        setStatus('Detecting face...')
        const detection = await fa
          .detectSingleFace(videoRef.current, new fa.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptor()

        if (!detection) {
          setStatus('No face detected. Try again.')
          setLoading(false)
          return
        }

        // capture to blob
        const off = document.createElement('canvas')
        off.width = videoRef.current.videoWidth
        off.height = videoRef.current.videoHeight
        const ctx = off.getContext('2d')
        ctx.drawImage(videoRef.current, 0, 0, off.width, off.height)

        const blob = await new Promise((res) => off.toBlob(res, 'image/jpeg', 0.9))

        clearInterval(intervalRef.current)
        try {
          streamRef.current?.getTracks().forEach((t) => t.stop())
        } catch (e) {}
        setActionDone(true)
        setStatus('✓ Face captured!')
        setLoading(false)
        if (onCaptureDone) onCaptureDone(blob)
        return
      }

      // verify mode
      if (mode === 'verify') {
        setStatus('Detecting face...')
        const detection = await fa
          .detectSingleFace(videoRef.current, new fa.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptor()

        if (!detection) {
          setStatus('No face detected. Try again.')
          setLoading(false)
          return
        }

        if (!storedImageUrl) {
          setStatus('No stored image available')
          setLoading(false)
          return
        }

        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.src = storedImageUrl
        await new Promise((res, rej) => {
          img.onload = res
          img.onerror = rej
        })

        const storedDetection = await fa
          .detectSingleFace(img, new fa.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptor()

        if (!storedDetection) {
          setStatus('Could not read stored face. Contact admin.')
          setLoading(false)
          return
        }

        const distance = fa.euclideanDistance(detection.descriptor, storedDetection.descriptor)
        const matched = distance < 0.6
        const matchScore = Math.max(0, Math.min(1, 1 - distance))

        clearInterval(intervalRef.current)
        try {
          streamRef.current?.getTracks().forEach((t) => t.stop())
        } catch (e) {}
        setActionDone(true)
        setStatus(matched ? '✓ Face verified!' : '✗ Face not recognized')
        setLoading(false)
        if (onVerified) onVerified(matched, matchScore)
        return
      }
    } catch (err) {
      console.error(err)
      setStatus('Processing error')
      setLoading(false)
    }
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <div
        style={{
          position: 'relative',
          display: 'inline-block',
          borderRadius: 12,
          overflow: 'hidden',
          border: faceDetected ? '2px solid rgba(251,191,36,0.8)' : '2px solid rgba(251,191,36,0.2)',
          boxShadow: faceDetected ? '0 0 25px rgba(251,191,36,0.35)' : 'none',
          transition: 'all 0.3s',
        }}
      >
        <video
          ref={videoRef}
          muted
          playsInline
          style={{ display: 'block', width: '100%', maxWidth: 420, transform: 'scaleX(-1)' }}
        />

        <canvas
          ref={canvasRef}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', transform: 'scaleX(-1)' }}
        />

        {/* corner brackets */}
        <div style={{ position: 'absolute', top: 10, left: 10, width: 20, height: 20, borderTop: '2px solid #fbbf24', borderLeft: '2px solid #fbbf24' }} />
        <div style={{ position: 'absolute', top: 10, right: 10, width: 20, height: 20, borderTop: '2px solid #fbbf24', borderRight: '2px solid #fbbf24' }} />
        <div style={{ position: 'absolute', bottom: 10, left: 10, width: 20, height: 20, borderBottom: '2px solid #fbbf24', borderLeft: '2px solid #fbbf24' }} />
        <div style={{ position: 'absolute', bottom: 10, right: 10, width: 20, height: 20, borderBottom: '2px solid #fbbf24', borderRight: '2px solid #fbbf24' }} />
      </div>

      <div style={{ marginTop: '0.75rem', fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.8rem', color: faceDetected ? '#fbbf24' : 'rgba(226,232,240,0.5)' }}>
        {status}
      </div>

      {!actionDone && (
        <div>
          <button
            className="btn-primary"
            style={{ marginTop: '1rem', maxWidth: 200, width: 200 }}
            disabled={!faceDetected || loading}
            onClick={handleAction}
          >
            {loading ? 'Processing...' : mode === 'capture' ? 'Capture Face' : 'Verify Face'}
          </button>
        </div>
      )}
    </div>
  )
}
