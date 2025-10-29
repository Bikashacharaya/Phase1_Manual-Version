import React, { useEffect, useState } from "react";
import { apiGet, apiPut } from "../api";
import NotificationBar from "../components/NotificationBar";

export default function ApprovedLoans() {
  const [loans, setLoans] = useState([]);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("success");

  // Auto-hide notification after 4s
  useEffect(() => {
    if (msg) {
      const t = setTimeout(() => setMsg(""), 4000);
      return () => clearTimeout(t);
    }
  }, [msg]);

  async function load() {
    setErr("");
    try {
      const data = await apiGet("/loans/approved"); // backend endpoint for approved loans
      setLoans(data);
    } catch (ex) {
      setErr(ex.data?.error || "Failed to load approved loans");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function markReturned(id) {
    try {
      await apiPut(`/loans/${id}/return`, {});
      setMsgType("success");
      setMsg("✅ Loan marked as returned successfully!");
      load();
    } catch (ex) {
      setMsgType("error");
      setMsg(ex.data?.error || "❌ Failed to mark as returned");
    }
  }

  return (
    <div>
      <h3>Approved Loans</h3>

      {msg && <NotificationBar message={msg} type={msgType} />}
      {err && <div style={{ color: "red" }}>{err}</div>}

      <table className="table card">
        <thead>
          <tr>
            <th>Loan ID</th>
            <th>User ID</th>
            <th>Equipment ID</th>
            <th>Approved Date</th>
            <th>Status</th>
            <th>Return Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {loans.length === 0 && (
            <tr>
              <td colSpan="7">No approved loans found.</td>
            </tr>
          )}
          {loans.map((l) => (
            <tr key={l.id}>
              <td>{l.id}</td>
              <td>{l.user_id}</td>
              <td>{l.equipment_id}</td>
              <td>{l.approved_date ? new Date(l.approved_date).toLocaleString() : "-"}</td>
              <td>{l.status}</td>
              <td>{l.return_date ? new Date(l.return_date).toLocaleString() : "-"}</td>
              <td>
                {l.status === "APPROVED" && (
                  <button onClick={() => markReturned(l.id)}>Mark Returned</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
