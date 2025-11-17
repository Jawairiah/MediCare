import React, { useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

/*
 Dynamic registration form depending on role (doctor/patient).
 Uses register() from AuthContext which posts to /api/auth/register/
*/

export default function Register() {
  const { state } = useLocation();
  const roleFromState = state?.role || "patient";
  const [role, setRole] = useState(roleFromState);
  const [form, setForm] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    // doctor fields
    specialization: "",
    qualification: "",
    experience_years: "",
    clinic_id: "", // doctor picks one clinic at registration
    // patient fields
    phone: "",
    date_of_birth: "",
    gender: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { register } = useContext(AuthContext);
  const nav = useNavigate();

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = { role, email: form.email, password: form.password, first_name: form.first_name, last_name: form.last_name };
    if (role === "doctor") {
      payload.specialization = form.specialization;
      payload.qualification = form.qualification;
      payload.experience_years = Number(form.experience_years) || 0;
      if (form.clinic_id) payload.clinic_id = Number(form.clinic_id);
    } else {
      payload.phone = form.phone;
      payload.date_of_birth = form.date_of_birth;
      payload.gender = form.gender;
      payload.address = form.address;
    }

    try {
      await register(payload);
      alert("Registered. Please login.");
      nav("/login");
    } catch (err) {
      setError(err.response?.data || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container card">
      <h2>Create account</h2>

      <div style={{ marginBottom: 12 }}>
        Role:
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="doctor">Doctor</option>
          <option value="patient">Patient</option>
        </select>
      </div>

      <form onSubmit={submit}>
        <input name="first_name" placeholder="First name" value={form.first_name} onChange={onChange} />
        <input name="last_name" placeholder="Last name" value={form.last_name} onChange={onChange} />
        <input name="email" placeholder="Email" value={form.email} onChange={onChange} />
        <input type="password" name="password" placeholder="Password" value={form.password} onChange={onChange} />

        {role === "doctor" ? (
          <>
            <input name="specialization" placeholder="Specialization" value={form.specialization} onChange={onChange} />
            <input name="qualification" placeholder="Qualification" value={form.qualification} onChange={onChange} />
            <input name="experience_years" placeholder="Years of experience" value={form.experience_years} onChange={onChange} />
            <input name="clinic_id" placeholder="Clinic ID (select in UI later)" value={form.clinic_id} onChange={onChange} />
            <small>Note: Clinic dropdown will be available in dashboard to add more clinics.</small>
          </>
        ) : (
          <>
            <input name="phone" placeholder="Phone" value={form.phone} onChange={onChange} />
            <input name="date_of_birth" type="date" placeholder="Date of birth" value={form.date_of_birth} onChange={onChange} />
            <input name="gender" placeholder="Gender" value={form.gender} onChange={onChange} />
            <input name="address" placeholder="Address" value={form.address} onChange={onChange} />
          </>
        )}

        <div style={{ marginTop: 12 }}>
          <button type="submit" disabled={loading}>{loading ? "Registering..." : "Register"}</button>
        </div>

        {error && <div className="error">{JSON.stringify(error)}</div>}
      </form>
    </div>
  );
}
