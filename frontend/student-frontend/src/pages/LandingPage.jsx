import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  ExternalLink,
  GraduationCap,
  KeyRound,
  LogIn,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Users,
  UserPlus,
  Zap,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getStudentUser, API_BASE_URL, TEACHER_PORTAL_URL } from '../services/api';

export default function LandingPage() {
  const student = getStudentUser();
  const [backendStatus, setBackendStatus] = useState('checking');

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/health`)
      .then((r) => r.json())
      .then((d) => setBackendStatus(d.status === 'ok' ? 'online' : 'degraded'))
      .catch(() => setBackendStatus('offline'));
  }, []);

  const teacherPortalUrl = TEACHER_PORTAL_URL;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--paper, #f5f2ea)',
        color: 'var(--ink, #152735)',
        fontFamily: "'Manrope', sans-serif",
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top Global Navigation Bar */}
      <header
        style={{
          width: '100%',
          borderBottom: '1px solid rgba(21, 39, 53, 0.1)',
          background: 'rgba(245, 242, 234, 0.92)',
          backdropFilter: 'blur(8px)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '1rem 1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'flex-end',
                gap: '3px',
                width: '26px',
                height: '24px',
                padding: '4px 3px',
                background: 'var(--teal, #0e8f86)',
                borderRadius: '4px',
              }}
            >
              <span style={{ display: 'block', width: '3px', height: '8px', background: '#fff' }} />
              <span style={{ display: 'block', width: '3px', height: '14px', background: '#fff' }} />
              <span style={{ display: 'block', width: '3px', height: '10px', background: '#fff' }} />
            </div>
            <span style={{ fontSize: '1.05rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--ink)' }}>
              EduMap <span style={{ fontWeight: 400, color: 'var(--moss)' }}>Platform</span>
            </span>
          </div>

          {/* Nav Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            {/* Live Backend Badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: '#ffffff',
                border: '1px solid rgba(21,39,53,0.12)',
                borderRadius: '999px',
                padding: '0.35rem 0.8rem',
                fontSize: '0.74rem',
                fontWeight: 600,
              }}
            >
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: backendStatus === 'online' ? '#38a169' : '#e53e3e',
                }}
              />
              <span style={{ color: 'var(--ink)' }}>
                System: <b>{backendStatus === 'online' ? 'Online' : 'Connecting'}</b>
              </span>
            </div>

            <a
              href={teacherPortalUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Open Teacher Portal"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.85rem',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: 'var(--teal)',
                background: '#ffffff',
                border: '1px solid rgba(14, 143, 134, 0.3)',
                borderRadius: '6px',
                textDecoration: 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <Users size={14} />
              <span>Teacher Portal</span>
              <ExternalLink size={12} />
            </a>

            {student ? (
              <Link
                to="/analytics"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.45rem 0.95rem',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#ffffff',
                  background: 'var(--ink)',
                  borderRadius: '6px',
                  textDecoration: 'none',
                }}
              >
                <span>Student Workspace</span>
                <ArrowRight size={14} />
              </Link>
            ) : (
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <Link
                  to="/login"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.45rem 0.85rem',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: 'var(--ink)',
                    background: '#ffffff',
                    border: '1px solid rgba(21, 39, 53, 0.15)',
                    borderRadius: '6px',
                    textDecoration: 'none',
                  }}
                >
                  <LogIn size={13} />
                  <span>Student Sign In</span>
                </Link>
                <Link
                  to="/register"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.45rem 0.85rem',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: '#ffffff',
                    background: 'var(--teal)',
                    borderRadius: '6px',
                    textDecoration: 'none',
                  }}
                >
                  <UserPlus size={13} />
                  <span>Register</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main style={{ flex: 1, maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem', width: '100%' }}>
        {/* Hero Section */}
        <section style={{ padding: '3.5rem 0 2.5rem', textAlign: 'center' }}>
          {/* Eyebrow badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: '#e6f4f1',
              color: 'var(--teal)',
              padding: '0.35rem 0.95rem',
              borderRadius: '999px',
              fontSize: '0.76rem',
              fontWeight: 700,
              marginBottom: '1.2rem',
            }}
          >
            <Sparkles size={14} />
            <span>Closed-Loop Educational Intelligence Ecosystem</span>
          </div>

          {/* Main Title */}
          <h1
            style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: 'clamp(2.4rem, 4.5vw, 3.6rem)',
              lineHeight: 1.15,
              color: 'var(--ink)',
              margin: '0 auto 1.2rem',
              maxWidth: '850px',
              letterSpacing: '-0.02em',
            }}
          >
            One unified platform for <span style={{ fontStyle: 'italic', color: 'var(--teal)' }}>teachers & learners.</span>
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: '1.05rem',
              lineHeight: 1.65,
              color: '#4a5568',
              maxWidth: '680px',
              margin: '0 auto 3rem',
            }}
          >
            EduMap bridges classroom instruction with AI: Teachers generate instant curriculum quizzes and inspect telemetry, while students attempt live assessments and resolve doubts 24/7 with the EduAI study tutor.
          </p>

          {/* Dual Portal Selection Cards (Grid) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1.8rem',
              maxWidth: '960px',
              margin: '0 auto',
              textAlign: 'left',
            }}
          >
            {/* Card 1: Teacher & Educator Portal */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                border: '2px solid rgba(14, 143, 134, 0.25)',
                boxShadow: '0 10px 30px rgba(21, 39, 53, 0.07)',
                padding: '1.8rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                overflow: 'hidden',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'var(--teal)' }} />

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      background: '#e6f4f1',
                      color: 'var(--teal)',
                      display: 'grid',
                      placeItems: 'center',
                    }}
                  >
                    <Users size={22} />
                  </div>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      background: '#f1f5f9',
                      color: 'var(--ink)',
                      padding: '0.25rem 0.6rem',
                      borderRadius: '4px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    Educator Hub
                  </span>
                </div>

                <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--teal)', fontWeight: 800 }}>
                  Educator Workspace
                </span>
                <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.6rem', margin: '0.25rem 0 0.75rem', color: 'var(--ink)' }}>
                  Teacher Portal
                </h3>
                <p style={{ fontSize: '0.84rem', color: '#4a5568', lineHeight: 1.55, marginBottom: '1.2rem' }}>
                  Create AI curriculum assessments from NCERT syllabi, manage student connection keys, and inspect rich class accuracy telemetry.
                </p>

                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem', display: 'grid', gap: '0.55rem', fontSize: '0.8rem' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle2 size={15} color="var(--teal)" style={{ flexShrink: 0 }} />
                    <span><b>AI Quiz Generator:</b> Select grade, subject & chapters</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle2 size={15} color="var(--teal)" style={{ flexShrink: 0 }} />
                    <span><b>Teacher Key:</b> One-click connection with students</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle2 size={15} color="var(--teal)" style={{ flexShrink: 0 }} />
                    <span><b>Detailed Reports:</b> Chapter mastery, accuracy & rosters</span>
                  </li>
                </ul>
              </div>

              <a
                href={teacherPortalUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.8rem 1.2rem',
                  background: 'var(--teal, #0e8f86)',
                  color: '#ffffff',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  boxShadow: '0 4px 14px rgba(14, 143, 134, 0.25)',
                }}
              >
                <span>Launch Teacher Portal</span>
                <ExternalLink size={15} />
              </a>
            </div>

            {/* Card 2: Student Learning Arena */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                border: '2px solid rgba(21, 39, 53, 0.15)',
                boxShadow: '0 10px 30px rgba(21, 39, 53, 0.07)',
                padding: '1.8rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                overflow: 'hidden',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'var(--ink)' }} />

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      background: '#f1f5f9',
                      color: 'var(--ink)',
                      display: 'grid',
                      placeItems: 'center',
                    }}
                  >
                    <GraduationCap size={22} />
                  </div>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      background: '#e6f4f1',
                      color: 'var(--teal)',
                      padding: '0.25rem 0.6rem',
                      borderRadius: '4px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    Learner Hub
                  </span>
                </div>

                <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--teal)', fontWeight: 800 }}>
                  Learner Arena
                </span>
                <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.6rem', margin: '0.25rem 0 0.75rem', color: 'var(--ink)' }}>
                  Student Portal
                </h3>
                <p style={{ fontSize: '0.84rem', color: '#4a5568', lineHeight: 1.55, marginBottom: '1.2rem' }}>
                  Connect with your teacher, attempt live published quizzes, review mistake breakdowns, and chat with EduAI for instant doubt resolution.
                </p>

                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem', display: 'grid', gap: '0.55rem', fontSize: '0.8rem' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle2 size={15} color="var(--teal)" style={{ flexShrink: 0 }} />
                    <span><b>Live Quiz Arena:</b> Timed assessments & instant scoring</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle2 size={15} color="var(--teal)" style={{ flexShrink: 0 }} />
                    <span><b>Personalized Analytics:</b> Weak concept detection & charts</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle2 size={15} color="var(--teal)" style={{ flexShrink: 0 }} />
                    <span><b>24/7 EduAI Tutor:</b> Gemini-powered instant doubt solver</span>
                  </li>
                </ul>
              </div>

              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <Link
                  to={student ? '/analytics' : '/login'}
                  style={{
                    flex: 1,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.8rem 1rem',
                    background: 'var(--ink, #152735)',
                    color: '#ffffff',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    boxShadow: '0 4px 14px rgba(21, 39, 53, 0.2)',
                  }}
                >
                  <span>{student ? 'Go to Workspace' : 'Student Sign In'}</span>
                  <ArrowRight size={15} />
                </Link>
                {!student && (
                  <Link
                    to="/register"
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      padding: '0.8rem 1rem',
                      background: '#ffffff',
                      color: 'var(--ink)',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontWeight: 700,
                      fontSize: '0.88rem',
                    }}
                  >
                    <span>Register</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Unified Workflow Section */}
        <section
          style={{
            margin: '3rem auto 4rem',
            padding: '3rem 2rem',
            background: '#ffffff',
            borderRadius: '20px',
            border: '1px solid rgba(21, 39, 53, 0.1)',
            boxShadow: '0 8px 30px rgba(21, 39, 53, 0.05)',
          }}
        >
          <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 2.5rem' }}>
            <span
              style={{
                fontSize: '0.72rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'var(--teal)',
                fontWeight: 800,
                display: 'block',
                marginBottom: '0.5rem',
              }}
            >
              Unified Learning Workflow
            </span>
            <h2
              style={{
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontSize: 'clamp(1.8rem, 3vw, 2.4rem)',
                color: 'var(--ink)',
                lineHeight: 1.25,
                margin: '0 0 0.8rem',
              }}
            >
              How Teachers and Students collaborate through EduMap AI
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0, lineHeight: 1.6 }}>
              A connected loop that transforms teacher lesson plans into live student assessments and actionable classroom mastery reports.
            </p>
          </div>

          {/* 4-Card Responsive Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1.5rem',
            }}
          >
            <FeatureCard
              icon={Sparkles}
              step="1"
              title="AI Quiz Generation"
              subtitle="Teacher Portal"
              text="Teachers select subjects and chapters to automatically generate unique, non-repeating curriculum questions via Gemini AI."
            />
            <FeatureCard
              icon={KeyRound}
              step="2"
              title="Teacher Key Sync"
              subtitle="Student Portal"
              text="Students connect using their teacher's unique connection key to instantly sync published class quizzes."
            />
            <FeatureCard
              icon={BrainCircuit}
              step="3"
              title="24/7 EduAI Tutor"
              subtitle="Student Portal"
              text="Students get instant conceptual explanations, formula cheat-sheets, and step-by-step problem-solving directly in the portal."
            />
            <FeatureCard
              icon={BarChart3}
              step="4"
              title="Deep Telemetry"
              subtitle="Teacher Portal"
              text="Teachers inspect comprehensive reports showing class average accuracy %, chapter mastery bars, question error diagnostics, and student rosters."
            />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid rgba(21, 39, 53, 0.1)',
          background: '#ffffff',
          padding: '1.5rem 1.5rem',
          width: '100%',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--ink)' }}>EduMap Platform</span>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>· Complete Closed-Loop Learning System</span>
          </div>

          <div style={{ display: 'flex', gap: '1.2rem', fontSize: '0.82rem' }}>
            <a href={teacherPortalUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--teal)', fontWeight: 700 }}>
              Teacher Portal
            </a>
            <Link to="/login" style={{ color: 'var(--ink)', fontWeight: 700 }}>
              Student Portal
            </Link>
            <Link to="/gateway" style={{ color: 'var(--moss)', fontWeight: 700 }}>
              Gateway Hub
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, step, title, subtitle, text }) {
  return (
    <div
      style={{
        background: '#f8faf9',
        border: '1px solid rgba(21, 39, 53, 0.08)',
        borderRadius: '12px',
        padding: '1.4rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.8rem',
        position: 'relative',
        transition: 'transform 0.15s ease, background 0.15s ease',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: '#e6f4f1',
            color: 'var(--teal)',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <Icon size={18} />
        </div>
        <span
          style={{
            fontSize: '0.68rem',
            fontWeight: 800,
            color: 'var(--teal)',
            background: '#ffffff',
            border: '1px solid rgba(14, 143, 134, 0.2)',
            padding: '0.15rem 0.5rem',
            borderRadius: '999px',
          }}
        >
          Step {step}
        </span>
      </div>

      <div>
        <h3 style={{ fontSize: '0.96rem', fontWeight: 800, color: 'var(--ink)', margin: '0 0 0.2rem' }}>
          {title}
        </h3>
        <span style={{ fontSize: '0.68rem', color: 'var(--moss)', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
          {subtitle}
        </span>
        <p style={{ fontSize: '0.78rem', color: '#4a5568', lineHeight: 1.6, margin: 0 }}>
          {text}
        </p>
      </div>
    </div>
  );
}


