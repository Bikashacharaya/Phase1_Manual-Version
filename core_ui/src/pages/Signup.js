import React, { useState, useEffect } from "react";
import { apiPost } from "../api";
import { useNavigate } from "react-router-dom";
import NotificationBar from "../components/NotificationBar";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("success");
  const nav = useNavigate();

  // Auto-hide message after 4 seconds
  useEffect(() => {
    if (msg) {
      const t = setTimeout(() => setMsg(""), 4000);
      return () => clearTimeout(t);
    }
  }, [msg]);

  async function submit(e) {
    e.preventDefault();
    setMsg("");
    try {
      await apiPost("/auth/signup", { username, email, password, role });
      setMsgType("success");
      setMsg("✅ Account created successfully! Redirecting to login...");
      // Redirect after 1.5 seconds
      setTimeout(() => nav("/login"), 1500);
    } catch (ex) {
      setMsgType("error");
      setMsg(ex.data?.error || "❌ Signup failed. Please try again.");
    }
  }

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 600, margin: "0 auto" }}>
        <h3>Signup</h3>

        {msg && <NotificationBar message={msg} type={msgType} />}

        <form onSubmit={submit}>
          <div className="form-group">
            <label>Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
            />
          </div>
          <div className="form-group">
            <label>Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="student">Student</option>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button type="submit">Create Account</button>
        </form>
      </div>
    </div>
  );
}
