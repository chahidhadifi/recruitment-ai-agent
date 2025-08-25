from sqlalchemy import Column, String, DateTime, Boolean, Enum, Integer, ForeignKey, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.db.session import Base


class UserRole(str, enum.Enum):
    admin = "admin"
    recruteur = "recruteur"
    candidat = "candidat"


class UserStatus(str, enum.Enum):
    actif = "actif"
    inactif = "inactif"
    suspendu = "suspendu"


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    name = Column(String, nullable=False)
    image = Column(String, nullable=True)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.candidat)
    status = Column(Enum(UserStatus), nullable=False, default=UserStatus.actif)
    date_created = Column(DateTime(timezone=True), server_default=func.now())
    last_login = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    recruiter_details = relationship("RecruiterDetails", back_populates="user", uselist=False, cascade="all, delete-orphan")
    candidate_details = relationship("CandidateDetails", back_populates="user", uselist=False, cascade="all, delete-orphan")
    jobs = relationship("Job", back_populates="recruiter")
    applications = relationship("Application", back_populates="candidate")


class RecruiterDetails(Base):
    __tablename__ = "recruiter_details"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    department = Column(String, nullable=True)
    specialization = Column(String, nullable=True)
    assigned_candidates = Column(Integer, default=0)
    completed_interviews = Column(Integer, default=0)
    
    # Relationships
    user = relationship("User", back_populates="recruiter_details")


class CandidateDetails(Base):
    __tablename__ = "candidate_details"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    applied_jobs = Column(Integer, default=0)
    completed_interviews = Column(Integer, default=0)
    average_score = Column(Integer, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="candidate_details")
    skills = relationship("CandidateSkill", back_populates="candidate")
    preferred_positions = relationship("CandidatePreferredPosition", back_populates="candidate")


class CandidateSkill(Base):
    __tablename__ = "candidate_skills"

    id = Column(String, primary_key=True, index=True)
    candidate_id = Column(String, ForeignKey("candidate_details.id", ondelete="CASCADE"))
    skill = Column(String, nullable=False)
    
    # Relationships
    candidate = relationship("CandidateDetails", back_populates="skills")


class CandidatePreferredPosition(Base):
    __tablename__ = "candidate_preferred_positions"

    id = Column(String, primary_key=True, index=True)
    candidate_id = Column(String, ForeignKey("candidate_details.id", ondelete="CASCADE"))
    position = Column(String, nullable=False)
    
    # Relationships
    candidate = relationship("CandidateDetails", back_populates="preferred_positions")