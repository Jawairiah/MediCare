import React, { useContext, useEffect, useState } from "react";
import api from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import { Link } from "react-router-dom";

/*
 Doctor dashboard:
 - lists doctor clinics (GET /api/doctors/my-clinics/)
 - provides link to manage each clinic (ClinicDetails)
 - lists upcoming appointments across clinics (optional endpoint)
*/

export default function DoctorDashboard() {
  const { user } = useContext(AuthContext);
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await api.get("/api/doctors/my-clinics/");
        setClinics(res.data);
      } catch (err) {
        setError(err.response?.data || "Failed to load clinics");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  return (
    <div className="container">
      <h2>Doctor Dashboard</h2>
      {loading && <p>Loading clinics...</p>}
      {error && <div className="error">{JSON.stringify(error)}</div>}
      <div className="grid">
        {clinics.map((dc) => (
          <div key={dc.id} className="card">
            <h3>{dc.clinic.name}</h3>
            <p>{dc.clinic.address}</p>
            <p>Fee: {dc.consultation_fee ?? "Not set"}</p>
            <Link to={`/doctor/clinic/${dc.clinic.id}`}>Manage</Link>
          </div>
        ))}
        {clinics.length === 0 && !loading && <div>No clinics linked. Add one via "Add Clinic" button</div>}
      </div>
      <div style={{ marginTop: 20 }}>
        <Link to="/doctor/add-clinic">Add Clinic</Link> {/* you can implement a subpage for selecting clinic */}
      </div>
    </div>
  );
}
