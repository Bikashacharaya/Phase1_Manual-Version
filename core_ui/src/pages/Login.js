import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiPost } from "../api";
import { saveAuth } from "../auth";

export default function Login(){
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const nav = useNavigate();

  async function submit(e){
    e.preventDefault();
    setErr("");
    try{
      const data = await apiPost("/auth/login", { email, password });
      saveAuth(data.access_token, data.user);
      nav("/dashboard");
    }catch(ex){
      setErr(ex.data?.error || "Login failed");
    }
  }

  return (
    <div className="container">
      <div className="card" style={{maxWidth:480, margin:"0 auto"}}>
        <h3>Login</h3>
        <form onSubmit={submit}>
          <div className="form-group">
            <label>Email</label>
            <input value={email} onChange={e=>setEmail(e.target.value)} type="email" />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input value={password} onChange={e=>setPassword(e.target.value)} type="password" />
          </div>
          <div style={{marginTop:8}}>
            <button type="submit">Login</button>
            <span className="small" style={{marginLeft:12}}></span>
          </div>
          {err && <div style={{color:"red", marginTop:8}}>{err}</div>}
        </form>
      </div>
    </div>
  );
}
