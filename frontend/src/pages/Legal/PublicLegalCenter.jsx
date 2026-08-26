import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Scale, FileText, TrendingUp, Calendar, ShieldCheck, AlertTriangle, Lock, Phone, ChevronDown, ChevronUp } from 'lucide-react';

// ── Policy catalogue (no desc — content lives inside the accordion) ──────────
const POLICY_TYPES = [
  { key: 'terms',         label: 'Terms & Conditions',      icon: FileText,      color: '#0d9488' },
  { key: 'interest',      label: 'Interest Policy',          icon: TrendingUp,    color: '#6366f1' },
  { key: 'emiPayment',    label: 'EMI & Payment Policy',     icon: Calendar,      color: '#f59e0b' },
  { key: 'foreclosure',   label: 'Foreclosure Policy',       icon: Scale,         color: '#ef4444' },
  { key: 'defaultOverdue',label: 'Default & Overdue Policy', icon: AlertTriangle, color: '#f97316' },
  { key: 'privacy',       label: 'Privacy Policy',           icon: Lock,          color: '#8b5cf6' },
  { key: 'contact',       label: 'Contact Information',      icon: Phone,         color: '#0ea5e9' },
];

// ── Default policy statements shown before live data loads ───────────────────
// Each entry is an array of bullet strings for clean rendering.
const FALLBACK_BULLETS = {
  terms: [
    'Loan agreements are entered into voluntarily by both lender and borrower.',
    'Borrowers agree to repay the loan according to the terms of the signed agreement.',
    'Loan terms remain effective until the loan is fully repaid, completed, or foreclosed.',
    'Future updates to platform policies do not affect existing signed agreements.',
    'All agreements are governed by applicable Indian law.',
  ],
  interest: [
    'The applicable interest rate is disclosed to the borrower before loan approval.',
    'The agreed interest rate is locked into the signed loan agreement.',
    'The calculation method (Simple or Compound) is specified in the agreement.',
    'Interest accrues from the loan disbursement date as per the agreed schedule.',
    'Any changes to interest terms require mutual written agreement.',
  ],
  emiPayment: [
    'EMI due dates are defined in the loan agreement and remain fixed.',
    'Only approved payment methods are accepted for EMI settlement.',
    'Payment receipts are generated automatically upon each successful payment.',
    'Payments are applied first to outstanding fees, then interest, then principal.',
    'Early repayment is subject to the foreclosure policy applicable to the loan.',
  ],
  foreclosure: [
    'Foreclosure eligibility depends on the policy configured at the time of agreement.',
    'Three options apply: Not Allowed, Allowed without discount, or Manual discount.',
    'When allowed, the borrower must pay the full remaining balance unless a discount is agreed.',
    'Any applicable discount is determined solely at the lender\'s discretion.',
    'Foreclosure requests must be submitted in writing and confirmed by the lender.',
  ],
  defaultOverdue: [
    'A grace period is granted after each EMI due date before a late fee applies.',
    'Late fees are calculated as specified in the individual loan agreement.',
    'Consecutive missed payments may result in the loan being classified as defaulted.',
    'Defaulted loans are subject to recovery procedures as per applicable law.',
    'Borrowers are encouraged to contact the lender immediately if payment is not possible.',
  ],
  privacy: [
    'Personal and financial information is collected only for loan processing purposes.',
    'Data is stored securely and is not shared with third parties without consent.',
    'Borrowers have the right to request access to their stored personal data.',
    'Data is retained only for as long as legally required or operationally necessary.',
    'All data handling complies with applicable Indian data protection regulations.',
  ],
  contact: [
    'For loan-related queries, contact the lender using the details on your agreement.',
    'Payment disputes should be raised in writing within 7 days of the transaction.',
    'Legal notices must be sent to the registered address of the lender.',
    'Support requests submitted through the platform are responded to within 2 business days.',
    'For urgent issues, contact the lender directly via the phone number on your agreement.',
  ],
};

const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Not disclosed';

// Parse content from DB: if it contains bullet markers (• or -) use as-is,
// otherwise split by newline and filter empty lines into a bullet array.
const parseContent = (raw) => {
  if (!raw) return null;
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
  return lines.map(l => l.replace(/^[•\-\*]\s*/, ''));
};

