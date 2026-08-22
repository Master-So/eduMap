import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  Users,
  BarChart3,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Zap,
  Layers,
  Award,
  ArrowRight,
  RefreshCw,
  Cpu,
  Database,
  Globe,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { API_BASE_URL, TEACHER_PORTAL_URL } from '../services/api';

export default function GatewayPage() {
  const [backendStatus, setBackendStatus] = useState('checking');
  const [dbStatus, setDbStatus] = useState('checking');

  const checkHealth = async () => {
    setBackendStatus('checking');
    try {
      const res = await fetch(`${API_BASE_URL}/api/health`);
      const data = await res.json();
      if (res.ok && data.status === 'ok') {
        setBackendStatus('online');
        setDbStatus(data.database === 'connected' ? 'connected' : 'connecting');
      } else {
        setBackendStatus('degraded');
      }
    } catch {
      setBackendStatus('offline');
      setDbStatus('offline');
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const teacherUrl = TEACHER_PORTAL_URL;
  const studentUrl = '/';

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at 10% 20%, #f0f7f5 0%, #faf8f5 90%)',
        color: 'var(--ink, #152735)',
        fontFamily: "'Manrope', sans-serif",
        padding: '2rem 1.5rem 4rem',
      }}
    >
      {/* Top Brand Bar */}
      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto 2.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(21,39,53,0.08)',
          paddingBottom: '1.2rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'flex-end',
              gap: '3px',
              width: '28px',
              height: '27px',
              padding: '5px 4px',
              background: 'var(--teal, #0e8f86)',
            }}
          >
            <span style={{ display: 'block', width: '4px', height: '9px', background: '#fff' }} />
            <span style={{ display: 'block', width: '4px', height: '15px', background: '#fff' }} />
            <span style={{ display: 'block', width: '4px', height: '11px', background: '#fff' }} />
          </div>
          <div>
            <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--teal)', fontWeight: 800 }}>
              AI Ecosystem Gateway
            </span>
            <h1 style={{ margin: 0, fontSize: '1.25rem', fontFamily: "'DM Serif Display', serif", color: 'var(--ink)' }}>
              EduMap Unified Platform
            </h1>
          </div>
        </div>

        {/* Live System Diagnostics */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: '#fff',
              border: '1px solid rgba(21,39,53,0.1)',
              borderRadius: '999px',
              padding: '0.35rem 0.85rem',
              fontSize: '0.74rem',
              fontWeight: 600,
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: backendStatus === 'online' ? '#38a169' : backendStatus === 'checking' ? '#d69e2e' : '#e53e3e',
              }}
            />
            <span>
              Backend API:{' '}
              <strong style={{ color: backendStatus === 'online' ? '#2f855a' : 'inherit' }}>
                {backendStatus === 'online' ? 'Online & Ready' : backendStatus}
              </strong>
            </span>
          </div>

          <button
            onClick={checkHealth}
            title="Refresh system health"
            style={{
              background: '#fff',
              border: '1px solid rgba(21,39,53,0.1)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer',
              color: 'var(--ink)',
            }}
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Hero Headline */}
      <div style={{ maxWidth: '900px', margin: '0 auto 3rem', textAlign: 'center' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: '#e6f4f1',
            color: 'var(--teal)',
            padding: '0.35rem 0.9rem',
            borderRadius: '999px',
            fontSize: '0.76rem',
            fontWeight: 700,
            marginBottom: '1rem',
          }}
        >
          <Sparkles size={14} />
          <span>EduMap Closed-Loop Learning System</span>
        </div>
        <h2
          style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: 'clamp(2rem, 4vw, 2.9rem)',
            color: 'var(--ink)',
            lineHeight: 1.2,
            margin: '0 0 1rem',
          }}
        >
          Select a Portal to Begin
        </h2>
        <p style={{ fontSize: '1rem', color: '#4a5568', maxWidth: '640px', margin: '0 auto', lineHeight: 1.6 }}>
          EduMap bridges educators and learners through Gemini-powered curriculum generation, instant assessment grading, and personalized study doubt solving.
        </p>
      </div>

      {/* Dual Portal Cards */}
      <div
        style={{
          maxWidth: '1060px',
          margin: '0 auto 2rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.8rem',
        }}
      >
        {/* Card 1: Teacher Portal */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '2px solid rgba(14, 143, 134, 0.25)',
            boxShadow: '0 12px 32px rgba(21, 39, 53, 0.08)',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 18px 40px rgba(14, 143, 134, 0.16)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 12px 32px rgba(21, 39, 53, 0.08)';
          }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'var(--teal)' }} />

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: '#e6f4f1',
                  color: 'var(--teal)',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <Users size={24} />
              </div>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  background: '#f1f5f9',
                  color: 'var(--ink)',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '4px',
                }}
              >
                Educator Hub
              </span>
            </div>

            <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--teal)', fontWeight: 800 }}>
              Educator Workspace
            </span>
            <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.75rem', margin: '0.3rem 0 0.8rem', color: 'var(--ink)' }}>
              Teacher Portal
            </h3>
            <p style={{ fontSize: '0.86rem', color: '#4a5568', lineHeight: 1.6, marginBottom: '1.4rem' }}>
              Create AI curriculum assessments from NCERT syllabi, manage student connection keys, and inspect rich class accuracy telemetry.
            </p>

            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.8rem', display: 'grid', gap: '0.6rem', fontSize: '0.82rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} color="var(--teal)" />
                <span><b>AI Quiz Generator:</b> Select grade, subject & chapters</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} color="var(--teal)" />
                <span><b>Teacher Key:</b> One-click connection with students</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} color="var(--teal)" />
                <span><b>Detailed Reports:</b> Chapter mastery, accuracy & rosters</span>
              </li>
            </ul>
          </div>

          <a
            href={teacherUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.85rem 1.4rem',
              background: 'var(--teal, #0e8f86)',
              color: '#ffffff',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '0.92rem',
              boxShadow: '0 4px 12px rgba(14, 143, 134, 0.28)',
            }}
          >
            <span>Launch Teacher Portal</span>
            <ExternalLink size={16} />
          </a>
        </div>

        {/* Card 2: Student Portal */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '2px solid rgba(21, 39, 53, 0.15)',
            boxShadow: '0 12px 32px rgba(21, 39, 53, 0.08)',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 18px 40px rgba(21, 39, 53, 0.14)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 12px 32px rgba(21, 39, 53, 0.08)';
          }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'var(--ink)' }} />

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: '#f1f5f9',
                  color: 'var(--ink)',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <GraduationCap size={24} />
              </div>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  background: '#f1f5f9',
                  color: 'var(--ink)',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '4px',
                }}
              >
                Learner Hub
              </span>
            </div>

            <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--teal)', fontWeight: 800 }}>
              Learner Arena
            </span>
            <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.75rem', margin: '0.3rem 0 0.8rem', color: 'var(--ink)' }}>
              Student Portal
            </h3>
            <p style={{ fontSize: '0.86rem', color: '#4a5568', lineHeight: 1.6, marginBottom: '1.4rem' }}>
              Connect with your teacher, attempt live published quizzes, review mistake breakdowns, and chat with EduAI for instant doubt resolution.
            </p>

            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.8rem', display: 'grid', gap: '0.6rem', fontSize: '0.82rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} color="var(--teal)" />
                <span><b>Live Quiz Arena:</b> Timed assessments & instantaneous results</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} color="var(--teal)" />
                <span><b>Personalized Analytics:</b> Weak concept detection & charts</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} color="var(--teal)" />
                <span><b>EduAI Study Assistant:</b> Gemini-powered 24/7 tutor</span>
              </li>
            </ul>
          </div>

          <Link
            to={studentUrl}
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.85rem 1.4rem',
              background: 'var(--ink, #152735)',
              color: '#ffffff',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '0.92rem',
              boxShadow: '0 4px 12px rgba(21, 39, 53, 0.25)',
            }}
          >
            <span>Launch Student Portal</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}

