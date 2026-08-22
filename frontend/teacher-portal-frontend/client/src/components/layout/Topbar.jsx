import { Menu, BarChart3, UsersRound, LogOut } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '../../context/AuthContext.jsx';
import { initials, displayValue } from '../../utils/safeData.jsx';
import { STUDENT_PORTAL_URL } from '../../services/api.jsx';

export default function Topbar({ onMenu }) {
  const { teacher, logout } = useAuth();
  const [, navigate] = useLocation();
  const name = displayValue(teacher?.name, 'Teacher');

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
        <button className="mobile-menu" onClick={onMenu} aria-label="Open menu">
          <Menu size={20} />
        </button>
        <div className="topbar-context">
          <span className="topbar-kicker">Teacher workspace</span>
          <span className="topbar-status">
            <span className="status-dot" /> Ready for your next lesson
          </span>
        </div>
      </div>
      <div className="topbar-actions">
        {/* Quick Portal Switcher for Judges & Demos */}
        <a
          href={STUDENT_PORTAL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="button ghost small"
          title="Switch to Student Portal"
          style={{ padding: '0.4rem 0.65rem', fontSize: '0.74rem', border: '1px solid rgba(21,39,53,0.12)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
        >
          <span>Student Portal</span>
        </a>

        <a
          href={`${STUDENT_PORTAL_URL}/gateway`}
          target="_blank"
          rel="noopener noreferrer"
          className="button ghost small"
          title="Open Unified Ecosystem Gateway"
          style={{ padding: '0.4rem 0.65rem', fontSize: '0.74rem', border: '1px solid rgba(21,39,53,0.12)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
        >
          <span>Gateway</span>
        </a>

        <Link href="/dashboard/students" className="icon-button" title="Student Connection Roster" aria-label="Students">
          <UsersRound size={18} />
        </Link>
        <Link href="/dashboard/reports" className="icon-button" title="Class Assessment Reports" aria-label="Reports">
          <BarChart3 size={18} />
        </Link>
        <div className="profile-chip">
          <span className="avatar">{initials(name)}</span>
          <span className="profile-name">{name}</span>
        </div>
        <button onClick={handleSignOut} className="button ghost small" title="Sign out" style={{ padding: '0.45rem 0.75rem' }}>
          <LogOut size={14} />
          <span className="profile-name">Sign Out</span>
        </button>
      </div>
    </header>
  );
}

