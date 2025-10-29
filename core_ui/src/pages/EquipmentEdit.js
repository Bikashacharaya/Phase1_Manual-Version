import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiGet, apiPut } from "../api";
import NotificationBar from "../components/NotificationBar";

export default function EquipmentEdit() {
  const { id } = useParams();
  const nav = useNavigate();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("Good");
  const [quantity, setQuantity] = useState(1);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("success");
  const [err, setErr] = useState("");

  // Auto-hide notifications
  useEffect(() => {
    if (msg) {
      const t = setTimeout(() => setMsg(""), 4000);
      return () => clearTimeout(t);
    }
  }, [msg]);

  // Load equipment details
  useEffect(() => {
    async function load() {
      try {
        const data = await apiGet(`/equipment/${id}`);
        setName(data.name);
        setCategory(data.category);
        setCondition(data.condition);
        setQuantity(data.quantity);
      } catch (ex) {
        setErr(ex.data?.error || "Failed to load equipment details.");
      }
    }
    load();
  }, [id]);

  async function submit(e) {
    e.preventDefault();
    setErr("");
    try {
      await apiPut(`/equipment/${id}`, {
        name,
        category,
        condition,
        quantity,
      });
      setMsgType("success");
      setMsg("✅ Equipment updated successfully!");
      setTimeout(() => nav("/dashboard"), 1500);
    } catch (ex) {
      setMsgType("error");
      setMsg(ex.data?.error || "❌ Failed to update equipment.");
    }
  }

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 600, margin: "0 auto" }}>
        <h3>Edit Equipment</h3>

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
          <button type="submit">Save Changes</button>
        </form>
      </div>
    </div>
  );
}
