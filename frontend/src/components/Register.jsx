import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  // The state automatically defaults to 'student'
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    const res = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
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
      <h2>Student Registration</h2>
      <form onSubmit={handleRegister}>
        <div className="input-group">
          <input type="text" placeholder="Full Name" onChange={e => setForm({...form, name: e.target.value})} required />
        </div>
        <div className="input-group">
          <input type="email" placeholder="Email Address" onChange={e => setForm({...form, email: e.target.value})} required />
        </div>
        <div className="input-group">
          <input type="password" placeholder="Password" onChange={e => setForm({...form, password: e.target.value})} required />
        </div>
        <button type="submit" className="submit-btn">Secure Register</button>
      </form>
      <div className="auth-link">
        Already have an account? <Link to="/login">Login here</Link>
      </div>
    </div>
  );
}