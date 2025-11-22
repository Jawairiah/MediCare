import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';
import api from '../lib/api';

const AppointmentContext = createContext(null);

// Utility to create time slots based on rules
function generateSlots({ startTime, endTime, slotDuration, buffer }) {
  const slots = [];
  const toMinutes = (t) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  const toTime = (mins) => {
    const h = Math.floor(mins / 60).toString().padStart(2, '0');
    const m = (mins % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
  };
  let cur = toMinutes(startTime);
  const end = toMinutes(endTime);
  while (cur + slotDuration <= end) {
    const start = cur;
    const finish = cur + slotDuration;
    slots.push({ start: toTime(start), end: toTime(finish) });
    cur = finish + buffer;
  }
  return slots;
}

export function AppointmentProvider({ children }) {
  const { user, selectedRole } = useAuth();
  const { addNotification } = useNotifications();

  const [doctors, setDoctors] = useState([
    { id: 1, name: 'Dr. Ayesha Khan', specialty: 'Cardiology', location: 'Downtown Clinic', rules: { slotDuration: 30, buffer: 10 }, hours: { startTime: '09:00', endTime: '17:00' } },
    { id: 2, name: 'Dr. Omar Saleh', specialty: 'Dermatology', location: 'SkinCare Center', rules: { slotDuration: 20, buffer: 5 }, hours: { startTime: '10:00', endTime: '16:00' } },
    { id: 3, name: 'Dr. Neha Patel', specialty: 'Pediatrics', location: 'Family Health', rules: { slotDuration: 25, buffer: 5 }, hours: { startTime: '08:30', endTime: '14:30' } },
  ]);

  const [appointments, setAppointments] = useState([]);

  // Persist appointments in localStorage for demo
  useEffect(() => {
    const saved = localStorage.getItem('medicare_appts');
    if (saved) setAppointments(JSON.parse(saved));
  }, []);
  useEffect(() => {
    localStorage.setItem('medicare_appts', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    // Try fetching doctors from backend if available
    (async () => {
      const r = await api.getDoctors();
      if (r.ok && Array.isArray(r.data)) {
        setDoctors(r.data);
      }
    })();
  }, []);

  const searchDoctors = async ({ specialty = '', location = '' }) => {
    const r = await api.getDoctors({ specialty, location });
    if (r.ok && Array.isArray(r.data)) return r.data;
    // Fallback to local filter
    const s = specialty.toLowerCase();
    const l = location.toLowerCase();
    return doctors.filter(d => (
      (!s || d.specialty.toLowerCase().includes(s)) &&
      (!l || d.location.toLowerCase().includes(l))
    ));
  };

  const getSlotsForDate = async (doctorId, dateStr) => {
    const r = await api.getDoctorSlots(doctorId, dateStr);
    if (r.ok && Array.isArray(r.data)) return r.data;
    const doctor = doctors.find(d => d.id === Number(doctorId));
    if (!doctor) return [];
    const baseSlots = generateSlots({ ...doctor.hours, ...doctor.rules });
    const booked = appointments.filter(a => a.doctorId === Number(doctorId) && a.date === dateStr && a.status !== 'cancelled');
    const takenStarts = new Set(booked.map(b => b.start));
    return baseSlots.filter(s => !takenStarts.has(s.start));
  };

  const bookAppointment = async (doctorId, dateStr, start) => {
    const r = await api.createAppointment({ doctorId: Number(doctorId), date: dateStr, start });
    if (r.ok && r.data?.id) {
      addNotification({ type: 'success', message: `Booked with doctor #${doctorId} on ${dateStr} at ${start}` });
      return { ok: true, id: r.data.id };
    }
    // Fallback to local demo booking
    const doctor = doctors.find(d => d.id === Number(doctorId));
    if (!doctor) return { ok: false, error: 'Doctor not found' };
    const slots = await getSlotsForDate(doctorId, dateStr);
    const slot = slots.find(s => s.start === start);
    if (!slot) return { ok: false, error: 'Slot not available' };
    const id = Date.now();
    const appt = { id, doctorId: Number(doctorId), doctorName: doctor.name, patientEmail: user?.email || 'guest@medicare', date: dateStr, start: slot.start, end: slot.end, status: 'booked' };
    setAppointments(prev => [appt, ...prev]);
    addNotification({ type: 'success', message: `Booked with ${doctor.name} on ${dateStr} at ${slot.start}` });
    return { ok: true, id, demo: true };
  };

  const cancelAppointment = async (id) => {
    const r = await api.cancelAppointment(id);
    if (r.ok) {
      addNotification({ type: 'info', message: `Cancelled appointment #${id}` });
      return { ok: true };
    }
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'cancelled' } : a));
    const appt = appointments.find(a => a.id === id);
    if (appt) addNotification({ type: 'info', message: `Cancelled appointment on ${appt.date} at ${appt.start}` });
    return { ok: true, demo: true };
  };

  const rescheduleAppointment = async (id, dateStr, start) => {
    const r = await api.rescheduleAppointment(id, { date: dateStr, start });
    if (r.ok) {
      addNotification({ type: 'success', message: `Rescheduled appointment #${id} to ${dateStr} at ${start}` });
      return { ok: true };
    }
    const appt = appointments.find(a => a.id === id);
    if (!appt) return { ok: false, error: 'Appointment not found' };
    const slots = await getSlotsForDate(appt.doctorId, dateStr);
    const slot = slots.find(s => s.start === start);
    if (!slot) return { ok: false, error: 'New slot not available' };
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, date: dateStr, start: slot.start, end: slot.end, status: 'booked' } : a));
    addNotification({ type: 'success', message: `Rescheduled to ${dateStr} at ${slot.start}` });
    return { ok: true, demo: true };
  };

  const setDoctorRules = (doctorId, rules) => {
    setDoctors(prev => prev.map(d => d.id === Number(doctorId) ? { ...d, rules: { ...d.rules, ...rules } } : d));
  };

  const setDoctorHours = (doctorId, hours) => {
    setDoctors(prev => prev.map(d => d.id === Number(doctorId) ? { ...d, hours: { ...d.hours, ...hours } } : d));
  };

  const myAppointments = useMemo(() => {
    if (!user) return [];
    if (selectedRole === 'patient') return appointments.filter(a => a.patientEmail === user.email);
    if (selectedRole === 'doctor') return appointments.filter(a => doctors.find(d => d.id === a.doctorId)?.name && true);
    return appointments;
  }, [appointments, user, selectedRole, doctors]);

  const analytics = useMemo(() => {
    const total = appointments.length;
    const cancelled = appointments.filter(a => a.status === 'cancelled').length;
    const booked = appointments.filter(a => a.status === 'booked').length;
    return { total, booked, cancelled, cancellationRate: total ? Math.round((cancelled / total) * 100) : 0 };
  }, [appointments]);

  const value = {
    doctors,
    appointments,
    myAppointments,
    analytics,
    searchDoctors,
    getSlotsForDate,
    bookAppointment,
    cancelAppointment,
    rescheduleAppointment,
    setDoctorRules,
    setDoctorHours,
  };

  return (
    <AppointmentContext.Provider value={value}>{children}</AppointmentContext.Provider>
  );
}

export function useAppointments() {
  return useContext(AppointmentContext);
}
