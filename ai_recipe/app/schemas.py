from pydantic import BaseModel
from typing import List

class RecipeRequest(BaseModel):
    ingredients_text: str

class RecipeResponse(BaseModel):
    title: str
    ingredients: str
    ingredients_text: str  # ⬅️ חדש – הטקסט הגולמי של המצרכים
    instructions: str