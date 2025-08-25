from sqlalchemy import Column, String, DateTime, ForeignKey, Enum, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.db.session import Base


class ApplicationStatus(str, enum.Enum):
    pending = "pending"
    reviewed = "reviewed"
    interview = "interview"
    accepted = "accepted"
    rejected = "rejected"


class Application(Base):
    __tablename__ = "applications"

    id = Column(String, primary_key=True, index=True)
    job_id = Column(String, ForeignKey("jobs.id", ondelete="CASCADE"))
    candidate_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"))
    cover_letter = Column(Text, nullable=False)
    cv_url = Column(String, nullable=False)
    status = Column(Enum(ApplicationStatus), default=ApplicationStatus.pending)
    applied_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    phone = Column(String, nullable=True)
    location = Column(String, nullable=True)
    
    # Relationships
    job = relationship("Job", back_populates="applications")
    candidate = relationship("User", back_populates="applications")
    interview = relationship("Interview", back_populates="application", uselist=False)