import { ArrowLeft, Eye, EyeOff, LockKeyhole, LogIn } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const [, navigate] = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);
  const [status, setStatus] = useState({ loading: false, error: '' });

  const update = (key) => (e) => {
    setForm((current) => ({ ...current, [key]: e.target.value }));
    if (status.error) setStatus((current) => ({ ...current, error: '' }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.email.trim() || !form.password) {
      return setStatus({ loading: false, error: 'Please enter your email and password.' });
    }

    setStatus({ loading: true, error: '' });
    try {
      await login(form);
      navigate('/dashboard/overview');
    } catch (error) {
      setStatus({
        loading: false,
        error: error?.message || 'Unable to sign in. Please check your credentials.',
      });
    }
  };

  return (
    <div className="auth-page">
      <Link href="/" className="auth-back">
        <ArrowLeft size={16} /> Back to home
      </Link>
      <div className="auth-panel">
        <div className="auth-aside">
          <div className="brand-lockup light">
            <div className="brand-mark">
              <span />
              <span />
              <span />
            </div>
            <span>Teacher <b>Portal</b></span>
          </div>
          <div>
            <span className="eyebrow">Private teacher workspace</span>
            <h1>Your classroom signal starts here.</h1>
            <p>Sign in to create quizzes, connect students, and read performance with confidence.</p>
          </div>
          <span className="auth-aside-foot">Teacher access only</span>
        </div>

        <div className="auth-form-wrap">
          <div className="auth-form-heading">
            <span className="eyebrow">Welcome back</span>
            <h2>Sign in to your portal</h2>
            <p>Enter your teacher credentials to access your dashboard.</p>
          </div>

          <form className="auth-form" onSubmit={submit}>
            <label>
              Teacher Email
              <input
                required
                type="email"
                value={form.email}
                onChange={update('email')}
                autoComplete="email"
                placeholder="teacher@institution.edu"
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
                />
                <button
                  type="button"
                  onClick={() => setShow((value) => !value)}
                  aria-label={show ? 'Hide password' : 'Show password'}
                >
                  {show ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </label>

            {status.error && (
              <div className="form-error">
                <LockKeyhole size={16} />
                {status.error}
              </div>
            )}

            <button className="button primary wide" disabled={status.loading}>
              <LogIn size={16} />
              {status.loading ? 'Signing in...' : 'Sign in to teacher portal'}
            </button>

            <p style={{ marginTop: '0.8rem', fontSize: '0.8rem', textAlign: 'center', color: 'var(--moss)' }}>
              Don't have a teacher account yet?{' '}
              <Link href="/register" style={{ color: 'var(--teal)', fontWeight: 800 }}>
                Register here
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
