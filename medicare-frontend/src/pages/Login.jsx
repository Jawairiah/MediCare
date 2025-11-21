// ================================
// medicare-frontend/src/pages/Login.jsx
// COMPLETE LOGIN PAGE - Copy this entire file
// ================================

import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({ role: "patient", email: "", password: "" });
  const { login } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const nav = useNavigate();

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const data = await login(form);
      if (data.user.role === "doctor") {
        nav("/doctor");
      } else {
        nav("/patient");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err.response?.data?.detail || 
        err.response?.data?.error ||
        err.response?.data || 
        "Login failed. Please check your credentials."
      );
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
      <div className="card" style={{ maxWidth: '450px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏥</div>
          <h2 style={{ 
            fontSize: '2rem', 
            color: '#1f2937', 
            marginBottom: '0.5rem' 
          }}>
            Welcome Back
          </h2>
          <p style={{ color: '#6b7280' }}>Sign in to your account</p>
        </div>

        <form onSubmit={submit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem', 
              fontWeight: '600', 
              color: '#374151' 
            }}>
              I am a
            </label>
            <select 
              name="role" 
              value={form.role} 
              onChange={onChange}
              style={{ 
                background: 'white',
                border: '2px solid #e5e7eb',
                cursor: 'pointer'
              }}
            >
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
            </select>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem', 
              fontWeight: '600', 
              color: '#374151' 
            }}>
              Email Address
            </label>
            <input 
              name="email" 
              type="email"
              placeholder="your@email.com" 
              value={form.email} 
              onChange={onChange}
              required
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem', 
              fontWeight: '600', 
              color: '#374151' 
            }}>
              Password
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
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {error && (
          <div className="error" style={{ marginTop: '1rem' }}>
            {typeof error === 'string' ? error : JSON.stringify(error)}
          </div>
        )}

        <div style={{ 
          marginTop: '1.5rem', 
          paddingTop: '1.5rem', 
          borderTop: '1px solid #e5e7eb',
          textAlign: 'center'
        }}>
          <p style={{ color: '#6b7280' }}>
            Don't have an account?{' '}
            <a 
              onClick={() => nav('/register')} 
              style={{ 
                color: '#667eea', 
                fontWeight: '600', 
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Create Account
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}