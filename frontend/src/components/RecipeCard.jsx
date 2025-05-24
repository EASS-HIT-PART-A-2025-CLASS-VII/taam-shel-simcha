import { useAuth } from "../context/AuthContext";

function RecipeCard({ recipe }) {
  const imageUrl = recipe.image_url || "/no_pic.png";
  const { user } = useAuth();

  const handleProtectedAction = () => {
    if (!user) {
      alert("נראה שלא התחברת... אנא התחבר כדי להשתמש בפעולה זו.");
    }
  };

  return (
    <div className="recipe-card">
      <div className="rating-box">
        ⭐ {recipe.average_rating?.toFixed(1) ?? "לא דורג"}
      </div>

      <img
        src={imageUrl}
        alt={recipe.title}
        className="recipe-image"
      />

      <h3>{recipe.title}</h3>
      <p><strong>יוצר:</strong> {recipe.creator_name}</p>

      {recipe.description && (
        <div className="description-block">
          <strong>תיאור:</strong>
          <p className="description">{recipe.description}</p>
        </div>
      )}

      {/* 👇 כפתורים תמיד מוצגים, אך ננעלים למשתמש לא מחובר */}
      <div className="card-actions">
        <button title="מועדפים" onClick={handleProtectedAction}>❤️</button>
        <button title="תגובות" onClick={handleProtectedAction}>💬</button>
        <button title="שתף" onClick={handleProtectedAction}>🔗</button>
      </div>
    </div>
  );
}

export default RecipeCard;
