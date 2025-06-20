// components/RecipeCard.tsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Star, Clock, ChefHat } from "lucide-react";
import { type Recipe } from "../types/Recipe";
import StarRating from "./StarRating";
import RecipeShareButton from "./RecipeShareButton";

interface RecipeCardProps {
  recipe: Recipe;
  isFavorited: boolean;
  onToggleFavorite: (id: number) => void;
  onRate: (rating: number) => void;
   isMine?: boolean;
}

export default function RecipeCard({
  recipe,
  isFavorited,
  onToggleFavorite,
  onRate,
}: RecipeCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const getDifficultyText = (difficulty?: string) => {
    switch (difficulty) {
      case "Easy":
        return "קל";
      case "Medium":
        return "בינוני";
      case "Hard":
        return "קשה";
      default:
        return difficulty || "לא צוינה";
    }
  };

  return (
    <Link
      to={`/recipes/${recipe.id}`}
      className="group relative bg-white rounded-xl shadow hover:shadow-lg transition cursor-pointer overflow-hidden border border-gray-200 w-[300px] no-underline text-inherit"
      dir="rtl"
    >
      {/* אזור תמונה */}
      <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
        {!imageError && recipe.image_url?.trim() ? (
          <img
            src={recipe.image_url}
            alt={recipe.title}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            className={`w-full h-full object-cover transition duration-300 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            } group-hover:scale-105`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-orange-100">
            <ChefHat className="w-14 h-14 text-orange-400" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

        {/* רמת קושי */}
        {recipe.difficulty && (
          <div className="absolute bottom-2 left-2 px-3 py-1.5 bg-white/90 text-gray-800 text-sm font-semibold rounded-full shadow-sm">
            {getDifficultyText(recipe.difficulty)}
          </div>
        )}

        {/* זמן הכנה */}
        {recipe.prep_time && (
          <div className="absolute bottom-2 right-2 px-3 py-1.5 bg-white/90 text-gray-800 text-sm font-semibold rounded-full shadow-sm flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{recipe.prep_time}</span>
          </div>
        )}

        {/* דירוג ממוצע */}
        {recipe.average_rating && recipe.average_rating > 0 && (
          <div className="absolute top-2 right-2 bg-white/90 rounded-full px-2 py-1 flex items-center gap-1 shadow">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="text-sm font-medium text-gray-800">
              {recipe.average_rating.toFixed(1)}
            </span>
          </div>
        )}

        {/* שיתוף + מועדפים */}
        <div className="absolute top-2 left-2 flex gap-2">
          <RecipeShareButton recipeId={recipe.id} title={recipe.title} />
          <button
            onClick={(e) => {
              e.preventDefault(); // מונע מה־<Link> לפעול
              e.stopPropagation(); // מונע bubbling
              onToggleFavorite(recipe.id);
            }}
            className="p-2 bg-white/90 rounded-full shadow hover:shadow-md transition"
            title={isFavorited ? "הסר מהמועדפים" : "הוסף למועדפים"}
          >
            <Heart
              className={`w-4 h-4 transition ${
                isFavorited
                  ? "fill-red-500 text-red-500"
                  : "text-gray-600 hover:text-red-500"
              }`}
            />
          </button>
        </div>
      </div>

      {/* תוכן */}
      <div className="p-4 flex flex-col gap-2">
        <div>
          <h3 className="text-lg font-bold text-gray-800 line-clamp-2 group-hover:text-orange-600 transition">
            {recipe.title}
          </h3>
          <div className="text-sm text-gray-600 flex items-center justify-end gap-1" dir="ltr">
            {recipe.creator_name}
            <ChefHat className="w-4 h-4" />
          </div>
        </div>

        {recipe.description && (
          <p className="text-sm text-gray-600 line-clamp-2">{recipe.description}</p>
        )}

        <div
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation(); // מונע לחיצה על הלינק
          }}
        >
          <StarRating onRate={onRate} size="sm" />
        </div>
      </div>
    </Link>
  );
}
