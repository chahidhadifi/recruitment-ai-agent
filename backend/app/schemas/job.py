from typing import Optional, List, Any
from datetime import datetime
from pydantic import BaseModel


# Shared properties
class JobBase(BaseModel):
    title: Optional[str] = None
    company: Optional[str] = None
    location: Optional[str] = None
    type: Optional[str] = None
    salary: Optional[str] = None
    description: Optional[str] = None
    responsibilities: Optional[List[str]] = None
    requirements: Optional[List[str]] = None
    benefits: Optional[List[str]] = None


# Properties to receive on job creation
class JobCreate(JobBase):
    title: str
    company: str
    location: str
    type: str
    description: str


# Properties to receive on job update
class JobUpdate(JobBase):
    pass


# Properties shared by models stored in DB
class JobInDBBase(JobBase):
    id: str
    recruiter_id: str
    posted_date: datetime

    class Config:
        orm_mode = True


# Properties to return to client
class Job(JobInDBBase):
    applications: int = 0


# Properties stored in DB
class JobInDB(JobInDBBase):
    pass


# Properties for job search filters
class JobFilters(BaseModel):
    search_term: Optional[str] = None
    location: Optional[str] = None
    job_type: Optional[str] = None
    company: Optional[str] = None
    sort_by: Optional[str] = None
    sort_order: Optional[str] = None