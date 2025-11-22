import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, selectedRole } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    const res = await login({ email, password });
    if (res?.ok) {
      const role = selectedRole || 'patient';
      navigate(role === 'doctor' ? '/doctor' : '/patient');
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="card stack">
      <h2 className="title">Login</h2>
      <p className="subtitle">Access your {selectedRole || 'account'}</p>
      {error && <div className="notif unread" style={{ borderColor: 'var(--danger)' }}>{error}</div>}
      <form className="stack" onSubmit={onSubmit}>
        <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
        <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
        <button className="btn" type="submit">Login</button>
      </form>
    </div>
  );
}
