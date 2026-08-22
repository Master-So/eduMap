import React from 'react';
import { BarChart3, LogOut, X, Home, LogIn } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getStudentUser, clearAuth } from '../../services/api';

export default function Sidebar({ open, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const student = getStudentUser();

  const handleSignOut = () => {
    clearAuth();
    navigate('/login');
  };

  // Nav items: login and register are strictly reserved for the landing page, not the logged-in sidebar
  const navItems = student
    ? [
        { href: '/analytics', label: 'Analytics & Quizzes', icon: BarChart3 },
      ]
    : [
        { href: '/', label: 'Overview', icon: Home },
      ];

  return (
    <aside className={`sidebar ${open ? 'is-open' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="brand-mark">
          <span />
          <span />
          <span />
        </div>
        <span>
          Student<br />
          <b>Portal</b>
        </span>
        <button className="mobile-close" onClick={onClose} aria-label="Close menu">
          <X size={18} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav" aria-label="Student navigation">
        <span className="nav-caption">Workspace</span>
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = location.pathname === href;
          return (
            <Link
              key={href}
              to={href}
              onClick={onClose}
              className={`nav-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer: Only Log Out option when logged in */}
      <div className="sidebar-footer">
        {student ? (
          <button className="nav-link signout" onClick={handleSignOut}>
            <LogOut size={18} />
            <span>Log Out</span>
          </button>
        ) : (
          <Link to="/login" onClick={onClose} className="nav-link signout">
            <LogIn size={18} />
            <span>Sign In</span>
          </Link>
        )}
        <span className="sidebar-note">
          {student ? `Signed in as ${student.name?.split(' ')[0] || 'Student'}` : 'Student workspace'}
        </span>
      </div>
    </aside>
  );
}
