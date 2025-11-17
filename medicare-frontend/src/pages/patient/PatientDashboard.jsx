import React, { useEffect, useState, useContext } from "react";
import api from "../../services/api";
import { AuthContext } from "../../context/AuthContext";

/*
 Patient dashboard:
 - list doctors (GET /api/patient/doctors/ maybe)
 - view selected doctor availability and book
*/

export default function PatientDashboard() {
  const { user } = useContext(AuthContext);
  const [doctors, setDoctors] = useState([]);
  const [selected, setSelected] = useState(null);
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [clinicId, setClinicId] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const r = await api.get("/api/patient/doctors/"); // sorting depends on backend route
        setDoctors(r.data);
      } catch (err) {
        setError(err.response?.data || "Failed to load doctors");
      }
    }
    load();
  }, []);

  const getSlots = async () => {
    setError(null);
    if (!selected || !clinicId || !date) {
      setError("Select doctor, clinic and date");
      return;
    }
    try {
      const res = await api.get(`/api/patient/doctor-availability/?doctor_id=${selected.id}&clinic_id=${clinicId}&date=${date}`);
      setSlots(res.data.slots || res.data.available_slots || []);
    } catch (err) {
      setError(err.response?.data || "Failed to get slots");
    }
  };

  const book = async (time) => {
    try {
      const body = {
        doctor_id: selected.id,
        clinic_id: Number(clinicId),
        scheduled_time: `${date}T${time}`,
      };
      const r = await api.post("/api/patient/book-appointment/", body);
      alert("Booked: " + JSON.stringify(r.data));
    } catch (err) {
      setError(err.response?.data || "Failed to book");
    }
  };

  return (
    <div className="container">
      <h2>Patient Dashboard</h2>
      {error && <div className="error">{JSON.stringify(error)}</div>}

      <section>
        <h3>Doctors</h3>
        <select onChange={(e)=> setSelected(doctors.find(d => d.id === Number(e.target.value)))}>
          <option value="">Select doctor</option>
          {doctors.map(d => <option key={d.id} value={d.id}>{d.user?.first_name} {d.user?.last_name} — {d.specialization}</option>)}
        </select>
        {selected && (
          <>
            <h4>Clinics</h4>
            <select onChange={(e)=> setClinicId(e.target.value)}>
              <option value="">Select clinic</option>
              {selected.clinics?.map(c => <option key={c.clinic} value={c.clinic}>{c.clinic_name} — Fee: {c.consultation_fee}</option>)}
            </select>
            <div>
              <input type="date" value={date} onChange={(e)=>setDate(e.target.value)} />
              <button onClick={getSlots}>Get available slots</button>
            </div>
            <div>
              {slots.length === 0 && <p>No slots</p>}
              <ul>
                {slots.map(s => <li key={s}><button onClick={()=>book(s)}>{s}</button></li>)}
              </ul>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
