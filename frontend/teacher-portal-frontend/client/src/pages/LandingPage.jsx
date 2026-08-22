import { ArrowRight, BarChart3, BrainCircuit, KeyRound, LogIn, ShieldCheck, Sparkles, UserPlus, UsersRound } from 'lucide-react';
import { Link } from 'wouter';
import { useAuth } from '../context/AuthContext.jsx';

export default function LandingPage() {
  const { teacher, isAuthenticated } = useAuth();

  return (
    <div className="landing-page">
      <header className="landing-nav">
        <div className="brand-lockup">
          <div className="brand-mark">
            <span />
            <span />
            <span />
          </div>
          <span>Teacher <b>Portal</b></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          {isAuthenticated ? (
            <Link className="button primary small" href="/dashboard/overview">
              <span>Go to Dashboard</span>
              <ArrowRight size={14} />
            </Link>
          ) : (
            <>
              <Link className="button text-button" href="/login">
                <LogIn size={15} />
                <span>Sign In</span>
              </Link>
              <Link className="button primary small" href="/register">
                <UserPlus size={14} />
                <span>Register as Teacher</span>
              </Link>
            </>
          )}
        </div>
      </header>

      <main>
        <section className="hero-section">
          <div className="hero-copy">
            <span className="eyebrow">A clearer signal for every lesson</span>
            <h1>Turn curriculum into <em>better questions.</em></h1>
            <p>
              Teacher Portal gives educators a focused workspace for AI-assisted quiz creation, student connection, and performance insight.
            </p>
            <div className="hero-actions">
              <Link className="button primary" href={isAuthenticated ? "/dashboard/overview" : "/register"}>
                <span>{isAuthenticated ? "Enter Teacher Dashboard" : "Get Started"}</span>
                <ArrowRight size={17} />
              </Link>
              {!isAuthenticated && (
                <Link className="button secondary" href="/login">
                  <span>Sign In</span>
                </Link>
              )}
              <span className="hero-note">
                <ShieldCheck size={16} /> Built for teacher workflows
              </span>
            </div>
          </div>

          <div className="hero-visual">
            <div className="visual-card-graphic" style={{ background: '#1c3640', color: '#fff', padding: '2rem', minHeight: '280px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid rgba(255, 255, 255, 0.12)' }}>
              <div>
                <span className="eyebrow" style={{ color: '#a8c5bd' }}>
                  CURRICULUM AI ENGINE
                </span>
                <h3 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: '1.45rem', margin: '0.6rem 0', fontWeight: 400, color: '#fff' }}>
                  Instant AI assessment synthesis and mastery telemetry.
                </h3>
                <p style={{ color: '#a0b9b1', fontSize: '0.82rem', lineHeight: 1.6, margin: 0 }}>
                  Generate targeted curriculum MCQs, broadcast connection keys to learners, and track live accuracy across all subjects.
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255, 255, 255, 0.12)', paddingTop: '1.2rem', marginTop: '1.5rem' }}>
                <div>
                  <small style={{ display: 'block', color: '#8db5aa', fontSize: '0.62rem', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.1em' }}>
                    TEACHER GATEWAY
                  </small>
                  <strong style={{ fontSize: '0.92rem', color: '#fff' }}>Real-time Sync</strong>
                </div>
                <div>
                  <small style={{ display: 'block', color: '#8db5aa', fontSize: '0.62rem', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.1em' }}>
                    AI MODEL
                  </small>
                  <strong style={{ fontSize: '0.92rem', color: '#fff' }}>Gemini AI</strong>
                </div>
              </div>
            </div>

            <div className="visual-stamp">
              01<br />
              <small>LESSON<br />SIGNAL</small>
            </div>
          </div>
        </section>

        <section className="feature-section">
          <div className="section-intro">
            <span className="eyebrow">One workspace, less noise</span>
            <h2>Everything a teacher needs to move from lesson plan to insight.</h2>
          </div>
          <div className="feature-list">
            <Feature
              icon={BrainCircuit}
              title="AI Quiz Generation"
              text="Shape a curriculum brief into a quiz draft your backend can refine and deliver."
              href="/dashboard/create-quiz"
            />
            <Feature
              icon={UsersRound}
              title="Student Management"
              text="Connect students through a clear teacher key and keep their workspace visible."
              href="/dashboard/students"
            />
            <Feature
              icon={BarChart3}
              title="Performance Reports"
              text="Read the signals behind submissions with focused, teacher-ready reports."
              href="/dashboard/reports"
            />
            <Feature
              icon={Sparkles}
              title="AI-powered Insights"
              text="Surface patterns from real classroom data without burying the evidence."
              href="/dashboard/overview"
            />
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <span>EduMap Teacher Portal</span>
        <div style={{ display: 'flex', gap: '1.2rem' }}>
          <Link href="/dashboard/overview" style={{ color: 'inherit' }}>Dashboard</Link>
          <Link href="/dashboard/create-quiz" style={{ color: 'inherit' }}>Create Quiz</Link>
          <Link href="/dashboard/students" style={{ color: 'inherit' }}>Students</Link>
          <Link href="/dashboard/reports" style={{ color: 'inherit' }}>Reports</Link>
        </div>
      </footer>
    </div>
  );
}

function Feature({ icon: Icon, title, text, href }) {
  return (
    <article className="feature-item">
      <div className="feature-icon">
        <Icon size={20} />
      </div>
      <div>
        <h3>
          {href ? (
            <Link href={href} style={{ color: 'inherit' }}>
              {title}
            </Link>
          ) : (
            title
          )}
        </h3>
        <p>{text}</p>
      </div>
    </article>
  );
}
