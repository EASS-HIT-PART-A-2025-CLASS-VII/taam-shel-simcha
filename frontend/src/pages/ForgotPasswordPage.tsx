import { useState } from "react";
import { Button } from "../components/ui/button";
import axios from "axios";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:8000/auth/forgot-password", { email });

      setMessage("קישור לאיפוס סיסמה נשלח למייל שלך");
      setError("");
    } catch (err: any) {
      setError("לא הצלחנו לשלוח קישור. ודא שהאימייל נכון.");
      setMessage("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm space-y-4 text-center">
        <h2 className="text-2xl font-bold">שכחת סיסמה?</h2>
        <p className="text-sm text-gray-600">הכנס את האימייל שלך ונשלח לך קישור לאיפוס</p>

        <form onSubmit={handleSubmit} className="space-y-3 text-right">
          <input
            type="email"
            placeholder="האימייל שלך"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-md text-right"
            dir="rtl"
            required
          />

          {message && <p className="text-green-600 text-sm">{message}</p>}
          {error && <p className="text-red-500 text-sm">{error}</p>}

          <Button type="submit" className="w-full bg-primary text-white hover:bg-hover">
            שלח קישור איפוס
          </Button>
        </form>
      </div>
    </div>
  );
}
