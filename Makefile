# Makefile לפרויקט "טעם של שמחה"

# 🔍 מריץ את כל הבדיקות ל־FastAPI
test:
	PYTHONPATH=. pytest

# 🚀 מריץ את השרת FastAPI עם reload (ללא Docker)
run:
	uvicorn app.main:app --reload

# 🔍 בדיקות עם פלט מפורט
test-verbose:
	PYTHONPATH=. pytest -v

# 🎯 בדיקות לקובץ יחיד: make test-file FILE=tests/test_users_service.py
test-file:
	PYTHONPATH=. pytest $(FILE)

# 🐳 מריץ את כל השירותים
up:
	docker-compose up --build

# 🛑 עוצר את כל השירותים
down:
	docker-compose down

# 🧼 מנקה גם את ה־volume של המסד נתונים
clean:
	docker-compose down --volumes --remove-orphans

# 🔁 מריץ מחדש את קונטיינר ה־backend
restart-backend:
	docker-compose restart backend

# 🐳 מריץ בדיקות בתוך קונטיינר backend
test-docker:
	docker-compose exec backend pytest

# 🐚 כניסה ל־bash של ה־backend (שימושי לדיבוג)
bash:
	docker-compose exec backend bash

# 📜 כניסה ל־psql במסד הנתונים recipes
db:
	docker-compose exec db psql -U postgres -d recipes

# 💬 הרצת שאילתת SQL: make sql QUERY="SELECT * FROM users;"
sql:
	docker-compose exec db psql -U postgres -d recipes -c "$(QUERY)"

# 📦 כניסה ל־bash של שירות ה־AI
ai-bash:
	docker-compose exec ai-service bash

# 🌐 כניסה לספריית הפרונט והפעלתו מקומית
frontend:
	cd frontend && npm run dev

# 🔁 הרצה מחדש של כל השירותים ללא בנייה
restart:
	docker-compose restart

# 🔍 צפייה בלוגים של שירות: make logs SERVICE=backend
logs:
	docker-compose logs -f $(SERVICE)
