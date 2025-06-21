import pytest
from unittest.mock import AsyncMock, patch
from app.services import ai_service


@pytest.mark.asyncio
@patch("app.services.ai_service.httpx.AsyncClient")
async def test_request_ai_recipe_success(mock_client_class):
    # תגובת JSON מדומה
    mock_json_response = {"title": "שקשוקה", "ingredients": ["ביצה", "עגבנייה"]}

    # יוצרים Mock לתגובה
    mock_response = AsyncMock()
    mock_response.status_code = 200
    mock_response.raise_for_status = AsyncMock()
    mock_response.json = AsyncMock(return_value=mock_json_response)

    # יוצרים Mock ל־AsyncClient
    mock_client_instance = AsyncMock()
    mock_client_instance.post = AsyncMock(return_value=mock_response)
    mock_client_class.return_value.__aenter__.return_value = mock_client_instance

    # קריאה לפונקציה בפועל
    result = await ai_service.request_ai_recipe("ביצה, עגבנייה")

    assert result["title"] == "שקשוקה"
    assert "ingredients" in result


@pytest.mark.asyncio
@patch("app.services.ai_service.httpx.AsyncClient")
async def test_request_ai_recipe_http_error(mock_client_class):
    # יוצרים שגיאה לדמות raise_for_status
    mock_response = AsyncMock()
    mock_response.status_code = 400
    mock_response.text = "Invalid ingredients"
    mock_response.raise_for_status = AsyncMock(side_effect=Exception("400 Client Error"))

    mock_client_instance = AsyncMock()
    mock_client_instance.post = AsyncMock(return_value=mock_response)
    mock_client_class.return_value.__aenter__.return_value = mock_client_instance

    with pytest.raises(Exception) as exc_info:
        await ai_service.request_ai_recipe("")

    assert "400 Client Error" in str(exc_info.value)
