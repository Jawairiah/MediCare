import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';

const app = express();
app.use(cors());
app.use(express.json());

// In-memory demo data
const users = new Map(); // email -> {email, role, name}
const doctors = [
  { id: 1, name: 'Dr. Ayesha Khan', clinic_name: 'Downtown Clinic', specialization: 'Cardiology', qualification: 'MD', experience_years: 10, consultation_fee: 50 },
  { id: 2, name: 'Dr. Omar Saleh', clinic_name: 'SkinCare Center', specialization: 'Dermatology', qualification: 'MD', experience_years: 8, consultation_fee: 45 },
  { id: 3, name: 'Dr. Neha Patel', clinic_name: 'Family Health', specialization: 'Pediatrics', qualification: 'MD', experience_years: 7, consultation_fee: 40 },
];
const appointments = []; // {id, doctorId, doctorName, clinic_name, patientEmail, date, start, end, status}
const notifications = []; // {id, recipientEmail, type, withName, clinic_name, date, time, status, created_at, read}

// Email transport: dev JSON transport logs to console
const transporter = nodemailer.createTransport({ jsonTransport: true });

function authEmail(req) {
  const h = req.headers.authorization || '';
  const m = h.match(/Bearer\s+(.*)/i);
  return m ? m[1] : null; // using email as token for demo
}

function slotGenerator({ startTime = '09:00', endTime = '17:00', slotDuration = 30, buffer = 10 }) {
  const toMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
  const toTime = (mins) => `${String(Math.floor(mins / 60)).padStart(2,'0')}:${String(mins % 60).padStart(2,'0')}`;
  const slots = [];
  let cur = toMin(startTime);
  const end = toMin(endTime);
  while (cur + slotDuration <= end) { slots.push({ start: toTime(cur), end: toTime(cur + slotDuration) }); cur += slotDuration + buffer; }
  return slots;
}

function notifyBoth({ doctor, patientEmail, type, date, start, status }) {
  const created_at = new Date().toISOString();
  const base = {
    withName: doctor.name,
    clinic_name: doctor.clinic_name,
    date,
    time: start,
    status,
    type,
    created_at,
    read: false,
  };
  const n1 = { id: Date.now(), recipientEmail: patientEmail, ...base };
  const n2 = { id: Date.now() + 1, recipientEmail: `${doctor.name.toLowerCase().replace(/\s+/g,'')}@clinic.local`, ...base };
  notifications.unshift(n1, n2);
  // email both sides
  const subject = `Appointment ${type}`;
  const html = `<p>${type} with ${doctor.name} (${doctor.clinic_name})</p><p>${date} at ${start}</p><p>Status: ${status}</p>`;
  transporter.sendMail({ to: patientEmail, from: 'no-reply@medicare.local', subject, html }, (err, info) => {
    if (err) console.error('email err patient', err); else console.log('email patient', info.message);
  });
  transporter.sendMail({ to: n2.recipientEmail, from: 'no-reply@medicare.local', subject, html }, (err, info) => {
    if (err) console.error('email err doctor', err); else console.log('email doctor', info.message);
  });
}

// Auth
app.post('/auth/signup', (req, res) => {
  const { name, email, password, role } = req.body;
  users.set(email, { email, role, name: name || email.split('@')[0] });
  return res.json({ ok: true });
});
app.post('/auth/login', (req, res) => {
  const { email, role } = req.body;
  const user = users.get(email) || { email, role: role || 'patient', name: email.split('@')[0] };
  users.set(email, user);
  return res.json({ token: email, user }); // token = email for demo
});

// Doctors
app.get('/doctors', (req, res) => {
  const { specialization, location } = req.query;
  let list = doctors;
  if (specialization) list = list.filter(d => d.specialization.toLowerCase().includes(String(specialization).toLowerCase()));
  // location not used in demo
  res.json(list);
});
app.get('/doctors/:id/slots', (req, res) => {
  const doc = doctors.find(d => d.id === Number(req.params.id));
  if (!doc) return res.status(404).json({ error: 'Doctor not found' });
  const slots = slotGenerator({});
  // remove taken
  const { date } = req.query;
  const takenStarts = new Set(appointments.filter(a => a.doctorId === doc.id && a.date === date && a.status !== 'cancelled').map(a => a.start));
  res.json(slots.filter(s => !takenStarts.has(s.start)));
});

// Appointments
app.post('/appointments', (req, res) => {
  const email = authEmail(req) || req.body.patientEmail;
  const { doctorId, date, start } = req.body;
  const doc = doctors.find(d => d.id === Number(doctorId));
  if (!doc) return res.status(404).json({ error: 'Doctor not found' });
  const id = Date.now();
  const appt = { id, doctorId: doc.id, doctorName: doc.name, clinic_name: doc.clinic_name, patientEmail: email, date, start, end: start, status: 'booked' };
  appointments.unshift(appt);
  notifyBoth({ doctor: doc, patientEmail: email, type: 'Appointment Booked', date, start, status: 'Booked' });
  res.json({ id, ...appt });
});
app.patch('/appointments/:id', (req, res) => {
  const email = authEmail(req) || req.body.patientEmail;
  const id = Number(req.params.id);
  const { date, start } = req.body;
  const appt = appointments.find(a => a.id === id);
  if (!appt) return res.status(404).json({ error: 'Appointment not found' });
  appt.date = date; appt.start = start; appt.status = 'booked';
  const doc = doctors.find(d => d.id === appt.doctorId);
  notifyBoth({ doctor: doc, patientEmail: email, type: 'Appointment Rescheduled', date, start, status: 'Rescheduled' });
  res.json({ ok: true, ...appt });
});
app.delete('/appointments/:id', (req, res) => {
  const email = authEmail(req);
  const id = Number(req.params.id);
  const appt = appointments.find(a => a.id === id);
  if (!appt) return res.status(404).json({ error: 'Appointment not found' });
  appt.status = 'cancelled';
  const doc = doctors.find(d => d.id === appt.doctorId);
  notifyBoth({ doctor: doc, patientEmail: email || appt.patientEmail, type: 'Appointment Cancelled', date: appt.date, start: appt.start, status: 'Cancelled' });
  res.json({ ok: true });
});

// Notifications
app.get('/notifications', (req, res) => {
  const email = authEmail(req);
  const list = notifications.filter(n => n.recipientEmail === email);
  res.json(list);
});
app.patch('/notifications/:id/read', (req, res) => {
  const id = Number(req.params.id);
  const n = notifications.find(n => n.id === id);
  if (!n) return res.status(404).json({ error: 'Not found' });
  n.read = true;
  res.json({ ok: true });
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Medicare backend listening on http://localhost:${port}`);
});
