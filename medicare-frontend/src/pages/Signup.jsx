import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const { selectedRole, signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Patient profile fields
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  // Doctor profile fields
  const [clinicName, setClinicName] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [qualification, setQualification] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [consultationFee, setConsultationFee] = useState('');
  const [error, setError] = useState(null);

  // Role is selected in AuthPortal; if not, we allow default UI to proceed.

  const onSubmit = async (e) => {
    e.preventDefault();
    const role = selectedRole || 'patient';
    const payload = {
      name,
      email,
      password,
      role,
      profile: role === 'patient'
        ? {
            date_of_birth: dateOfBirth,
            gender,
            phone,
            address,
          }
        : {
            clinic_name: clinicName,
            specialization,
            qualification,
            experience_years: experienceYears ? Number(experienceYears) : undefined,
            consultation_fee: consultationFee ? Number(consultationFee) : undefined,
          },
    };
    const res = await signup(payload);
    if (res?.ok) {
      navigate('/login');
    } else {
      setError(res?.error || 'Signup failed');
    }
  };

  return (
    <div className="card stack">
      <h2 className="title">Sign Up</h2>
      <p className="subtitle">Create your {selectedRole || 'account'}</p>
      {error && <div className="notif unread" style={{ borderColor: 'var(--danger)' }}>{error}</div>}
      <form className="stack" onSubmit={onSubmit}>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" required />
        <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
        <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />

        {selectedRole === 'patient' && (
          <div className="stack">
            <label className="subtitle">Patient Profile</label>
            <input className="input" type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} placeholder="Date of Birth" required />
            <select className="input" value={gender} onChange={(e) => setGender(e.target.value)} required>
              <option value="" disabled>Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            <input className="input" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" required />
            <input className="input" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Address" required />
          </div>
        )}

        {selectedRole === 'doctor' && (
          <div className="stack">
            <label className="subtitle">Doctor Profile</label>
            <input className="input" value={clinicName} onChange={(e) => setClinicName(e.target.value)} placeholder="Clinic Name" required />
            <input className="input" value={specialization} onChange={(e) => setSpecialization(e.target.value)} placeholder="Specialization" required />
            <input className="input" value={qualification} onChange={(e) => setQualification(e.target.value)} placeholder="Qualification" required />
            <input className="input" type="number" min="0" value={experienceYears} onChange={(e) => setExperienceYears(e.target.value)} placeholder="Experience Years" required />
            <input className="input" type="number" min="0" step="0.01" value={consultationFee} onChange={(e) => setConsultationFee(e.target.value)} placeholder="Consultation Fee" required />
          </div>
        )}

        <button className="btn" type="submit">Create Account</button>
      </form>
    </div>
  );
}
