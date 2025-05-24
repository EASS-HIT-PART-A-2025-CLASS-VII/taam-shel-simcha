// src/pages/ResetPasswordPage.jsx
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { resetPassword } from "../services/authService";
import "../css/RegisterPage.css";

function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const res = await resetPassword(token, newPassword, confirmPassword);
      console.log("Server response:", res);

      setMessage("🔐 הסיסמה אופסה בהצלחה! אפשר להתחבר מחדש.");
    } catch (err) {
      console.error("❌ שגיאה באיפוס סיסמה:", err);
      setError("⚠️ לא הצלחנו לאפס את הסיסמה. ודא שהקישור תקף והסיסמאות תואמות.");
    }
  };

  useEffect(() => {
    if (!token) {
      setError("❌ קישור לא תקף או חסר טוקן.");
    }
  }, [token]);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>איפוס סיסמה</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="סיסמה חדשה"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="אימות סיסמה"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          {error && <p className="error">{error}</p>}
          {message && <p style={{ color: "green" }}>{message}</p>}
          <button type="submit" className="auth-submit-button">
            אפס סיסמה
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
