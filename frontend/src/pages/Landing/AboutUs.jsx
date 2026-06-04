import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  BookOpen, Lightbulb, CheckCircle2, XCircle,
  Laptop2, MessageSquare, FolderOpen, Smartphone,
  Github, Linkedin, Zap, ArrowUpRight, Target, Sparkles,
  Code2, GraduationCap,
} from 'lucide-react';
import Navbar from '../Landing/sections/Navbar';
import Footer from '../Landing/sections/Footer';
import '../Landing/landing.css';

/* ── Animation variants ────────────────────────────── */
const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };
// Use fadeUp for all directions on mobile — x-axis animations cause jitter
const fadeLeft  = fadeUp;
const fadeRight = fadeUp;

/* ── Why-choose card data ──────────────────────────── */
const whyCards = [
  {
    icon: Laptop2,
    title: 'Modern User Experience',
    desc: 'A clean, intuitive interface designed for efficiency. No clutter — just the tools you need, exactly when you need them.',
    iconColor: '#22d3ee',
    iconBg: 'rgba(6,182,212,0.14)',
    iconBorder: 'rgba(6,182,212,0.22)',
    glow: 'rgba(6,182,212,0.14)',
  },
  {
    icon: MessageSquare,
    title: 'Real-Time Communication',
    desc: 'Built-in chat between lenders and borrowers keeps everyone aligned. No need for external messaging apps.',
    iconColor: '#a78bfa',
    iconBg: 'rgba(139,92,246,0.14)',
    iconBorder: 'rgba(139,92,246,0.22)',
    glow: 'rgba(139,92,246,0.14)',
  },
  {
    icon: FolderOpen,
    title: 'Organized Record Management',
    desc: 'Loan histories, repayment schedules, invoices, and customer profiles — all structured and searchable in one place.',
    iconColor: '#34d399',
    iconBg: 'rgba(52,211,153,0.14)',
    iconBorder: 'rgba(52,211,153,0.22)',
    glow: 'rgba(52,211,153,0.14)',
  },
  {
    icon: Smartphone,
    title: 'Cross-Device Accessibility',
    desc: 'Fully responsive across desktop, tablet, and mobile. Manage your lending operations from anywhere, any time.',
    iconColor: '#fbbf24',
    iconBg: 'rgba(245,158,11,0.14)',
    iconBorder: 'rgba(245,158,11,0.22)',
    glow: 'rgba(245,158,11,0.14)',
  },
];

/* ── Challenge items ───────────────────────────────── */
const challenges = [
  'Manual record keeping with notebooks and paper',
  'Spreadsheet dependency with no real-time updates',
  'Difficult repayment tracking and follow-ups',
  'Scattered customer information across multiple tools',
];

/* ── Solution items ────────────────────────────────── */
const solutions = [
  'Centralized management — everything in one place',
  'Real-time loan and repayment tracking',
  'Organized, searchable records with full history',
  'Better operational efficiency as you scale',
];

