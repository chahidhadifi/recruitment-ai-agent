from fastapi import FastAPI, Depends, HTTPException, Query, status, Path, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func, or_, text
from typing import List, Optional
import uvicorn
from datetime import datetime
import secrets
import hashlib
import logging

from . import models, schemas
from .database import SessionLocal, engine

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(title="Recruitment AI Platform API", version="1.0.0")

# Initialize database tables on startup
@app.on_event("startup")
async def create_tables():
    from .database import init_db
    
    try:
        # Initialize database using the function that replaces Alembic migrations
        init_db()
    except Exception as e:
        logger.error(f"Failed to initialize database: {str(e)}")
        # Don't raise the exception here to allow the application to start
        # even if initialization fails initially

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*", "http://frontend:3000", "http://localhost:3000"],  # Include Docker service name
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        # Foreign key constraints are disabled at the database level
        yield db
    finally:
        db.close()
        
# Dependency to get current authenticated user
def get_current_user(db: Session = Depends(get_db), authorization: str = Header(None)):
    if authorization is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Extract token from Authorization header
    scheme, token = authorization.split()
    if scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication scheme",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Parse user ID from token (format: user_{id}_{random_hex})
    try:
        parts = token.split('_')
        if len(parts) < 3 or parts[0] != "user":
            raise ValueError("Invalid token format")
        
        user_id = int(parts[1])
    except (ValueError, IndexError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Get user from database
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user
        
# Helper function to hash passwords
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

# Authentication endpoint
@app.post("/api/auth/login", response_model=schemas.Token)
def login(login_data: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == login_data.email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Verify password
    hashed_password = hash_password(login_data.password)
    if user.password != hashed_password:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Update last login time
    user.last_login = datetime.now()
    db.commit()
    
    # Convert user to dictionary for serialization
    user_dict = {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "image": user.image,
        "role": user.role.value,
        "status": user.status.value,
        "is_active": user.is_active,
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "updated_at": user.updated_at.isoformat() if user.updated_at else None,
        "last_login": user.last_login.isoformat() if user.last_login else None
    }
    
    # Return user data with token
    return {
        "access_token": f"user_{user.id}_{secrets.token_hex(16)}",
        "token_type": "bearer",
        "user": user_dict
    }

@app.get("/")
def read_root():
    return {"message": "Welcome to the Recruitment AI Platform API!"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "message": "API is running"}





@app.get("/api/users/", response_model=List[schemas.User])
def read_users(
    searchTerm: Optional[str] = None,
    role: Optional[schemas.UserRole] = None,
    status: Optional[schemas.UserStatus] = None,
    sortBy: Optional[str] = None,
    sortOrder: Optional[schemas.SortOrder] = schemas.SortOrder.asc,
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    query = db.query(models.User)
    
    # Apply filters
    if searchTerm:
        query = query.filter(
            or_(
                models.User.name.ilike(f"%{searchTerm}%"),
                models.User.email.ilike(f"%{searchTerm}%")
            )
        )
    
    if role:
        query = query.filter(models.User.role == role)
    
    if status:
        query = query.filter(models.User.status == status)
    
    # Apply sorting
    if sortBy:
        if sortBy == "name":
            order_column = models.User.name
        elif sortBy == "email":
            order_column = models.User.email
        elif sortBy == "role":
            order_column = models.User.role
        elif sortBy == "dateCreated":
            order_column = models.User.created_at
        elif sortBy == "lastLogin":
            order_column = models.User.last_login
        else:
            order_column = models.User.id
            
        if sortOrder == schemas.SortOrder.desc:
            order_column = order_column.desc()
            
        query = query.order_by(order_column)
    
    # Apply pagination
    users = query.offset(skip).limit(limit).all()
    return users

@app.post("/api/users/", response_model=schemas.User, status_code=status.HTTP_201_CREATED)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # No authentication required for user registration
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash the password
    hashed_password = hash_password(user.password)
    
    try:
        # Ensure role is properly converted to enum if it's a string
        user_role = user.role
        if isinstance(user_role, str):
            try:
                user_role = models.UserRole(user_role)
            except ValueError:
                # Default to candidat if invalid role
                user_role = models.UserRole.candidat
                logger.warning(f"Invalid role provided: {user.role}, defaulting to candidat")
        
        # Create the user
        db_user = models.User(
            email=user.email, 
            name=user.name, 
            image=user.image,
            role=user_role,
            status=models.UserStatus.actif,
            password=hashed_password
        )
        db.add(db_user)
        db.flush()  # Flush to get the user ID without committing
        db.refresh(db_user)
        
        # Create profile based on role
        if db_user.role == models.UserRole.recruteur:
            recruiter_profile = models.RecruiterProfile(user_id=db_user.id)
            db.add(recruiter_profile)
            logger.info(f"Created recruiter profile for user {db_user.id}")
        elif db_user.role == models.UserRole.candidat:
            candidate_profile = models.CandidateProfile(user_id=db_user.id)
            db.add(candidate_profile)
            logger.info(f"Created candidate profile for user {db_user.id}")
        
        # Commit all changes in a single transaction
        db.commit()
        
        return db_user
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating user: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create user: {str(e)}")


@app.get("/api/users/{user_id}", response_model=schemas.UserWithDetails)
def read_user(user_id: int, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    result = schemas.User.model_validate(db_user)
    user_dict = result.model_dump()
    
    # Add profile details based on role
    if db_user.role == models.UserRole.recruteur:
        recruiter_profile = db.query(models.RecruiterProfile).filter(models.RecruiterProfile.user_id == user_id).first()
        if recruiter_profile:
            user_dict["recruiter_profile"] = schemas.RecruiterProfile.model_validate(recruiter_profile)
    
    elif db_user.role == models.UserRole.candidat:
        candidate_profile = db.query(models.CandidateProfile).filter(models.CandidateProfile.user_id == user_id).first()
        if candidate_profile:
            user_dict["candidate_profile"] = schemas.CandidateProfile.model_validate(candidate_profile)
    
    return schemas.UserWithDetails(**user_dict)

@app.put("/api/users/{user_id}", response_model=schemas.User)
def update_user(user_id: int, user: schemas.UserUpdate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update user fields
    update_data = user.model_dump(exclude_unset=True)
    
    # Handle profile-specific fields
    department = update_data.pop("department", None)
    specialization = update_data.pop("specialization", None)
    
    # Update user model
    for key, value in update_data.items():
        setattr(db_user, key, value)
    
    # Update profile if needed
    if db_user.role == models.UserRole.recruteur and (department or specialization):
        recruiter_profile = db.query(models.RecruiterProfile).filter(models.RecruiterProfile.user_id == user_id).first()
        if recruiter_profile:
            if department:
                recruiter_profile.department = department
            if specialization:
                recruiter_profile.specialization = specialization
    
    db.commit()
    db.refresh(db_user)
    return db_user

@app.delete("/api/users/{user_id}", response_model=dict)
def delete_user(user_id: int, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Delete associated profile
    if db_user.role == models.UserRole.recruteur:
        db.query(models.RecruiterProfile).filter(models.RecruiterProfile.user_id == user_id).delete()
    elif db_user.role == models.UserRole.candidat:
        db.query(models.CandidateProfile).filter(models.CandidateProfile.user_id == user_id).delete()
    
    # Delete user
    db.delete(db_user)
    db.commit()
    
    return {"success": True}

@app.get("/api/users/stats", response_model=schemas.UserStats)
def get_user_stats(db: Session = Depends(get_db)):
    total_users = db.query(func.count(models.User.id)).scalar()
    admin_count = db.query(func.count(models.User.id)).filter(models.User.role == models.UserRole.admin).scalar()
    recruiter_count = db.query(func.count(models.User.id)).filter(models.User.role == models.UserRole.recruteur).scalar()
    candidate_count = db.query(func.count(models.User.id)).filter(models.User.role == models.UserRole.candidat).scalar()
    active_users = db.query(func.count(models.User.id)).filter(models.User.status == models.UserStatus.actif).scalar()
    inactive_users = db.query(func.count(models.User.id)).filter(models.User.status != models.UserStatus.actif).scalar()
    
    return schemas.UserStats(
        totalUsers=total_users,
        adminCount=admin_count,
        recruiterCount=recruiter_count,
        candidateCount=candidate_count,
        activeUsers=active_users,
        inactiveUsers=inactive_users
    )

# Job endpoints
@app.get("/api/jobs/", response_model=List[schemas.Job])
def read_jobs(
    title: Optional[str] = None,
    company: Optional[str] = None,
    location: Optional[str] = None,
    type: Optional[schemas.JobType] = None,
    recruiter_id: Optional[int] = None,
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    query = db.query(models.Job)
    
    # Apply filters
    if title:
        query = query.filter(models.Job.title.ilike(f"%{title}%"))
    
    if company:
        query = query.filter(models.Job.company.ilike(f"%{company}%"))
    
    if location:
        query = query.filter(models.Job.location.ilike(f"%{location}%"))
    
    if type:
        query = query.filter(models.Job.type == type)
    
    if recruiter_id:
        query = query.filter(models.Job.recruiter_id == recruiter_id)
    
    # Apply pagination
    jobs = query.offset(skip).limit(limit).all()
    return jobs

@app.post("/api/jobs/", response_model=schemas.Job, status_code=status.HTTP_201_CREATED)
def create_job(job: schemas.JobCreate, db: Session = Depends(get_db)):
    # Verify recruiter exists
    recruiter = db.query(models.RecruiterProfile).filter(models.RecruiterProfile.id == job.recruiter_id).first()
    if not recruiter:
        raise HTTPException(status_code=404, detail="Recruiter not found")
    
    # Create job
    db_job = models.Job(**job.model_dump())
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    
    return db_job

@app.get("/api/jobs/{job_id}", response_model=schemas.Job)
def read_job(job_id: int = Path(..., title="The ID of the job to get"), db: Session = Depends(get_db)):
    db_job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if db_job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    return db_job

@app.put("/api/jobs/{job_id}", response_model=schemas.Job)
def update_job(job_id: int, job: schemas.JobUpdate, db: Session = Depends(get_db)):
    db_job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if db_job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Update job fields
    update_data = job.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_job, key, value)
    
    db.commit()
    db.refresh(db_job)
    return db_job

@app.delete("/api/jobs/{job_id}", response_model=dict)
def delete_job(job_id: int, db: Session = Depends(get_db)):
    db_job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if db_job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    
    db.delete(db_job)
    db.commit()
    
    return {"success": True}

# Job Application endpoints
@app.get("/api/applications/", response_model=List[schemas.JobApplication])
def read_applications(
    job_id: Optional[int] = None,
    candidate_id: Optional[int] = None,
    status: Optional[schemas.ApplicationStatus] = None,
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    query = db.query(models.JobApplication)
    
    # Apply filters
    if job_id:
        query = query.filter(models.JobApplication.job_id == job_id)
    
    if candidate_id:
        query = query.filter(models.JobApplication.candidate_id == candidate_id)
    
    if status:
        query = query.filter(models.JobApplication.status == status)
    
    # Apply pagination
    applications = query.offset(skip).limit(limit).all()
    
    # For candidate role, check if there are upcoming interviews
    if current_user.role == "candidat":
        now = datetime.now()
        for app in applications:
            # If interview is scheduled and within 24 hours, add interview link
            if app.interview_at and app.status == models.ApplicationStatus.interview:
                time_diff = app.interview_at - now
                # If interview is within 24 hours or already started but not more than 1 hour ago
                if time_diff.total_seconds() < 86400 and time_diff.total_seconds() > -3600:
                    # Get interview details
                    interview = db.query(models.Interview).filter(
                        models.Interview.candidate_id == app.candidate_id,
                        models.Interview.date == app.interview_at
                    ).first()
                    
                    if interview:
                        # Add interview ID to the application for frontend to create link
                        app.interview_id = interview.id
    
    return applications

@app.post("/api/applications/", response_model=schemas.JobApplication, status_code=status.HTTP_201_CREATED)
def create_application(application: schemas.JobApplicationCreate, db: Session = Depends(get_db)):
    # Verify job exists
    # job = db.query(models.Job).filter(models.Job.id == application.job_id).first()
    # if not job:
    #     raise HTTPException(status_code=404, detail="Job not found")
    
    # Verify candidate exists
    # candidate = db.query(models.CandidateProfile).filter(models.CandidateProfile.id == application.candidate_id).first()
    # if not candidate:
    #     raise HTTPException(status_code=404, detail="Candidate not found")
    
    # Check if application already exists
    existing_application = db.query(models.JobApplication).filter(
        models.JobApplication.job_id == application.job_id,
        models.JobApplication.candidate_id == application.candidate_id
    ).first()
    
    if existing_application:
        raise HTTPException(status_code=400, detail="Application already exists")
    
    # Create application
    db_application = models.JobApplication(**application.model_dump())
    db.add(db_application)
    db.commit()
    db.refresh(db_application)
    
    return db_application

@app.get("/api/applications/{application_id}", response_model=schemas.JobApplication)
def read_application(application_id: int, db: Session = Depends(get_db)):
    db_application = db.query(models.JobApplication).filter(models.JobApplication.id == application_id).first()
    if db_application is None:
        raise HTTPException(status_code=404, detail="Application not found")
    return db_application

@app.put("/api/applications/{application_id}", response_model=schemas.JobApplication)
def update_application(application_id: int, application: schemas.JobApplicationUpdate, db: Session = Depends(get_db)):
    db_application = db.query(models.JobApplication).filter(models.JobApplication.id == application_id).first()
    if db_application is None:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # Update application fields
    update_data = application.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_application, key, value)
    
    db.commit()
    db.refresh(db_application)
    return db_application

@app.delete("/api/applications/{application_id}", response_model=dict)
def delete_application(application_id: int, db: Session = Depends(get_db)):
    db_application = db.query(models.JobApplication).filter(models.JobApplication.id == application_id).first()
    if db_application is None:
        raise HTTPException(status_code=404, detail="Application not found")
    
    db.delete(db_application)
    db.commit()
    
    return {"success": True}

# Interview endpoints
@app.get("/api/interviews/", response_model=List[schemas.Interview])
def read_interviews(
    candidate_id: Optional[int] = None,
    status: Optional[schemas.InterviewStatus] = None,
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    query = db.query(models.Interview)
    
    # Apply filters
    if candidate_id:
        query = query.filter(models.Interview.candidate_id == candidate_id)
    
    if status:
        query = query.filter(models.Interview.status == status)
    
    # Apply pagination
    interviews = query.offset(skip).limit(limit).all()
    return interviews

@app.post("/api/interviews/", response_model=schemas.Interview, status_code=status.HTTP_201_CREATED)
def create_interview(interview: schemas.InterviewCreate, db: Session = Depends(get_db)):
    # Verify candidate exists
    # candidate = db.query(models.CandidateProfile).filter(models.CandidateProfile.id == interview.candidate_id).first()
    # if not candidate:
    #     raise HTTPException(status_code=404, detail="Candidate not found")
    
    # Create interview
    db_interview = models.Interview(**interview.model_dump())
    db.add(db_interview)
    db.commit()
    db.refresh(db_interview)
    
    return db_interview

@app.get("/api/interviews/{interview_id}", response_model=schemas.Interview)
def read_interview(interview_id: int, db: Session = Depends(get_db)):
    db_interview = db.query(models.Interview).filter(models.Interview.id == interview_id).first()
    if db_interview is None:
        raise HTTPException(status_code=404, detail="Interview not found")
    return db_interview

@app.put("/api/interviews/{interview_id}", response_model=schemas.Interview)
def update_interview(interview_id: int, interview: schemas.InterviewUpdate, db: Session = Depends(get_db)):
    db_interview = db.query(models.Interview).filter(models.Interview.id == interview_id).first()
    if db_interview is None:
        raise HTTPException(status_code=404, detail="Interview not found")
    
    # Update interview fields
    update_data = interview.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_interview, key, value)
    
    db.commit()
    db.refresh(db_interview)
    return db_interview

@app.patch("/api/interviews/{interview_id}", response_model=schemas.Interview)
def patch_interview(interview_id: int, interview: schemas.InterviewPatch, db: Session = Depends(get_db)):
    db_interview = db.query(models.Interview).filter(models.Interview.id == interview_id).first()
    if db_interview is None:
        raise HTTPException(status_code=404, detail="Interview not found")
    
    # Update only the provided fields
    update_data = interview.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_interview, key, value)
    
    db.commit()
    db.refresh(db_interview)
    return db_interview

@app.delete("/api/interviews/{interview_id}", response_model=dict)
def delete_interview(interview_id: int, db: Session = Depends(get_db)):
    db_interview = db.query(models.Interview).filter(models.Interview.id == interview_id).first()
    if db_interview is None:
        raise HTTPException(status_code=404, detail="Interview not found")
    
    db.delete(db_interview)
    db.commit()
    
    return {"success": True}

# Les endpoints de questions ont été supprimés et intégrés directement dans l'entité Interview

# Message endpoints
@app.get("/api/messages/", response_model=List[schemas.Message])
def read_messages(
    interview_id: Optional[int] = None,
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    query = db.query(models.Message)
    
    # Apply filters
    if interview_id:
        query = query.filter(models.Message.interview_id == interview_id)
    
    # Apply pagination and ordering by timestamp
    messages = query.order_by(models.Message.timestamp).offset(skip).limit(limit).all()
    return messages

@app.post("/api/messages/", response_model=schemas.Message, status_code=status.HTTP_201_CREATED)
def create_message(message: schemas.MessageCreate, db: Session = Depends(get_db)):
    # Verify interview exists
    interview = db.query(models.Interview).filter(models.Interview.id == message.interview_id).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    
    # Create message
    db_message = models.Message(**message.model_dump())
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    
    return db_message

@app.get("/api/messages/{message_id}", response_model=schemas.Message)
def read_message(message_id: int, db: Session = Depends(get_db)):
    db_message = db.query(models.Message).filter(models.Message.id == message_id).first()
    if db_message is None:
        raise HTTPException(status_code=404, detail="Message not found")
    return db_message

@app.put("/api/messages/{message_id}", response_model=schemas.Message)
def update_message(message_id: int, message: schemas.MessageUpdate, db: Session = Depends(get_db)):
    db_message = db.query(models.Message).filter(models.Message.id == message_id).first()
    if db_message is None:
        raise HTTPException(status_code=404, detail="Message not found")
    
    # Update message fields
    update_data = message.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_message, key, value)
    
    db.commit()
    db.refresh(db_message)
    return db_message

@app.delete("/api/messages/{message_id}", response_model=dict)
def delete_message(message_id: int, db: Session = Depends(get_db)):
    db_message = db.query(models.Message).filter(models.Message.id == message_id).first()
    if db_message is None:
        raise HTTPException(status_code=404, detail="Message not found")
    
    db.delete(db_message)
    db.commit()
    
    return {"success": True}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
