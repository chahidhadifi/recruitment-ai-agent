from typing import Optional, Any
from datetime import datetime
from pydantic import BaseModel

from app.models.application import ApplicationStatus


# Shared properties
class ApplicationBase(BaseModel):
    cover_letter: Optional[str] = None
    cv_url: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None


# Properties to receive on application creation
class ApplicationCreate(ApplicationBase):
    job_id: str
    cover_letter: str
    cv_url: str


# Properties to receive on application update
class ApplicationUpdate(ApplicationBase):
    status: Optional[ApplicationStatus] = None


# Properties shared by models stored in DB
class ApplicationInDBBase(ApplicationBase):
    id: str
    job_id: str
    candidate_id: str
    status: ApplicationStatus
    applied_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


# Properties to return to client
class Application(ApplicationInDBBase):
    job_title: Optional[str] = None
    company: Optional[str] = None
    candidate_name: Optional[str] = None
    candidate_email: Optional[str] = None


# Properties stored in DB
class ApplicationInDB(ApplicationInDBBase):
    pass


# Properties for application search filters
class ApplicationFilters(BaseModel):
    job_id: Optional[str] = None
    candidate_id: Optional[str] = None
    status: Optional[ApplicationStatus] = None
    sort_by: Optional[str] = None
    sort_order: Optional[str] = None