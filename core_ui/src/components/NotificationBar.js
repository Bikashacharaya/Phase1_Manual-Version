import React from "react";

export default function NotificationBar({ message, type }) {
  if (!message) return null;
  const color = type === "error" ? "#f56565" : "#48bb78"; // red or green
  return (
    <div style={{
      background: color,
      color: "white",
      padding: "8px 12px",
      borderRadius: "6px",
      marginBottom: "10px"
    }}>
      {message}
    </div>
  );
}
