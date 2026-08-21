import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, LockKeyhole, LogIn } from 'lucide-react';
import { authApi, setAuthToken, setStudentUser } from '../services/api';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [show, setShow] = useState(false);
  const [status, setStatus] = useState({ loading: false, error: '' });

  const update = (key) => (e) => {
    setForm((current) => ({ ...current, [key]: e.target.value }));
    if (status.error) setStatus({ loading: false, error: '' });
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setStatus({ loading: false, error: 'All fields are required.' });
      return;
    }
    if (form.password.length < 6) {
      setStatus({ loading: false, error: 'Password must be at least 6 characters.' });
      return;
    }
    if (form.password !== form.confirmPassword) {
      setStatus({ loading: false, error: 'Passwords do not match.' });
      return;
    }

    setStatus({ loading: true, error: '' });
    try {
      // Hardcode role: 'student'
      const data = await authApi.register(form.name.trim(), form.email.trim(), form.password);
      if (data.token) {
        setAuthToken(data.token);
        setStudentUser({
          _id: data._id,
          name: data.name,
          email: data.email,
          role: data.role || 'student',
          connectionKey: data.connectionKey,
          connectedTeacher: data.connectedTeacher,
        });
        navigate('/analytics');
      } else {
        throw new Error('Registration completed, but no authentication token was received.');
      }
    } catch (error) {
      setStatus({
        loading: false,
        error: error?.message || 'Unable to register student account. Please try again.',
      });
    }
  };

  return (
    <div className="auth-page">
      {/* Top Bar with Home Back link & Sign In button */}
      <div style={{ maxWidth: '1180px', margin: '0 auto 1rem', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" className="auth-back" style={{ margin: 0 }}>
          <ArrowLeft size={16} /> Back to home
        </Link>
        <Link to="/login" className="button ghost small" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }}>
          <LogIn size={14} />
          <span>Already registered? Sign In</span>
        </Link>
      </div>

      <div className="auth-panel">
        {/* Dark Aside */}
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
            <span className="eyebrow">Student registration</span>
            <h1>Join your classroom ecosystem.</h1>
            <p>
              Register with your student profile to access interactive quizzes, teacher-published assessments, and tailored AI analytics.
            </p>
          </div>

          <span className="auth-aside-foot">Student access only</span>
        </div>

        {/* Ivory Form Area */}
        <div className="auth-form-wrap">
          <div className="auth-form-heading">
            <span className="eyebrow">New Student</span>
            <h2>Create your account</h2>
            <p>Register as a student to begin connecting with teacher quizzes.</p>
          </div>

          <form className="auth-form" onSubmit={submit}>
            <label>
              Full Name
              <input
                required
                type="text"
                value={form.name}
                onChange={update('name')}
                autoComplete="name"
                placeholder="Alex Johnson"
                disabled={status.loading}
              />
            </label>

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
                  autoComplete="new-password"
                  placeholder="At least 6 characters"
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

            <label>
              Confirm Password
              <div className="password-field">
                <input
                  required
                  type={show ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={update('confirmPassword')}
                  autoComplete="new-password"
                  placeholder="Repeat your password"
                  disabled={status.loading}
                />
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
              {status.loading ? 'Creating account...' : 'Create student account'}
            </button>

            <div style={{ marginTop: '0.8rem', textAlign: 'center' }}>
              <p style={{ fontSize: '0.78rem', color: 'var(--moss)' }}>
                Already registered?{' '}
                <Link
                  to="/login"
                  style={{ color: 'var(--teal)', fontWeight: 800 }}
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
