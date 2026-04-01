import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

import LandingPage from './pages/LandingPage'
import SignupPage from './pages/SignupPage'
import LoginPage from './pages/LoginPage'
import DashboardLayout from './pages/DashboardLayout'
import DashboardHome from './pages/DashboardHome'
import EncryptPage from './pages/EncryptPage'
import DecryptPage from './pages/DecryptPage'
import SharePage from './pages/SharePage'
import HistoryPage from './pages/HistoryPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardHome />} />
            <Route path="encrypt" element={<EncryptPage />} />
            <Route path="decrypt" element={<DecryptPage />} />
            <Route path="share" element={<SharePage />} />
            <Route path="history" element={<HistoryPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>

      <ToastContainer
        position="bottom-right"
        autoClose={4000}
        hideProgressBar={false}
        theme="dark"
        toastStyle={{
          background: '#071230',
          border: '1px solid rgba(251,191,36,0.25)',
          color: '#e2e8f0',
          fontFamily: "'IBM Plex Sans', sans-serif",
        }}
      />
    </AuthProvider>
  )
}
