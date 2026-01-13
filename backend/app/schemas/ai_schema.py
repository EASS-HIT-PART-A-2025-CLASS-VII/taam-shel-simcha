from pydantic import BaseModel
# backend/app/schemas/ai_schema.py

class RecipeAIResponse(BaseModel):
    title: str
    ingredients: str
    ingredients_text: str
    instructions: str
