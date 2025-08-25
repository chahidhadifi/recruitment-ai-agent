from typing import Any, List, Optional

from fastapi import APIRouter, Body, Depends, HTTPException, Query, status
from fastapi.encoders import jsonable_encoder
from pydantic import EmailStr
from sqlalchemy.orm import Session

from app import crud
from app.api import deps
from app.models.user import UserRole
from app.schemas.user import (
    User,
    UserCreate,
    UserUpdate,
    UserWithDetails,
    UserStats
)

router = APIRouter()


@router.get("/", response_model=List[User])
def read_users(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    role: Optional[str] = Query(None, description="Filter by user role"),
    status: Optional[str] = Query(None, description="Filter by user status"),
    current_user: User = Depends(deps.get_current_admin_user),
) -> Any:
    """
    Retrieve users.
    """
    users = db.query(crud.user.model)
    
    if role:
        users = users.filter(crud.user.model.role == role)
    
    if status:
        users = users.filter(crud.user.model.status == status)
    
    return users.offset(skip).limit(limit).all()


@router.post("/", response_model=User, status_code=status.HTTP_201_CREATED)
def create_user(
    *,
    db: Session = Depends(deps.get_db),
    user_in: UserCreate,
    current_user: User = Depends(deps.get_current_admin_user),
) -> Any:
    """
    Create new user.
    """
    user = crud.user.get_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    user = crud.user.create(db, obj_in=user_in)
    return user


@router.get("/me", response_model=UserWithDetails)
def read_user_me(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get current user.
    """
    return current_user


@router.put("/me", response_model=User)
def update_user_me(
    *,
    db: Session = Depends(deps.get_db),
    name: Optional[str] = Body(None),
    email: Optional[EmailStr] = Body(None),
    password: Optional[str] = Body(None),
    image: Optional[str] = Body(None),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update own user.
    """
    current_user_data = jsonable_encoder(current_user)
    user_in = UserUpdate(**current_user_data)
    if name is not None:
        user_in.name = name
    if email is not None:
        user_in.email = email
    if password is not None:
        user_in.password = password
    if image is not None:
        user_in.image = image
    user = crud.user.update(db, db_obj=current_user, obj_in=user_in)
    return user


@router.get("/stats", response_model=UserStats)
def read_user_stats(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_admin_user),
) -> Any:
    """
    Get user statistics.
    """
    return crud.user.get_stats(db)


@router.get("/{user_id}", response_model=UserWithDetails)
def read_user_by_id(
    user_id: str,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get a specific user by id.
    """
    user = crud.user.get(db, id=user_id)
    if user == current_user:
        return user
    if not crud.user.is_admin(current_user):
        raise HTTPException(
            status_code=400, detail="The user doesn't have enough privileges"
        )
    return user


@router.put("/{user_id}", response_model=User)
def update_user(
    *,
    db: Session = Depends(deps.get_db),
    user_id: str,
    user_in: UserUpdate,
    current_user: User = Depends(deps.get_current_admin_user),
) -> Any:
    """
    Update a user.
    """
    user = crud.user.get(db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=404,
            detail="The user with this id does not exist in the system",
        )
    user = crud.user.update(db, db_obj=user, obj_in=user_in)
    return user