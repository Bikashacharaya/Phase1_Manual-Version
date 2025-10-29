export function saveAuth(token, user){
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
}

export function clearAuth(){
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export function getUser(){
  const s = localStorage.getItem("user");
  return s ? JSON.parse(s) : null;
}

export function getToken(){
  return localStorage.getItem("token");
}
