from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models import User
from app.schemas.comment_schema import CommentCreate, CommentResponse
from app.services import users_services, comments_service

router = APIRouter(prefix="/comments", tags=["comments"])

@router.post("/{recipe_id}", response_model=CommentResponse)
def add_comment(recipe_id: int, comment: CommentCreate, db: Session = Depends(get_db), current_user: User = Depends(users_services.get_current_user)):
    return comments_service.add_comment(recipe_id, comment, db, current_user)

@router.get("/{recipe_id}", response_model=list[CommentResponse])
def get_comments(recipe_id: int, db: Session = Depends(get_db)):
    return comments_service.get_comments(recipe_id, db)


@router.delete("/{comment_id}")
def delete_comment(comment_id: int,db: Session = Depends(get_db),current_user: User = Depends(users_services.get_current_user)):
    return comments_service.delete_comment(comment_id, db, current_user)