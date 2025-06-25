import axios from "axios";

export async function generateAIRecipe(ingredients_text: string) {
  const response = await axios.post(
    "http://localhost:8000/ai/recipe",
    { ingredients_text }  
  );
  console.log("AI Recipe Response:", response.data);
  return response.data;
}

