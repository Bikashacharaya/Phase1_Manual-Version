import React from "react";
import { Navigate } from "react-router-dom";
import { getUser } from "../auth";

export default function PrivateRoute({ children, roles }){
  const user = getUser();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <div className="container"><div className="card">Forbidden — requires role: {roles.join(", ")}</div></div>;
  return children;
}
