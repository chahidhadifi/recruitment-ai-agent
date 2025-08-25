from typing import Any, Dict, Optional, Union, List

from sqlalchemy.orm import Session
import uuid

from app.core.security import get_password_hash, verify_password
from app.crud.base import CRUDBase
from app.models.user import User, RecruiterDetails, CandidateDetails, UserRole
from app.schemas.user import UserCreate, UserUpdate


class CRUDUser(CRUDBase[User, UserCreate, UserUpdate]):
    def get_by_email(self, db: Session, *, email: str) -> Optional[User]:
        return db.query(User).filter(User.email == email).first()

    def create(self, db: Session, *, obj_in: UserCreate) -> User:
        user_id = str(uuid.uuid4())
        db_obj = User(
            id=user_id,
            email=obj_in.email,
            hashed_password=get_password_hash(obj_in.password),
            name=obj_in.name,
            image=obj_in.image,
            role=obj_in.role,
            status=obj_in.status if obj_in.status else "actif",
        )
        db.add(db_obj)
        db.flush()
        
        # Create role-specific details
        if obj_in.role == UserRole.recruteur:
            recruiter_details = RecruiterDetails(
                id=str(uuid.uuid4()),
                user_id=user_id
            )
            db.add(recruiter_details)
        elif obj_in.role == UserRole.candidat:
            candidate_details = CandidateDetails(
                id=str(uuid.uuid4()),
                user_id=user_id
            )
            db.add(candidate_details)
        
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(
        self, db: Session, *, db_obj: User, obj_in: Union[UserUpdate, Dict[str, Any]]
    ) -> User:
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.dict(exclude_unset=True)
        if update_data.get("password"):
            hashed_password = get_password_hash(update_data["password"])
            del update_data["password"]
            update_data["hashed_password"] = hashed_password
        return super().update(db, db_obj=db_obj, obj_in=update_data)

    def authenticate(self, db: Session, *, email: str, password: str) -> Optional[User]:
        user = self.get_by_email(db, email=email)
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user

    def is_active(self, user: User) -> bool:
        return user.status == "actif"

    def is_admin(self, user: User) -> bool:
        return user.role == UserRole.admin

    def is_recruiter(self, user: User) -> bool:
        return user.role == UserRole.recruteur

    def is_candidate(self, user: User) -> bool:
        return user.role == UserRole.candidat

    def get_stats(self, db: Session) -> Dict[str, int]:
        total_users = db.query(User).count()
        admin_count = db.query(User).filter(User.role == UserRole.admin).count()
        recruiter_count = db.query(User).filter(User.role == UserRole.recruteur).count()
        candidate_count = db.query(User).filter(User.role == UserRole.candidat).count()
        active_users = db.query(User).filter(User.status == "actif").count()
        inactive_users = db.query(User).filter(User.status != "actif").count()
        
        return {
            "total_users": total_users,
            "admin_count": admin_count,
            "recruiter_count": recruiter_count,
            "candidate_count": candidate_count,
            "active_users": active_users,
            "inactive_users": inactive_users
        }


user = CRUDUser(User)