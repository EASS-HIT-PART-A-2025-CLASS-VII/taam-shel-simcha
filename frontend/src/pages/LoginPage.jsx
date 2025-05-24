import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";
import { useAuth } from "../context/AuthContext"; // ✅ נכון
     // נכון
 // נכון

import "../css/LoginPage.css";

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await loginUser(formData.email, formData.password);
      login({ id: res.user_id, email: formData.email }, res.access_token);
      navigate("/recipes");
    } catch {
      setError("אימייל או סיסמה שגויים.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>התחברות</h2>
        <form onSubmit={handleSubmit}>
          <input type="email" name="email" placeholder="אימייל" value={formData.email} onChange={handleChange} required />
          <input type="password" name="password" placeholder="סיסמה" value={formData.password} onChange={handleChange} required />
          {error && <p className="error">{error}</p>}
          <button type="submit">התחבר</button>
        </form>
        <p className="register-link">אין לך חשבון? <a href="/register">להרשמה</a></p>
      </div>
    </div>
  );
}

export default LoginPage;
