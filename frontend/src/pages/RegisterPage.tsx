import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { useState } from "react";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // בדיקת סיסמאות
    if (password !== confirmPassword) {
      setError("הסיסמאות לא תואמות");
      return;
    }

    // ננקה שגיאות ונבצע פעולה בעתיד (שליחה ל-API וכו׳)
    setError("");
    console.log("נרשמת בהצלחה:", { username, email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="bg-white p-6 rounded-lg shadow-lg space-y-4 w-full max-w-sm text-center">
        <h2 className="text-2xl font-bold">הרשמה</h2>
        <form onSubmit={handleSubmit} className="space-y-3 text-right">
          <input
            type="text"
            placeholder="שם משתמש"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 border rounded-md text-right"
            dir="rtl"
          />
          <input
            type="email"
            placeholder="אימייל"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-md text-right"
            dir="rtl"
          />
          <input
            type="password"
            placeholder="סיסמה"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-md text-right"
            dir="rtl"
          />
          <input
            type="password"
            placeholder="אישור סיסמה"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-md text-right"
            dir="rtl"
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <Button type="submit" className="w-full bg-primary text-white hover:bg-hover">
            הרשמה
          </Button>
        </form>

        <p className="text-sm text-gray-600 mt-2">
          כבר יש לך חשבון?{" "}
          <Link to="/login" className="text-primary underline">
            התחבר כאן
          </Link>
        </p>
      </div>
    </div>
  );
}
