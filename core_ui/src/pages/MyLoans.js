import React, { useEffect, useState } from "react";
import { apiGet, apiPut } from "../api";
import { getUser } from "../auth";
import NotificationBar from "../components/NotificationBar";

export default function MyLoans() {
  const [loans, setLoans] = useState([]);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("success");
  const user = getUser();

  // Auto-hide notifications after 4 seconds
  useEffect(() => {
    if (msg) {
      const t = setTimeout(() => setMsg(""), 4000);
      return () => clearTimeout(t);
    }
  }, [msg]);

  // Load data based on role
  async function load() {
    setErr("");
    try {
      let data;
      if (user.role === "staff" || user.role === "admin") {
        // For staff/admin, get all approved loans
        data = await apiGet("/loans/pending"); // load pending first
        const approved = await apiGet("/loans/my"); // load all loans by default
        data = [...data, ...approved];
      } else {
        // For students, only their own
        data = await apiGet("/loans/my");
      }
      setLoans(data);
    } catch (ex) {
      setErr(ex.data?.error || "Failed to load loans");
    }
  }

  useEffect(() => {
    load();
  }, []);

  // Return functionality for staff/admin
  async function markReturned(id) {
    try {
      await apiPut(`/loans/${id}/return`, {});
      setMsgType("success");
      setMsg("✅ Loan marked as returned successfully!");
      load();
    } catch (ex) {
      setMsgType("error");
      setMsg(ex.data?.error || "❌ Failed to mark returned");
    }
  }

  return (
    <div>
      <h3>{user.role === "student" ? "My Loans" : "All Loans"}</h3>

      {msg && <NotificationBar message={msg} type={msgType} />}
      {err && <div style={{ color: "red" }}>{err}</div>}

      <table className="table card">
        <thead>
          <tr>
            <th>Loan ID</th>
            <th>Equipment</th>
            <th>User</th>
            <th>Status</th>
            <th>Request Date</th>
            <th>Return Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {loans.length === 0 && (
            <tr>
              <td colSpan="7">No loans found.</td>
            </tr>
          )}
          {loans.map((l) => (
            <tr key={l.id}>
              <td>{l.id}</td>
              <td>{l.equipment_id}</td>
              <td>{l.user_id}</td>
              <td>{l.status}</td>
              <td>{new Date(l.request_date).toLocaleString()}</td>
              <td>
                {l.return_date
                  ? new Date(l.return_date).toLocaleString()
                  : "-"}
              </td>
              <td>
                {(user.role === "staff" || user.role === "admin") &&
                  l.status === "APPROVED" && (
                    <button onClick={() => markReturned(l.id)}>
                      Mark Returned
                    </button>
                  )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
