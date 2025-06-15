import axios from "axios";

export async function generateAIRecipe(ingredients_text: string) {
  const response = await axios.post(
    `http://localhost:8000/ai/recipe?text=${encodeURIComponent(ingredients_text)}`
  );
  return response.data;
}
