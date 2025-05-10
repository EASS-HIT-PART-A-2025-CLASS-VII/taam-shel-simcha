from fastapi import APIRouter, HTTPException
from app.services.ai_service import request_ai_recipe

router = APIRouter()

@router.post("/ai/recipe")
async def generate_ai_recipe(text: str):
    try:
        result = await request_ai_recipe(text)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
