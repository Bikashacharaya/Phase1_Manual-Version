import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { getUser, clearAuth } from "../auth";

export default function Navbar() {
  const user = getUser();
  const nav = useNavigate();

  function logout() {
    clearAuth();
    nav("/login");
  }

  return (
    <div className="nav">
      <div>
        <Link to="/dashboard" style={{ fontWeight: 700 }}>
          BITS EquipLend
        </Link>
      </div>
      <div>
        {user ? (
          <>
            <span style={{ marginRight: 12 }}>
              Hi, {user.username} ({user.role})
            </span>

            {/* Common Links */}
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/my-loans">My Loans</Link>

            {/* Admin-only link */}
            {user.role === "admin" && <Link to="/equipment/new">Add Item</Link>}

            {/* Admin/Staff-only links */}
            {(user.role === "admin" || user.role === "staff") && (
              <>
                <Link to="/pending">Pending</Link>
                <Link to="/approved">Approved</Link>
              </>
            )}

            <button onClick={logout} style={{ marginLeft: 12 }}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup">Signup</Link>
          </>
        )}
      </div>
    </div>
  );
}
