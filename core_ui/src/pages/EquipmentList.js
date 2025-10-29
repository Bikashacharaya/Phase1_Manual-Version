import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiDelete } from "../api";
import NotificationBar from "../components/NotificationBar";

export default function EquipmentList({ items, onRequest, userRole, onReload }) {
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("success");

  // Auto-hide notification after 4s
  useEffect(() => {
    if (msg) {
      const t = setTimeout(() => setMsg(""), 4000);
      return () => clearTimeout(t);
    }
  }, [msg]);

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await apiDelete("/equipment/" + id);
      setMsgType("success");
      setMsg("✅ Equipment deleted successfully!");
      // trigger reload if parent provided a callback
      if (onReload) onReload();
    } catch (ex) {
      setMsgType("error");
      setMsg(ex.data?.error || "Failed to delete equipment.");
    }
  }

  return (
    <div>
      {msg && <NotificationBar message={msg} type={msgType} />}

      <table className="table card">
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Condition</th>
            <th>Qty</th>
            <th>Available</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 && (
            <tr>
              <td colSpan="6">No equipment found.</td>
            </tr>
          )}
          {items.map((it) => (
            <tr key={it.id}>
              <td>{it.name}</td>
              <td>{it.category}</td>
              <td>{it.condition}</td>
              <td>{it.quantity}</td>
              <td>{it.available}</td>
              <td className="actions">
                {userRole === "student" && it.available > 0 && (
                  <button onClick={() => onRequest(it.id)}>Request</button>
                )}
                {userRole === "admin" && (
                  <>
                    <Link to={`/equipment/edit/${it.id}`}>
                      <button>Edit</button>
                    </Link>
                    <button onClick={() => handleDelete(it.id)}>Delete</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
