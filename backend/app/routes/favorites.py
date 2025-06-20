from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models import Favorite, Recipe, User
from app.services import users_services, favorites_services
from app.schemas.recipe_schema import RecipeResponse

router = APIRouter(prefix="/favorites", tags=["favorites"])

@router.post("/{recipe_id}")
def add_favorite(recipe_id: int,db: Session = Depends(get_db),current_user: User = Depends(users_services.get_current_user)):
    return favorites_services.add_favorite(recipe_id, db, current_user)


@router.get("/", response_model=list[RecipeResponse])
def get_favorites(db: Session = Depends(get_db),current_user: User = Depends(users_services.get_current_user)):
    return favorites_services.get_favorites(db, current_user)


@router.delete("/{recipe_id}")
def remove_favorite(recipe_id: int,db: Session = Depends(get_db),current_user: User = Depends(users_services.get_current_user)):
    return favorites_services.remove_favorite(recipe_id, db, current_user)