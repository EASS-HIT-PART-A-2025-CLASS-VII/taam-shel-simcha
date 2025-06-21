import pytest
from fastapi import HTTPException
from app.models import User, Recipe, Comment
from app.schemas.comment_schema import CommentCreate
from app.services import comments_service

# ====== מחוללים ======

def create_user(id=1, is_admin=False):
    return User(
        id=id,
        username=f"user{id}",
        email=f"user{id}@mail.com",
        password="pass",
        is_admin=is_admin
    )

def create_recipe(id=1, user_id=1):
    return Recipe(
        id=id,
        title="Test Recipe",
        description="Delicious",
        ingredients="Eggs, Tomatoes",
        instructions="Cook well",
        user_id=user_id,
        is_public=True,
        share_token="token",
        prep_time=15,  # חובה
        difficulty="Easy"  # חובה
    )

def create_comment(content="Nice", user_id=1, recipe_id=1):
    return Comment(content=content, user_id=user_id, recipe_id=recipe_id)

# ====== add_comment ======

def test_add_comment_success(db):
    user = create_user()
    recipe = create_recipe(user_id=user.id)
    db.add_all([user, recipe])
    db.commit()

    comment = CommentCreate(content="Great recipe!")
    response = comments_service.add_comment(recipe.id, comment, db, user)

    assert response.content == "Great recipe!"
    assert response.recipe_id == recipe.id
    assert response.user_id == user.id
    assert response.username == user.username

def test_add_comment_recipe_not_found(db):
    user = create_user()
    db.add(user)
    db.commit()

    comment = CommentCreate(content="Doesn't matter")
    with pytest.raises(HTTPException) as e:
        comments_service.add_comment(999, comment, db, user)
    assert e.value.status_code == 404

# ====== get_comments ======

def test_get_comments_success(db):
    user = create_user()
    recipe = create_recipe(user_id=user.id)
    comment = create_comment(content="Yummy!", user_id=user.id, recipe_id=recipe.id)

    db.add_all([user, recipe, comment])
    db.commit()

    result = comments_service.get_comments(recipe.id, db)

    assert isinstance(result, list)
    assert len(result) == 1
    assert result[0].content == "Yummy!"

# ====== delete_comment ======

def test_delete_comment_by_owner(db):
    user = create_user()
    recipe = create_recipe(user_id=user.id)
    comment = create_comment(user_id=user.id, recipe_id=recipe.id)
    db.add_all([user, recipe, comment])
    db.commit()

    response = comments_service.delete_comment(comment.id, db, user)
    assert response == {"message": "Comment deleted successfully"}

def test_delete_comment_by_admin(db):
    owner = create_user(id=1)
    admin = create_user(id=2, is_admin=True)
    recipe = create_recipe(user_id=owner.id)
    comment = create_comment(user_id=owner.id, recipe_id=recipe.id)

    db.add_all([owner, admin, recipe, comment])
    db.commit()

    response = comments_service.delete_comment(comment.id, db, admin)
    assert response == {"message": "Comment deleted successfully"}

def test_delete_comment_unauthorized(db):
    owner = create_user(id=1)
    other = create_user(id=2)
    recipe = create_recipe(user_id=owner.id)
    comment = create_comment(user_id=owner.id, recipe_id=recipe.id)

    db.add_all([owner, other, recipe, comment])
    db.commit()

    with pytest.raises(HTTPException) as e:
        comments_service.delete_comment(comment.id, db, other)
    assert e.value.status_code == 403

def test_delete_comment_not_found(db):
    user = create_user()
    db.add(user)
    db.commit()

    with pytest.raises(HTTPException) as e:
        comments_service.delete_comment(999, db, user)
    assert e.value.status_code == 404
