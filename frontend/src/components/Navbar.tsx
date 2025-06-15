import { Link } from "react-router-dom";
import logo from "../assets/savtaicon.png";

export default function Navbar() {
  return (
    <header className="bg-primary text-white shadow-md w-full">
      <div className="w-full px-4 py-3 flex flex-row-reverse items-center justify-between">
        {/* לוגו ושם מימין */}
        <Link to="/" className="flex items-center gap-2">
        <span className="text-xl font-bold hidden sm:inline">טעם של שמחה</span>
          <img
            src={logo}
            alt="טעם של שמחה לוגו"
            className="h-10 w-10 rounded-full object-cover shadow-md"
          />
          
        </Link>

        {/* כפתורים משמאל */}
        <nav className="flex gap-3">
          <Link
            to="/public"
            className="px-4 py-2 rounded-md transition-colors bg-primary hover:bg-hover text-white text-sm font-medium shadow"
          >
            🍽️ מתכונים
          </Link>
          <Link
            to="/ai-recipe"
            className="px-4 py-2 rounded-md transition-colors bg-primary hover:bg-hover text-white text-sm font-medium shadow"
          >
            🤖 AI מתכונים עם 
          </Link>
          <Link
            to="/login"
            className="px-4 py-2 rounded-md transition-colors bg-primary hover:bg-hover text-white text-sm font-medium shadow"
          >
            🔐 התחברות
          </Link>
        </nav>
      </div>
    </header>
  );
}
