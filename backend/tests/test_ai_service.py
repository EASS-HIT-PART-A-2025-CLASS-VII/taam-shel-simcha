import pytest
from unittest.mock import AsyncMock, patch
from app.services import ai_service


@pytest.mark.asyncio
@patch("app.services.ai_service.httpx.AsyncClient")
async def test_request_ai_recipe_success(mock_client_class):
    mock_json_response = {
        "title": "שקשוקה",
        "ingredients": ["ביצה", "עגבנייה"],
        "ingredients_text": "ביצה, עגבנייה",
        "instructions": "טגן ובשל",
    }

    mock_response = AsyncMock()
    mock_response.status_code = 200
    mock_response.raise_for_status = AsyncMock()
    mock_response.json = AsyncMock(return_value=mock_json_response)

    mock_client_instance = AsyncMock()
    mock_client_instance.post = AsyncMock(return_value=mock_response)
    mock_client_class.return_value.__aenter__.return_value = mock_client_instance

    result = await ai_service.request_ai_recipe("ביצה, עגבנייה")
    result = await result  # ← הוספה חשובה

    assert result["title"] == "שקשוקה"
    assert "ingredients" in result



@pytest.mark.asyncio
@patch("app.services.ai_service.httpx.AsyncClient")
async def test_request_ai_recipe_http_error(mock_client_class):
    # נבנה את ה-AsyncMock שיזרוק שגיאה מיד עם post()
    mock_response = AsyncMock()
    mock_response.status_code = 400
    mock_response.text = "Invalid ingredients"
    mock_response.raise_for_status = AsyncMock()  # לא נשתמש בזה כרגע
    mock_response.json = AsyncMock(return_value={})

    mock_client_instance = AsyncMock()
    mock_client_instance.post = AsyncMock(side_effect=Exception("400 Client Error"))  # ⬅️ השגיאה תיזרק כאן

    mock_client_class.return_value.__aenter__.return_value = mock_client_instance

    with pytest.raises(Exception) as exc_info:
        await ai_service.request_ai_recipe("")

    assert "400 Client Error" in str(exc_info.value)
