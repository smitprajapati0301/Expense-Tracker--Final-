import React from 'react';
import track from '../assets/1.png';

const featureItems = [
  { icon: '🔒', text: 'Firebase email and Google sign-in' },
  { icon: '📊', text: 'Clean expense tracking workflow' },
  { icon: '📱', text: 'Responsive layout for mobile and desktop' },
];

export default function AuthLayout({ title, subtitle, children, eyebrow, helperTitle, helperText }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(circle at 10% 20%, rgba(33,112,228,0.25) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(0,108,73,0.15) 0%, transparent 35%), linear-gradient(160deg, #001a42 0%, #0058be 45%, #1a3a7a 100%)',
      }}
    >
      {/* ── Navbar ── */}
      <nav
        style={{
          background: 'rgba(0,20,60,0.55)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 72, display: 'flex', alignItems: 'center' }}>
          <a href="/" style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none', gap: 10 }}>
            {/* Logo — unchanged */}
            <img src={track} alt="Trackify" style={{ height: 36, width: 'auto', objectFit: 'contain' }} />
          </a>
        </div>
      </nav>

      {/* ── Content ── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px 64px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 48, alignItems: 'center' }}>

          {/* Left — Branding panel */}
          <div style={{ color: '#f8fbff' }}>
            {/* Eyebrow */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              marginBottom: 16, padding: '4px 12px',
              background: 'rgba(255,255,255,0.12)',
              borderRadius: 9999,
              fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.85)',
            }}>
              ✦ {eyebrow || 'Trackify'}
            </div>

            {/* Headline */}
            <h1 style={{
              fontFamily: '-apple-system, "SF Pro Display", BlinkMacSystemFont, "Inter", "Helvetica Neue", sans-serif',
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: 700,
              lineHeight: 1.05,
              marginBottom: 16,
              letterSpacing: '-0.025em',
            }}>
              {title}
            </h1>

            {/* Subtitle */}
            <p style={{
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              fontSize: '1.0625rem',
              color: 'rgba(248,251,255,0.78)',
              maxWidth: 480,
              lineHeight: 1.65,
              marginBottom: 32,
            }}>
              {subtitle}
            </p>

            {/* Feature list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {featureItems.map((item) => (
                <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'rgba(248,251,255,0.88)' }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 10,
                    background: 'rgba(255,255,255,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 15, flexShrink: 0,
                  }}>
                    {item.icon}
                  </div>
                  <span style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '0.9375rem', fontWeight: 500 }}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>

            {/* Subtle decorative tagline */}
            <p style={{
              marginTop: 40,
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              fontSize: '0.6875rem',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.35)',
            }}>
              Sophisticated Wealth Management
            </p>
          </div>

          {/* Right — Form glass card */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div
              className="glass-card"
              style={{
                width: '100%',
                maxWidth: 440,
                padding: '2.5rem',
                boxShadow: '0 32px 80px rgba(0,0,0,0.22)',
              }}
            >
              {/* Card header */}
              <div style={{ marginBottom: 24 }}>
                <div style={{
                  fontSize: '0.6875rem', fontWeight: 700,
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  color: '#727785', marginBottom: 6,
                }}>
                  {helperTitle || 'Secure access'}
                </div>
                <h2 style={{
                  fontFamily: '-apple-system, "SF Pro Display", BlinkMacSystemFont, "Inter", "Helvetica Neue", sans-serif',
                  fontSize: '1.75rem', fontWeight: 700,
                  color: '#1d1d1f', margin: '0 0 8px',
                  letterSpacing: '-0.02em',
                }}>
                  {title}
                </h2>
                <p style={{
                  fontFamily: '"Plus Jakarta Sans", sans-serif',
                  fontSize: '0.9375rem', color: '#424754',
                  margin: 0, lineHeight: 1.55,
                }}>
                  {helperText || subtitle}
                </p>
              </div>

              {/* Form children */}
              {children}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
