import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    
    if (data.token) {
      localStorage.setItem('token', data.token);
      window.location.href = '/';
    } else {
      alert(data.error);
    }
  };

  return (
    <div className="auth-container">
      <h2>Welcome Back</h2>
      <form onSubmit={handleLogin}>
        <div className="input-group">
          <input type="email" placeholder="Email Address" onChange={e => setEmail(e.target.value)} required />
        </div>
        <div className="input-group">
          <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} required />
        </div>
        <button type="submit" className="submit-btn">Secure Login</button>
      </form>
      <div className="auth-link">
        New to EduMap? <Link to="/register">Create an account</Link>
      </div>
    </div>
  );
}