import pytest
from fastapi import HTTPException
from app.services import favorites_services
from app.models import User, Recipe, Favorite
from app.schemas.recipe_schema import RecipeResponse

# יצירת משתמש מזויף (בלי id מוגדר מראש)
def create_mock_user(username="testuser", email="test@example.com"):
    return User(
        username=username,
        email=email,
        password="hashedpassword",
        is_admin=False,
        wants_emails=True
    )

# יצירת מתכון מזויף עם שיוך ליוזר
def create_mock_recipe(user_id: int, title="Test Recipe"):
    return Recipe(
        title=title,
        description="Test Desc",
        ingredients="Tomatoes, Cheese",
        instructions="Mix and cook",
        image_url=None,
        video_url=None,
        user_id=user_id,
        created_at=None,
        share_token="123e4567-e89b-12d3-a456-426614174000",
        is_public=True,
        prep_time="30 min",
        difficulty="קל"
    )

def test_add_favorite_success(db):
    user = create_mock_user(username="user1", email="user1@example.com")
    db.add(user)
    db.commit()
    db.refresh(user)

    recipe = create_mock_recipe(user_id=user.id)
    db.add(recipe)
    db.commit()
    db.refresh(recipe)

    res = favorites_services.add_favorite(recipe.id, db, user)
    assert res == {"message": "Recipe added to favorites"}

def test_add_favorite_already_exists(db):
    user = create_mock_user(username="user2", email="user2@example.com")
    db.add(user)
    db.commit()
    db.refresh(user)

    recipe = create_mock_recipe(user_id=user.id, title="Already Exists Recipe")
    db.add(recipe)
    db.commit()
    db.refresh(recipe)

    db.add(Favorite(user_id=user.id, recipe_id=recipe.id))
    db.commit()

    with pytest.raises(HTTPException) as e:
        favorites_services.add_favorite(recipe.id, db, user)
    assert e.value.status_code == 400
    assert "already in favorites" in str(e.value.detail)

def test_remove_favorite_success(db):
    user = create_mock_user(username="user3", email="user3@example.com")
    db.add(user)
    db.commit()
    db.refresh(user)

    recipe = create_mock_recipe(user_id=user.id, title="Remove Test")
    db.add(recipe)
    db.commit()
    db.refresh(recipe)

    db.add(Favorite(user_id=user.id, recipe_id=recipe.id))
    db.commit()

    res = favorites_services.remove_favorite(recipe.id, db, user)
    assert res == {"message": "Recipe removed from favorites"}

def test_remove_favorite_not_found(db):
    user = create_mock_user(username="user4", email="user4@example.com")
    db.add(user)
    db.commit()
    db.refresh(user)

    with pytest.raises(HTTPException) as e:
        favorites_services.remove_favorite(recipe_id=999, db=db, current_user=user)
    assert e.value.status_code == 404
    assert "not found" in str(e.value.detail)

def test_get_favorites(db):
    user = create_mock_user(username="user5", email="user5@example.com")
    db.add(user)
    db.commit()
    db.refresh(user)

    recipe = create_mock_recipe(user_id=user.id, title="Get Favorites")
    db.add(recipe)
    db.commit()
    db.refresh(recipe)

    db.add(Favorite(user_id=user.id, recipe_id=recipe.id))
    db.commit()

    res = favorites_services.get_favorites(db, user)
    assert isinstance(res, list)
    assert len(res) == 1
    assert isinstance(res[0], RecipeResponse)
    assert res[0].id == recipe.id
