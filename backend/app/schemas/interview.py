from typing import Optional
from datetime import datetime
from pydantic import BaseModel

from app.models.interview import InterviewStatus


# Shared properties
class InterviewBase(BaseModel):
    scheduled_date: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    location: Optional[str] = None
    notes: Optional[str] = None


# Properties to receive on interview creation
class InterviewCreate(InterviewBase):
    application_id: str
    scheduled_date: datetime


# Properties to receive on interview update
class InterviewUpdate(InterviewBase):
    status: Optional[InterviewStatus] = None
    feedback: Optional[str] = None
    score: Optional[int] = None


# Properties shared by models stored in DB
class InterviewInDBBase(InterviewBase):
    id: str
    application_id: str
    recruiter_id: str
    status: InterviewStatus
    feedback: Optional[str] = None
    score: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


# Properties to return to client
class Interview(InterviewInDBBase):
    candidate_name: Optional[str] = None
    job_title: Optional[str] = None


# Properties stored in DB
class InterviewInDB(InterviewInDBBase):
    pass