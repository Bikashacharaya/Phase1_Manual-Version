import React, { useEffect, useState } from "react";
import { apiGet, apiPut } from "../api";
import NotificationBar from "../components/NotificationBar";

export default function PendingRequests() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("success");

  // Auto-hide messages
  useEffect(() => {
    if (msg) {
      const t = setTimeout(() => setMsg(null), 4000);
      return () => clearTimeout(t);
    }
  }, [msg]);

  async function load() {
    setErr("");
    try {
      const data = await apiGet("/loans/pending");
      setItems(data);
    } catch (ex) {
      setErr(ex.data?.error || "Failed to load pending requests");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function approve(id) {
    try {
      await apiPut(`/loans/${id}/approve`, {});
      setMsgType("success");
      setMsg("✅ Loan approved successfully!");
      load();
    } catch (ex) {
      setMsgType("error");
      setMsg(ex.data?.error || "❌ Failed to approve loan");
    }
  }

  async function reject(id) {
    try {
      await apiPut(`/loans/${id}/reject`, {});
      setMsgType("success");
      setMsg("✅ Loan rejected successfully!");
      load();
    } catch (ex) {
      setMsgType("error");
      setMsg(ex.data?.error || "❌ Failed to reject loan");
    }
  }

  return (
    <div>
      <h3>Pending Loan Requests</h3>

      {msg && <NotificationBar message={msg} type={msgType} />}
      {err && <div style={{ color: "red" }}>{err}</div>}

      <table className="table card">
        <thead>
          <tr>
            <th>Request ID</th>
            <th>User ID</th>
            <th>Equipment ID</th>
            <th>Requested On</th>
            <th>Notes</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 && (
            <tr>
              <td colSpan="6">No pending requests found.</td>
            </tr>
          )}
          {items.map((it) => (
            <tr key={it.id}>
              <td>{it.id}</td>
              <td>{it.user_id}</td>
              <td>{it.equipment_id}</td>
              <td>{new Date(it.request_date).toLocaleString()}</td>
              <td>{it.notes || "-"}</td>
              <td>
                <button onClick={() => approve(it.id)}>Approve</button>{" "}
                <button onClick={() => reject(it.id)}>Reject</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
