const BASE = "http://localhost:18080/v1";

function headers(json = true) {
  const h = {};
  if (json) h["Content-Type"] = "application/json";
  const token = localStorage.getItem("token");
  if (token) h["Authorization"] = `Bearer ${token}`;
  return h;
}

export async function apiGet(path){
  const res = await fetch(BASE + path, { headers: headers(true) });
  return parseResponse(res);
}

export async function apiPost(path, body){
  const res = await fetch(BASE + path, { method: "POST", headers: headers(true), body: JSON.stringify(body) });
  return parseResponse(res);
}

export async function apiPut(path, body){
  const res = await fetch(BASE + path, { method: "PUT", headers: headers(true), body: JSON.stringify(body) });
  return parseResponse(res);
}

export async function apiDelete(path){
  const res = await fetch(BASE + path, { method: "DELETE", headers: headers(true) });
  return parseResponse(res);
}

async function parseResponse(res){
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) throw { status: res.status, data };
  return data;
}
