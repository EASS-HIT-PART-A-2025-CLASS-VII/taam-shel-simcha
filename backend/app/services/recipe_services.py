from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, desc
from sqlalchemy.sql.expression import func as sql_func
from app.models import Recipe, Rating, Favorite,User
from app.schemas.recipe_schema import RecipeResponse, DifficultyLevel, RecipeUpdate, RecipeAdminUpdate, ratingRequest, ShareRequest
import random
from app.services.cloudinary_service import upload_image_to_cloudinary
from fastapi import HTTPException, UploadFile, BackgroundTasks
from datetime import datetime
from uuid import uuid4
from typing import Optional
import models
from app.services.email import send_rating_notification_email, send_recipe_email_with_pdf

PAGE_SIZE = 8




def get_top_rated_recipes_raw(db: Session, limit: int = 8):
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
        .options(joinedload(Recipe.creator))
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


def get_most_recent_recipes_from_db(db: Session, limit: int = 8):
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


def get_all_recipes(db: Session, page: int, page_size: int = 8) -> dict:
    query = db.query(Recipe).filter(Recipe.is_public == True)
    total = query.count()

    recipes = query.offset((page - 1) * page_size).limit(page_size).all()

    avg_ratings = dict(
        db.query(Rating.recipe_id, func.avg(Rating.rating))
        .group_by(Rating.recipe_id)
        .all()
    )

    response = [
        RecipeResponse(
            id=r.id,
            title=r.title,
            description=r.description,
            ingredients=r.ingredients,
            instructions=r.instructions,
            image_url=r.image_url,
            video_url=r.video_url,
            user_id=r.user_id,
            share_token=r.share_token,
            is_public=r.is_public,
            creator_name=r.creator.username if r.creator else "Unknown",
            created_at=r.created_at.isoformat() if r.created_at else None,
            average_rating=round(avg_ratings.get(r.id), 2) if avg_ratings.get(r.id) else None,
            prep_time=r.prep_time,
            difficulty=r.difficulty
        )
        for r in recipes
    ]

    return {
        "recipes": response,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size,
    }


def get_random_public_recipes(db: Session, limit: int = 8):
    all_public = (
        db.query(Recipe)
        .options(joinedload(Recipe.creator))
        .filter(Recipe.is_public == True)
        .all()
    )

    random_recipes = random.sample(all_public, min(len(all_public), limit))

    results = []
    for r in random_recipes:
        avg_rating = db.query(func.avg(Rating.rating)).filter(Rating.recipe_id == r.id).scalar()
        results.append(
            RecipeResponse(
                id=r.id,
                title=r.title,
                description=r.description,
                ingredients=r.ingredients,
                instructions=r.instructions,
                image_url=r.image_url,
                video_url=r.video_url,
                created_at=r.created_at.isoformat() if r.created_at else None,
                creator_name=r.creator.username if r.creator else "לא ידוע",
                share_token=r.share_token,
                is_public=r.is_public,
                average_rating=round(avg_rating, 2) if avg_rating else None,
                user_id=r.user_id,
                difficulty=r.difficulty,
                prep_time=r.prep_time
            )
        )

    return results


def create_recipe(
    db: Session,
    title: str,
    description: Optional[str],
    ingredients: str,
    instructions: Optional[str],
    video_url: Optional[str],
    image: Optional[UploadFile],
    is_public: bool,
    difficulty: DifficultyLevel,
    prep_time: str,
    current_user: User
):
    image_url = None

    if image and image.filename:
        try:
            image_url = upload_image_to_cloudinary(image, folder="recipes")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Image upload failed: {str(e)}")

    new_recipe = Recipe(
        title=title,
        description=description,
        ingredients=ingredients,
        instructions=instructions,
        image_url=image_url,
        video_url=video_url,
        user_id=current_user.id,
        created_at=datetime.utcnow(),
        share_token=str(uuid4()),
        is_public=is_public,
        prep_time=prep_time,
        difficulty=difficulty.value
    )

    db.add(new_recipe)
    db.commit()
    db.refresh(new_recipe)

    return {
        "message": "Recipe created successfully",
        "recipe_id": new_recipe.id,
        "image_url": image_url,
        "share_token": new_recipe.share_token,
        "is_public": new_recipe.is_public
    }



