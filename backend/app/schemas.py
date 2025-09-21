from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional, List, Union, Any, Dict
from enum import Enum

class UserRole(str, Enum):
    admin = "admin"
    recruteur = "recruteur"
    candidat = "candidat"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: Dict[str, Any]
    
    class Config:
        from_attributes = True

class UserStatus(str, Enum):
    actif = "actif"
    inactif = "inactif"
    suspendu = "suspendu"

class SortOrder(str, Enum):
    asc = "asc"
    desc = "desc"

class UserBase(BaseModel):
    email: EmailStr
    name: str
    image: Optional[str] = None

class UserCreate(UserBase):
    password: str
    role: UserRole = UserRole.candidat

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[UserRole] = None
    status: Optional[UserStatus] = None
    department: Optional[str] = None
    specialization: Optional[str] = None

class RecruiterProfileBase(BaseModel):
    department: Optional[str] = None
    specialization: Optional[str] = None

class RecruiterProfileCreate(RecruiterProfileBase):
    user_id: int

class RecruiterProfile(RecruiterProfileBase):
    id: int
    user_id: int
    assigned_candidates: int = 0
    completed_interviews: int = 0
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class CandidateProfileBase(BaseModel):
    skills: Optional[List[str]] = None
    preferred_positions: Optional[List[str]] = None

class CandidateProfileCreate(CandidateProfileBase):
    user_id: int

class CandidateProfile(CandidateProfileBase):
    id: int
    user_id: int
    applied_jobs: int = 0
    completed_interviews: int = 0
    average_score: Optional[float] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class User(UserBase):
    id: int
    role: UserRole
    status: UserStatus = UserStatus.actif
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    last_login: Optional[datetime] = None

    class Config:
        from_attributes = True

class UserWithDetails(User):
    recruiter_profile: Optional[RecruiterProfile] = None
    candidate_profile: Optional[CandidateProfile] = None

class UserFilters(BaseModel):
    searchTerm: Optional[str] = None
    role: Optional[UserRole] = None
    status: Optional[UserStatus] = None
    sortBy: Optional[str] = None
    sortOrder: Optional[SortOrder] = SortOrder.asc

class UserStats(BaseModel):
    totalUsers: int
    adminCount: int
    recruiterCount: int
    candidateCount: int
    activeUsers: int
    inactiveUsers: int


# Job schemas
class JobType(str, Enum):
    CDI = "CDI"
    CDD = "CDD"
    Stage = "Stage"
    Alternance = "Alternance"
    Freelance = "Freelance"


class JobBase(BaseModel):
    title: str
    company: str
    location: str
    type: JobType
    salary: Optional[str] = None
    description: str
    responsibilities: Optional[List[str]] = None
    requirements: Optional[List[str]] = None
    benefits: Optional[List[str]] = None
    company_website: Optional[str] = None
    company_linkedin: Optional[str] = None


class JobCreate(JobBase):
    recruiter_id: int


class JobUpdate(BaseModel):
    title: Optional[str] = None
    company: Optional[str] = None
    location: Optional[str] = None
    type: Optional[JobType] = None
    salary: Optional[str] = None
    description: Optional[str] = None
    responsibilities: Optional[List[str]] = None
    requirements: Optional[List[str]] = None
    benefits: Optional[List[str]] = None
    company_website: Optional[str] = None
    company_linkedin: Optional[str] = None


class Job(JobBase):
    id: int
    recruiter_id: int
    posted_date: datetime
    applications_count: Optional[int] = 0

    class Config:
        from_attributes = True


class JobDetail(Job):
    applications: Optional[List[Any]] = None  # Will be replaced with JobApplication


# JobApplication schemas
class ApplicationStatus(str, Enum):
    pending = "pending"
    reviewed = "reviewed"
    interview = "interview"
    accepted = "accepted"
    rejected = "rejected"
    analyzed = "analyzed"


class JobApplicationBase(BaseModel):
    job_id: int
    candidate_id: int
    cover_letter: Optional[str] = None
    cv_url: str
    phone: Optional[str] = None
    location: Optional[str] = None


class JobApplicationCreate(JobApplicationBase):
    pass


