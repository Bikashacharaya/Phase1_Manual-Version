import React, { useEffect, useState } from "react";
import { apiGet, apiPost } from "../api";
import { getUser } from "../auth";
import EquipmentList from "./EquipmentList";
import NotificationBar from "../components/NotificationBar";

export default function Dashboard() {
  const user = getUser();
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [availableOnly, setAvailableOnly] = useState(true);
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");

  // notification state
  const [msg, setMsg] = useState(null);
  const [msgType, setMsgType] = useState("success");

  // Auto-hide messages after few seconds
  useEffect(() => {
    if (msg) {
      const t = setTimeout(() => setMsg(null), 4000);
      return () => clearTimeout(t);
    }
  }, [msg]);

  async function load() {
    setErr("");
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (category) params.set("category", category);
      if (availableOnly) params.set("available", "true");
      const data = await apiGet("/equipment?" + params.toString());
      setItems(data);
    } catch (ex) {
      setErr(ex.data?.error || "Failed to load equipment");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function requestLoan(equipmentId) {
    try {
      await apiPost("/loans/request", { equipment_id: equipmentId });
      setMsgType("success");
      setMsg("✅ Loan request created successfully!");
      load();
    } catch (ex) {
      setMsgType("error");
      setMsg(ex.data?.error || "❌ Failed to request loan");
    }
  }

  return (
    <div>
      {msg && <NotificationBar message={msg} type={msgType} />}

      <div className="card topbar">
        <div className="search">
          <input
            placeholder="Search name..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div>
          <label style={{ marginRight: 8 }}>
            <input
              type="checkbox"
              checked={availableOnly}
              onChange={(e) => setAvailableOnly(e.target.checked)}
            />{" "}
            Available only
          </label>
          <button onClick={load}>Search</button>
        </div>
      </div>

      {err && <div className="card" style={{ color: "red" }}>{err}</div>}

      <EquipmentList
        items={items}
        onRequest={(id) => requestLoan(id)}
        userRole={user?.role}
      />
    </div>
  );
}
