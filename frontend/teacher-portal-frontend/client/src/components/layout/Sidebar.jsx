import { BarChart3, BookOpen, LayoutDashboard, LogOut, UsersRound, X } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '../../context/AuthContext.jsx';
const items = [{ href: '/dashboard/overview', label: 'Overview', icon: LayoutDashboard }, { href: '/dashboard/students', label: 'Student Connection', icon: UsersRound }, { href: '/dashboard/create-quiz', label: 'Create Quiz', icon: BookOpen }, { href: '/dashboard/reports', label: 'Reports', icon: BarChart3 }];
export default function Sidebar({ open, onClose }) {
  const [location, navigate] = useLocation();
  const { logout, teacher } = useAuth();
  const signOut = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className={`sidebar ${open ? 'is-open' : ''}`}>
      <Link href="/dashboard/overview" onClick={onClose} className="sidebar-brand" style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className="brand-mark">
          <span />
          <span />
          <span />
        </div>
        <span>
          Teacher<br />
          <b>Portal</b>
        </span>
        <button className="mobile-close" onClick={onClose} aria-label="Close menu">
          <X size={18} />
        </button>
      </Link>
      <nav className="sidebar-nav" aria-label="Teacher portal">
        <span className="nav-caption">Workspace</span>
        {items.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={onClose}
            className={`nav-link ${location === href ? 'active' : ''}`}
          >
            <Icon size={18} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
      <div className="sidebar-footer">
        <button className="nav-link signout" onClick={signOut}>
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
        <span className="sidebar-note">
          {teacher ? `Signed in as ${teacher.name?.split(' ')[0] || 'Teacher'}` : 'Teacher workspace'}
          <br />
          Live System Active
        </span>
      </div>
    </aside>
  );
}
