import pytest
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models import User
from app.services import users_services
from app.schemas.user_schema import UserCreate, UserLogin, UserUpdate, ForgotPasswordRequest, ResetPasswordRequest
from jose import jwt
import re


def create_test_user(db: Session, **kwargs):
    user = User(
        username=kwargs.get("username", "testuser"),
        email=kwargs.get("email", "test@example.com"),
        password=users_services.hash_password(kwargs.get("password", "1234")),
        is_admin=kwargs.get("is_admin", False),
        wants_emails=kwargs.get("wants_emails", True)
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def test_hash_and_verify_password():
    raw = "mysecret"
    hashed = users_services.hash_password(raw)
    assert hashed != raw
    assert users_services.verify_password(raw, hashed)


def test_signup_success(db: Session):
    user_data = UserCreate(username="newuser", email="new@example.com", password="pass123", wants_emails=True)
    res = users_services.signup(user_data, db)
    assert res["message"] == "User created successfully"
    assert "user_id" in res


def test_signup_duplicate_email(db: Session):
    create_test_user(db, email="dupe@example.com")
    user_data = UserCreate(username="user1", email="dupe@example.com", password="pass")
    with pytest.raises(HTTPException) as exc:
        users_services.signup(user_data, db)
    assert exc.value.status_code == 400


def test_signup_duplicate_username(db: Session):
    create_test_user(db, username="dupe")
    user_data = UserCreate(username="dupe", email="another@example.com", password="pass")
    with pytest.raises(HTTPException) as exc:
        users_services.signup(user_data, db)
    assert exc.value.status_code == 400


def test_login_success(db: Session):
    user = create_test_user(db, email="login@example.com", password="mypassword")
    creds = UserLogin(email="login@example.com", password="mypassword")
    res = users_services.login(creds, db)
    assert res["message"] == "Login successful"
    assert "access_token" in res


def test_login_invalid_password(db: Session):
    create_test_user(db, email="fail@example.com", password="goodpass")
    creds = UserLogin(email="fail@example.com", password="badpass")
    with pytest.raises(HTTPException) as exc:
        users_services.login(creds, db)
    assert exc.value.status_code == 401


def test_update_profile(db: Session):
    user = create_test_user(db, username="oldname")
    update = UserUpdate(username="newname", password="newpass", wants_emails=False)
    res = users_services.update_profile(update, db, user)
    assert res["message"] == "Profile updated successfully"
    assert user.username == "newname"
    assert user.wants_emails is False
    assert users_services.verify_password("newpass", user.password)


def test_forgot_password_sends_token(db: Session):
    user = create_test_user(db, email="reset@example.com")
    req = ForgotPasswordRequest(email="reset@example.com")
    res = users_services.forgot_password(req, db)
    assert "reset link was sent" in res["message"]


def test_reset_password_success(db: Session):
    user = create_test_user(db, password="oldpass")
    token = users_services.create_reset_token(user.id)
    req = ResetPasswordRequest(token=token, new_password="newpass", confirm_password="newpass")
    res = users_services.reset_password(req, db)
    assert res["message"] == "Password reset successfully"
    assert users_services.verify_password("newpass", user.password)


def test_get_all_users(db: Session):
    create_test_user(db, username="u1")
    create_test_user(db, username="u2", email="u2@example.com")
    user = create_test_user(db, username="admin", is_admin=True, email="admin@example.com")
    all_users = users_services.get_all_users(user, db)
    assert len(all_users) >= 3


def test_delete_user_success(db: Session):
    admin = create_test_user(db, is_admin=True, email="admin2@example.com")
    target = create_test_user(db, username="todelete", email="del@example.com")
    res = users_services.delete_user(target.id, admin, db)
    assert res["message"]
    assert db.query(User).filter_by(id=target.id).first() is None


def test_delete_user_self_forbidden(db: Session):
    admin = create_test_user(db, is_admin=True, email="admin3@example.com")
    with pytest.raises(HTTPException) as exc:
        users_services.delete_user(admin.id, admin, db)
    assert exc.value.status_code == 400
