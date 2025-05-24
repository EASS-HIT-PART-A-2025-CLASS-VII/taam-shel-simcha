// src/pages/PublicRecipesPage.jsx
import { useEffect, useState } from "react";
import { getPublicRandomRecipes } from "../services/recipeService";
import RecipeCard from "../components/RecipeCard";
import "../css/PublicRecipesPage.css";

function PublicRecipesPage() {
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    getPublicRandomRecipes()
      .then((data) => {
        console.log("✔️ קיבלתי מתכונים אקראיים:", data);
        setRecipes(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("❌ שגיאה בקבלת מתכונים אקראיים:", err);
        setRecipes([]);
      });
  }, []);

  return (
    <div className="public-recipes-page">
      <h2>מתכונים ציבוריים</h2>
      {recipes.length === 0 ? (
        <p>לא נמצאו מתכונים.</p>
      ) : (
        <div className="recipes-grid">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  );
}

export default PublicRecipesPage;
