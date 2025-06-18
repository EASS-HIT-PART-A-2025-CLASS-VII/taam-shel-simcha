import { useEffect, useState } from "react";
import { getAllRecipes, deleteRecipe } from "../services/adminService";
import { Recipe } from "../types/Recipe";

export default function AdminRecipesTable() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    getAllRecipes()
      .then(setRecipes)
      .catch(() => setRecipes([]));
  }, []);

  const handleDelete = async (id: number) => {
    if (confirm("האם למחוק את המתכון הזה?")) {
      await deleteRecipe(id);
      setRecipes(recipes.filter((r) => r.id !== id));
    }
  };

  return (
    <div className="mt-8" dir="rtl">
      <h2 className="text-xl font-bold mb-2">📋 כל המתכונים</h2>
      <table className="w-full border-collapse border text-right">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-4 py-2">#</th>
            <th className="border px-4 py-2">שם מתכון</th>
            <th className="border px-4 py-2">תיאור</th>
            <th className="border px-4 py-2">ציבורי?</th>
            <th className="border px-4 py-2">יוצר</th>
            <th className="border px-4 py-2 w-10"></th>
          </tr>
        </thead>
        <tbody>
          {recipes.map((r) => (
            <tr key={r.id} className="border-t hover:bg-gray-50">
              <td className="border px-4 py-2">{r.id}</td>
              <td className="border px-4 py-2">{r.title}</td>
              <td className="border px-4 py-2">{r.description?.slice(0, 40)}...</td>
              <td className="border px-4 py-2">{r.is_public ? "✅" : "❌"}</td>
              <td className="border px-4 py-2">{r.creator_name}</td>
              <td className="border px-2 py-2 text-center">
                <button
                  onClick={() => handleDelete(r.id)}
                  className="text-red-600 hover:scale-110 transition-transform text-lg"
                  title="מחק מתכון"
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