def get_public_recipe(recipe_id: int, db: Session):

    recipe = db.query(Recipe).filter_by(id=recipe_id, is_public=True).first()
    
    if not recipe:
        raise HTTPException(status_code=404, detail="Public recipe not found")
    
    return RecipeResponse(
        id=recipe.id,
        title=recipe.title,
        description=recipe.description,
        ingredients=recipe.ingredients,
        instructions=recipe.instructions,
        image_url=recipe.image_url,
        video_url=recipe.video_url,
        share_token = recipe.share_token,
        is_public = recipe.is_public,
        creator_name = recipe.creator.username if recipe.creator else "Unknown",
        created_at = recipe.created_at.isoformat() if recipe.created_at else None,
        user_id=recipe.user_id,
        prep_time=recipe.prep_time,
        difficulty=recipe.difficulty,
    )


def get_my_recipes(db: Session, current_user: User):
    recipes = (
        db.query(Recipe)
        .options(joinedload(Recipe.creator))  # ⬅️ נטען את היוצר
        .filter(Recipe.user_id == current_user.id)
        .all()
    )

    avg_ratings = dict(
        db.query(Rating.recipe_id, func.avg(Rating.rating))
        .group_by(Rating.recipe_id)
        .all()
    )

    return [
        RecipeResponse(
            id=recipe.id,
            title=recipe.title,
            description=recipe.description,
            ingredients=recipe.ingredients,
            instructions=recipe.instructions,
            image_url=recipe.image_url,
            video_url=recipe.video_url,
            user_id=recipe.user_id,
            share_token=recipe.share_token,
            is_public=recipe.is_public,
            creator_name=recipe.creator.username if recipe.creator else "Unknown",
            created_at=recipe.created_at.isoformat() if recipe.created_at else None,
            prep_time=recipe.prep_time,
            average_rating=round(avg_ratings.get(recipe.id), 2) if avg_ratings.get(recipe.id) else None,
            difficulty=recipe.difficulty
        )
        for recipe in recipes
    ]


def delete_recipe(recipe_id: int,db: Session ,current_user):
    recipe = db.query(models.Recipe).filter(models.Recipe.id == recipe_id).first()

    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")

    if recipe.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only delete your own recipes")

    db.delete(recipe)
    db.commit()

    return {"message": "Recipe deleted successfully"}


def update_recipe(recipe_id: int,updated_data: RecipeUpdate,db: Session ,current_user: User):
    recipe = db.query(models.Recipe).filter(models.Recipe.id == recipe_id).first()

    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")

    if recipe.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only edit your own recipes")

    # נעדכן רק שדות שנשלחו
    if updated_data.title is not None:
        recipe.title = updated_data.title
    if updated_data.description is not None:
        recipe.description = updated_data.description
    if updated_data.ingredients is not None:
        recipe.ingredients = updated_data.ingredients
    if updated_data.instructions is not None:
        recipe.instructions = updated_data.instructions
    if updated_data.image_url is not None:
        recipe.image_url = updated_data.image_url
    if updated_data.video_url is not None:
        recipe.video_url = updated_data.video_url
    if updated_data.is_public is not None:
        recipe.is_public = updated_data.is_public

    db.commit()
    db.refresh(recipe)

    return {"message": "Recipe updated successfully"}


def search_recipes(title: Optional[str] ,ingredient: Optional[str] ,creator_name: Optional[str] ,db: Session ):
    query = db.query(models.Recipe).filter(models.Recipe.is_public == True)

    if title and title.strip():
        query = query.filter(models.Recipe.title.ilike(f"%{title.strip()}%"))
    
    if ingredient and ingredient.strip():
        query = query.filter(models.Recipe.ingredients.ilike(f"%{ingredient.strip()}%"))
    
    if creator_name and creator_name.strip():
        query = query.join(models.User).filter(models.User.username.ilike(f"%{creator_name.strip()}%"))

    recipes = query.all()

    result = []
    for recipe in recipes:
        creator = recipe.creator.username if recipe.creator else "Unknown"
        result.append(RecipeResponse(
            id=recipe.id,
            title=recipe.title,
            description=recipe.description,
            ingredients=recipe.ingredients,
            instructions=recipe.instructions,
            image_url=recipe.image_url,
            video_url=recipe.video_url,
            share_token=recipe.share_token,
            is_public=recipe.is_public,
            created_at=recipe.created_at.isoformat() if recipe.created_at else None,
            creator_name=creator,
            prep_time=recipe.prep_time,
            user_id=recipe.user_id,
            difficulty=recipe.difficulty,
        ))

    return result


