import axios from "axios";

const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:8000"
    : "http://backend:8000"; // לשימוש בתוך Docker Network

// ✅ 1. שליפת מתכונים ציבוריים לפי מיון (top, recent, random, favorite)
export async function getPublicRecipes(sortBy = "recent", page = 1) {
  let sortPath = "recent";
  if (sortBy === "top") sortPath = "top-rated";
  else if (sortBy === "random") sortPath = "random";
  else if (sortBy === "favorite") sortPath = "favorited";

  const res = await axios.get(`${API_URL}/recipes/sorted/${sortPath}?page=${page}`);
  return res.data;
}

// ✅ 2. מתכונים אקראיים (8 בלבד) – לאורחים
export async function getPublicRandomRecipes() {
  const res = await axios.get(`${API_URL}/recipes/public-random`);
  return res.data;
}

// ✅ 3. יצירת מתכון עם AI
export async function generateRecipeWithAI(text) {
  const res = await axios.post(`${API_URL}/ai/recipe`, null, {
    params: { text },
  });
  return res.data;
}
