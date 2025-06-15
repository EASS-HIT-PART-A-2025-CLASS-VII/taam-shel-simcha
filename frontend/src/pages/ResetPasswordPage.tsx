// src/pages/ResetPasswordPage.tsx
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";


export default function ResetPasswordPage() {

  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");


  console.log("Token from URL:", token);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage("הסיסמאות לא תואמות");
      return;
    }

    try {
      await axios.post("http://localhost:8000/auth/reset-password", {
        token,
        new_password: password,
        confirm_password: confirmPassword,  // ← זה היה חסר
        });

      setMessage("הסיסמה אופסה בהצלחה!");
    } catch (error) {
      setMessage("אירעה שגיאה בעת איפוס הסיסמה");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded p-6 w-full max-w-md space-y-4"
      >
        <h2 className="text-xl font-bold text-center">איפוס סיסמה</h2>
        <input
          type="password"
          placeholder="סיסמה חדשה"
          className="w-full p-2 border rounded text-right"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="אישור סיסמה"
          className="w-full p-2 border rounded text-right"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full bg-primary text-white p-2 rounded hover:bg-hover"
        >
          איפוס סיסמה
        </button>
        {message && <p className="text-center text-sm text-red-500">{message}</p>}
      </form>
    </div>
  );
}
