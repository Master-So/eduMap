import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, LockKeyhole, UserPlus } from 'lucide-react';
import { authApi, setAuthToken, setStudentUser } from '../services/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);
  const [status, setStatus] = useState({ loading: false, error: '' });

  const update = (key) => (e) => {
    setForm((current) => ({ ...current, [key]: e.target.value }));
    if (status.error) setStatus({ loading: false, error: '' });
  };

  const submit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: '' });
    try {
      const data = await authApi.login(form.email, form.password);
      if (data.token) {
        setAuthToken(data.token);
        setStudentUser({
          _id: data._id,
          name: data.name,
          email: data.email,
          role: data.role,
          connectionKey: data.connectionKey,
          connectedTeacher: data.connectedTeacher,
          connectedTeachers: data.connectedTeachers,
          connectedTeacherDetails: data.connectedTeacherDetails,
        });
        navigate('/analytics');
      } else {
        throw new Error('Invalid response from server.');
      }
    } catch (error) {
      setStatus({
        loading: false,
        error: error?.message || 'Unable to sign in. Please verify your student credentials.',
      });
    }
  };

  return (
    <div className="auth-page">
      {/* Top Bar with Home Back link & Register button */}
      <div style={{ maxWidth: '1180px', margin: '0 auto 1rem', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" className="auth-back" style={{ margin: 0 }}>
          <ArrowLeft size={16} /> Back to home
        </Link>
        <Link to="/register" className="button ghost small" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }}>
          <UserPlus size={14} />
          <span>New Student? Register</span>
        </Link>
      </div>

      <div className="auth-panel">
        {/* Dark Editorial Aside */}
        <div className="auth-aside">
          <div className="brand-lockup light">
            <div className="brand-mark">
              <span />
              <span />
              <span />
            </div>
            <span>
              Student <b>Portal</b>
            </span>
          </div>

          <div>
            <span className="eyebrow">Student learning workspace</span>
            <h1>Your academic telemetry starts here.</h1>
            <p>
              Sign in with your student credentials to connect with your teacher, take live assessments, and track subject mastery.
            </p>
          </div>

          <span className="auth-aside-foot">Student access only</span>
        </div>

        {/* Ivory Form Area */}
        <div className="auth-form-wrap">
          <div className="auth-form-heading">
            <span className="eyebrow">Welcome back</span>
            <h2>Sign in to your portal</h2>
            <p>Use your student credentials to continue.</p>
          </div>

          <form className="auth-form" onSubmit={submit}>
            <label>
              Email Address
              <input
                required
                type="email"
                value={form.email}
                onChange={update('email')}
                autoComplete="email"
                placeholder="student@institution.edu"
                disabled={status.loading}
              />
            </label>

            <label>
              Password
              <div className="password-field">
                <input
                  required
                  type={show ? 'text' : 'password'}
                  value={form.password}
                  onChange={update('password')}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  disabled={status.loading}
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  aria-label={show ? 'Hide password' : 'Show password'}
                >
                  {show ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </label>

            {status.error && (
              <div className="form-error">
                <LockKeyhole size={16} />
                <span>{status.error}</span>
              </div>
            )}

            <button
              type="submit"
              className="button primary wide"
              disabled={status.loading}
            >
              {status.loading ? 'Signing in...' : 'Sign in to student portal'}
            </button>

            <div style={{ marginTop: '0.8rem', textAlign: 'center' }}>
              <p style={{ fontSize: '0.78rem', color: 'var(--moss)' }}>
                Don't have a student account?{' '}
                <Link
                  to="/register"
                  style={{ color: 'var(--teal)', fontWeight: 800 }}
                >
                  Create student account
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
