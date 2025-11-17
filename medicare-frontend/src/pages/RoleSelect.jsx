import React from "react";
import { useNavigate } from "react-router-dom";

/*
 Simple page to pick role before registration.
 Stores role in navigation state to be read by the Register page.
*/

export default function RoleSelect() {
  const nav = useNavigate();

  const goRegister = (role) => {
    nav("/register", { state: { role } });
  };

  return (
    <div className="container card">
      <h2>Select account type</h2>
      <div className="role-buttons">
        <button onClick={() => goRegister("doctor")}>Doctor</button>
        <button onClick={() => goRegister("patient")}>Patient</button>
      </div>
    </div>
  );
}
