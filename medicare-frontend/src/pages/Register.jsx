
// ================================
// medicare-frontend/src/pages/Register.jsx
// COMPLETE REGISTER PAGE - Copy this entire file
// ================================

import React, { useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Register() {
  const { state } = useLocation();
  const roleFromState = state?.role || "patient";
  const [role, setRole] = useState(roleFromState);
  const [form, setForm] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    // doctor fields
    specialization: "",
    qualification: "",
    experience_years: "",
    clinic_id: "",
    // patient fields
    phone: "",
    date_of_birth: "",
    gender: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { register } = useContext(AuthContext);
  const nav = useNavigate();

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = { 
      role, 
      email: form.email, 
      password: form.password, 
      first_name: form.first_name, 
      last_name: form.last_name 
    };
    
    if (role === "doctor") {
      payload.specialization = form.specialization;
      payload.qualification = form.qualification;
      payload.experience_years = Number(form.experience_years) || 0;
      if (form.clinic_id) payload.clinic_id = Number(form.clinic_id);
    } else {
      payload.phone = form.phone;
      payload.date_of_birth = form.date_of_birth || null;
      payload.gender = form.gender;
      payload.address = form.address;
    }

    try {
      await register(payload);
      alert("✅ Registration successful! Please login with your credentials.");
      nav("/login");
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.response?.data || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: 'calc(100vh - 100px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div className="card" style={{ maxWidth: '550px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏥</div>
          <h2 style={{ 
            fontSize: '2rem', 
            color: '#1f2937', 
            marginBottom: '0.5rem' 
          }}>
            Create Account
          </h2>
          <p style={{ color: '#6b7280' }}>Join Medicare today</p>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.75rem', 
            fontWeight: '600', 
            color: '#374151' 
          }}>
            Register as
          </label>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '1rem' 
          }}>
            <div
              onClick={() => setRole("patient")}
              style={{
                padding: '1.25rem',
                border: `2px solid ${role === "patient" ? '#667eea' : '#e5e7eb'}`,
                borderRadius: '10px',
                cursor: 'pointer',
                textAlign: 'center',
                background: role === "patient" ? 'rgba(102, 126, 234, 0.05)' : 'white',
                transition: 'all 0.3s'
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🧑‍💼</div>
              <div style={{ 
                fontWeight: '600', 
                color: role === "patient" ? '#667eea' : '#374151' 
              }}>
                Patient
              </div>
            </div>
            <div
              onClick={() => setRole("doctor")}
              style={{
                padding: '1.25rem',
                border: `2px solid ${role === "doctor" ? '#667eea' : '#e5e7eb'}`,
                borderRadius: '10px',
                cursor: 'pointer',
                textAlign: 'center',
                background: role === "doctor" ? 'rgba(102, 126, 234, 0.05)' : 'white',
                transition: 'all 0.3s'
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👨‍⚕️</div>
              <div style={{ 
                fontWeight: '600', 
                color: role === "doctor" ? '#667eea' : '#374151' 
              }}>
                Doctor
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={submit}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '1rem' 
          }}>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                fontWeight: '600', 
                color: '#374151', 
                fontSize: '0.9rem' 
              }}>
                First Name *
              </label>
              <input 
                name="first_name" 
                placeholder="John" 
                value={form.first_name} 
                onChange={onChange}
                required
              />
            </div>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                fontWeight: '600', 
                color: '#374151', 
                fontSize: '0.9rem' 
              }}>
                Last Name *
              </label>
              <input 
                name="last_name" 
                placeholder="Doe" 
                value={form.last_name} 
                onChange={onChange}
                required
              />
            </div>
          </div>

          <label style={{ 
            display: 'block', 
            marginTop: '1rem', 
            marginBottom: '0.5rem', 
            fontWeight: '600', 
            color: '#374151', 
            fontSize: '0.9rem' 
          }}>
            Email *
          </label>
          <input 
            name="email" 
            type="email"
            placeholder="your@email.com" 
            value={form.email} 
            onChange={onChange}
            required
          />

          <label style={{ 
            display: 'block', 
            marginTop: '1rem', 
            marginBottom: '0.5rem', 
            fontWeight: '600', 
            color: '#374151', 
            fontSize: '0.9rem' 
          }}>
            Password * (minimum 6 characters)
          </label>
          <input 
            type="password" 
            name="password" 
            placeholder="••••••••" 
            value={form.password} 
            onChange={onChange}
            required
            minLength={6}
          />

          {role === "doctor" ? (
            <>
              <label style={{ 
                display: 'block', 
                marginTop: '1rem', 
                marginBottom: '0.5rem', 
                fontWeight: '600', 
                color: '#374151', 
                fontSize: '0.9rem' 
              }}>
                Specialization
              </label>
              <input 
                name="specialization" 
                placeholder="e.g., Cardiologist" 
                value={form.specialization} 
                onChange={onChange}
              />

              <label style={{ 
                display: 'block', 
                marginTop: '1rem', 
                marginBottom: '0.5rem', 
                fontWeight: '600', 
                color: '#374151', 
                fontSize: '0.9rem' 
              }}>
                Qualification
              </label>
              <input 
                name="qualification" 
                placeholder="e.g., MBBS, MD" 
                value={form.qualification} 
                onChange={onChange}
              />

              <label style={{ 
                display: 'block', 
                marginTop: '1rem', 
                marginBottom: '0.5rem', 
                fontWeight: '600', 
                color: '#374151', 
                fontSize: '0.9rem' 
              }}>
                Years of Experience
              </label>
              <input 
                name="experience_years" 
                type="number"
                placeholder="5" 
                value={form.experience_years} 
                onChange={onChange}
                min="0"
              />
            </>
          ) : (
            <>
              <label style={{ 
                display: 'block', 
                marginTop: '1rem', 
                marginBottom: '0.5rem', 
                fontWeight: '600', 
                color: '#374151', 
                fontSize: '0.9rem' 
              }}>
                Phone
              </label>
              <input 
                name="phone" 
                type="tel"
                placeholder="+92 300 1234567" 
                value={form.phone} 
                onChange={onChange}
              />

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '1rem', 
                marginTop: '1rem' 
              }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    fontWeight: '600', 
                    color: '#374151', 
                    fontSize: '0.9rem' 
                  }}>
                    Date of Birth
                  </label>
                  <input 
                    name="date_of_birth" 
                    type="date" 
                    value={form.date_of_birth} 
                    onChange={onChange}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    fontWeight: '600', 
                    color: '#374151', 
                    fontSize: '0.9rem' 
                  }}>
                    Gender
                  </label>
                  <select 
                    name="gender" 
                    value={form.gender} 
                    onChange={onChange}
                  >
                    <option value="">Select...</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <label style={{ 
                display: 'block', 
                marginTop: '1rem', 
                marginBottom: '0.5rem', 
                fontWeight: '600', 
                color: '#374151', 
                fontSize: '0.9rem' 
              }}>
                Address
              </label>
              <textarea 
                name="address" 
                placeholder="Your address" 
                value={form.address} 
                onChange={onChange}
                rows="2"
                style={{ resize: 'vertical' }}
              />
            </>
          )}

          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              marginTop: '1.5rem', 
              opacity: loading ? 0.7 : 1 
            }}
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>

          {error && (
            <div className="error" style={{ marginTop: '1rem' }}>
              {typeof error === 'string' ? error : JSON.stringify(error)}
            </div>
          )}
        </form>

        <div style={{ 
          marginTop: '1.5rem', 
          paddingTop: '1.5rem', 
          borderTop: '1px solid #e5e7eb',
          textAlign: 'center'
        }}>
          <p style={{ color: '#6b7280' }}>
            Already have an account?{' '}
            <a 
              onClick={() => nav('/login')} 
              style={{ 
                color: '#667eea', 
                fontWeight: '600', 
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Sign In
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}