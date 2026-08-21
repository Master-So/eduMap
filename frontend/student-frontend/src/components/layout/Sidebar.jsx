import React from 'react';
import { BarChart3, LogIn, UserPlus, LogOut, X, GraduationCap, Home } from 'lucide-react';
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

  const navItems = [
    { href: '/', label: 'Overview', icon: Home },
    { href: '/analytics', label: 'Analytics & Quizzes', icon: BarChart3 },
    { href: '/login', label: 'Student Login', icon: LogIn },
    { href: '/register', label: 'Student Register', icon: UserPlus },
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

      {/* Footer */}
      <div className="sidebar-footer">
        {student ? (
          <button className="nav-link signout" onClick={handleSignOut}>
            <LogOut size={18} />
            <span>Sign Out ({student.name?.split(' ')[0]})</span>
          </button>
        ) : (
          <Link to="/login" onClick={onClose} className="nav-link signout">
            <LogIn size={18} />
            <span>Sign In</span>
          </Link>
        )}
        <span className="sidebar-note">
          Student workspace<br />
          Connected to port 5001
        </span>
      </div>
    </aside>
  );
}
