from sqlalchemy import Boolean, Column, Integer, String, DateTime, Enum, ARRAY, Float, ForeignKey, Text, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .database import Base
import enum

class UserRole(enum.Enum):
    admin = "admin"
    recruteur = "recruteur"
    candidat = "candidat"

class UserStatus(enum.Enum):
    actif = "actif"
    inactif = "inactif"
    suspendu = "suspendu"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    image = Column(String, nullable=True)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.candidat)
    status = Column(Enum(UserStatus), nullable=False, default=UserStatus.actif)
    password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class JobType(enum.Enum):
    CDI = "CDI"
    CDD = "CDD"
    Stage = "Stage"
    Alternance = "Alternance"
    Freelance = "Freelance"


class Job(Base):
    __tablename__ = "jobs"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    company = Column(String, nullable=False)
    location = Column(String, nullable=False)
    type = Column(Enum(JobType), nullable=False)
    salary = Column(String, nullable=True)
    posted_date = Column(DateTime(timezone=True), server_default=func.now())
    description = Column(Text, nullable=False)
    responsibilities = Column(ARRAY(String), nullable=True)
    requirements = Column(ARRAY(String), nullable=True)
    benefits = Column(ARRAY(String), nullable=True)
    recruiter_id = Column(Integer, nullable=False)
    
    # Relationships
    # recruiter = relationship("RecruiterProfile", back_populates="jobs", primaryjoin="Job.recruiter_id == RecruiterProfile.id")
    # applications = relationship("JobApplication", back_populates="job")


class ApplicationStatus(enum.Enum):
    pending = "pending"
    reviewed = "reviewed"
    interview = "interview"
    accepted = "accepted"
    rejected = "rejected"
    analyzed = "analyzed"


class JobApplication(Base):
    __tablename__ = "job_applications"
    
    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, nullable=False)
    candidate_id = Column(Integer, nullable=False)
    cover_letter = Column(Text, nullable=True)
    cv_url = Column(String, nullable=False)
    status = Column(Enum(ApplicationStatus), nullable=False, default=ApplicationStatus.pending)
    applied_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    phone = Column(String, nullable=True)
    location = Column(String, nullable=True)
    interview_at = Column(DateTime(timezone=True), nullable=True)
    
    # Analysis fields from migration
    score = Column(Integer, nullable=True)
    observations = Column(Text, nullable=True)
    qualified = Column(Boolean, nullable=True)
    strengths = Column(Text, nullable=True)
    weaknesses = Column(Text, nullable=True)
    keywords_match = Column(Text, nullable=True)
    analyzed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    # job = relationship("Job", back_populates="applications", primaryjoin="JobApplication.job_id == Job.id")
    # candidate = relationship("CandidateProfile", back_populates="applications", primaryjoin="JobApplication.candidate_id == CandidateProfile.id")
    # interview = relationship("Interview", back_populates="application", uselist=False, primaryjoin="JobApplication.id == Interview.application_id")


class InterviewStatus(enum.Enum):
    scheduled = "scheduled"
    in_progress = "in_progress"
    completed = "completed"
    cancelled = "cancelled"


class Interview(Base):
    __tablename__ = "interviews"
    
    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, nullable=False)
    application_id = Column(Integer, nullable=True)
    position = Column(String, nullable=False)
    date = Column(DateTime(timezone=True), nullable=False)
    duration = Column(String, nullable=True)
    status = Column(Enum(InterviewStatus), nullable=False, default=InterviewStatus.scheduled)
    score = Column(Float, nullable=True)
    questions = Column(JSON, nullable=True)  # Nouveau champ pour stocker les questions générées par l'IA
    detailed_scores = Column(JSON, nullable=True)  # Scores détaillés par catégorie
    question_by_question_analysis = Column(JSON, nullable=True)  # Analyse détaillée par question
    overall_assessment = Column(JSON, nullable=True)  # Évaluation globale du candidat
    interview_summary = Column(JSON, nullable=True)  # Résumé de l'entretien
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    # candidate = relationship("CandidateProfile", back_populates="interviews", primaryjoin="Interview.candidate_id == CandidateProfile.id")
    # application = relationship("JobApplication", back_populates="interview", primaryjoin="Interview.application_id == JobApplication.id")
    # messages = relationship("Message", back_populates="interview", primaryjoin="Interview.id == Message.interview_id")


class Question(Base):
    __tablename__ = "questions"
    
    id = Column(Integer, primary_key=True, index=True)
    interview_id = Column(Integer, nullable=False)
    question_text = Column(Text, nullable=False)
    answer_text = Column(Text, nullable=True)
    score = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    # interview = relationship("Interview", back_populates="questions", primaryjoin="Question.interview_id == Interview.id")


class MessageType(enum.Enum):
    text = "text"
    audio = "audio"


class MessageRole(enum.Enum):
    user = "user"
    assistant = "assistant"


class Message(Base):
    __tablename__ = "messages"
    
    id = Column(Integer, primary_key=True, index=True)
    interview_id = Column(Integer, nullable=False)
    role = Column(Enum(MessageRole), nullable=False)
    content = Column(Text, nullable=False)
    type = Column(Enum(MessageType), nullable=False, default=MessageType.text)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    audio_url = Column(String, nullable=True)
    
    # Relationships
    # interview = relationship("Interview", back_populates="messages", primaryjoin="Message.interview_id == Interview.id")
    # last_login = Column(DateTime(timezone=True), nullable=True)

class RecruiterProfile(Base):
    __tablename__ = "recruiter_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, unique=True, index=True, nullable=False)
    department = Column(String, nullable=True)
    specialization = Column(String, nullable=True)
    assigned_candidates = Column(Integer, default=0)
    completed_interviews = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    # user = relationship("User", primaryjoin="RecruiterProfile.user_id == User.id")
    # jobs = relationship("Job", back_populates="recruiter", primaryjoin="RecruiterProfile.id == Job.recruiter_id")

class CandidateProfile(Base):
    __tablename__ = "candidate_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, unique=True, index=True, nullable=False)
    applied_jobs = Column(Integer, default=0)
    completed_interviews = Column(Integer, default=0)
    average_score = Column(Float, nullable=True)
    skills = Column(ARRAY(String), nullable=True)
    preferred_positions = Column(ARRAY(String), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    # user = relationship("User", primaryjoin="CandidateProfile.user_id == User.id")
    # applications = relationship("JobApplication", back_populates="candidate", primaryjoin="CandidateProfile.id == JobApplication.candidate_id")
    # interviews = relationship("Interview", back_populates="candidate", primaryjoin="CandidateProfile.id == Interview.candidate_id")
