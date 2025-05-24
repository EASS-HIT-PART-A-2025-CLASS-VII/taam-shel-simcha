// src/services/authService.js

import axios from "axios";

const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:8000"
    : "http://backend:8000";

export async function loginUser(email, password) {
  const res = await axios.post(`${API_URL}/auth/login`, { email, password });
  return res.data;
}

// ✅ הוסף את זה:
export async function registerUser(username, email, password) {
  const res = await axios.post(`${API_URL}/auth/signup`, {
    username,
    email,
    password,
  });
  return res.data;
}

// מוסיף את הטוקן לכל בקשה באופן אוטומטי
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


export async function requestPasswordReset(email) {
  const res = await axios.post(`${API_URL}/auth/forgot-password`, { email });
  return res.data;
}


export async function resetPassword(token, newPassword, confirmPassword) {
  const res = await axios.post(`${API_URL}/auth/reset-password`, {
    token,
    new_password: newPassword,
    confirm_password: confirmPassword,
  });
  return res.data;
}
