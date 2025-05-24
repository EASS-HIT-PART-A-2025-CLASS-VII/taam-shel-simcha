import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../css/GuestNavbar.css"; // נשתמש באותו עיצוב

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
  navigate("/"); // קודם כל לנווט
  setTimeout(() => logout(), 100); // ואז להתנתק עם דיליי קצר
};


  if (!user) return null; // בטיחות – מציג רק אם מחובר

  return (
    <nav className="guest-navbar">
      <div className="guest-navbar-logo"></div>

      <ul className="guest-navbar-links">
        <li>
          <Link to="/recipes" className="nav-icon-button">
            <img
              src="/recipe_icon.png"
              alt="מתכונים"
              className="nav-icon-img"
            />
            <span className="nav-icon-label">מתכונים</span>
          </Link>
        </li>

        <li>
          <Link to="/ai-recipe" className="nav-icon-button">
            <img
              src="/recipe_icon_ai.png"
              alt="AI"
              className="nav-icon-img"
            />
            <span className="nav-icon-label">AI מתכון עם</span>
          </Link>
        </li>

        <li>
          <Link to="/profile" className="nav-icon-button">
            <img
              src="/login_icon.png"
              alt="פרופיל"
              className="nav-icon-img"
            />
            <span className="nav-icon-label">הפרופיל שלי</span>
          </Link>
        </li>

        <li>
          <button onClick={handleLogout} className="nav-icon-button logout-button">
            <img
              src="/logout_icon.png" // תוכל להוסיף אייקון חדש, או להשתמש בקיים
              alt="התנתקות"
              className="nav-icon-img"
            />
            <span className="nav-icon-label">התנתקות</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
