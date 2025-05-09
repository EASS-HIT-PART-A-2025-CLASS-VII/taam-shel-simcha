import cloudinary
import cloudinary.uploader
import os
from dotenv import load_dotenv
from fastapi import UploadFile


load_dotenv()

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)

def upload_image_to_cloudinary(file: UploadFile, folder: str = "recipes") -> str:
    import cloudinary
    import cloudinary.uploader

    result = cloudinary.uploader.upload(
        file.file,  # ✅ משתמשים ב־file.file ולא file.read()
        folder=folder,
        resource_type="image"
    )
    return result.get("secure_url")
