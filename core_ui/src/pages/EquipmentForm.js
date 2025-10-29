import React, { useState, useEffect } from "react";
import { apiPost } from "../api";
import { useNavigate } from "react-router-dom";
import NotificationBar from "../components/NotificationBar";

export default function EquipmentForm() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("Good");
  const [quantity, setQuantity] = useState(1);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("success");
  const nav = useNavigate();

  // Auto-hide notifications after 4s
  useEffect(() => {
    if (msg) {
      const t = setTimeout(() => setMsg(""), 4000);
      return () => clearTimeout(t);
    }
  }, [msg]);

  async function submit(e) {
    e.preventDefault();
    setErr("");
    try {
      await apiPost("/equipment", { name, category, condition, quantity });
      setMsgType("success");
      setMsg("✅ Equipment added successfully!");
      setName("");
      setCategory("");
      setCondition("Good");
      setQuantity(1);
      // Optionally redirect after a short delay
      setTimeout(() => nav("/dashboard"), 1500);
    } catch (ex) {
      setMsgType("error");
      setMsg(ex.data?.error || "Failed to add equipment.");
    }
  }

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 600, margin: "0 auto" }}>
        <h3>Add Equipment</h3>

        {msg && <NotificationBar message={msg} type={msgType} />}
        {err && <div style={{ color: "red" }}>{err}</div>}

        <form onSubmit={submit}>
          <div className="form-group">
            <label>Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Category</label>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Condition</label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
            >
              <option>Good</option>
              <option>Fair</option>
              <option>Poor</option>
            </select>
          </div>
          <div className="form-group">
            <label>Quantity</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </div>
          <button type="submit">Create</button>
        </form>
      </div>
    </div>
  );
}
