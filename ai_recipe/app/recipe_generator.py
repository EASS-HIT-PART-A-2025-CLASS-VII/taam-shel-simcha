import json
import re
from urllib import response
from openai import OpenAI
from app.config import OPENAI_API_KEY

client = OpenAI(api_key=OPENAI_API_KEY)

def generate_recipe_with_openai(ingredients: str) -> dict:
    prompt = f"""
You are a professional Israeli home chef and AI recipe generator.

Your task is to create a realistic, tasty home-style recipe using only the ingredients provided by the user.

The user wrote this free-text ingredients list:
"{ingredients}"
"""
    prompt += """
Instructions:
1. Understand the ingredients, even if written in Hebrew with typos or informal phrasing.
2. Remove any items that are NOT edible or not food-related (e.g., soap, batteries, shampoo, paper, laptop, etc.).
3. Create ONE complete dish using only the remaining edible ingredients (you may add basic pantry items like salt, pepper, oil, water).
4. If ALL provided items are non-edible / not food-related, return a valid JSON object that asks the user to provide edible ingredients.
5. The output MUST be in Hebrew.
6. The output MUST be a valid JSON object and nothing else.

The JSON format MUST be exactly:

{
  "title": "<short appealing Hebrew dish name OR a short Hebrew message asking for edible ingredients>",
  "ingredients": "<the original ingredients string exactly as received>",
  "ingredients_text": "- <ingredient with quantity>\\n- <ingredient with quantity>\\n...",
  "instructions": "1. <step one>\\n2. <step two>\\n3. <step three>\\n..."
}

Rules:
- The recipe must be realistic and something a person can actually cook.
- Do NOT invent main ingredients that were not mentioned by the user (except basic pantry items: salt, pepper, oil, water).
- Any ingredients identified as non-edible or not food-related must be completely excluded from the recipe output and must not appear in the title, ingredients_text, or instructions.
- If ALL items are non-edible, set:
  - "title" to something like: "נא להזין רכיבים אכילים להכנת מתכון"
  - "ingredients_text" to an empty string ""
  - "instructions" to an empty string ""
- The title should be a short, appealing Hebrew dish name (or the short request message if no edible ingredients exist).
- Ingredients must include quantities (כוס, כף, יחידה, גרם וכו').
- Instructions must be clear, short, and written as numbered steps.
- Do not include explanations, notes, emojis or extra text — only the JSON in the exact format.
"""



    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
        temperature=0.7,
        max_tokens=700
    )

    content = response.choices[0].message.content
    recipe = json.loads(content)
    return recipe

   