import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Star, ChefHat } from "lucide-react";
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
    <div
      className="group relative bg-white rounded-xl shadow hover:shadow-lg transition cursor-pointer overflow-visible border border-gray-200 w-[300px] text-inherit"
      dir="rtl"
    >
      {/* תמונה + תגיות זמן/קושי */}
      <Link to={`/recipes/${recipe.id}`}>
        <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-xl overflow-hidden">
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

          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

          <div className="absolute bottom-2 right-2 flex gap-2 z-10">
            {recipe.difficulty && (
              <span
                className={`px-2 py-0.5 text-xs rounded-full font-medium shadow backdrop-blur-sm ${
                  recipe.difficulty === "Easy"
                    ? "bg-green-100 text-green-800"
                    : recipe.difficulty === "Medium"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                🎯 {getDifficultyText(recipe.difficulty)}
              </span>
            )}
            {recipe.prep_time && (
              <span className="px-2 py-0.5 text-xs rounded-full font-medium bg-purple-100 text-purple-800 shadow backdrop-blur-sm">
                🕒 {recipe.prep_time} דק'
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* דירוג ממוצע */}
      {recipe.average_rating && recipe.average_rating > 0 && (
        <div className="absolute top-2 right-2 bg-white/90 rounded-full px-2 py-1 flex items-center gap-1 shadow">
          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          <span className="text-sm font-medium text-gray-800">
            {recipe.average_rating.toFixed(1)}
          </span>
        </div>
      )}

      {/* שיתוף ולב */}
      <div className="absolute top-2 left-2 flex gap-2 z-50">
        <div
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <RecipeShareButton recipeId={recipe.id} title={recipe.title} />
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation(); // תיקון חשוב
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

      {/* טקסטים */}
      <div className="p-4 flex flex-col gap-2">
        <Link to={`/recipes/${recipe.id}`}>
          <h3 className="text-lg font-bold text-gray-800 line-clamp-2 group-hover:text-orange-600 transition">
            {recipe.title}
          </h3>
        </Link>

        <div className="text-sm text-gray-600 flex items-center justify-end gap-1" dir="ltr">
          {recipe.creator_name}
          <ChefHat className="w-4 h-4" />
        </div>

        {recipe.description && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {recipe.description}
          </p>
        )}

        <div
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <StarRating onRate={onRate} size="sm" />
        </div>
      </div>
    </div>
  );
}
