import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import RoleSelect from "./pages/RoleSelect";
import Register from "./pages/Register";
import Login from "./pages/Login";
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import PatientDashboard from "./pages/patient/PatientDashboard";
import ClinicDetails from "./pages/doctor/ClinicDetails";
import PrivateRoute from "./components/PrivateRoute";
import Header from "./components/Header";

export default function App() {
  return (
    <div className="app">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<RoleSelect />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* Doctor routes */}
          <Route
            path="/doctor/*"
            element={
              <PrivateRoute requiredRole="doctor">
                <Routes>
                  <Route path="" element={<DoctorDashboard />} />
                  <Route path="clinic/:id" element={<ClinicDetails />} />
                </Routes>
              </PrivateRoute>
            }
          />

          {/* Patient routes */}
          <Route
            path="/patient/*"
            element={
              <PrivateRoute requiredRole="patient">
                <Routes>
                  <Route path="" element={<PatientDashboard />} />
                </Routes>
              </PrivateRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
