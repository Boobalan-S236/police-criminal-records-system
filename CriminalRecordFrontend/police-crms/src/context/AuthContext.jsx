import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('token')
    } catch (e) {
      return null
    }
  })

  const [user, setUser] = useState(null)

  const login = (newToken, userData) => {
    try {
      if (newToken) localStorage.setItem('token', newToken)
    } catch (e) {
      // ignore
    }
    setToken(newToken)
    setUser(userData || null)
  }

  const logout = () => {
    try {
      localStorage.removeItem('token')
    } catch (e) {
      // ignore
    }
    setToken(null)
    setUser(null)
  }

  const isAuthenticated = !!token

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

export default AuthContext
