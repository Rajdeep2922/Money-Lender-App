import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, ShieldCheck, Database, Share2, Lock,
  Clock, UserCheck, Cookie, Mail, CheckCircle2, Zap,
} from 'lucide-react';

/* ── Data ──────────────────────────────────────────── */
const sections = [
  { id: 'collect',   num: '01', title: 'Information We Collect',  icon: Database },
  { id: 'use',       num: '02', title: 'How We Use Your Info',    icon: Zap },
  { id: 'sharing',   num: '03', title: 'Information Sharing',     icon: Share2 },
  { id: 'security',  num: '04', title: 'Data Security',           icon: Lock },
  { id: 'retention', num: '05', title: 'Data Retention',          icon: Clock },
  { id: 'rights',    num: '06', title: 'Your Rights',             icon: UserCheck },
  { id: 'cookies',   num: '07', title: 'Cookies',                 icon: Cookie },
  { id: 'contact',   num: '08', title: 'Contact Us',              icon: Mail },
];

/* ── Reusable check-list ─────────────────────────────── */
function CheckList({ items }) {
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: '1rem 0 0', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
      {items.map((item, i) => (
        <li key={i} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
          <CheckCircle2 size={15} color="#22d3ee" strokeWidth={2} style={{ marginTop: '0.18rem', flexShrink: 0 }} />
          <span style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.75 }}>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/* ── Glass section card ──────────────────────────────── */
function SectionCard({ id, num, title, icon: Icon, iconColor = '#22d3ee', iconBg = 'rgba(6,182,212,0.12)', iconBorder = 'rgba(6,182,212,0.2)', children }) {
  return (
    <div
      id={id}
      style={{
        background: 'rgba(15,23,42,0.92)',       /* opaque — no backdrop-filter needed */
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '1.25rem',
        padding: 'clamp(1.5rem,4vw,2.25rem)',
        marginBottom: '1.5rem',
        scrollMarginTop: '5rem',
        transform: 'translate3d(0,0,0)',          /* GPU compositing layer */
        transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'rgba(34,211,238,0.18)';
        e.currentTarget.style.boxShadow = '0 0 30px rgba(6,182,212,0.05)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Card header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
        <div style={{
          width: '3rem', height: '3rem',
          borderRadius: '0.875rem',
          background: iconBg,
          border: `1px solid ${iconBorder}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon size={20} color={iconColor} strokeWidth={1.75} />
        </div>
        <div>
          <div style={{ fontSize: '0.65rem', color: '#475569', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
            Section {num}
          </div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f1f5f9', margin: 0 }}>{title}</h2>
        </div>
      </div>
      {/* Divider */}
      <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', marginBottom: '1.25rem' }} />
      {/* Content */}
      <div style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.8 }}>
        {children}
      </div>
    </div>
  );
}

/* ── Main component ──────────────────────────────────── */
export default function PrivacyPolicy() {
  const [activeSection, setActiveSection] = useState('collect');

  useEffect(() => {
    const handleScroll = () => {
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i].id);
        if (el && el.getBoundingClientRect().top <= 120) {
          setActiveSection(sections[i].id);
          return;
        }
      }
      setActiveSection('collect');
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={{ background: '#020617', minHeight: '100vh', color: '#f1f5f9', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* ── Top nav bar ── */}
      <div style={{
        background: 'rgba(2,6,23,0.96)',   /* opaque — no backdrop-filter */
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '1rem 1.5rem',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link
              to="/landing"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', textDecoration: 'none', fontSize: '0.875rem', transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#22d3ee'}
              onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
            >
              <ArrowLeft size={15} strokeWidth={2} /> Back
            </Link>
            <span style={{ color: '#1e293b' }}>|</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '1.5rem', height: '1.5rem', borderRadius: '0.375rem', background: 'linear-gradient(135deg,#06b6d4,#10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={11} color="#fff" fill="#fff" />
              </div>
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f1f5f9' }}>Money Lenders</span>
            </div>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#334155', fontWeight: 500 }}>Privacy Policy</span>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '3rem 1.5rem 5rem', display: 'grid', gridTemplateColumns: '1fr 260px', gap: '3rem', alignItems: 'flex-start' }}>

        {/* ── Main content ── */}
        <main>
          {/* Hero header card */}
          <div style={{
            background: 'rgba(6,182,212,0.07)',
            border: '1px solid rgba(34,211,238,0.18)',
            borderRadius: '1.5rem',
            padding: 'clamp(2rem,5vw,3rem)',
            marginBottom: '2rem',
            position: 'relative',
            overflow: 'hidden',
            transform: 'translate3d(0,0,0)',
          }}>
            {/* Decorative corner — no filter:blur */}
            <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(34,211,238,0.05)', pointerEvents: 'none' }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
              {/* Badge */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.25)', borderRadius: '9999px', padding: '0.3rem 0.875rem', marginBottom: '1.5rem' }}>
                <ShieldCheck size={13} color="#22d3ee" strokeWidth={2} />
                <span style={{ fontSize: '0.72rem', color: '#22d3ee', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Legal · Privacy</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem', flexWrap: 'wrap' }}>
                {/* Large shield icon — no backdropFilter */}
                <div style={{
                  width: '5rem', height: '5rem',
                  borderRadius: '1.25rem',
                  background: 'rgba(6,182,212,0.18)',
                  border: '1px solid rgba(34,211,238,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 0 30px rgba(6,182,212,0.18)',
                }}>
                  <ShieldCheck size={36} color="#22d3ee" strokeWidth={1.6} />
                </div>
                <div>
                  <h1 style={{ fontSize: 'clamp(1.75rem,4vw,2.5rem)', fontWeight: 800, letterSpacing: '-0.02em', color: '#f1f5f9', marginBottom: '0.5rem', lineHeight: 1.15 }}>
                    Privacy Policy
                  </h1>
                  <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1rem' }}>
                    Last updated: <span style={{ color: '#94a3b8' }}>May 27, 2026</span>
                    &nbsp;·&nbsp;
                    <span style={{ color: '#94a3b8' }}>Effective immediately</span>
                  </p>
                  <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.8, maxWidth: 560 }}>
                    At <strong style={{ color: '#f1f5f9' }}>Money Lenders</strong>, we are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Section cards ── */}
          <SectionCard id="collect" num="01" title="Information We Collect" icon={Database}>
            <p>We collect information you provide directly to us, such as when you create an account, submit a loan request, or contact us for support. This includes:</p>
            <CheckList items={[
              'Full name, email address, and phone number',
              'Financial information related to loan requests and repayments',
              'Business details and identity verification documents',
              'Usage data and analytics (pages visited, actions taken, timestamps)',
              'Device and browser information',
            ]} />
          </SectionCard>

          <SectionCard id="use" num="02" title="How We Use Your Information" icon={Zap} iconColor="#a78bfa" iconBg="rgba(139,92,246,0.12)" iconBorder="rgba(139,92,246,0.2)">
            <p>We use the information we collect to:</p>
            <CheckList items={[
              'Process and manage loan requests and repayments',
              'Communicate with you about your account and transactions',
              'Improve our platform and develop new features',
              'Detect and prevent fraud or unauthorized access',
              'Comply with applicable laws and regulations',
              'Send you service updates, security alerts, and support messages',
            ]} />
          </SectionCard>

          <SectionCard id="sharing" num="03" title="Information Sharing" icon={Share2} iconColor="#34d399" iconBg="rgba(52,211,153,0.12)" iconBorder="rgba(52,211,153,0.2)">
            <p>We do not sell, trade, or rent your personal information to third parties. We may share your information only in these limited circumstances:</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '1rem 0 0', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {[
                { label: 'Service Providers', desc: 'Trusted partners who assist us in operating the platform (e.g., cloud hosting, email delivery)' },
                { label: 'Legal Requirements', desc: 'When required by law, court order, or governmental authority' },
                { label: 'Business Transfers', desc: 'In connection with a merger, acquisition, or sale of assets' },
              ].map(item => (
                <li key={item.label} style={{ display: 'flex', gap: '0.75rem', background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '0.75rem', padding: '0.875rem 1rem' }}>
                  <CheckCircle2 size={15} color="#34d399" strokeWidth={2} style={{ marginTop: '0.18rem', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.75 }}>
                    <strong style={{ color: '#e2e8f0' }}>{item.label}:</strong>{' '}{item.desc}
                  </span>
                </li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard id="security" num="04" title="Data Security" icon={Lock} iconColor="#f59e0b" iconBg="rgba(245,158,11,0.12)" iconBorder="rgba(245,158,11,0.2)">
            <p>We implement industry-standard security measures to protect your data, including:</p>
            <CheckList items={[
              'AES-256 encryption for data at rest and in transit (TLS/HTTPS)',
              'Secure token-based authentication (JWT)',
              'Regular security audits and vulnerability assessments',
              'Role-based access controls limiting who can view your data',
            ]} />
          </SectionCard>

          <SectionCard id="retention" num="05" title="Data Retention" icon={Clock}>
            <p>
              We retain your personal information for as long as your account is active or as needed to provide you services.
              You may request deletion of your account and associated data by contacting us.
              Certain information may be retained for legal compliance purposes.
            </p>
          </SectionCard>

          <SectionCard id="rights" num="06" title="Your Rights" icon={UserCheck} iconColor="#60a5fa" iconBg="rgba(59,130,246,0.12)" iconBorder="rgba(59,130,246,0.2)">
            <p>You have the right to:</p>
            <CheckList items={[
              'Access and receive a copy of your personal data',
              'Correct inaccurate or incomplete information',
              'Request deletion of your data ("right to be forgotten")',
              'Opt out of marketing communications at any time',
              'File a complaint with a relevant data protection authority',
            ]} />
          </SectionCard>

          <SectionCard id="cookies" num="07" title="Cookies" icon={Cookie} iconColor="#fb923c" iconBg="rgba(251,146,60,0.12)" iconBorder="rgba(251,146,60,0.2)">
            <p>
              We use cookies and similar tracking technologies to improve your experience on our platform.
              You can control cookie settings through your browser preferences.
              Disabling certain cookies may affect the functionality of the platform.
            </p>
          </SectionCard>

          <SectionCard id="contact" num="08" title="Contact Us" icon={Mail}>
            <p>If you have questions or concerns about this Privacy Policy, please contact us:</p>
            <div style={{ marginTop: '1.25rem', background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(34,211,238,0.15)', borderRadius: '0.875rem', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <p style={{ margin: 0 }}><strong style={{ color: '#f1f5f9' }}>Money Lenders</strong></p>
              <p style={{ margin: 0 }}>Email: <a href="mailto:privacy@moneylenders.app" style={{ color: '#22d3ee', textDecoration: 'none' }}>privacy@moneylenders.app</a></p>
              <p style={{ margin: 0 }}>Website: <Link to="/landing" style={{ color: '#22d3ee', textDecoration: 'none' }}>moneylenders.app</Link></p>
            </div>
          </SectionCard>
        </main>

        {/* ── Sticky ToC sidebar ── */}
        <aside style={{ position: 'sticky', top: '5.5rem', alignSelf: 'flex-start' }}>
          <div style={{
            background: 'rgba(15,23,42,0.95)',    /* opaque — no backdrop-filter */
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '1.25rem',
            padding: '1.5rem',
          }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#475569', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem' }}>
              On This Page
            </div>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
              {sections.map(s => {
                const isActive = activeSection === s.id;
                const Icon = s.icon;
                return (
                  <button
                    key={s.id}
                    onClick={() => scrollTo(s.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.625rem',
                      width: '100%',
                      background: isActive ? 'rgba(34,211,238,0.08)' : 'transparent',
                      border: `1px solid ${isActive ? 'rgba(34,211,238,0.15)' : 'transparent'}`,
                      borderRadius: '0.625rem',
                      padding: '0.5rem 0.625rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.2s ease, color 0.2s ease, border-color 0.2s ease',
                      color: isActive ? '#22d3ee' : '#64748b',
                    }}
                    onMouseEnter={e => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                        e.currentTarget.style.color = '#94a3b8';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#64748b';
                      }
                    }}
                  >
                    <Icon size={13} strokeWidth={2} style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: '0.8rem', fontWeight: isActive ? 600 : 400, lineHeight: 1.4 }}>{s.title}</span>
                  </button>
                );
              })}
            </nav>

            {/* Footer note */}
            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <p style={{ fontSize: '0.75rem', color: '#334155', lineHeight: 1.6 }}>
                Last updated May 27, 2026
              </p>
            </div>
          </div>
        </aside>
      </div>

      {/* ── Footer bar ── */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '1.5rem', textAlign: 'center' }}>
        <p style={{ fontSize: '0.8rem', color: '#334155' }}>
          © 2026 Money Lenders. All rights reserved.
        </p>
      </div>

      {/* Responsive: collapse to single column on mobile */}
      <style>{`
        @media (max-width: 768px) {
          main + aside { display: none !important; }
          div[style*="grid-template-columns: 1fr 260px"] {
            grid-template-columns: 1fr !important;
            padding: 1.5rem 1rem 3rem !important;
          }
        }
      `}</style>
    </div>
  );
}
