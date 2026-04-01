import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

/* Navbar */
function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [loginHover, setLoginHover] = useState(false)
  const [registerHover, setRegisterHover] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const handleScroll = () => {
      setScrolled(window.scrollY > 40)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navBaseStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    transition: 'all 0.3s ease',
    WebkitTransition: 'all 0.3s ease',
  }

  const navScrolledStyle = scrolled
    ? {
        background: 'rgba(2,8,24,0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(251,191,36,0.15)',
      }
    : {
        background: 'transparent',
        borderBottom: 'none',
      }

  const innerStyle = {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '1rem 1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  }

  const logoLinkStyle = {
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
  }

  const hexStyle = {
    width: '34px',
    height: '34px',
    background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
    clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
    flexShrink: 0,
  }

  const crmsTextStyle = {
    fontFamily: "'Exo 2', sans-serif",
    fontWeight: 800,
    fontSize: '1.1rem',
    letterSpacing: '0.08em',
    color: '#fbbf24',
    marginLeft: '10px',
  }

  const rightStyle = {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  }

  const leftGroup = {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  }

  const centerNav = {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    gap: '2rem',
    alignItems: 'center',
  }

  const centerLinkStyle = {
    fontFamily: "'Exo 2', sans-serif",
    fontSize: '0.78rem',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'rgba(226,232,240,0.6)',
    textDecoration: 'none',
    transition: 'color 0.2s ease',
    cursor: 'pointer',
  }

  const loginBase = {
    fontFamily: "'Exo 2', sans-serif",
    fontWeight: 600,
    fontSize: '0.8rem',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#fbbf24',
    padding: '0.5rem 1.2rem',
    border: '1px solid rgba(251,191,36,0.4)',
    borderRadius: '6px',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    display: 'inline-block',
  }

  const loginHoverStyle = loginHover
    ? {
        background: 'rgba(251,191,36,0.1)',
        border: '1px solid rgba(251,191,36,0.7)',
      }
    : {}

  const registerBase = {
    fontFamily: "'Exo 2', sans-serif",
    fontWeight: 700,
    fontSize: '0.8rem',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#020818',
    padding: '0.5rem 1.2rem',
    background: 'linear-gradient(135deg,#f59e0b,#fbbf24)',
    borderRadius: '6px',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    display: 'inline-block',
  }

  const registerHoverStyle = registerHover
    ? {
        boxShadow: '0 0 20px rgba(251,191,36,0.5)',
      }
    : {}

  return (
    <nav style={{ ...navBaseStyle, ...navScrolledStyle }}>
      <div style={innerStyle}>
        <div style={leftGroup}>
          <Link to="/" style={logoLinkStyle}>
            <div style={hexStyle} aria-hidden="true" />
            <span style={crmsTextStyle}>CRMS</span>
          </Link>
        </div>

        <div style={centerNav}>
          <a
            href="#features"
            style={centerLinkStyle}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#fbbf24')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(226,232,240,0.6)')}
          >
            Features
          </a>

          <a
            href="#how-it-works"
            style={centerLinkStyle}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#fbbf24')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(226,232,240,0.6)')}
          >
            How It Works
          </a>

          <a
            href="#features"
            style={centerLinkStyle}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#fbbf24')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(226,232,240,0.6)')}
          >
            Security
          </a>
        </div>

        <div style={rightStyle}>
          <Link
            to="/login"
            style={{ ...loginBase, ...loginHoverStyle }}
            onMouseEnter={() => setLoginHover(true)}
            onMouseLeave={() => setLoginHover(false)}
          >
            Login
          </Link>

          <Link
            to="/signup"
            style={{ ...registerBase, ...registerHoverStyle }}
            onMouseEnter={() => setRegisterHover(true)}
            onMouseLeave={() => setRegisterHover(false)}
          >
            Register
          </Link>
        </div>
      </div>
    </nav>
  )
}