class JobApplicationUpdate(BaseModel):
    job_id: Optional[int] = None
    candidate_id: Optional[int] = None
    cover_letter: Optional[str] = None
    cv_url: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    status: Optional[ApplicationStatus] = None
    interview_at: Optional[datetime] = None
    score: Optional[int] = None
    observations: Optional[str] = None
    qualified: Optional[bool] = None
    strengths: Optional[str] = None
    weaknesses: Optional[str] = None
    keywords_match: Optional[str] = None
    analyzed_at: Optional[datetime] = None


class JobApplication(JobApplicationBase):
    id: int
    status: ApplicationStatus
    applied_at: datetime
    updated_at: Optional[datetime] = None
    interview_at: Optional[datetime] = None
    job_title: Optional[str] = None
    company: Optional[str] = None
    score: Optional[int] = None
    observations: Optional[str] = None
    qualified: Optional[bool] = None
    strengths: Optional[str] = None
    weaknesses: Optional[str] = None
    keywords_match: Optional[str] = None
    analyzed_at: Optional[datetime] = None
    interview_id: Optional[int] = None

    class Config:
        from_attributes = True


# Interview schemas
class InterviewStatus(str, Enum):
    scheduled = "scheduled"
    in_progress = "in_progress"
    completed = "completed"
    cancelled = "cancelled"


class InterviewBase(BaseModel):
    candidate_id: int
    application_id: Optional[int] = None
    position: str
    date: datetime
    duration: Optional[str] = None
    questions: Optional[List[Dict[str, Any]]] = None
    detailed_scores: Optional[Dict[str, Any]] = None
    question_by_question_analysis: Optional[List[Dict[str, Any]]] = None
    overall_assessment: Optional[Dict[str, Any]] = None
    interview_summary: Optional[Dict[str, Any]] = None


class InterviewCreate(InterviewBase):
    pass


class InterviewUpdate(BaseModel):
    candidate_id: Optional[int] = None
    application_id: Optional[int] = None
    position: Optional[str] = None
    date: Optional[datetime] = None
    duration: Optional[str] = None
    status: Optional[InterviewStatus] = None
    score: Optional[float] = None
    questions: Optional[List[Dict[str, Any]]] = None
    detailed_scores: Optional[Dict[str, Any]] = None
    question_by_question_analysis: Optional[List[Dict[str, Any]]] = None
    overall_assessment: Optional[Dict[str, Any]] = None
    interview_summary: Optional[Dict[str, Any]] = None


class InterviewPatch(BaseModel):
    candidate_id: Optional[int] = None
    application_id: Optional[int] = None
    position: Optional[str] = None
    date: Optional[datetime] = None
    duration: Optional[str] = None
    status: Optional[InterviewStatus] = None
    score: Optional[float] = None
    questions: Optional[List[Dict[str, Any]]] = None
    detailed_scores: Optional[Dict[str, Any]] = None
    question_by_question_analysis: Optional[List[Dict[str, Any]]] = None
    overall_assessment: Optional[Dict[str, Any]] = None
    interview_summary: Optional[Dict[str, Any]] = None


class Interview(InterviewBase):
    id: int
    status: InterviewStatus
    score: Optional[float] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    candidate_name: Optional[str] = None

    class Config:
        from_attributes = True


class InterviewDetail(Interview):
    messages: Optional[List[Any]] = None  # Will be replaced with Message


# Question schemas
class QuestionBase(BaseModel):
    interview_id: int
    question_text: str


class QuestionCreate(QuestionBase):
    pass


class QuestionUpdate(BaseModel):
    answer_text: Optional[str] = None
    score: Optional[float] = None


class Question(QuestionBase):
    id: int
    answer_text: Optional[str] = None
    score: Optional[float] = None
    created_at: datetime

    class Config:
        from_attributes = True


# Message schemas
class MessageType(str, Enum):
    text = "text"
    audio = "audio"


class MessageRole(str, Enum):
    user = "user"
    assistant = "assistant"


class MessageBase(BaseModel):
    interview_id: int
    role: MessageRole
    content: str
    type: MessageType = MessageType.text
    audio_url: Optional[str] = None


class MessageCreate(MessageBase):
    pass


class MessageUpdate(BaseModel):
    interview_id: Optional[int] = None
    role: Optional[MessageRole] = None
    content: Optional[str] = None
    type: Optional[MessageType] = None
    audio_url: Optional[str] = None


class Message(MessageBase):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True