def get_recipe_by_id(recipe_id: int,db: Session ,current_user: User ):
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()

    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")

    if not recipe.is_public and recipe.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="You are not authorized to view this recipe")

    avg_rating = db.query(func.avg(Rating.rating)).filter(Rating.recipe_id == recipe_id).scalar()

    return RecipeResponse(
        id=recipe.id,
        title=recipe.title,
        description=recipe.description,
        ingredients=recipe.ingredients,
        instructions=recipe.instructions,
        image_url=recipe.image_url,
        video_url=recipe.video_url,
        share_token=recipe.share_token,
        is_public=recipe.is_public,
        created_at=recipe.created_at.isoformat() if recipe.created_at else None,
        prep_time=recipe.prep_time,
        creator_name=recipe.creator.username if recipe.creator else "לא ידוע",
        average_rating=round(avg_rating, 2) if avg_rating else None,
        user_id=recipe.user_id,
        difficulty=recipe.difficulty
    )


def get_all_recipes_admin(current_user: User, db: Session):
    recipes = db.query(Recipe).options(joinedload(Recipe.creator)).all()
    
    response = []
    for recipe in recipes:
        creator_name = recipe.creator.username if recipe.creator else "Unknown"
        response.append(RecipeResponse(
            id=recipe.id,
            title=recipe.title,
            description=recipe.description,
            ingredients=recipe.ingredients,
            instructions=recipe.instructions,
            image_url=recipe.image_url,
            video_url=recipe.video_url,
            user_id=recipe.user_id,
            share_token=recipe.share_token,
            is_public=recipe.is_public,
            creator_name=creator_name,
            prep_time=recipe.prep_time,
            created_at=recipe.created_at.isoformat() if recipe.created_at else None,
            difficulty=recipe.difficulty,
        ))

    return response


def delete_recipe_admin(recipe_id: int,db: Session ,current_user: User):
    recipe = db.query(models.Recipe).filter(models.Recipe.id == recipe_id).first()

    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")

    db.delete(recipe)
    db.commit()

    return {"message": "Recipe deleted successfully"}



