from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field

from app.models.user import UserRole, UserStatus


# Shared properties
class UserBase(BaseModel):
    email: Optional[EmailStr] = None
    name: Optional[str] = None
    image: Optional[str] = None
    role: Optional[UserRole] = None
    status: Optional[UserStatus] = None


# Properties to receive via API on creation
class UserCreate(UserBase):
    email: EmailStr
    password: str
    name: str
    role: UserRole


# Properties to receive via API on update
class UserUpdate(UserBase):
    password: Optional[str] = None


class RecruiterDetailsBase(BaseModel):
    department: Optional[str] = None
    specialization: Optional[str] = None
    assigned_candidates: Optional[int] = None
    completed_interviews: Optional[int] = None


class RecruiterDetailsCreate(RecruiterDetailsBase):
    pass


class RecruiterDetailsUpdate(RecruiterDetailsBase):
    pass


class RecruiterDetailsInDBBase(RecruiterDetailsBase):
    id: str
    user_id: str

    class Config:
        orm_mode = True


class CandidateDetailsBase(BaseModel):
    applied_jobs: Optional[int] = None
    completed_interviews: Optional[int] = None
    average_score: Optional[int] = None
    skills: Optional[List[str]] = None
    preferred_positions: Optional[List[str]] = None


class CandidateDetailsCreate(CandidateDetailsBase):
    pass


class CandidateDetailsUpdate(CandidateDetailsBase):
    pass


class CandidateDetailsInDBBase(CandidateDetailsBase):
    id: str
    user_id: str

    class Config:
        orm_mode = True


# Additional properties to return via API
class User(UserBase):
    id: str
    date_created: datetime
    last_login: Optional[datetime] = None

    class Config:
        orm_mode = True


# Additional properties stored in DB
class UserInDB(User):
    hashed_password: str


class RecruiterDetails(RecruiterDetailsInDBBase):
    pass


class CandidateDetails(CandidateDetailsInDBBase):
    pass


class UserWithDetails(User):
    recruiter_details: Optional[RecruiterDetails] = None
    candidate_details: Optional[CandidateDetails] = None


class UserStats(BaseModel):
    total_users: int
    admin_count: int
    recruiter_count: int
    candidate_count: int
    active_users: int
    inactive_users: int