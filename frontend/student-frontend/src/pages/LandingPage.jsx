import React from 'react';
import { ArrowRight, BarChart3, BrainCircuit, KeyRound, LogIn, ShieldCheck, Sparkles, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getStudentUser } from '../services/api';

export default function LandingPage() {
  const student = getStudentUser();

  return (
    <div className="landing-page">
      {/* Top Navigation Bar with Sign In & Register buttons */}
      <header className="landing-nav">
        <div className="brand-lockup">
          <div className="brand-mark">
            <span />
            <span />
            <span />
          </div>
          <span>
            Student <b>Portal</b>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          {student ? (
            <Link className="button primary small" to="/analytics">
              <span>Go to Analytics</span>
              <ArrowRight size={14} />
            </Link>
          ) : (
            <>
              <Link className="button text-button" to="/login">
                <LogIn size={15} />
                <span>Student Login</span>
              </Link>
              <Link className="button primary small" to="/register">
                <UserPlus size={14} />
                <span>Register</span>
              </Link>
            </>
          )}
        </div>
      </header>

      <main>
        {/* Hero Section matching Teacher Portal */}
        <section className="hero-section">
          <div className="hero-copy">
            <span className="eyebrow">A clearer signal for every student</span>
            <h1>
              Turn live assessments into <em>measurable mastery.</em>
            </h1>
            <p>
              Student Portal gives learners a focused workspace for teacher-connected quizzes, real-time assessment feedback, and granular AI performance insights.
            </p>
            <div className="hero-actions">
              <Link className="button primary" to={student ? "/analytics" : "/login"}>
                <span>{student ? "Enter Student Workspace" : "Sign In to Portal"}</span>
                <ArrowRight size={17} />
              </Link>
              {!student && (
                <Link className="button secondary" to="/register">
                  <span>Create Account</span>
                </Link>
              )}
              <span className="hero-note">
                <ShieldCheck size={16} /> Teacher key gated assessments
              </span>
            </div>
          </div>

          <div className="hero-visual">
            <div className="visual-card-graphic">
              <div>
                <span className="eyebrow" style={{ color: '#a8c5bd' }}>
                  TELEMETRY ENGINE
                </span>
                <h3>
                  Adaptive mastery tracking with instant feedback.
                </h3>
                <p>
                  Connect your teacher's key, attempt curriculum questions, and receive targeted AI remedial actions.
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255, 255, 255, 0.12)', paddingTop: '1.2rem', marginTop: '1.5rem' }}>
                <div>
                  <small style={{ display: 'block', color: '#8db5aa', fontSize: '0.62rem', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.1em' }}>
                    SOCKET SYNC
                  </small>
                  <strong style={{ fontSize: '0.92rem' }}>Port 5001</strong>
                </div>
                <div>
                  <small style={{ display: 'block', color: '#8db5aa', fontSize: '0.62rem', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.1em' }}>
                    CURRICULUM
                  </small>
                  <strong style={{ fontSize: '0.92rem' }}>AI Graded</strong>
                </div>
              </div>
            </div>

            <div className="visual-stamp">
              01<br />
              <small>STUDENT<br />SIGNAL</small>
            </div>
          </div>
        </section>

        {/* Feature Grid matching Teacher Portal */}
        <section className="feature-section">
          <div className="section-intro">
            <span className="eyebrow">Focused learning, zero friction</span>
            <h2>Everything a student needs to master concepts and track growth.</h2>
          </div>

          <div className="feature-list">
            <Feature
              icon={KeyRound}
              title="Teacher Key Connection"
              text="Connect seamlessly with your teacher's unique connection key to unlock published curriculum quizzes."
            />
            <Feature
              icon={BrainCircuit}
              title="Live Assessment Arena"
              text="Attempt single-choice interactive MCQ tests with instant evaluation, animated progress, and timer."
            />
            <Feature
              icon={BarChart3}
              title="Performance Analytics"
              text="Inspect progression trend charts, subject-by-subject accuracy bars, and assessment history."
            />
            <Feature
              icon={Sparkles}
              title="AI Strategic Insights"
              text="Receive tailored remedial recommendations and revision strategies generated from your answers."
            />
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <span>EduMap Student Portal</span>
        <span>Designed for learners, schools, and colleges.</span>
      </footer>
    </div>
  );
}

function Feature({ icon: Icon, title, text }) {
  return (
    <article className="feature-item">
      <div className="feature-icon">
        <Icon size={20} />
      </div>
      <div>
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
    </article>
  );
}
