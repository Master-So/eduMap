import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, GraduationCap, LogOut, User, Activity } from 'lucide-react';
import { getStudentUser, clearAuth } from '../services/api';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getStudentUser();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-700/40 bg-slate-950/70 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 p-[1px] shadow-lg shadow-blue-500/20 group-hover:shadow-glow-blue transition-all duration-300">
            <div className="w-full h-full bg-slate-950 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-blue-400 group-hover:text-blue-300 transition-colors" />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
                EduMap
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Sparkles className="w-2.5 h-2.5" /> AI Student
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Interactive Learning Engine</span>
          </div>
        </Link>

        {/* Right Section: Status, User profile or Auth Links */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Live Status Pill */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-xs text-slate-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Live Engine</span>
          </div>

          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/60 shadow-sm">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-semibold">
                  {user.name ? user.name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
                </div>
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-xs font-medium text-slate-200 leading-tight">
                    {user.name || 'Student'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {user.email || 'student@edumap.ai'}
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                title="Log Out"
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/20 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : !isAuthPage ? (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white rounded-lg hover:bg-slate-800/80 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm shadow-blue-500/20 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
