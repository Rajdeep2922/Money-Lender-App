import { useEffect, useRef } from 'react';
import { UserPlus, FilePlus2, TrendingUp, Rocket } from 'lucide-react';

/* ── Inline IntersectionObserver hook ── */
function useInView(options = {}) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      el.classList.add('in-view');
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('in-view'); observer.disconnect(); } },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px', ...options }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

const steps = [
  { icon: UserPlus,   num: 1, title: 'Create Account',     desc: 'Sign up in minutes and set up your lending account with full verification.' },
  { icon: FilePlus2,  num: 2, title: 'Add Loan Requests',  desc: 'Add new loan requests and manage borrower details with ease.' },
  { icon: TrendingUp, num: 3, title: 'Track & Manage',     desc: 'Monitor repayments, collections, and loan performance in real time.' },
  { icon: Rocket,     num: 4, title: 'Grow Your Business', desc: 'Make data-driven decisions and scale your lending confidently.' },
];

export default function HowItWorks() {
  const headingRef = useInView();
  const desktopRef = useInView();
  const mobileRef  = useInView();

  return (
    <section id="how-it-works" className="section" style={{ background: '#020617' }}>
      <div className="container">

        {/* Heading */}
        <div ref={headingRef} className="anim-ready" style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <h2 style={{ fontSize: 'clamp(1.75rem,4vw,2.5rem)', fontWeight: 800, color: '#f1f5f9', marginBottom: '0.875rem', letterSpacing: '-0.02em' }}>
            How It <span className="grad-text">Works</span>
          </h2>
          <p style={{ color: '#64748b', fontSize: '1rem' }}>Simple steps to get started with Money Lenders</p>
          <div className="section-divider" />
        </div>

        {/* ── Desktop horizontal timeline ── */}
        <div ref={desktopRef} className="anim-stagger hide-mobile" style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', top: '2.75rem', left: '12%', right: '12%', height: 2, background: 'linear-gradient(90deg,#22d3ee,#34d399)', opacity: 0.25, zIndex: 0 }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1.5rem', position: 'relative', zIndex: 1 }}>
            {steps.map(s => {
              const Icon = s.icon;
              return (
                <div key={s.num} className="anim-item" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <div style={{
                    width: '5.5rem', height: '5.5rem', borderRadius: '50%',
                    background: 'linear-gradient(135deg,rgba(6,182,212,0.18),rgba(16,185,129,0.12))',
                    border: '1.5px solid rgba(34,211,238,0.3)',
                    backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#22d3ee', marginBottom: '1.25rem', position: 'relative',
                    boxShadow: '0 0 28px rgba(6,182,212,0.18), inset 0 1px 0 rgba(255,255,255,0.06)',
                  }}>
                    <Icon size={32} strokeWidth={1.6} />
                    <div style={{ position: 'absolute', top: -8, right: -8, width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg,#06b6d4,#10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#fff', boxShadow: '0 0 10px rgba(6,182,212,0.4)' }}>
                      {s.num}
                    </div>
                  </div>
                  <h3 style={{ fontSize: '0.975rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '0.5rem' }}>{s.title}</h3>
                  <p style={{ fontSize: '0.825rem', color: '#64748b', lineHeight: 1.6 }}>{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Mobile vertical timeline ── */}
        <div ref={mobileRef} className="show-mobile" style={{ display: 'flex', flexDirection: 'column', gap: 0, position: 'relative' }}>
          {/* Connector line */}
          <div style={{ position: 'absolute', left: '1.625rem', top: '2rem', bottom: '2rem', width: 2, background: 'linear-gradient(180deg,#22d3ee,#34d399)', opacity: 0.25, zIndex: 0 }} />

          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={s.num}
                style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', paddingBottom: i < steps.length - 1 ? '1.75rem' : 0, position: 'relative', zIndex: 1 }}
              >
                {/* Icon circle */}
                <div style={{
                  width: '3.25rem', height: '3.25rem', borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg,rgba(6,182,212,0.35),rgba(16,185,129,0.28))',
                  border: '1.5px solid rgba(34,211,238,0.45)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#22d3ee', position: 'relative',
                }}>
                  <Icon size={20} strokeWidth={1.6} />
                  {/* Step badge */}
                  <div style={{
                    position: 'absolute', top: -6, right: -6,
                    width: 18, height: 18, borderRadius: '50%',
                    background: 'linear-gradient(135deg,#06b6d4,#10b981)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.55rem', fontWeight: 800, color: '#fff',
                  }}>
                    {s.num}
                  </div>
                </div>

                <div style={{ paddingTop: '0.5rem', flex: 1 }}>
                  <div style={{ fontSize: '0.6rem', color: '#22d3ee', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Step {s.num}</div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '0.3rem' }}>{s.title}</h3>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.65, margin: 0 }}>{s.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
