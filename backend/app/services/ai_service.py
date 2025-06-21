import httpx

AI_SERVICE_URL = "http://ai-service:5002/generate-recipe"

async def request_ai_recipe(ingredients_text: str):
    payload = {"ingredients_text": ingredients_text}
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(AI_SERVICE_URL, json=payload)
            await response.raise_for_status()
            return await response.json()
        except httpx.HTTPStatusError as e:
            # זה יטפל בשגיאת 400 מה-AI
            raise Exception(f"AI Service Error {e.response.status_code}: {e.response.text}")
        except Exception as e:
            raise Exception(f"שגיאה כללית: {str(e)}")