export default function AboutUs() {
  return (
    <div className="landing-root">
      <Navbar />

      {/* ══════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════ */}
      <section style={{ minHeight: '82vh', display: 'flex', alignItems: 'center', paddingTop: '6rem', position: 'relative', overflow: 'hidden' }}>
        {/* Background blobs */}
        <div className="blob blob-cyan"    style={{ width: 700, height: 700, top: -200, left: -200, opacity: 0.5 }} />
        <div className="blob blob-emerald" style={{ width: 500, height: 500, bottom: -100, right: -150, opacity: 0.4 }} />

        <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ duration: 0.6 }}>
            {/* Badge */}
            <div className="badge-pill" style={{ marginBottom: '1.75rem', display: 'inline-flex' }}>
              <BookOpen size={13} strokeWidth={2} /> Our Story
            </div>

            <h1 style={{ fontSize: 'clamp(2.2rem,5.5vw,3.75rem)', fontWeight: 800, lineHeight: 1.08, color: '#f1f5f9', letterSpacing: '-0.025em', marginBottom: '1.5rem', maxWidth: 780, margin: '0 auto 1.5rem' }}>
              Building Smarter{' '}
              <span className="grad-text">Loan Management</span>
            </h1>

            <p style={{ fontSize: 'clamp(1rem,2vw,1.15rem)', color: '#94a3b8', lineHeight: 1.75, maxWidth: 620, margin: '0 auto 2.5rem' }}>
              Money Lenders was created with a simple goal — to make loan management easier,
              more organized, and more transparent for individuals and small businesses.
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/register" className="btn-glow" style={{ padding: '0.875rem 2rem', fontSize: '0.975rem' }}>
                Get Started Free <ArrowUpRight size={16} />
              </Link>
              <Link to="/login" className="btn-ghost" style={{ padding: '0.875rem 2rem', fontSize: '0.975rem' }}>
                Sign In
              </Link>
            </div>
          </motion.div>

          {/* Floating stat pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.6 }}
            style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '3.5rem' }}
          >
            {[
              { label: 'Full-Stack Platform', icon: '⚡' },
              { label: 'Real-Time Communication', icon: '💬' },
              { label: 'Cross-Device Support', icon: '📱' },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(15,23,42,0.7)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '9999px', padding: '0.5rem 1.125rem', backdropFilter: 'blur(12px)', fontSize: '0.82rem', color: '#94a3b8', fontWeight: 500 }}>
                <span>{s.icon}</span> {s.label}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          PROBLEM & SOLUTION
      ══════════════════════════════════════════════ */}
      <section className="section" style={{ background: 'linear-gradient(180deg,#020617 0%,#071129 100%)' }}>
        <div className="container">
          {/* Section header */}
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.5 }}
            style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h2 style={{ fontSize: 'clamp(1.75rem,4vw,2.5rem)', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em', marginBottom: '0.875rem' }}>
              The <span className="grad-text">Problem & Solution</span>
            </h2>
            <p style={{ color: '#64748b', fontSize: '1rem', maxWidth: 520, margin: '0 auto' }}>
              Traditional lending management is broken. We fixed it.
            </p>
            <div className="section-divider" />
          </motion.div>

          {/* Two-card grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '1.5rem' }}>
            {/* Challenge card */}
            <motion.div variants={fadeLeft} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.6 }}
              className="glass-card"
              style={{ padding: '2rem', borderColor: 'rgba(248,113,113,0.12)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '1.5rem' }}>
                <div style={{ width: '3rem', height: '3rem', borderRadius: '0.875rem', background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <XCircle size={20} color="#f87171" strokeWidth={1.75} />
                </div>
                <div>
                  <div style={{ fontSize: '0.65rem', color: '#f87171', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Before</div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f1f5f9', margin: 0 }}>The Challenge</h3>
                </div>
              </div>
              <div style={{ height: '1px', background: 'rgba(248,113,113,0.1)', marginBottom: '1.5rem' }} />
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {challenges.map((item, i) => (
                  <li key={i} style={{ display: 'flex', gap: '0.625rem', alignItems: 'flex-start' }}>
                    <XCircle size={15} color="#f87171" strokeWidth={2} style={{ marginTop: '0.18rem', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.65 }}>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Solution card */}
            <motion.div variants={fadeRight} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.6 }}
              className="glass-card"
              style={{ padding: '2rem', borderColor: 'rgba(52,211,153,0.15)', background: 'rgba(15,23,42,0.8)', boxShadow: '0 0 40px rgba(52,211,153,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '1.5rem' }}>
                <div style={{ width: '3rem', height: '3rem', borderRadius: '0.875rem', background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <CheckCircle2 size={20} color="#34d399" strokeWidth={1.75} />
                </div>
                <div>
                  <div style={{ fontSize: '0.65rem', color: '#34d399', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.2rem' }}>After</div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f1f5f9', margin: 0 }}>Our Solution</h3>
                </div>
              </div>
              <div style={{ height: '1px', background: 'rgba(52,211,153,0.1)', marginBottom: '1.5rem' }} />
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {solutions.map((item, i) => (
                  <li key={i} style={{ display: 'flex', gap: '0.625rem', alignItems: 'flex-start' }}>
                    <CheckCircle2 size={15} color="#34d399" strokeWidth={2} style={{ marginTop: '0.18rem', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.65 }}>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FOUNDER STORY
      ══════════════════════════════════════════════ */}
      <section className="section" style={{ background: '#020617' }}>
        <div className="container">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.5 }}
            style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h2 style={{ fontSize: 'clamp(1.75rem,4vw,2.5rem)', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em', marginBottom: '0.875rem' }}>
              The <span className="grad-text">Person Behind It</span>
            </h2>
            <div className="section-divider" />
          </motion.div>

          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.6 }}
            style={{ maxWidth: 760, margin: '0 auto' }}>
            <div
              className="glass-card"
              style={{
                padding: 'clamp(2rem,5vw,3rem)',
                background: 'linear-gradient(135deg,rgba(6,182,212,0.07),rgba(16,185,129,0.04))',
                borderColor: 'rgba(34,211,238,0.15)',
                boxShadow: '0 0 60px rgba(6,182,212,0.07)',
                position: 'relative',
                overflow: 'hidden',
              }}>
              {/* Decorative inner glow — no filter:blur to avoid mobile jank */}
              <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(34,211,238,0.05)', pointerEvents: 'none' }} />

              <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                {/* Avatar */}
                <div style={{ flexShrink: 0 }}>
                  <div style={{
                    width: '5.5rem', height: '5.5rem',
                    borderRadius: '1.25rem',
                    background: 'linear-gradient(135deg,#06b6d4,#10b981)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.75rem', fontWeight: 800, color: '#fff',
                    boxShadow: '0 0 36px rgba(6,182,212,0.3), inset 0 1px 0 rgba(255,255,255,0.15)',
                    letterSpacing: '-0.02em',
                  }}>
                    RS
                  </div>
                  {/* Role badge under avatar */}
                  <div style={{ marginTop: '0.625rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.65rem', color: '#22d3ee', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Founder</div>
                  </div>
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 240 }}>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.01em', marginBottom: '0.25rem' }}>
                    Rajdeep Singh
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 500 }}>Founder &amp; Full-Stack Developer</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', color: '#22d3ee', background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.2)', borderRadius: '9999px', padding: '0.2rem 0.6rem', fontWeight: 600 }}>
                      <GraduationCap size={11} strokeWidth={2} /> BCA Student
                    </span>
                  </div>

                  <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.8, marginBottom: '1.5rem' }}>
                    What started as a <strong style={{ color: '#e2e8f0' }}>learning journey in web development</strong> gradually evolved into a complete lending management platform. Driven by a passion for building practical software that solves real-world problems, Rajdeep built Money Lenders from the ground up — focused on usability, reliability, and continuous improvement.
                  </p>

                  <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
                    <a
                      href="https://github.com/Rajdeep2922"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: '0.625rem', padding: '0.55rem 1.1rem', fontSize: '0.85rem', color: '#e2e8f0', textDecoration: 'none', fontWeight: 600, transition: 'background 0.2s, border-color 0.2s', lineHeight: 1 }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)'; }}
                    >
                      <Github size={15} strokeWidth={1.75} /> GitHub
                    </a>
                    <a
                      href="https://www.linkedin.com/in/rajdeep-singh-3900b12b9/"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem', background: 'linear-gradient(135deg,#06b6d4,#10b981)', border: '1px solid transparent', borderRadius: '0.625rem', padding: '0.55rem 1.1rem', fontSize: '0.85rem', color: '#fff', textDecoration: 'none', fontWeight: 600, boxShadow: '0 0 18px rgba(6,182,212,0.35)', transition: 'box-shadow 0.2s', lineHeight: 1 }}
                      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 28px rgba(6,182,212,0.55)'; }}
                      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 18px rgba(6,182,212,0.35)'; }}
                    >
                      <Linkedin size={15} strokeWidth={1.75} /> LinkedIn
                    </a>
                  </div>
                </div>
              </div>

              {/* Quote */}
              <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.8, fontStyle: 'italic', margin: 0 }}>
                  <span style={{ color: '#22d3ee', fontSize: '1.5rem', lineHeight: 0.5, verticalAlign: 'bottom', fontFamily: 'Georgia, serif', marginRight: '0.25rem' }}>"</span>
                  This project represents more than just software — it reflects a commitment to learning, innovation, and creating tools that genuinely make everyday financial management simpler and more efficient.
                  <span style={{ color: '#22d3ee', fontSize: '1.5rem', lineHeight: 0.5, verticalAlign: 'bottom', fontFamily: 'Georgia, serif', marginLeft: '0.1rem' }}>"</span>
                </p>
                <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <div style={{ width: 20, height: 2, background: 'linear-gradient(90deg,#22d3ee,#34d399)', borderRadius: 2 }} />
                  <span style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 600 }}>Rajdeep Singh</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          WHY CHOOSE
      ══════════════════════════════════════════════ */}
      <section className="section" style={{ background: 'linear-gradient(180deg,#020617 0%,#071129 100%)' }}>
        <div className="container">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.5 }}
            style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h2 style={{ fontSize: 'clamp(1.75rem,4vw,2.5rem)', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em', marginBottom: '0.875rem' }}>
              Why Choose <span className="grad-text">Money Lenders</span>
            </h2>
            <p style={{ color: '#64748b', fontSize: '1rem', maxWidth: 520, margin: '0 auto' }}>
              Unlike basic loan tracking tools, we offer a modern, complete platform built for how you actually work.
            </p>
            <div className="section-divider" />
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '1.5rem' }}>
            {whyCards.map((c, i) => {
              const Icon = c.icon;
              return (
                <motion.div
                  key={c.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="glass-card"
                  style={{ padding: '1.75rem', transition: 'all 0.3s ease', cursor: 'default' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = c.iconBorder; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 0 32px ${c.glow}`; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: '1rem', background: c.iconBg, border: `1px solid ${c.iconBorder}`, backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', boxShadow: `0 0 24px ${c.glow}` }}>
                    <Icon size={22} color={c.iconColor} strokeWidth={1.75} />
                  </div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '0.625rem' }}>{c.title}</h3>
                  <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.7 }}>{c.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          VISION
      ══════════════════════════════════════════════ */}
      <section className="section" style={{ background: 'linear-gradient(180deg,#071129 0%,#020617 100%)', position: 'relative', overflow: 'hidden' }}>
        <div className="blob blob-cyan" style={{ width: 500, height: 500, top: '50%', left: '50%', transform: 'translate(-50%,-50%)', opacity: 0.35 }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7 }}
          >
            <div
              className="glass-card"
              style={{
                maxWidth: 780,
                margin: '0 auto',
                padding: 'clamp(2.5rem,5vw,4rem)',
                textAlign: 'center',
                background: 'linear-gradient(135deg,rgba(6,182,212,0.09),rgba(16,185,129,0.05))',
                borderColor: 'rgba(34,211,238,0.18)',
                boxShadow: '0 0 80px rgba(6,182,212,0.09)',
              }}>
              {/* Icon */}
              <div style={{ width: '4.5rem', height: '4.5rem', borderRadius: '1.25rem', background: 'linear-gradient(135deg,rgba(6,182,212,0.2),rgba(16,185,129,0.12))', border: '1px solid rgba(34,211,238,0.3)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.75rem', boxShadow: '0 0 36px rgba(6,182,212,0.22), inset 0 1px 0 rgba(255,255,255,0.06)' }}>
                <Target size={30} color="#22d3ee" strokeWidth={1.6} />
              </div>

              <div className="badge-pill" style={{ marginBottom: '1.25rem', display: 'inline-flex' }}>
                <Sparkles size={13} strokeWidth={2} /> Our Vision
              </div>

              <h2 style={{ fontSize: 'clamp(1.6rem,4vw,2.4rem)', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: '1.25rem' }}>
                Empowering Lenders with{' '}
                <span className="grad-text">Modern Technology</span>
              </h2>

              <p style={{ fontSize: '1rem', color: '#94a3b8', lineHeight: 1.85, marginBottom: '2rem', maxWidth: 600, margin: '0 auto 2rem' }}>
                As the platform continues to grow, the vision remains the same — empowering lenders with modern technology that <strong style={{ color: '#e2e8f0' }}>saves time</strong>, <strong style={{ color: '#e2e8f0' }}>reduces complexity</strong>, and helps them stay focused on what matters most: their lending operations.
              </p>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/register" className="btn-glow" style={{ padding: '0.875rem 2rem', fontSize: '0.975rem' }}>
                  Start for Free <ArrowUpRight size={16} />
                </Link>
                <Link to="/login" className="btn-ghost" style={{ padding: '0.875rem 2rem', fontSize: '0.975rem' }}>
                  Sign In
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Dev note ribbon */}
      <div style={{ background: 'rgba(15,23,42,0.6)', borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)', padding: '0.875rem 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <Code2 size={14} color="#22d3ee" strokeWidth={2} />
          <p style={{ fontSize: '0.8rem', color: '#475569', margin: 0, textAlign: 'center' }}>
            Built with passion by <strong style={{ color: '#94a3b8' }}>Rajdeep Singh</strong> · Full-Stack Developer &amp; BCA Student
          </p>
          <Zap size={12} color="#22d3ee" fill="#22d3ee" />
        </div>
      </div>

      <Footer />
    </div>
  );
}
