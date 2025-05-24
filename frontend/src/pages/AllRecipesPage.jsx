import { useEffect, useState } from "react";
import { getPublicRecipes } from "../services/recipeService";
import RecipeCard from "../components/RecipeCard";
import { useAuth } from "../context/AuthContext";
import "../css/AllRecipesPage.css";

function AllRecipesPage() {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [sortBy, setSortBy] = useState("recent");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!user) return;

    async function fetch() {
      try {
        const data = await getPublicRecipes(sortBy, page);
        console.log("📦 קיבלתי מהשרת:", data);
        setRecipes(data.recipes);
        setTotalPages(data.total_pages);
      } catch (err) {
        console.error("❌ שגיאה בטעינת מתכונים:", err);
        setRecipes([]);
      }
    }

    fetch();
  }, [sortBy, page, user]);

  if (!user) {
    return (
      <div className="not-logged-in-message">
        <h2>נראה שלא התחברת 🚫</h2>
        <p>כדי לצפות במתכונים, אנא התחבר תחילה</p>
      </div>
    );
  }

  return (
    <div className="public-recipes-page">
      <div className="recipes-layout">
        {/* 🧱 שינוי סדר! הגריד קודם */}
        <div className="recipes-grid">
          {recipes.length === 0 ? (
            <p>לא נמצאו מתכונים.</p>
          ) : (
            recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))
          )}

          {totalPages > 1 && (
            <div className="pagination-controls">
              <button disabled={page === 1} onClick={() => setPage(page - 1)}>
                הקודם
              </button>
              <span>
                עמוד {page} מתוך {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                הבא
              </button>
            </div>
          )}
        </div>

        {/* 📌 Sidebar בצד ימין */}
        <aside className="sidebar-filter">
          <h3>מיון לפי:</h3>
          {[
            { value: "recent", label: "מהחדש לישן" },
            { value: "top", label: "דירוג גבוה" },
            { value: "random", label: "אקראי" },
            { value: "favorite", label: "הכי מועדפים" },
          ].map((option) => (
            <div className="sort-option" key={option.value}>
              <label>
                <input
                  type="radio"
                  value={option.value}
                  checked={sortBy === option.value}
                  onChange={(e) => setSortBy(e.target.value)}
                />
                {option.label}
              </label>
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
}

export default AllRecipesPage;
