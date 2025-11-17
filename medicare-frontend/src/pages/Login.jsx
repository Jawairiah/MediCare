import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

/*
 Login must send role + email + password per our backend auth design.
 On success, user and tokens are saved in AuthContext and user redirected to appropriate dashboard.
*/

export default function Login() {
  const [form, setForm] = useState({ role: "patient", email: "", password: "" });
  const { login } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const nav = useNavigate();

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await login(form);
      // Redirect based on role
      if (data.user.role === "doctor") nav("/doctor");
      else nav("/patient");
    } catch (err) {
      setError(err.response?.data || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container card">
      <h2>Login</h2>
      <form onSubmit={submit}>
        <select name="role" value={form.role} onChange={onChange}>
          <option value="doctor">Doctor</option>
          <option value="patient">Patient</option>
        </select>
        <input name="email" placeholder="Email" value={form.email} onChange={onChange} />
        <input type="password" name="password" placeholder="Password" value={form.password} onChange={onChange} />
        <button type="submit" disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
      </form>
      {error && <div className="error">{JSON.stringify(error)}</div>}
    </div>
  );
}
