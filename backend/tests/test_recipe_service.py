from uuid import uuid4
from app.services import recipe_services
from app.models import User, Recipe, Rating
from app.schemas.recipe_schema import DifficultyLevel, RecipeUpdate, ratingRequest
from sqlalchemy.orm import Session      
from fastapi import HTTPException
import pytest



def test_create_recipe(db: Session):
    user = User(username="testuser", email="test@example.com", password="1234")
    db.add(user)
    db.commit()
    db.refresh(user)

    result = recipe_services.create_recipe(
        db=db,
        title="חביתה ירוקה",
        description="עם פטרוזיליה",
        ingredients="ביצים, פטרוזיליה",
        instructions="לערבב ולטגן",
        video_url=None,
        image=None,
        is_public=True,
        difficulty=DifficultyLevel.קל,
        prep_time="10 דקות",
        current_user=user
    )

    assert result["message"] == "Recipe created successfully"
    assert result["is_public"] is True
    assert "recipe_id" in result


def test_get_my_recipes(db: Session):
    user = User(username="me", email="me@example.com", password="1234")
    db.add(user)
    db.commit()
    db.refresh(user)

    recipe = Recipe(
        title="פסטה",
        description="טעים",
        ingredients="פסטה, מלח",
        instructions="לבשל",
        user_id=user.id,
        is_public=False,
        prep_time="15 דקות",
        difficulty=DifficultyLevel.קל.value,
        share_token=str(uuid4())
    )
    db.add(recipe)
    db.commit()

    result = recipe_services.get_my_recipes(db, user)
    assert len(result) == 1
    assert result[0].title == "פסטה"


def test_search_recipes_by_title(db: Session):
    user = User(username="chef", email="chef@example.com", password="pass")
    db.add(user)
    db.commit()
    db.refresh(user)

    recipe = Recipe(
        title="עוגת שוקולד",
        description="עסיסית",
        ingredients="קקאו, סוכר",
        instructions="לאפות",
        user_id=user.id,
        is_public=True,
        prep_time="45 דקות",
        difficulty=DifficultyLevel.בינוני.value,
        share_token=str(uuid4())
    )
    db.add(recipe)
    db.commit()

    results = recipe_services.search_recipes(title="שוקולד", ingredient=None, creator_name=None, db=db)
    assert len(results) == 1
    assert results[0].title == "עוגת שוקולד"


def test_rate_recipe(db: Session):
    user = User(username="rater", email="rater@example.com", password="pass")
    creator = User(username="creator", email="creator@example.com", password="pass", wants_emails=False)
    db.add_all([user, creator])
    db.commit()
    db.refresh(user)
    db.refresh(creator)

    recipe = Recipe(
        title="מרק",
        description="חם",
        ingredients="מים, מלח",
        instructions="לבשל",
        user_id=creator.id,
        is_public=True,
        prep_time="20 דקות",
        difficulty=DifficultyLevel.קל.value,
        share_token=str(uuid4())
    )
    db.add(recipe)
    db.commit()
    db.refresh(recipe)

    response = recipe_services.rate_recipe(
        recipe_id=recipe.id,
        rating_data=ratingRequest(rating=5),
        db=db,
        current_user=user
    )

    assert response["message"] == "Rating submitted successfully"

    avg = recipe_services.get_average_rating(recipe.id, db)
    assert avg["average_rating"] == 5.0


def test_update_recipe(db: Session):
    user = User(username="editor", email="edit@example.com", password="pass")
    db.add(user)
    db.commit()
    db.refresh(user)

    recipe = Recipe(
        title="סלט",
        description="עם ירק",
        ingredients="עגבנייה, מלפפון",
        instructions="לחתוך",
        user_id=user.id,
        is_public=True,
        prep_time="5 דקות",
        difficulty=DifficultyLevel.קל.value,
        share_token=str(uuid4())
    )
    db.add(recipe)
    db.commit()
    db.refresh(recipe)

    update_data = RecipeUpdate(title="סלט ירקות", description="סלט קצוץ")
    result = recipe_services.update_recipe(recipe.id, update_data, db, user)

    assert result["message"] == "Recipe updated successfully"
    updated = db.get(Recipe, recipe.id)
    assert updated.title == "סלט ירקות"


def test_delete_recipe(db: Session):
    user = User(username="deleter", email="del@example.com", password="pass")
    db.add(user)
    db.commit()
    db.refresh(user)

    recipe = Recipe(
        title="שקשוקה",
        description="טעימה",
        ingredients="עגבניות, ביצים",
        instructions="לבשל",
        user_id=user.id,
        is_public=True,
        prep_time="15 דקות",
        difficulty=DifficultyLevel.בינוני.value,
        share_token=str(uuid4())
    )
    db.add(recipe)
    db.commit()
    db.refresh(recipe)

    response = recipe_services.delete_recipe(recipe.id, db, user)
    assert response["message"] == "Recipe deleted successfully"
    assert db.get(Recipe, recipe.id) is None



def create_sample_user(db: Session, username="user", email="user@example.com", password="pass", is_admin=False):
    user = User(username=username, email=email, password=password, is_admin=is_admin)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def create_sample_recipe(db: Session, user: User, public=True, title="Title"):
    recipe = Recipe(
        title=title,
        description="desc",
        ingredients="ingr",
        instructions="inst",
        user_id=user.id,
        is_public=public,
        prep_time="10",
        difficulty=DifficultyLevel.קל.value,
        share_token=str(uuid4())
    )
    db.add(recipe)
    db.commit()
    db.refresh(recipe)
    return recipe

def test_get_recipe_by_id_allowed(db: Session):
    user = create_sample_user(db)
    recipe = create_sample_recipe(db, user)
    res = recipe_services.get_recipe_by_id(recipe.id, db, user)
    assert res.title == recipe.title

def test_get_recipe_by_id_denied_for_private(db: Session):
    user = create_sample_user(db)
    other = create_sample_user(db, username="other", email="other@example.com")
    recipe = create_sample_recipe(db, user, public=False)
    with pytest.raises(HTTPException) as exc:
        recipe_services.get_recipe_by_id(recipe.id, db, other)
    assert exc.value.status_code == 403

def test_get_average_rating(db: Session):
    user = create_sample_user(db)
    recipe = create_sample_recipe(db, user)
    db.add(Rating(user_id=user.id, recipe_id=recipe.id, rating=4))
    db.commit()
    res = recipe_services.get_average_rating(recipe.id, db)
    assert res["average_rating"] == 4.0

def test_get_top_rated_recipes(db: Session):
    user = create_sample_user(db)
    recipe = create_sample_recipe(db, user)
    db.add(Rating(user_id=user.id, recipe_id=recipe.id, rating=5))
    db.commit()
    res = recipe_services.get_top_rated_recipes(db)
    assert len(res) >= 1

def test_get_public_recipe_success(db: Session):
    user = create_sample_user(db)
    recipe = create_sample_recipe(db, user)
    res = recipe_services.get_public_recipe(recipe.id, db)
    assert res.title == recipe.title

def test_get_public_recipe_not_found(db: Session):
    with pytest.raises(HTTPException) as exc:
        recipe_services.get_public_recipe(999, db)
    assert exc.value.status_code == 404

def test_get_random_public_recipes(db: Session):
    user = create_sample_user(db)
    for i in range(5):
        create_sample_recipe(db, user, title=f"recipe {i}")
    res = recipe_services.get_random_public_recipes(db, limit=3)
    assert len(res) <= 3