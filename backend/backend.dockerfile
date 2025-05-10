FROM python:3.13-alpine

WORKDIR /app


RUN pip install fastapi uvicorn sqlalchemy psycopg2-binary python-dotenv pydantic[email] passlib[bcrypt]  bcrypt python-jose[cryptography] cloudinary python-multipart httpx





COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
