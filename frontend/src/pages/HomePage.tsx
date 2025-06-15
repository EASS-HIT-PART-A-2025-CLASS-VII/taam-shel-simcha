import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background space-y-6">
      <h2 className="text-2xl font-semibold">ברוך הבא ל"טעם של שמחה"</h2>
      <Button onClick={() => navigate("/public")}>🍽️ מתכונים ציבוריים</Button>
      <Button onClick={() => navigate("/ai-recipe")}>🤖 יצירת מתכון עם AI</Button>
    </div>
  );
}
