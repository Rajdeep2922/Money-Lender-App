import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, FileText, Zap, CheckCircle2,
  ClipboardList, Settings, UserCheck, ShieldOff,
  AlertTriangle, Copyright, XCircle, RefreshCw,
  Scale, Mail,
} from 'lucide-react';

/* ── Section data for ToC ──────────────────────────── */
const sections = [
  { id: 'acceptance',   num: '01', title: 'Acceptance of Terms',    icon: ClipboardList },
  { id: 'services',     num: '02', title: 'Description of Services', icon: Settings },
  { id: 'accounts',     num: '03', title: 'User Accounts',           icon: UserCheck },
  { id: 'acceptable',   num: '04', title: 'Acceptable Use',          icon: ShieldOff },
  { id: 'financial',    num: '05', title: 'Financial Disclaimer',    icon: AlertTriangle },
  { id: 'ip',           num: '06', title: 'Intellectual Property',   icon: Copyright },
  { id: 'liability',    num: '07', title: 'Limitation of Liability', icon: XCircle },
  { id: 'termination',  num: '08', title: 'Termination',             icon: XCircle },
  { id: 'changes',      num: '09', title: 'Changes to Terms',        icon: RefreshCw },
  { id: 'governing',    num: '10', title: 'Governing Law',           icon: Scale },
  { id: 'contact',      num: '11', title: 'Contact Us',              icon: Mail },
];

