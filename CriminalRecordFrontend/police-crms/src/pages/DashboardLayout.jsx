import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'

const NAV_ITEMS = [
  { to: '/dashboard',         label: 'Overview',  icon: '⬡', end: true  },
  { to: '/dashboard/encrypt', label: 'Encrypt',   icon: '🔐', end: false },
  { to: '/dashboard/decrypt', label: 'Decrypt',   icon: '🔓', end: false },
  { to: '/dashboard/share',   label: 'Share',     icon: '📤', end: false },
  { to: '/dashboard/history', label: 'History',   icon: '📋', end: false },
]

export default function DashboardLayout() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.info('Logged out securely.')
    navigate('/')
  }

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#020818' }}>

      <aside style={{
        width:240, flexShrink:0,
        background:'#040d24',
        borderRight:'1px solid rgba(251,191,36,0.1)',
        display:'flex', flexDirection:'column',
        padding:'1.5rem 0',
        position:'sticky', top:0, height:'100vh',
        overflowY:'auto'
      }}>

        {/* Logo */}
        <div style={{ padding:'0 1.25rem', marginBottom:'2rem',
          display:'flex', alignItems:'center', gap:'0.75rem' }}>
          <div style={{
            width:30, height:30, flexShrink:0,
            background:'linear-gradient(135deg,#f59e0b,#fbbf24)',
            clipPath:'polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)'
          }} />
          <div>
            <div style={{ fontFamily:'Exo 2,sans-serif', fontWeight:800,
              fontSize:'0.95rem', letterSpacing:'0.08em', color:'#fbbf24' }}>
              CRMS
            </div>
            <div style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:'0.55rem',
              color:'rgba(226,232,240,0.25)', letterSpacing:'0.08em' }}>
              SECURE SYSTEM
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height:1, background:'rgba(251,191,36,0.08)',
          margin:'0 1.25rem', marginBottom:'1.25rem' }} />

        {/* Nav label */}
        <div style={{ padding:'0 1.25rem', marginBottom:'0.5rem',
          fontFamily:'Exo 2,sans-serif', fontSize:'0.6rem', fontWeight:600,
          letterSpacing:'0.15em', textTransform:'uppercase',
          color:'rgba(251,191,36,0.35)' }}>
          Navigation
        </div>

        {/* Nav items */}
        <nav style={{ flex:1, padding:'0 0.75rem' }}>
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              style={({ isActive }) => ({
                display:'flex', alignItems:'center', gap:'0.75rem',
                padding:'0.65rem 0.75rem', borderRadius:8,
                textDecoration:'none',
                fontFamily:'Exo 2,sans-serif',
                fontWeight: isActive ? 600 : 400,
                fontSize:'0.875rem',
                color: isActive ? '#fbbf24' : 'rgba(226,232,240,0.5)',
                background: isActive ? 'rgba(251,191,36,0.08)' : 'transparent',
                borderLeft: isActive ? '2px solid #fbbf24' : '2px solid transparent',
                marginBottom:'0.15rem',
                transition:'all 0.2s',
              })}
            >
              <span style={{ fontSize:'1rem' }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding:'0 0.75rem' }}>
          <div style={{ height:1, background:'rgba(251,191,36,0.08)',
            margin:'0 0.25rem', marginBottom:'1rem' }} />
          <button
            onClick={handleLogout}
            style={{
              display:'flex', alignItems:'center', gap:'0.75rem',
              width:'100%', padding:'0.65rem 0.75rem', borderRadius:8,
              background:'transparent', cursor:'pointer',
              border:'1px solid rgba(248,113,113,0.2)',
              color:'rgba(248,113,113,0.7)',
              fontFamily:'Exo 2,sans-serif', fontSize:'0.875rem', fontWeight:500,
              transition:'all 0.2s'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background='rgba(248,113,113,0.08)'
              e.currentTarget.style.borderColor='rgba(248,113,113,0.45)'
              e.currentTarget.style.color='#f87171'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background='transparent'
              e.currentTarget.style.borderColor='rgba(248,113,113,0.2)'
              e.currentTarget.style.color='rgba(248,113,113,0.7)'
            }}
          >
            <span>⏻</span> Logout
          </button>
        </div>

      </aside>

      <main style={{ flex:1, overflow:'auto', padding:'2.5rem', minWidth:0 }}>
        <Outlet />
      </main>

    </div>
  )
}