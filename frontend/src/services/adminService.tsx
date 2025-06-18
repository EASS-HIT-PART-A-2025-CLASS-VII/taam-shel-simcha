import api from "./api";
import { User } from "../types/user";
import { Recipe } from "../types/Recipe";

// שליפת כל המשתמשים
export const getAllUsers = async (): Promise<User[]> => {
  const res = await api.get("/auth/admin/users");
  return res.data;
};

// מחיקת משתמש לפי ID
export const deleteUser = async (userId: number): Promise<{ message: string }> => {
  const res = await api.delete(`/auth/admin/users/${userId}`);
  return res.data;
};


export const getAllRecipes = async (): Promise<Recipe[]> => {
  const res = await api.get("/recipes/admin/recipes"); // ✅ הנתיב הנכון
  return res.data;
};


// מחיקת מתכון לפי ID
export const deleteRecipe = async (recipeId: number): Promise<{ message: string }> => {
  const res = await api.delete(`/recipes/admin/recipes/${recipeId}`);
  return res.data;
};



export const getAdminStats = async (): Promise<{
  user_count: number;
  recipe_count: number;
  top_rated_recipe: string;
  most_favorited_recipe: string;
}> => {
  const res = await api.get("/recipes/admin/stats");
  return res.data;
};
