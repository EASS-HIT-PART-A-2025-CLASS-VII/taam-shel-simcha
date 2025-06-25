import httpx

AI_SERVICE_URL = "http://ai-service:5002/generate-recipe"

async def request_ai_recipe(ingredients_text: str):
    payload = {"ingredients_text": ingredients_text}
    print("📤 שולח ל-AI:", payload)

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(AI_SERVICE_URL, json=payload, timeout=25.0)
            print("📥 תשובה גולמית:", response.text)
            response.raise_for_status()
            result = response.json()  # בלי await!!
            print("✅ JSON אחרי פיענוח:", result)
            return result

        except httpx.HTTPStatusError as e:
            print("❌ HTTPStatusError:", e.response.status_code, e.response.text)
            raise Exception(f"AI Service Error {e.response.status_code}: {e.response.text}")
        except Exception as e:
            print("❌ שגיאה כללית:", str(e))
            import traceback
            traceback.print_exc()
            raise Exception(f"שגיאה כללית: {str(e)}")
