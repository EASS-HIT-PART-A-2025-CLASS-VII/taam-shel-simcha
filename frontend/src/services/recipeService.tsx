import axios from "axios";

const BASE_URL = "http://localhost:8000";

export async function getPublicRecipes() {
  const response = await axios.get(`${BASE_URL}/recipes/public-random`);
  return response.data;
}
