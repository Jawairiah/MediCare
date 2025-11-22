import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppointments } from '../context/AppointmentContext';

export default function PatientDashboard() {
  const { myAppointments, cancelAppointment, rescheduleAppointment, getSlotsForDate } = useAppointments();
  const [editingId, setEditingId] = useState(null);
  const [date, setDate] = useState('');
  const [start, setStart] = useState('');

  const beginReschedule = (a) => {
    setEditingId(a.id);
    setDate(a.date);
    setStart(a.start);
  };

  const submitReschedule = (a) => {
    if (!date || !start) return;
    const res = rescheduleAppointment(a.id, date, start);
    if (res.ok) setEditingId(null);
  };

  return (
    <div className="card stack">
      <h2 className="title">Patient Dashboard</h2>
      <p className="subtitle">Upcoming and past appointments</p>
      <div className="section">
        <Link className="btn" to="/search">Search Doctors</Link>
      </div>
      <div className="stack">
        {myAppointments.length === 0 && (
          <div className="notif">No appointments yet. Use Search to book one.</div>
        )}
        {myAppointments.map(a => (
          <div key={a.id} className="card">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <strong>{a.doctorName}</strong>
                <div className="subtitle">{a.date} • {a.start}-{a.end} • {a.status}</div>
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <button className="btn" onClick={() => beginReschedule(a)}>Reschedule</button>
                <button className="btn danger" onClick={() => cancelAppointment(a.id)}>Cancel</button>
              </div>
            </div>
            {editingId === a.id && (
              <div className="section stack">
                <div className="row">
                  <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                  <select className="select" value={start} onChange={(e) => setStart(e.target.value)}>
                    <option value="">Select a slot</option>
                    {getSlotsForDate(a.doctorId, date).map(s => (
                      <option key={s.start} value={s.start}>{s.start} - {s.end}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <button className="btn success" onClick={() => submitReschedule(a)}>Confirm</button>
                  <button className="btn secondary" onClick={() => setEditingId(null)}>Close</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}