import { Recipe } from "../types/Recipe";
import { Link } from "react-router-dom";
import StarRating from "./StarRating";
import RecipeShareButton from "./RecipeShareButton";

interface RecipeCardProps {
  recipe: Recipe;
  isFavorited: boolean;
  onToggleFavorite: (id: number) => void;
  onRate: (rating: number) => void;
  isMine?: boolean; // 👈 תוסיף את זה
}


export default function RecipeCard({
  recipe,
  isFavorited,
  onToggleFavorite,
  onRate,
}: RecipeCardProps) {
  return (
    <Link
      to={`/recipes/${recipe.id}`}
      className="bg-white shadow rounded p-4 relative text-right hover:shadow-lg transition block"
    >
      {/* דירוג ממוצע */}
      <div className="absolute top-2 right-2 bg-yellow-400 text-white px-2 py-1 rounded-md text-xs font-bold shadow">
        ⭐{" "}
        {recipe.average_rating != null
          ? recipe.average_rating.toFixed(1)
          : "אין דירוג"}
      </div>

      {/* כפתורי לב ושיתוף */}
      <div
        onClick={(e) => e.preventDefault()}
        className="absolute top-2 left-2 flex gap-2 items-center z-10"
      >
        <button
          onClick={() => onToggleFavorite(recipe.id)}
          className="text-2xl hover:scale-110 transition-transform"
          title="הוסף למועדפים"
        >
          {isFavorited ? "❤️" : "🤍"}
        </button>
        <RecipeShareButton recipeId={recipe.id} title={recipe.title} />
      </div>

      {/* דירוג */}
      <div onClick={(e) => e.preventDefault()} className="mt-2">
        <StarRating onRate={onRate} />
      </div>

      {/* תמונה */}
      <img
        src={recipe.image_url?.trim() ? recipe.image_url : "/images/no_pic.png"}
        alt={recipe.title}
        className="w-full h-48 object-contain object-center rounded"
      />

      {/* פרטים */}
      <h3 className="text-lg font-bold mt-2">{recipe.title}</h3>
      <p className="text-sm text-gray-600">👨‍🍳 {recipe.creator_name}</p>
      <p className="text-sm mt-1 break-words whitespace-pre-wrap">
        📝 {recipe.description}
      </p>
    </Link>
  );
}
