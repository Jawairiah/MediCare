// medicare-frontend/src/pages/DoctorDashboard.jsx
// FIXED VERSION - Compatible with your existing architecture

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as api from '../lib/api';

export default function DoctorDashboard() {
  const { user } = useAuth();
  
  // State management
  const [clinics, setClinics] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [pastAppointments, setPastAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load initial data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all data in parallel
      const [clinicsRes, appointmentsRes, pastRes] = await Promise.all([
        api.getDoctorClinics(),
        api.getDoctorAppointments(),
        api.getDoctorPastAppointments()
      ]);

      if (clinicsRes.ok) {
        setClinics(clinicsRes.data || []);
      }
      if (appointmentsRes.ok) {
        setAppointments(appointmentsRes.data || []);
      }
      if (pastRes.ok) {
        setPastAppointments(pastRes.data || []);
      }
    } catch (err) {
      console.error('Dashboard load error:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const upcomingCount = appointments.length;
  const completedCount = pastAppointments.filter(a => a.status === 'completed').length;
  const completionRate = pastAppointments.length > 0 
    ? Math.round((completedCount / pastAppointments.length) * 100) 
    : 0;

  // Loading state
  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
            <p>Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Header */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px' }}>
          Welcome back, Dr. {user?.last_name || user?.first_name} 👋
        </h1>
        <p style={{ color: '#6b7280', fontSize: '16px' }}>
          Manage your clinics and appointments
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="card" style={{ 
          marginBottom: '24px', 
          borderLeft: '4px solid #ef4444',
          background: '#fee2e2' 
        }}>
          <p style={{ color: '#991b1b', margin: 0 }}>{error}</p>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid" style={{ marginBottom: '24px' }}>
        <div className="card" style={{ borderLeft: '4px solid #667eea' }}>
          <div style={{ fontSize: '32px', fontWeight: '800', color: '#667eea' }}>
            {upcomingCount}
          </div>
          <div style={{ color: '#6b7280', marginTop: '4px' }}>Upcoming Appointments</div>
          <p style={{ fontSize: '14px', color: '#9ca3af', marginTop: '8px' }}>
            Scheduled appointments
          </p>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '32px', fontWeight: '800', color: '#10b981' }}>
            {completedCount}
          </div>
          <div style={{ color: '#6b7280', marginTop: '4px' }}>Completed</div>
          <p style={{ fontSize: '14px', color: '#9ca3af', marginTop: '8px' }}>
            Successfully completed
          </p>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '32px', fontWeight: '800', color: '#f59e0b' }}>
            {clinics.length}
          </div>
          <div style={{ color: '#6b7280', marginTop: '4px' }}>Clinics</div>
          <p style={{ fontSize: '14px', color: '#9ca3af', marginTop: '8px' }}>
            Where you practice
          </p>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ fontSize: '32px', fontWeight: '800', color: '#8b5cf6' }}>
            {completionRate}%
          </div>
          <div style={{ color: '#6b7280', marginTop: '4px' }}>Completion Rate</div>
          <p style={{ fontSize: '14px', color: '#9ca3af', marginTop: '8px' }}>
            Overall completion
          </p>
        </div>
      </div>

      {/* My Clinics */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '20px' 
        }}>
          <h3 className="title">My Clinics</h3>
          <button className="btn" onClick={() => window.alert('Add clinic feature coming soon!')}>
            + Add Clinic
          </button>
        </div>

        {clinics.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem', 
            color: '#6b7280' 
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏥</div>
            <p style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
              No clinics linked yet
            </p>
            <p style={{ fontSize: '14px', color: '#9ca3af' }}>
              Add your first clinic to get started
            </p>
          </div>
        ) : (
          <div className="grid">
            {clinics.map((clinic) => (
              <div key={clinic.id} className="card" style={{ 
                padding: '20px',
                border: '1px solid #e5e7eb'
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px' }}>
                  {clinic.clinic_name || clinic.name || 'Unnamed Clinic'}
                </h3>
                <div style={{ display: 'grid', gap: '8px', color: '#6b7280' }}>
                  <p>📍 {clinic.clinic_address || clinic.address || 'Address not set'}</p>
                  <p>📞 {clinic.clinic_phone || clinic.phone || 'Phone not set'}</p>
                  {clinic.clinic_email && <p>✉️ {clinic.clinic_email}</p>}
                  <p style={{ 
                    fontWeight: '600', 
                    color: '#667eea', 
                    marginTop: '8px' 
                  }}>
                    Fee: PKR {clinic.consultation_fee || 'Not set'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Appointments */}
      <div className="card">
        <h3 className="title">Recent Appointments</h3>
        <p className="subtitle">Your latest scheduled appointments</p>
        
        {appointments.length === 0 ? (
          <div style={{ 
            padding: '2rem', 
            textAlign: 'center', 
            color: '#6b7280' 
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
            <p>No upcoming appointments</p>
          </div>
        ) : (
          <div className="stack">
            {appointments.slice(0, 5).map((appt) => (
              <div key={appt.id} className="card" style={{ 
                padding: '16px',
                border: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                    {appt.patient_name || 'Patient'}
                  </h4>
                  <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>
                    📍 {appt.clinic_name || 'Clinic'}
                  </p>
                  {appt.notes && (
                    <p style={{ fontSize: '13px', color: '#9ca3af', marginTop: '4px' }}>
                      {appt.notes}
                    </p>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
                    {new Date(appt.scheduled_time).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                  <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '8px' }}>
                    {new Date(appt.scheduled_time).toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                  <span className="badge" style={{
                    background: appt.status === 'booked' ? '#dbeafe' : '#fee2e2',
                    color: appt.status === 'booked' ? '#1e40af' : '#991b1b'
                  }}>
                    {appt.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {appointments.length > 5 && (
          <div style={{ marginTop: '16px', textAlign: 'center' }}>
            <button className="btn outline">
              View All Appointments →
            </button>
          </div>
        )}
      </div>

      {/* Past Appointments Summary */}
      {pastAppointments.length > 0 && (
        <div className="card" style={{ marginTop: '24px' }}>
          <h3 className="title">Recent Completed Appointments</h3>
          <div className="stack">
            {pastAppointments.slice(0, 3).map((appt) => (
              <div key={appt.id} className="card" style={{ 
                padding: '16px',
                border: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: '600' }}>
                    {appt.patient_name || 'Patient'}
                  </h4>
                  <p style={{ fontSize: '14px', color: '#6b7280' }}>
                    📍 {appt.clinic_name || 'Clinic'}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>
                    {new Date(appt.completed_at || appt.scheduled_time).toLocaleDateString()}
                  </div>
                  <span className="badge" style={{ background: '#d1fae5', color: '#065f46' }}>
                    {appt.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}