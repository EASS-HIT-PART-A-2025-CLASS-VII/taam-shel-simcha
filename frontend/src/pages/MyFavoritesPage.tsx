import { useEffect, useState } from "react";
import { getmyFavorites, addToFavorites, removeFromFavorites, rateRecipe } from "../services/recipeService";
import { Recipe } from "../types/Recipe";
import RecipeCard from "../components/RecipeCard";

export default function MyFavoritesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [favorites, setFavorites] = useState<number[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getmyFavorites();
        setRecipes(data);
        setFavorites(data.map((r) => r.id));
      } catch {
        setError("שגיאה בטעינת המועדפים 😥");
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
      <h1 className="text-3xl font-bold text-primary mb-6 text-center">המועדפים שלי 💖</h1>

      {loading ? (
        <p className="text-center">טוען מתכונים...</p>
      ) : error ? (
        <p className="text-center text-red-600">{error}</p>
      ) : recipes.length === 0 ? (
        <p className="text-center text-gray-600">לא הוספת עדיין מתכונים למועדפים.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
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
