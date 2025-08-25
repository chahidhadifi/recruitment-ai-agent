from sqlalchemy import Column, String, DateTime, ForeignKey, Enum, Text, Integer
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.db.session import Base


class InterviewStatus(str, enum.Enum):
    scheduled = "scheduled"
    completed = "completed"
    cancelled = "cancelled"


class Interview(Base):
    __tablename__ = "interviews"

    id = Column(String, primary_key=True, index=True)
    application_id = Column(String, ForeignKey("applications.id", ondelete="CASCADE"), unique=True)
    recruiter_id = Column(String, ForeignKey("users.id"))
    scheduled_date = Column(DateTime(timezone=True), nullable=False)
    duration_minutes = Column(Integer, default=60)
    location = Column(String, nullable=True)  # Can be physical location or virtual meeting link
    status = Column(Enum(InterviewStatus), default=InterviewStatus.scheduled)
    notes = Column(Text, nullable=True)
    feedback = Column(Text, nullable=True)
    score = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    application = relationship("Application", back_populates="interview")
    recruiter = relationship("User")