/* ── Check list ─────────────────────────────────────── */
function CheckList({ items, iconColor = '#22d3ee' }) {
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: '1rem 0 0', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
      {items.map((item, i) => (
        <li key={i} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
          <CheckCircle2 size={15} color={iconColor} strokeWidth={2} style={{ marginTop: '0.18rem', flexShrink: 0 }} />
          <span style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.75 }}>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/* ── X-mark list (prohibited items) ─────────────────── */
function XList({ items }) {
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: '1rem 0 0', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
      {items.map((item, i) => (
        <li key={i} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
          <XCircle size={15} color="#f87171" strokeWidth={2} style={{ marginTop: '0.18rem', flexShrink: 0 }} />
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
        background: 'rgba(15,23,42,0.65)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '1.25rem',
        padding: 'clamp(1.5rem,4vw,2.25rem)',
        marginBottom: '1.5rem',
        scrollMarginTop: '5rem',
        transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'rgba(34,211,238,0.18)';
        e.currentTarget.style.boxShadow = '0 0 40px rgba(6,182,212,0.06)';
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
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          boxShadow: `0 0 20px ${iconBg}`,
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
export default function TermsOfService() {
  const [activeSection, setActiveSection] = useState('acceptance');

  useEffect(() => {
    const handleScroll = () => {
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i].id);
        if (el && el.getBoundingClientRect().top <= 120) {
          setActiveSection(sections[i].id);
          return;
        }
      }
      setActiveSection('acceptance');
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
      <div style={{ background: 'rgba(2,6,23,0.9)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '1rem 1.5rem', position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
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
          <span style={{ fontSize: '0.75rem', color: '#334155', fontWeight: 500 }}>Terms of Service</span>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '3rem 1.5rem 5rem', display: 'grid', gridTemplateColumns: '1fr 260px', gap: '3rem', alignItems: 'flex-start' }}>

        {/* ── Main content ── */}
        <main>
          {/* Hero header card */}
          <div style={{
            background: 'linear-gradient(135deg,rgba(6,182,212,0.1),rgba(16,185,129,0.06))',
            border: '1px solid rgba(34,211,238,0.18)',
            borderRadius: '1.5rem',
            padding: 'clamp(2rem,5vw,3rem)',
            marginBottom: '2rem',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 0 60px rgba(6,182,212,0.07)',
          }}>
            {/* BG glow blob */}
            <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(34,211,238,0.08)', filter: 'blur(60px)', pointerEvents: 'none' }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
              {/* Badge */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.25)', borderRadius: '9999px', padding: '0.3rem 0.875rem', marginBottom: '1.5rem' }}>
                <FileText size={13} color="#22d3ee" strokeWidth={2} />
                <span style={{ fontSize: '0.72rem', color: '#22d3ee', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Legal · Terms</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem', flexWrap: 'wrap' }}>
                {/* Large icon */}
                <div style={{
                  width: '5rem', height: '5rem',
                  borderRadius: '1.25rem',
                  background: 'linear-gradient(135deg,rgba(6,182,212,0.2),rgba(16,185,129,0.12))',
                  border: '1px solid rgba(34,211,238,0.3)',
                  backdropFilter: 'blur(8px)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 0 36px rgba(6,182,212,0.22), inset 0 1px 0 rgba(255,255,255,0.06)',
                }}>
                  <FileText size={36} color="#22d3ee" strokeWidth={1.6} />
                </div>
                <div>
                  <h1 style={{ fontSize: 'clamp(1.75rem,4vw,2.5rem)', fontWeight: 800, letterSpacing: '-0.02em', color: '#f1f5f9', marginBottom: '0.5rem', lineHeight: 1.15 }}>
                    Terms of Service
                  </h1>
                  <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1rem' }}>
                    Last updated: <span style={{ color: '#94a3b8' }}>May 27, 2026</span>
                    &nbsp;·&nbsp;
                    <span style={{ color: '#94a3b8' }}>Effective immediately</span>
                  </p>
                  <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.8, maxWidth: 560 }}>
                    By accessing or using <strong style={{ color: '#f1f5f9' }}>Money Lenders</strong>, you agree to be bound by these Terms of Service. Please read them carefully before using our platform.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Section cards ── */}
          <SectionCard id="acceptance" num="01" title="Acceptance of Terms" icon={ClipboardList}>
            <p>
              By creating an account, accessing our platform, or using any of our services, you agree to comply with and
              be legally bound by these Terms of Service and our{' '}
              <Link to="/privacy-policy" style={{ color: '#22d3ee', textDecoration: 'none' }}>Privacy Policy</Link>.
              If you do not agree with any part of these terms, you must not use our services.
            </p>
          </SectionCard>

          <SectionCard id="services" num="02" title="Description of Services" icon={Settings} iconColor="#a78bfa" iconBg="rgba(139,92,246,0.12)" iconBorder="rgba(139,92,246,0.2)">
            <p>Money Lenders provides a software-as-a-service (SaaS) platform for loan management, including:</p>
            <CheckList iconColor="#a78bfa" items={[
              'Creation and management of loan records',
              'Customer and borrower tracking',
              'Payment collection and repayment scheduling',
              'Invoice generation and financial reporting',
              'Customer portal access for borrowers',
            ]} />
          </SectionCard>

          <SectionCard id="accounts" num="03" title="User Accounts" icon={UserCheck} iconColor="#34d399" iconBg="rgba(52,211,153,0.12)" iconBorder="rgba(52,211,153,0.2)">
            <p>To use our services, you must:</p>
            <CheckList iconColor="#34d399" items={[
              'Be at least 18 years of age',
              'Provide accurate, current, and complete registration information',
              'Maintain the security of your account credentials',
              'Notify us immediately of any unauthorized access to your account',
              'Be responsible for all activities that occur under your account',
            ]} />
          </SectionCard>

          <SectionCard id="acceptable" num="04" title="Acceptable Use" icon={ShieldOff} iconColor="#f87171" iconBg="rgba(248,113,113,0.12)" iconBorder="rgba(248,113,113,0.2)">
            <p>You agree <strong style={{ color: '#f1f5f9' }}>not</strong> to:</p>
            <XList items={[
              'Use the platform for any illegal or unauthorized purpose',
              'Violate any applicable local, national, or international laws',
              'Submit false or misleading information',
              'Attempt to gain unauthorized access to any part of the platform',
              'Interfere with or disrupt the integrity or performance of the services',
              'Use the platform to engage in predatory or fraudulent lending practices',
            ]} />
          </SectionCard>

          <SectionCard id="financial" num="05" title="Financial Disclaimer" icon={AlertTriangle} iconColor="#fbbf24" iconBg="rgba(245,158,11,0.12)" iconBorder="rgba(245,158,11,0.2)">
            <p>Money Lenders is a <strong style={{ color: '#f1f5f9' }}>management software platform only</strong>. We do not:</p>
            <XList items={[
              'Provide, arrange, or broker loans ourselves',
              'Guarantee any loan approvals or outcomes',
              'Offer financial, legal, or investment advice',
              'Hold, transfer, or process actual funds on behalf of users',
            ]} />
            <p style={{ marginTop: '1rem', padding: '0.875rem 1rem', background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: '0.75rem', color: '#94a3b8' }}>
              All lending activities conducted through the platform are the sole responsibility of the registered lender.
            </p>
          </SectionCard>

          <SectionCard id="ip" num="06" title="Intellectual Property" icon={Copyright} iconColor="#60a5fa" iconBg="rgba(59,130,246,0.12)" iconBorder="rgba(59,130,246,0.2)">
            <p>
              All content, features, and functionality of Money Lenders — including but not limited to design, text, graphics, and code —
              are the exclusive property of Money Lenders and are protected by applicable intellectual property laws.
              You may not copy, modify, distribute, or create derivative works without our explicit written consent.
            </p>
          </SectionCard>

          <SectionCard id="liability" num="07" title="Limitation of Liability" icon={XCircle} iconColor="#f87171" iconBg="rgba(248,113,113,0.12)" iconBorder="rgba(248,113,113,0.2)">
            <p>
              To the fullest extent permitted by law, Money Lenders shall not be liable for any indirect, incidental, special,
              consequential, or punitive damages arising from your use of the platform, including loss of profits, data, or
              business opportunities. Our total liability to you shall not exceed the amount you paid us in the 12 months
              preceding the claim.
            </p>
          </SectionCard>

          <SectionCard id="termination" num="08" title="Termination" icon={XCircle}>
            <p>
              We reserve the right to suspend or terminate your account at our sole discretion if you violate these Terms
              or engage in conduct harmful to other users or the platform. Upon termination, your right to use the service
              will immediately cease. You may also delete your account at any time from your account settings.
            </p>
          </SectionCard>

          <SectionCard id="changes" num="09" title="Changes to Terms" icon={RefreshCw} iconColor="#34d399" iconBg="rgba(52,211,153,0.12)" iconBorder="rgba(52,211,153,0.2)">
            <p>
              We may update these Terms of Service from time to time. We will notify registered users of significant changes
              via email or an in-app notification. Continued use of the platform after changes constitutes acceptance of the
              updated terms.
            </p>
          </SectionCard>

          <SectionCard id="governing" num="10" title="Governing Law" icon={Scale} iconColor="#a78bfa" iconBg="rgba(139,92,246,0.12)" iconBorder="rgba(139,92,246,0.2)">
            <p>
              These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising out
              of or relating to these Terms shall be subject to the exclusive jurisdiction of the courts located in India.
            </p>
          </SectionCard>

          <SectionCard id="contact" num="11" title="Contact Us" icon={Mail}>
            <p>If you have questions about these Terms, please contact us:</p>
            <div style={{ marginTop: '1.25rem', background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(34,211,238,0.15)', borderRadius: '0.875rem', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <p style={{ margin: 0 }}><strong style={{ color: '#f1f5f9' }}>Money Lenders</strong></p>
              <p style={{ margin: 0 }}>Email: <a href="mailto:legal@moneylenders.app" style={{ color: '#22d3ee', textDecoration: 'none' }}>legal@moneylenders.app</a></p>
              <p style={{ margin: 0 }}>Website: <Link to="/landing" style={{ color: '#22d3ee', textDecoration: 'none' }}>moneylenders.app</Link></p>
            </div>
          </SectionCard>
        </main>

        {/* ── Sticky ToC sidebar ── */}
        <aside style={{ position: 'sticky', top: '5.5rem', alignSelf: 'flex-start' }}>
          <div style={{
            background: 'rgba(15,23,42,0.7)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
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
                      transition: 'all 0.2s ease',
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
              <Link to="/privacy-policy" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', color: '#475569', textDecoration: 'none', marginTop: '0.5rem', transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#22d3ee'}
                onMouseLeave={e => e.currentTarget.style.color = '#475569'}
              >
                Privacy Policy →
              </Link>
            </div>
          </div>
        </aside>
      </div>

      {/* ── Footer bar ── */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '1.5rem', textAlign: 'center' }}>
        <p style={{ fontSize: '0.8rem', color: '#334155' }}>
          © 2026 Money Lenders. All rights reserved.&nbsp;·&nbsp;
          <Link to="/privacy-policy" style={{ color: '#475569', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#22d3ee'}
            onMouseLeave={e => e.currentTarget.style.color = '#475569'}
          >
            Privacy Policy
          </Link>
        </p>
      </div>

      {/* Responsive: hide sidebar on mobile */}
      <style>{`
        @media (max-width: 768px) {
          main + aside { display: none !important; }
          div[style*="grid-template-columns: 1fr 260px"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
