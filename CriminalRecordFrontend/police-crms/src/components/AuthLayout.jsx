import { Link } from 'react-router-dom'

export default function AuthLayout({ title, subtitle, children }) {
  const pageStyle = {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background:
      "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(251,191,36,0.05) 0%, transparent 60%), #020818",
    padding: '2rem 1rem',
  }

  const logoRow = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '2rem',
    textDecoration: 'none',
  }

  const hexStyle = {
    width: '34px',
    height: '34px',
    background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
    clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
    flexShrink: 0,
  }

  const crmsText = {
    fontFamily: "'Exo 2', sans-serif",
    fontWeight: 800,
    fontSize: '1.05rem',
    letterSpacing: '0.08em',
    color: '#fbbf24',
  }

  const cardStyle = {
    width: '100%',
    maxWidth: '480px',
    padding: '2.5rem',
  }

  const headerStyle = {
    textAlign: 'center',
    marginBottom: '2rem',
  }

  const titleStyle = {
    fontFamily: "'Exo 2', sans-serif",
    fontWeight: 800,
    fontSize: '1.55rem',
    color: '#e2e8f0',
    marginBottom: '0.4rem',
  }

  const subtitleStyle = {
    color: 'rgba(226,232,240,0.5)',
    fontSize: '0.88rem',
    lineHeight: 1.5,
    margin: 0,
  }

  return (
    <div style={pageStyle}>
      <Link to="/" style={logoRow}>
        <div style={hexStyle} aria-hidden="true" />
        <div style={crmsText}>CRMS</div>
      </Link>

      <div className="card animate-fade-up" style={cardStyle}>
        <div style={headerStyle}>
          <h1 style={titleStyle}>{title}</h1>
          {subtitle && <p style={subtitleStyle}>{subtitle}</p>}
        </div>

        <div>
          {children}
        </div>
      </div>
    </div>
  )
}
