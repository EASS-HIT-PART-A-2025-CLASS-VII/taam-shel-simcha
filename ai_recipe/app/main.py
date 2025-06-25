from fastapi import FastAPI, HTTPException
from app.recipe_generator import extract_hebrew_ingredients, generate_recipe_with_openai
from app.schemas import RecipeRequest, RecipeResponse

app = FastAPI()

@app.post("/generate-recipe", response_model=RecipeResponse)
def generate_recipe(data: RecipeRequest):
    print("🔍 קלט מהבקאנד:", data.ingredients_text)

    try:
        ingredients = extract_hebrew_ingredients(data.ingredients_text)
        print("📦 רכיבים שזוהו:", ingredients)

        if not ingredients:
            raise HTTPException(status_code=400, detail="לא נמצאו רכיבים תקפים. נסה שוב עם מילים כמו 'ביצה', 'עגבנייה' וכו'.")

        result = generate_recipe_with_openai(ingredients)
        print("✅ תשובה מה-OpenAI:", result)

        return RecipeResponse(
            title=result["title"],
            ingredients=result["ingredients"],
            ingredients_text=result["ingredients_text"],
            instructions=result["instructions"]
        )
    except Exception as e:
        print("❌ שגיאה פנימית:", str(e))
        raise HTTPException(status_code=500, detail=str(e))
