import { ArrowLeft, Eye, EyeOff, LockKeyhole, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '../context/AuthContext.jsx';

export default function RegisterPage() {
  const [, navigate] = useLocation();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [status, setStatus] = useState({ loading: false, error: '' });

  const update = (key) => (e) => {
    setForm((current) => ({ ...current, [key]: e.target.value }));
    if (status.error) setStatus((current) => ({ ...current, error: '' }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      return setStatus({ loading: false, error: 'Please enter your full name.' });
    }
    if (!form.email.trim()) {
      return setStatus({ loading: false, error: 'Please enter your email address.' });
    }
    if (form.password.length < 6) {
      return setStatus({ loading: false, error: 'Password must be at least 6 characters.' });
    }
    if (form.password !== form.confirmPassword) {
      return setStatus({ loading: false, error: 'Passwords do not match.' });
    }

    setStatus({ loading: true, error: '' });
    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      navigate('/dashboard/overview');
    } catch (error) {
      setStatus({
        loading: false,
        error: error?.message || 'Unable to create teacher account. Please try again.',
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
            <span className="eyebrow">Educator registration</span>
            <h1>Join your private teacher workspace.</h1>
            <p>
              Create your teacher account to automatically generate curriculum quizzes, connect your students, and analyze real classroom performance.
            </p>
          </div>
          <span className="auth-aside-foot">Teacher access only</span>
        </div>

        <div className="auth-form-wrap">
          <div className="auth-form-heading">
            <span className="eyebrow">New educator account</span>
            <h2>Create your account</h2>
            <p>Register as a teacher to get your unique classroom connection key.</p>
          </div>

          <form className="auth-form" onSubmit={submit}>
            <label>
              Full Name / Title
              <input
                required
                type="text"
                value={form.name}
                onChange={update('name')}
                autoComplete="name"
                placeholder="e.g. Prof. Sharma or Dr. Jane Smith"
              />
            </label>

            <label>
              Teacher / Institutional Email
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
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={update('password')}
                  autoComplete="new-password"
                  placeholder="At least 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </label>

            <label>
              Confirm Password
              <div className="password-field">
                <input
                  required
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={update('confirmPassword')}
                  autoComplete="new-password"
                  placeholder="Re-enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((value) => !value)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
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
              <UserPlus size={16} />
              {status.loading ? 'Creating your account...' : 'Create Teacher Account'}
            </button>

            <p style={{ marginTop: '0.8rem', fontSize: '0.8rem', textAlign: 'center', color: 'var(--moss)' }}>
              Already have a teacher account?{' '}
              <Link href="/login" style={{ color: 'var(--teal)', fontWeight: 800 }}>
                Sign in here
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
