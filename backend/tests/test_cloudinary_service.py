import pytest
from unittest.mock import patch, MagicMock
from fastapi import UploadFile
from io import BytesIO
from app.services import cloudinary_service  # ודא שזה הנתיב הנכון לקובץ שלך

class DummyUploadFile:
    def __init__(self, filename="test.jpg", content=b"fake image bytes"):
        self.filename = filename
        self.file = BytesIO(content)

# ========== בדיקה עוקפת של Cloudinary ==========

@patch("app.services.cloudinary_service.cloudinary.uploader.upload")
def test_upload_image_to_cloudinary_success(mock_upload):
    # מגדירים מה אמור לחזור מהפונקציה המדומה
    mock_upload.return_value = {"secure_url": "https://cloudinary.com/fake-image.jpg"}

    dummy_file = DummyUploadFile()
    result = cloudinary_service.upload_image_to_cloudinary(dummy_file)

    assert result == "https://cloudinary.com/fake-image.jpg"
    mock_upload.assert_called_once()
    args, kwargs = mock_upload.call_args
    assert kwargs["folder"] == "recipes"
    assert kwargs["resource_type"] == "image"