def update_recipe_admin(recipe_id: int,updated_data: RecipeAdminUpdate,db: Session ,current_user: User):

    recipe = db.query(models.Recipe).filter(models.Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found") 
    
    for field, value in updated_data.dict(exclude_unset=True).items():
        setattr(recipe, field, value)

    db.commit()
    db.refresh(recipe)
    return {"message": "Recipe updated successfully"}


def rate_recipe(recipe_id: int,rating_data: ratingRequest,db: Session ,current_user: User):
    recipe = db.query(models.Recipe).filter(models.Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    
    existing_rating = db.query(models.Rating).filter(
        models.Rating.recipe_id == recipe_id,
        models.Rating.user_id == current_user.id
    ).first()

    if existing_rating:
        existing_rating.rating = rating_data.rating
    else:
        new_rating = Rating(
            user_id=current_user.id,
            recipe_id=recipe_id,
            rating=rating_data.rating
        )
        db.add(new_rating)

        # ✅ שליחת מייל לבעל המתכון רק בדירוג חדש
        if recipe.creator and recipe.creator.email and recipe.creator.wants_emails:
            send_rating_notification_email(
                to_email=recipe.creator.email,
                recipe_title=recipe.title,
                rating=rating_data.rating
            )

    db.commit()
    return {"message": "Rating submitted successfully"}


def get_average_rating(recipe_id: int, db: Session):
    
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code = 404, detail = "Recipe not found")
    
    avg = db.query(func.avg(Rating.rating)).filter(Recipe.id == recipe_id).scalar()

    return {
        "recipe_id": recipe_id,
        "average_rating": round(avg, 1) if avg is not None else None
    }



def get_top_rated_recipes(db: Session):
    
    recipes = (
        db.query(models.Recipe)
        .join(models.Rating, models.Rating.recipe_id == models.Recipe.id)
        .filter(models.Recipe.is_public == True)
        .group_by(models.Recipe.id)
        .order_by(func.avg(models.Rating.rating).desc())
        .all()
    )

    result = []
    for recipe in recipes:
        creator_name = recipe.creator.username if recipe.creator else "Unknown"
        result.append(RecipeResponse(
            id=recipe.id,
            title=recipe.title,
            description=recipe.description,
            ingredients=recipe.ingredients,
            instructions=recipe.instructions,
            image_url=recipe.image_url,
            video_url=recipe.video_url,
            created_at=recipe.created_at.isoformat() if recipe.created_at else None,
            creator_name=creator_name,
            user_id=recipe.user_id,
            prep_time=recipe.prep_time,
            difficulty=recipe.difficulty,
        ))

    return result


def upload_recipe_image(file: UploadFile):
    image_url = upload_image_to_cloudinary(file.file)
    return {"image_url": image_url}



def get_shared_recipe(token: str, db: Session):
    recipe = (
        db.query(models.Recipe)
        .filter_by(share_token=token, is_public=True)
        .first()
    )

    if not recipe:
        raise HTTPException(status_code=404, detail="Shared recipe not found")

    return {
        "id": recipe.id,
        "title": recipe.title,
        "description": recipe.description,
        "ingredients": recipe.ingredients,
        "instructions": recipe.instructions,
        "image_url": recipe.image_url,
        "video_url": recipe.video_url,
        "created_at": recipe.created_at.isoformat() if recipe.created_at else None,
        "share_token": str(recipe.share_token),
        "creator_name": recipe.creator.username if recipe.creator else "Unknown"
    }


def send_recipe_via_email(data: ShareRequest,background_tasks: BackgroundTasks,db: Session):
    recipe = (
        db.query(Recipe)
        .options(joinedload(Recipe.creator))
        .filter(Recipe.id == data.recipe_id, Recipe.is_public == True)
        .first()
    )
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")

    background_tasks.add_task(send_recipe_email_with_pdf, data.email, recipe)
    return {"message": "Email is being sent"}


def get_top_rated_recipes( db: Session,page: int = 1):
    recipes = get_top_rated_recipes_raw(db)
    total = len(recipes)
    paginated = recipes[(page - 1) * PAGE_SIZE : page * PAGE_SIZE]
    total_pages = (total + PAGE_SIZE - 1) // PAGE_SIZE

    results = []
    for r in paginated:
        avg_rating = db.query(func.avg(Rating.rating)).filter(Rating.recipe_id == r.id).scalar()
        results.append(RecipeResponse(
            id=r.id,
            title=r.title,
            description=r.description,
            ingredients=r.ingredients,
            instructions=r.instructions,
            image_url=r.image_url,
            video_url=r.video_url,
            created_at=r.created_at.isoformat() if r.created_at else None,
            creator_name=r.creator.username if r.creator else "לא ידוע",
            share_token=r.share_token,
            is_public=r.is_public,
            prep_time=r.prep_time,
            average_rating=round(avg_rating, 2) if avg_rating else None,
            user_id=r.user_id,
            difficulty=r.difficulty
        ))

    return {"recipes": results, "total_pages": total_pages, "current_page": page}



def get_random_recipes(db: Session, page: int = 1):
    recipes = (
        db.query(Recipe)
        .filter(Recipe.is_public == True)
        .options(joinedload(Recipe.creator))
        .all()
    )
    random.shuffle(recipes)
    total = len(recipes)
    paginated = recipes[(page - 1) * PAGE_SIZE : page * PAGE_SIZE]
    total_pages = (total + PAGE_SIZE - 1) // PAGE_SIZE

    results = []
    for r in paginated:
        avg_rating = db.query(func.avg(Rating.rating)).filter(Rating.recipe_id == r.id).scalar()
        results.append(RecipeResponse(
            id=r.id,
            title=r.title,
            description=r.description,
            ingredients=r.ingredients,
            instructions=r.instructions,
            image_url=r.image_url,
            video_url=r.video_url,
            created_at=r.created_at.isoformat() if r.created_at else None,
            creator_name=r.creator.username if r.creator else "לא ידוע",
            share_token=r.share_token,
            prep_time=r.prep_time,
            is_public=r.is_public,
            average_rating=round(avg_rating, 2) if avg_rating else None,
            user_id=r.user_id,
            difficulty=r.difficulty
        ))

    return {"recipes": results, "total_pages": total_pages, "current_page": page}


def get_recent_recipes(db: Session, page: int = 1):
    recipes = (
        db.query(Recipe)
        .filter(Recipe.is_public == True)
        .options(joinedload(Recipe.creator))
        .order_by(Recipe.created_at.desc())
        .all()
    )

    total = len(recipes)
    paginated = recipes[(page - 1) * PAGE_SIZE : page * PAGE_SIZE]
    total_pages = (total + PAGE_SIZE - 1) // PAGE_SIZE

    results = []
    for r in paginated:
        avg_rating = db.query(func.avg(Rating.rating)).filter(Rating.recipe_id == r.id).scalar()
        results.append(RecipeResponse(
            id=r.id,
            title=r.title,
            description=r.description,
            ingredients=r.ingredients,
            instructions=r.instructions,
            image_url=r.image_url,
            video_url=r.video_url,
            prep_time=r.prep_time,
            created_at=r.created_at.isoformat() if r.created_at else None,
            creator_name=r.creator.username if r.creator else "לא ידוע",
            share_token=r.share_token,
            is_public=r.is_public,
            average_rating=round(avg_rating, 2) if avg_rating else None,
            user_id=r.user_id,
            difficulty=r.difficulty
        ))

    return {"recipes": results, "total_pages": total_pages, "current_page": page}


def get_most_favorited_recipes(db: Session, page: int = 1):
    recipes = get_most_recent_recipes_from_db(db)

    if not recipes:
        recipes = get_top_rated_recipes_raw(db)

    total = len(recipes)
    paginated = recipes[(page - 1) * PAGE_SIZE : page * PAGE_SIZE]
    total_pages = (total + PAGE_SIZE - 1) // PAGE_SIZE

    results = []
    for r in paginated:
        avg_rating = db.query(func.avg(Rating.rating)).filter(Rating.recipe_id == r.id).scalar()
        results.append(RecipeResponse(
            id=r.id,
            title=r.title,
            description=r.description,
            ingredients=r.ingredients,
            instructions=r.instructions,
            image_url=r.image_url,
            video_url=r.video_url,
            created_at=r.created_at.isoformat() if r.created_at else None,
            creator_name=r.creator.username if r.creator else "לא ידוע",
            share_token=r.share_token,
            is_public=r.is_public,
            prep_time=r.prep_time,
            average_rating=round(avg_rating, 2) if avg_rating else None,
            user_id=r.user_id,
            difficulty=r.difficulty
        ))

    return {"recipes": results, "total_pages": total_pages, "current_page": page}


def get_admin_stats(db: Session ,current_user: User):

    # מספר משתמשים
    user_count = db.query(User).count()

    # מספר מתכונים
    recipe_count = db.query(Recipe).count()

    # מתכון עם דירוג ממוצע הכי גבוה
    top_rated = (
        db.query(Recipe.title, func.avg(Rating.rating).label("avg_rating"))
        .join(Rating, Rating.recipe_id == Recipe.id)
        .group_by(Recipe.id)
        .order_by(func.avg(Rating.rating).desc())
        .first()
    )
    top_rated_title = top_rated.title if top_rated else "אין"

    # מתכון עם הכי הרבה מועדפים
    most_favorited = (
        db.query(Recipe.title, func.count(Favorite.user_id).label("fav_count"))
        .join(Favorite, Favorite.recipe_id == Recipe.id)
        .group_by(Recipe.id)
        .order_by(func.count(Favorite.user_id).desc())
        .first()
    )
    most_favorited_title = most_favorited.title if most_favorited else "אין"

    return {
        "user_count": user_count,
        "recipe_count": recipe_count,
        "top_rated_recipe": top_rated_title,
        "most_favorited_recipe": most_favorited_title
    }

