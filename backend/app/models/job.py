from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Table, Text, ARRAY
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.session import Base


class Job(Base):
    __tablename__ = "jobs"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False, index=True)
    company = Column(String, nullable=False)
    location = Column(String, nullable=False)
    type = Column(String, nullable=False)  # CDI, CDD, Stage, etc.
    salary = Column(String, nullable=True)
    posted_date = Column(DateTime(timezone=True), server_default=func.now())
    description = Column(Text, nullable=False)
    responsibilities = Column(ARRAY(String), nullable=True)
    requirements = Column(ARRAY(String), nullable=True)
    benefits = Column(ARRAY(String), nullable=True)
    recruiter_id = Column(String, ForeignKey("users.id"))
    
    # Relationships
    recruiter = relationship("User", back_populates="jobs")
    applications = relationship("Application", back_populates="job")