// medicare-frontend/src/pages/RoleSelect.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function RoleSelect() {
  const nav = useNavigate();

  const goRegister = (role) => {
    nav("/register", { state: { role } });
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
      <div className="container">
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2.5rem', color: '#1f2937', marginBottom: '1rem' }}>
              Welcome to Medicare
            </h1>
            <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>
              Select your account type to get started
            </p>
          </div>

          <div className="role-buttons">
            <div 
              className="role-button" 
              onClick={() => goRegister("doctor")}
              style={{ cursor: 'pointer' }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👨‍⚕️</div>
              <div>Doctor</div>
              <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.5rem' }}>
                Manage appointments & patients
              </div>
            </div>

            <div 
              className="role-button" 
              onClick={() => goRegister("patient")}
              style={{ cursor: 'pointer' }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🧑‍💼</div>
              <div>Patient</div>
              <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.5rem' }}>
                Book appointments & track health
              </div>
            </div>
          </div>

          <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #e5e7eb' }}>
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
    </div>
  );
}