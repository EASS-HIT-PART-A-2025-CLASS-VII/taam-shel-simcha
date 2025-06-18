import { useEffect, useState } from "react";
import { getMyRecipes, addToFavorites, removeFromFavorites, rateRecipe } from "../services/recipeService";
import { Recipe } from "../types/Recipe";
import { Link } from "react-router-dom";
import RecipeCard from "../components/RecipeCard";

export default function MyRecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [favorites, setFavorites] = useState<number[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getMyRecipes();
        setRecipes(data);
        // כאן אתה יכול לשלוף את המועדפים האמיתיים אם יש לך את זה מופרד (כרגע דמה)
        setFavorites(data.filter((r) => r.is_public).map((r) => r.id));
      } catch {
        setError("שגיאה בטעינת המתכונים שלי 😥");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const toggleFavorite = async (id: number) => {
    try {
      if (favorites.includes(id)) {
        await removeFromFavorites(id);
        setFavorites(favorites.filter((fid) => fid !== id));
      } else {
        await addToFavorites(id);
        setFavorites([...favorites, id]);
      }
    } catch (err) {
      console.error("שגיאה בניהול מועדפים:", err);
    }
  };

  return (
    <div className="p-4 text-right" dir="rtl">
      <h1 className="text-3xl font-bold text-primary mb-6 text-center">המתכונים שלי 🍲</h1>

      <div className="mb-4 text-center">
        <Link
          to="/recipes/create"
          className="bg-primary hover:bg-hover text-white px-4 py-2 rounded shadow transition text-sm font-semibold"
        >
          ➕ הוסף מתכון חדש
        </Link>
      </div>

      {loading ? (
        <p className="text-center">טוען מתכונים...</p>
      ) : error ? (
        <p className="text-center text-red-600">{error}</p>
      ) : recipes.length === 0 ? (
        <p className="text-center text-gray-600">לא יצרת עדיין מתכונים.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              isMine={true}
              isFavorited={favorites.includes(recipe.id)}
              onToggleFavorite={toggleFavorite}
              onRate={async (rating) => {
                try {
                  await rateRecipe(recipe.id, rating);
                  alert("תודה על הדירוג!");
                } catch {
                  alert("הייתה שגיאה בשליחת הדירוג.");
                }
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
