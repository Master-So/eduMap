import React from 'react';
import { Menu, LogIn, UserPlus, LogOut, ExternalLink, Globe } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getStudentUser, clearAuth, TEACHER_PORTAL_URL } from '../../services/api';

function getInitials(name) {
  if (!name) return 'ST';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Topbar({ onMenu }) {
  const navigate = useNavigate();
  const student = getStudentUser();
  const name = student?.name;

  const handleSignOut = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <header className="topbar">
      {/* Left: Mobile Menu & Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
        <button className="mobile-menu" onClick={onMenu} aria-label="Open menu">
          <Menu size={20} />
        </button>

        <div className="topbar-context">
          <span className="topbar-kicker">Student workspace</span>
          <span className="topbar-status">
            <span className="status-dot" /> 
            {(student?.connectedTeachers?.length || student?.connectedTeacher) ? 'Connected to Teacher(s)' : 'Teacher Key Required for Tests'}
          </span>
        </div>
      </div>

      {/* Right: Navigation Buttons (Portal Switcher, Login, Register, Profile, Logout) */}
      <div className="topbar-actions">
        {/* Quick Portal Switcher for Judges & Demos */}
        <a
          href={TEACHER_PORTAL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="button ghost small"
          title="Switch to Teacher Portal"
          style={{ padding: '0.4rem 0.65rem', fontSize: '0.74rem', border: '1px solid rgba(21,39,53,0.12)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
        >
          <span>Teacher Portal</span>
          <ExternalLink size={12} />
        </a>

        <Link
          to="/gateway"
          className="button ghost small"
          title="Open Unified Ecosystem Gateway"
          style={{ padding: '0.4rem 0.65rem', fontSize: '0.74rem', border: '1px solid rgba(21,39,53,0.12)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
        >
          <Globe size={12} color="var(--teal)" />
          <span>Gateway</span>
        </Link>

        {student ? (
          <>
            <div className="profile-chip">
              <span className="avatar">{getInitials(name)}</span>
              <span className="profile-name">{name}</span>
            </div>

            <button
              onClick={handleSignOut}
              className="button ghost small"
              title="Sign out of student portal"
              style={{ padding: '0.45rem 0.75rem' }}
            >
              <LogOut size={14} />
              <span className="profile-name">Sign Out</span>
            </button>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Link to="/login" className="button secondary small">
              <LogIn size={14} />
              <span>Sign In</span>
            </Link>

            <Link to="/register" className="button primary small">
              <UserPlus size={14} />
              <span>Register</span>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}

