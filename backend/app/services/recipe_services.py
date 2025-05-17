from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from sqlalchemy.sql.expression import func as sql_func
from app.models import Recipe, Rating, Favorite


def get_top_rated_recipes(db: Session, limit: int = 8):
    subquery = (
        db.query(
            Rating.recipe_id,
            func.avg(Rating.rating).label("avg_rating")
        )
        .group_by(Rating.recipe_id)
        .subquery()
    )

    recipes = (
        db.query(Recipe)
        .join(subquery, Recipe.id == subquery.c.recipe_id)
        .filter(Recipe.is_public == True)
        .order_by(desc(subquery.c.avg_rating))
        .limit(limit)
        .all()
    )
    return recipes


def get_random_recipes(db: Session, limit: int = 8):
    return (
        db.query(Recipe)
        .filter(Recipe.is_public == True)
        .order_by(sql_func.random())
        .limit(limit)
        .all()
    )


def get_most_recent_recipes(db: Session, limit: int = 8):
    return (
        db.query(Recipe)
        .filter(Recipe.is_public == True)
        .order_by(Recipe.created_at.desc())
        .limit(limit)
        .all()
    )


def get_most_favorited_recipes(db: Session, limit: int = 8):
    subquery = (
        db.query(
            Favorite.recipe_id,
            func.count(Favorite.id).label("fav_count")
        )
        .group_by(Favorite.recipe_id)
        .subquery()
    )

    recipes = (
        db.query(Recipe)
        .join(subquery, Recipe.id == subquery.c.recipe_id)
        .filter(Recipe.is_public == True)
        .order_by(desc(subquery.c.fav_count))
        .limit(limit)
        .all()
    )
    return recipes