/* HeroSection */
function HeroSection() {
  const [statsVisible, setStatsVisible] = useState(false)

  useEffect(() => {
    // trigger a subtle fade-in for the stats on mount
    const t = setTimeout(() => setStatsVisible(true), 120)
    return () => clearTimeout(t)
  }, [])
  const outerStyle = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    background:
      'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(251,191,36,0.06) 0%, transparent 70%)',
  }

  const gridBgStyle = {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    backgroundImage: [
      'linear-gradient(to bottom, rgba(251,191,36,0.04) 1px, transparent 1px)',
      'linear-gradient(to right, rgba(251,191,36,0.04) 1px, transparent 1px)',
    ].join(', '),
    backgroundSize: '60px 60px, 60px 60px',
  }

  const innerStyle = {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '6rem 1.5rem 4rem 1.5rem',
    position: 'relative',
    zIndex: 10,
    textAlign: 'center',
  }

  const badgeStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'rgba(251,191,36,0.1)',
    border: '1px solid rgba(251,191,36,0.3)',
    borderRadius: '100px',
    padding: '0.3rem 1rem',
    marginBottom: '2rem',
  }

  const amberDot = {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#fbbf24',
    flexShrink: 0,
  }

  const badgeText = {
    fontFamily: "'Exo 2', sans-serif",
    fontSize: '0.72rem',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: '#fbbf24',
    fontWeight: 700,
  }

  const headingStyle = {
    fontFamily: "'Exo 2', sans-serif",
    fontWeight: 900,
    fontSize: 'clamp(2.5rem, 6vw, 5rem)',
    lineHeight: 1.05,
    letterSpacing: '-0.02em',
    marginBottom: '1.5rem',
  }

  const line1Style = {
    display: 'block',
    color: '#e2e8f0',
  }
  const line2Style = {
    display: 'block',
    color: '#fbbf24',
    textShadow: '0 0 40px rgba(251,191,36,0.4)',
  }

  const subtitleStyle = {
    maxWidth: '560px',
    margin: '0 auto 3rem',
    color: 'rgba(226,232,240,0.6)',
    fontSize: '1.05rem',
    lineHeight: 1.7,
    fontFamily: "'IBM Plex Sans', sans-serif",
  }

  const ctaRow = {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    flexWrap: 'wrap',
  }

  const accessBtn = {
    fontFamily: "'Exo 2', sans-serif",
    fontWeight: 700,
    fontSize: '0.9rem',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#020818',
    padding: '1rem 2.5rem',
    background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
    borderRadius: '8px',
    textDecoration: 'none',
    boxShadow: '0 0 30px rgba(251,191,36,0.3)',
    display: 'inline-block',
  }

  const learnBtn = {
    fontFamily: "'Exo 2', sans-serif",
    fontWeight: 700,
    fontSize: '0.9rem',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#fbbf24',
    padding: '1rem 2.5rem',
    border: '1px solid rgba(251,191,36,0.4)',
    borderRadius: '8px',
    textDecoration: 'none',
    display: 'inline-block',
  }

  const statsWrapper = {
    marginTop: '5rem',
    paddingTop: '3rem',
    borderTop: '1px solid rgba(251,191,36,0.1)',
    display: 'flex',
    gap: '3rem',
    justifyContent: 'center',
    flexWrap: 'wrap',
    opacity: statsVisible ? 1 : 0,
    transition: 'opacity 0.6s ease',
  }

  const statItem = {
    textAlign: 'center',
  }

  const statValue = {
    fontFamily: "'Exo 2', sans-serif",
    fontWeight: 800,
    fontSize: '1.8rem',
    color: '#fbbf24',
  }

  const statLabel = {
    fontSize: '0.75rem',
    color: 'rgba(226,232,240,0.4)',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    marginTop: '0.4rem',
  }

  const stats = [
    { value: 'AES-256', label: 'Encryption' },
    { value: 'RSA', label: 'Key Exchange' },
    { value: '3-Factor', label: 'Authentication' },
    { value: 'Zero', label: 'Plain-text Storage' },
  ]

  return (
    <section style={outerStyle}>
      <div style={gridBgStyle} />
      <div style={innerStyle}>
        <div style={badgeStyle}>
          <div style={amberDot} />
          <span style={badgeText}>
            Classified System — Authorized Personnel Only
          </span>
        </div>

        <h1 style={headingStyle}>
          <span style={line1Style}>Criminal Records</span>
          <span style={line2Style}>Management System</span>
        </h1>

        <p style={subtitleStyle}>
          A secure, encrypted platform for law enforcement to manage, encrypt,
          and share criminal records — protected by face recognition and
          RSA/AES cryptography.
        </p>

        <div style={ctaRow}>
          <Link to="/login" style={accessBtn}>
            Access System
          </Link>
          <a href="#features" style={learnBtn}>
            Learn More
          </a>
        </div>

        <div style={statsWrapper}>
          {stats.map((s) => (
            <div key={s.value} style={statItem}>
              <div style={statValue}>{s.value}</div>
              <div style={statLabel}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* FeaturesSection */
function FeaturesSection() {
  const sectionStyle = {
    padding: '6rem 1.5rem',
    background: 'rgba(4,13,36,0.5)',
  }

  const innerStyle = {
    maxWidth: '1280px',
    margin: '0 auto',
  }

  const headerStyle = {
    textAlign: 'center',
    marginBottom: '4rem',
  }

  const eyebrowStyle = {
    fontFamily: "'Exo 2', sans-serif",
    fontSize: '0.72rem',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    color: '#fbbf24',
    marginBottom: '0.75rem',
    display: 'block',
  }

  const h2Style = {
    fontFamily: "'Exo 2', sans-serif",
    fontWeight: 800,
    fontSize: 'clamp(1.8rem, 3vw, 2.8rem)',
    margin: 0,
    color: '#e2e8f0',
  }

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.5rem',
  }

  const cardBaseStyle = {
    padding: '2rem',
    cursor: 'default',
    transition:
      'transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
  }

  const iconStyle = {
    fontSize: '2rem',
    marginBottom: '1rem',
  }

  const titleStyle = {
    fontFamily: "'Exo 2', sans-serif",
    fontWeight: 700,
    fontSize: '1.05rem',
    color: '#fbbf24',
    marginBottom: '0.5rem',
  }

  const descStyle = {
    color: 'rgba(226,232,240,0.6)',
    lineHeight: 1.6,
    fontSize: '0.9rem',
    margin: 0,
    fontFamily: "'IBM Plex Sans', sans-serif",
  }

  const features = [
    {
      icon: '🔐',
      title: 'AES Encryption',
      desc: 'Military-grade AES-256 encryption protects every criminal record file.',
    },
    {
      icon: '🧬',
      title: 'Face Recognition Login',
      desc: 'Three-factor auth: password, OTP, and live face verification.',
    },
    {
      icon: '🔑',
      title: 'RSA Key Infrastructure',
      desc: "Only the receiver's private key can decrypt shared files.",
    },
    {
      icon: '📤',
      title: 'Secure File Sharing',
      desc: 'Share encrypted files directly to verified officers at any station.',
    },
    {
      icon: '📋',
      title: 'Audit History',
      desc: 'Full audit trail of every encryption, decryption and share event.',
    },
    {
      icon: '🛡️',
      title: 'JWT Authentication',
      desc: 'Stateless token-based sessions keep access secure and controlled.',
    },
  ]

  const handleCardEnter = (e) => {
    const el = e.currentTarget
    el.style.borderColor = 'rgba(251,191,36,0.4)'
    el.style.boxShadow = '0 0 30px rgba(251,191,36,0.1)'
    el.style.transform = 'translateY(-4px)'
  }

  const handleCardLeave = (e) => {
    const el = e.currentTarget
    el.style.borderColor = ''
    el.style.boxShadow = ''
    el.style.transform = ''
  }

  return (
    <section id="features" style={sectionStyle}>
      <div style={innerStyle}>
        <header style={headerStyle}>
          <span style={eyebrowStyle}>System Capabilities</span>
          <h2 style={h2Style}>Built for Law Enforcement</h2>
        </header>

        <div style={gridStyle}>
          {features.map((f) => (
            <div
              key={f.title}
              className="card"
              style={cardBaseStyle}
              onMouseEnter={handleCardEnter}
              onMouseLeave={handleCardLeave}
            >
              <div style={iconStyle} aria-hidden="true">
                {f.icon}
              </div>
              <div style={titleStyle}>{f.title}</div>
              <p style={descStyle}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* HowItWorksSection */
function HowItWorksSection() {
  const sectionStyle = {
    padding: '6rem 1.5rem',
    background: 'transparent',
  }

  const innerStyle = {
    maxWidth: '900px',
    margin: '0 auto',
    position: 'relative',
  }

  const headerStyle = {
    textAlign: 'center',
    marginBottom: '4rem',
  }

  const eyebrowStyle = {
    fontFamily: "'Exo 2', sans-serif",
    fontSize: '0.72rem',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    color: '#fbbf24',
    marginBottom: '0.75rem',
    display: 'block',
    fontWeight: 700,
  }

  const h2Style = {
    fontFamily: "'Exo 2', sans-serif",
    fontWeight: 800,
    fontSize: 'clamp(1.8rem, 3vw, 2.8rem)',
    margin: 0,
    color: '#e2e8f0',
  }

  const stepsWrapper = {
    position: 'relative',
    paddingLeft: '0px',
  }

  const verticalLine = {
    position: 'absolute',
    left: '27px',
    top: '2rem',
    bottom: '2rem',
    width: '1px',
    background:
      'linear-gradient(to bottom, rgba(251,191,36,0.5), rgba(251,191,36,0.05))',
    borderRadius: '1px',
    pointerEvents: 'none',
  }

  const stepsColumn = {
    display: 'flex',
    flexDirection: 'column',
    gap: '2.5rem',
  }

  const stepRow = {
    display: 'flex',
    gap: '2rem',
    alignItems: 'flex-start',
  }

  const numberBase = {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Exo 2', sans-serif",
    fontWeight: 800,
    fontSize: '0.85rem',
  }

  const numberFilled = {
    background: 'linear-gradient(135deg,#f59e0b,#fbbf24)',
    color: '#020818',
  }

  const numberOutlined = {
    background: 'rgba(7,18,48,0.8)',
    border: '1px solid rgba(251,191,36,0.3)',
    color: '#fbbf24',
  }

  const textRight = {
    paddingTop: '0.5rem',
    flex: 1,
  }

  const stepTitle = {
    fontFamily: "'Exo 2', sans-serif",
    fontWeight: 700,
    fontSize: '1.15rem',
    color: '#e2e8f0',
    marginBottom: '0.4rem',
  }

  const stepDesc = {
    fontFamily: "'IBM Plex Sans', sans-serif",
    color: 'rgba(226,232,240,0.5)',
    lineHeight: 1.6,
    margin: 0,
  }

  const steps = [
    {
      num: '01',
      title: 'Register & Enroll Face',
      desc: 'Create your officer account and enroll your biometric face data.',
    },
    {
      num: '02',
      title: 'Three-Factor Authentication',
      desc: 'Login with password + OTP + live face scan every session.',
    },
    {
      num: '03',
      title: 'Encrypt Criminal Records',
      desc: 'Upload sensitive case files — instantly AES-256 encrypted on server.',
    },
    {
      num: '04',
      title: 'Share Files Securely',
      desc: 'Send encrypted files to officers. Only they can decrypt with their key.',
    },
  ]

  return (
    <section id="how-it-works" style={sectionStyle}>
      <div style={innerStyle}>
        <header style={headerStyle}>
          <span style={eyebrowStyle}>Workflow</span>
          <h2 style={h2Style}>How It Works</h2>
        </header>

        <div style={stepsWrapper}>
          <div style={verticalLine} />

          <div style={stepsColumn}>
            {steps.map((s, idx) => {
              const isFirst = idx === 0
              const numberStyle = {
                ...numberBase,
                ...(isFirst ? numberFilled : numberOutlined),
              }

              return (
                <div key={s.num} style={stepRow}>
                  <div style={{ marginLeft: '0px' }}>
                    <div style={numberStyle}>{s.num}</div>
                  </div>

                  <div style={textRight}>
                    <div style={stepTitle}>{s.title}</div>
                    <p style={stepDesc}>{s.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

/* CTASection */
function CTASection() {
  const sectionStyle = {
    padding: '5rem 1.5rem',
    background:
      'radial-gradient(ellipse 60% 80% at 50% 50%, rgba(251,191,36,0.07) 0%, transparent 70%)',
    borderTop: '1px solid rgba(251,191,36,0.1)',
  }

  const innerStyle = {
    maxWidth: '640px',
    margin: '0 auto',
    textAlign: 'center',
  }

  const h2Style = {
    fontFamily: "'Exo 2', sans-serif",
    fontWeight: 800,
    fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
    marginBottom: '1rem',
    color: '#e2e8f0',
  }

  const pStyle = {
    color: 'rgba(226,232,240,0.5)',
    lineHeight: 1.7,
    marginBottom: '2.5rem',
    fontFamily: "'IBM Plex Sans', sans-serif",
  }

  const buttonsRow = {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    flexWrap: 'wrap',
  }

  const registerBtn = {
    fontFamily: "'Exo 2', sans-serif",
    fontWeight: 700,
    fontSize: '0.9rem',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: '#020818',
    padding: '1rem 2.5rem',
    background: 'linear-gradient(135deg,#f59e0b,#fbbf24)',
    borderRadius: '8px',
    textDecoration: 'none',
    boxShadow: '0 0 30px rgba(251,191,36,0.3)',
    display: 'inline-block',
  }

  const loginBtn = {
    fontFamily: "'Exo 2', sans-serif",
    fontWeight: 600,
    fontSize: '0.9rem',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: '#fbbf24',
    padding: '1rem 2.5rem',
    border: '1px solid rgba(251,191,36,0.4)',
    borderRadius: '8px',
    textDecoration: 'none',
    display: 'inline-block',
  }

  return (
    <section style={sectionStyle}>
      <div style={innerStyle}>
        <h2 style={h2Style}>Authorized Access Only</h2>
        <p style={pStyle}>
          This system is restricted to verified law enforcement officers.
          Unauthorized access is a criminal offense.
        </p>

        <div style={buttonsRow}>
          <Link to="/signup" style={registerBtn}>
            Register Account
          </Link>

          <Link to="/login" style={loginBtn}>
            Login
          </Link>
        </div>
      </div>
    </section>
  )
}

/* Footer */
function Footer() {
  const footerStyle = {
    padding: '2rem 1.5rem',
    borderTop: '1px solid rgba(251,191,36,0.08)',
    textAlign: 'center',
  }

  const logoRow = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    justifyContent: 'center',
    marginBottom: '0.75rem',
  }

  const hexStyle = {
    width: '24px',
    height: '24px',
    background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
    clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
    flexShrink: 0,
  }

  const crmsText = {
    fontFamily: "'Exo 2', sans-serif",
    fontWeight: 800,
    fontSize: '0.9rem',
    color: '#fbbf24',
  }

  const copyright = {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: '0.75rem',
    color: 'rgba(226,232,240,0.2)',
  }

  return (
    <footer style={footerStyle}>
      <div style={logoRow}>
        <div style={hexStyle} aria-hidden="true" />
        <div style={crmsText}>CRMS</div>
      </div>

      <div style={copyright}>
        Criminal Records Management System — Confidential Law Enforcement Tool
      </div>
    </footer>
  )
}

/* LandingPage */
export default function LandingPage() {
  const pageStyle = {
    background: '#020818',
    color: '#e2e8f0',
    minHeight: '100vh',
    paddingTop: '72px', // space for fixed navbar
    fontFamily: "'IBM Plex Sans', sans-serif",
  }

  useEffect(() => {
    // enable smooth scrolling for in-page anchors while this page is mounted
    const prev = document.documentElement.style.scrollBehavior
    document.documentElement.style.scrollBehavior = 'smooth'
    return () => {
      document.documentElement.style.scrollBehavior = prev || ''
    }
  }, [])

  return (
    <div style={pageStyle}>
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <CTASection />
      <Footer />
    </div>
  )
}
