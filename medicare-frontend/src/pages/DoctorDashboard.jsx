import { useState } from 'react';
import { useAppointments } from '../context/AppointmentContext';

export default function DoctorDashboard() {
  const { doctors, setDoctorRules, setDoctorHours, myAppointments, analytics } = useAppointments();
  const me = doctors[0]; // demo: assume first doctor is the logged-in doctor

  const [startTime, setStartTime] = useState(me.hours.startTime);
  const [endTime, setEndTime] = useState(me.hours.endTime);
  const [slotDuration, setSlotDuration] = useState(me.rules.slotDuration);
  const [buffer, setBuffer] = useState(me.rules.buffer);

  const saveSchedule = () => {
    setDoctorHours(me.id, { startTime, endTime });
    setDoctorRules(me.id, { slotDuration: Number(slotDuration), buffer: Number(buffer) });
  };

  const today = new Date().toISOString().slice(0,10);
  const todays = myAppointments.filter(a => a.doctorId === me.id && a.date === today && a.status !== 'cancelled');

  return (
    <div className="stack">
      <div className="card stack">
        <h2 className="title">Schedule Management</h2>
        <p className="subtitle">Define working hours and booking rules</p>
        <div className="row">
          <input className="input" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          <input className="input" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
        </div>
        <div className="row">
          <input className="input" type="number" min="10" max="60" value={slotDuration} onChange={(e) => setSlotDuration(e.target.value)} placeholder="Slot duration (min)" />
          <input className="input" type="number" min="0" max="30" value={buffer} onChange={(e) => setBuffer(e.target.value)} placeholder="Buffer (min)" />
        </div>
        <button className="btn" onClick={saveSchedule}>Save Schedule</button>
      </div>

      <div className="card stack">
        <h2 className="title">Today’s Queue</h2>
        <p className="subtitle">Appointments scheduled for today</p>
        <div className="stack">
          {todays.length === 0 && <div className="notif">No appointments today.</div>}
          {todays.map(a => (
            <div key={a.id} className="card">
              <strong>{a.start}-{a.end}</strong>
              <div className="subtitle">{a.patientEmail} • {a.status}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card stack">
        <h2 className="title">Analytics</h2>
        <div className="row">
          <div className="card">
            <div className="subtitle">Total</div>
            <h3 className="title">{analytics.total}</h3>
          </div>
          <div className="card">
            <div className="subtitle">Booked</div>
            <h3 className="title">{analytics.booked}</h3>
          </div>
          <div className="card">
            <div className="subtitle">Cancelled</div>
            <h3 className="title">{analytics.cancelled}</h3>
          </div>
          <div className="card">
            <div className="subtitle">Cancellation Rate</div>
            <h3 className="title">{analytics.cancellationRate}%</h3>
          </div>
        </div>
      </div>
    </div>
  );
}