// ── Policy Accordion Card ────────────────────────────────────────────────────
function PolicyCard({ policy, data }) {
  const [open, setOpen] = useState(false);
  const Icon = policy.icon;
  const version   = data?.version  || 'v1.0';
  const updatedAt = data?.updatedAt || null;

  // Prefer live DB content (parsed into bullets), fall back to static bullets
  const bullets = data?.content
    ? (parseContent(data.content) || FALLBACK_BULLETS[policy.key])
    : FALLBACK_BULLETS[policy.key] || [];

  return (
    <div
      style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '0.875rem', overflow: 'hidden', transition: 'border-color 0.2s, box-shadow 0.2s' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = `${policy.color}55`; e.currentTarget.style.boxShadow = `0 0 0 1px ${policy.color}22`; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      {/* ── Header (always visible) ── */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: '1.05rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.875rem' }}
      >
        <div style={{ flexShrink: 0, width: 38, height: 38, borderRadius: '0.6rem', background: `${policy.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={17} color={policy.color} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f1f5f9' }}>{policy.label}</span>
            <span style={{ fontSize: '0.66rem', fontWeight: 700, color: policy.color, background: `${policy.color}18`, padding: '0.12rem 0.5rem', borderRadius: '999px', border: `1px solid ${policy.color}35`, letterSpacing: '0.02em' }}>
              {version}
            </span>
          </div>
          <p style={{ fontSize: '0.71rem', color: '#3b4f62', margin: '0.15rem 0 0' }}>
            Last updated: {fmtDate(updatedAt)}
          </p>
        </div>

        <div style={{ flexShrink: 0, color: '#475569' }}>
          {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </div>
      </button>

      {/* ── Expanded body ── */}
      {open && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '1rem 1.25rem 1.25rem 1.25rem', background: 'rgba(255,255,255,0.012)' }}>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            {bullets.map((line, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                <span style={{ flexShrink: 0, marginTop: '0.35rem', width: 5, height: 5, borderRadius: '50%', background: policy.color, opacity: 0.8 }} />
                <span style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.65 }}>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}


// ── Page ─────────────────────────────────────────────────────────────────────
export default function PublicLegalCenter() {
  const [policies, setPolicies] = useState({});
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const base = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    fetch(`${base}/legal/public`)
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        if (data?.policies) {
          const map = {};
          data.policies.forEach(p => { map[p.policyType] = { version: p.version, updatedAt: p.createdAt, content: p.content }; });
          setPolicies(map);
        }
      })
      .catch(() => { /* silent — use static fallback */ })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#020617', color: '#f1f5f9', fontFamily: 'inherit' }}>

      {/* Sticky nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(2,6,23,0.92)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0.875rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
          <div style={{ width: '1.75rem', height: '1.75rem', borderRadius: '0.45rem', background: 'linear-gradient(135deg,#06b6d4,#10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={13} color="#fff" fill="#fff" />
          </div>
          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f1f5f9' }}>Money Lenders</span>
        </Link>
        <Link to="/" style={{ fontSize: '0.82rem', color: '#64748b', textDecoration: 'none', transition: 'color 0.2s' }}
          onMouseEnter={e => (e.target.style.color = '#22d3ee')} onMouseLeave={e => (e.target.style.color = '#64748b')}>
          ← Back to Home
        </Link>
      </nav>

      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '4.5rem 2rem 3rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', background: 'rgba(13,148,136,0.1)', border: '1px solid rgba(13,148,136,0.22)', borderRadius: '999px', padding: '0.28rem 0.85rem', fontSize: '0.72rem', fontWeight: 700, color: '#0d9488', letterSpacing: '0.06em', marginBottom: '1.25rem' }}>
          <ShieldCheck size={12} />
          LEGAL DOCUMENTATION
        </div>
        <h1 style={{ fontSize: 'clamp(1.8rem,4vw,2.75rem)', fontWeight: 800, color: '#f1f5f9', margin: '0 0 0.875rem', lineHeight: 1.15 }}>
          Legal Center
        </h1>
        <p style={{ fontSize: '0.975rem', color: '#64748b', maxWidth: 540, margin: '0 auto 0.625rem', lineHeight: 1.7 }}>
          All legal policies governing our platform — versioned, timestamped, and permanently referenced in every loan agreement.
        </p>
        <p style={{ fontSize: '0.8rem', color: '#334155', maxWidth: 500, margin: '0 auto' }}>
          The specific policy versions accepted for each loan are securely locked into an immutable Agreement Snapshot and cannot be altered after signing.
        </p>
      </div>

      {/* Policy list */}
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 1.5rem 5rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#475569', fontSize: '0.875rem' }}>Loading policies…</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
            {POLICY_TYPES.map(p => <PolicyCard key={p.key} policy={p} data={policies[p.key]} />)}
          </div>
        )}

        {/* Immutability notice */}
        <div style={{ marginTop: '2.5rem', padding: '1.25rem 1.4rem', background: 'rgba(13,148,136,0.07)', border: '1px solid rgba(13,148,136,0.2)', borderRadius: '0.875rem' }}>
          <div style={{ display: 'flex', gap: '0.875rem', alignItems: 'flex-start' }}>
            <ShieldCheck size={20} color="#0d9488" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <p style={{ fontWeight: 700, color: '#0d9488', fontSize: '0.875rem', marginBottom: '0.35rem' }}>Immutable Agreement Snapshots</p>
              <p style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.7 }}>
                When a loan agreement is generated, the exact versions of all applicable policies are permanently locked into an immutable Agreement Snapshot stored with the loan record.
                Future updates to any policy shown above will <strong style={{ color: '#94a3b8' }}>never</strong> affect previously signed agreements — ensuring legal certainty for both lenders and borrowers.
              </p>
            </div>
          </div>
        </div>

        {/* Page footer */}
        <div style={{ textAlign: 'center', marginTop: '2.25rem' }}>
          <p style={{ fontSize: '0.76rem', color: '#1e293b' }}>
            © {new Date().getFullYear()} Money Lenders. All rights reserved.&nbsp;·&nbsp;
            <Link to="/privacy-policy" style={{ color: '#334155', textDecoration: 'none' }}
              onMouseEnter={e => (e.target.style.color = '#22d3ee')} onMouseLeave={e => (e.target.style.color = '#334155')}>
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
