// medicare-frontend/src/pages/doctor/DoctorAppointmentsPage.jsx

import { useNavigate } from 'react-router-dom';
import * as api from '../../lib/api';

export default function DoctorAppointmentsPage() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const response = await api.getDoctorAppointments();

      if (response.ok) {
        setAppointments(response.data || []);
      }
    } catch (err) {
      console.error('Failed to load appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredAppointments = appointments.filter(appt => {
    const matchesFilter = filter === 'all' || appt.status === filter;
    const matchesSearch = !searchTerm || 
      appt.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appt.clinic_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: appointments.length,
    booked: appointments.filter(a => a.status === 'booked').length,
    rescheduled: appointments.filter(a => a.status === 'rescheduled').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
  };

  if (loading) {
    return (
      <div className="container">
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
          <p>Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ marginBottom: '0.5rem' }}>My Appointments</h1>
            <p className="subtitle">View and manage upcoming appointments</p>
          </div>
          <button onClick={() => navigate('/doctor')} className="btn ghost">
            ← Back
          </button>
        </div>
      </div>

      <div className="grid" style={{ marginBottom: '1.5rem' }}>
        <div className="card" style={{ borderLeft: '4px solid #667eea' }}>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#667eea' }}>{stats.total}</div>
          <div className="subtitle">Total</div>
        </div>
        <div className="card" style={{ borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10b981' }}>{stats.booked}</div>
          <div className="subtitle">Booked</div>
        </div>
        <div className="card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#f59e0b' }}>{stats.rescheduled}</div>
          <div className="subtitle">Rescheduled</div>
        </div>
        <div className="card" style={{ borderLeft: '4px solid #ef4444' }}>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#ef4444' }}>{stats.cancelled}</div>
          <div className="subtitle">Cancelled</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <input
            className="input"
            type="text"
            placeholder="🔍 Search by patient or clinic..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: '1', minWidth: '250px' }}
          />
          
          <select
            className="select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ minWidth: '150px' }}
          >
            <option value="all">All Status</option>
            <option value="booked">Booked</option>
            <option value="rescheduled">Rescheduled</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {filteredAppointments.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
          <h3 style={{ marginBottom: '0.5rem' }}>No appointments found</h3>
          <p className="subtitle">
            {searchTerm || filter !== 'all' 
              ? 'Try adjusting your filters' 
              : 'You have no upcoming appointments'}
          </p>
        </div>
      ) : (
        <div className="stack">
          {filteredAppointments.map(appt => (
            <div key={appt.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <h4 style={{ marginBottom: '0.5rem' }}>{appt.patient_name}</h4>
                  <p className="subtitle">📍 {appt.clinic_name}</p>
                  <p className="subtitle">
                    📅 {new Date(appt.scheduled_time).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <p className="subtitle">
                    🕐 {new Date(appt.scheduled_time).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  {appt.notes && (
                    <p className="subtitle" style={{ marginTop: '0.5rem' }}>
                      📝 {appt.notes}
                    </p>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span 
                    className="badge"
                    style={{
                      background: appt.status === 'booked' ? '#d1fae5' :
                                 appt.status === 'cancelled' ? '#fee2e2' : '#fef3c7',
                      color: appt.status === 'booked' ? '#065f46' :
                             appt.status === 'cancelled' ? '#991b1b' : '#92400e',
                      border: `1px solid ${appt.status === 'booked' ? '#10b981' :
                                          appt.status === 'cancelled' ? '#ef4444' : '#f59e0b'}`
                    }}
                  >
                    {appt.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// medicare-frontend/src/pages/doctor/DoctorPastAppointmentsPage.jsx
import React from 'react';

export function DoctorPastAppointmentsPage() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const response = await api.getDoctorPastAppointments();

      if (response.ok) {
        setAppointments(response.data || []);
      }
    } catch (err) {
      console.error('Failed to load past appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredAppointments = appointments.filter(appt => {
    return !searchTerm || 
      appt.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appt.clinic_name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const stats = {
    total: appointments.length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
    completionRate: appointments.length > 0 
      ? Math.round((appointments.filter(a => a.status === 'completed').length / appointments.length) * 100)
      : 0
  };

  if (loading) {
    return (
      <div className="container">
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
          <p>Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ marginBottom: '0.5rem' }}>Past Appointments</h1>
            <p className="subtitle">View your appointment history</p>
          </div>
          <button onClick={() => navigate('/doctor')} className="btn ghost">
            ← Back
          </button>
        </div>
      </div>

      <div className="grid" style={{ marginBottom: '1.5rem' }}>
        <div className="card" style={{ borderLeft: '4px solid #667eea' }}>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#667eea' }}>{stats.total}</div>
          <div className="subtitle">Total Past</div>
        </div>
        <div className="card" style={{ borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10b981' }}>{stats.completed}</div>
          <div className="subtitle">Completed</div>
        </div>
        <div className="card" style={{ borderLeft: '4px solid #ef4444' }}>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#ef4444' }}>{stats.cancelled}</div>
          <div className="subtitle">Cancelled</div>
        </div>
        <div className="card" style={{ borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#8b5cf6' }}>{stats.completionRate}%</div>
          <div className="subtitle">Completion Rate</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <input
          className="input"
          type="text"
          placeholder="🔍 Search by patient or clinic..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredAppointments.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
          <h3 style={{ marginBottom: '0.5rem' }}>No past appointments</h3>
          <p className="subtitle">
            {searchTerm ? 'Try adjusting your search' : 'Your appointment history will appear here'}
          </p>
        </div>
      ) : (
        <div className="stack">
          {filteredAppointments.map(appt => (
            <div key={appt.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <h4 style={{ marginBottom: '0.5rem' }}>{appt.patient_name}</h4>
                  <p className="subtitle">📍 {appt.clinic_name}</p>
                  <p className="subtitle">
                    📅 {new Date(appt.scheduled_time).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <p className="subtitle">
                    ✅ Completed: {new Date(appt.completed_at).toLocaleDateString()}
                  </p>
                  {appt.notes && (
                    <p className="subtitle" style={{ marginTop: '0.5rem' }}>
                      📝 {appt.notes}
                    </p>
                  )}
                </div>
                <span 
                  className="badge"
                  style={{
                    background: appt.status === 'completed' ? '#d1fae5' : '#fee2e2',
                    color: appt.status === 'completed' ? '#065f46' : '#991b1b',
                    border: `1px solid ${appt.status === 'completed' ? '#10b981' : '#ef4444'}`
                  }}
                >
                  {appt.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}