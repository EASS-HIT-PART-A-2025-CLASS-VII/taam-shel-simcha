from fastapi import FastAPI, HTTPException
from app.recipe_generator import extract_hebrew_ingredients, generate_recipe_with_openai
from app.schemas import RecipeRequest, RecipeResponse

app = FastAPI()

@app.post("/generate-recipe", response_model=RecipeResponse)
def generate_recipe(data: RecipeRequest):
    ingredients = extract_hebrew_ingredients(data.ingredients_text)

    if not ingredients:
        raise HTTPException(status_code=400, detail="לא נמצאו רכיבים תקפים. נסה שוב עם מילים כמו 'ביצה', 'עגבנייה' וכו'.")

    result = generate_recipe_with_openai(ingredients)

    return RecipeResponse(
        title=result["title"],
        ingredients=result["ingredients"],
        ingredients_text=result["ingredients_text"],
        instructions=result["instructions"]
    )
