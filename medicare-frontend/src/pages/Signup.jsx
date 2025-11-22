import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const { selectedRole } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [specialty, setSpecialty] = useState('');

  useEffect(() => {
    if (!selectedRole) navigate('/'); // enforce single role selection on first page
  }, [selectedRole, navigate]);

  const onSubmit = (e) => {
    e.preventDefault();
    // Placeholder: call backend signup with selectedRole
    navigate('/login');
  };

  return (
    <div className="card stack">
      <h2 className="title">Sign Up</h2>
      <p className="subtitle">Create your {selectedRole} account</p>
      <form className="stack" onSubmit={onSubmit}>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" required />
        <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
        <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
        {selectedRole === 'doctor' && (
          <input className="input" value={specialty} onChange={(e) => setSpecialty(e.target.value)} placeholder="Specialty" />
        )}
        {/* No role dropdown here; role comes from RoleSelect */}
        <button className="btn" type="submit">Create Account</button>
      </form>
    </div>
  );
}