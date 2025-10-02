from fastapi import FastAPI, Depends, HTTPException, Query, status, Path, Header, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from typing import List, Optional
import uvicorn
from datetime import datetime
import secrets
import hashlib
import logging
import io
from fastapi.responses import StreamingResponse

from . import models, schemas
from .database import SessionLocal, engine, Base
from .routers import interviews, applications
from . import file_storage

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(title="Recruitment AI NIMA", version="1.0.0")

# Configure CORS ONCE - before any other middleware or routes
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*", "http://localhost:3000", "http://frontend:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers AFTER CORS configuration
app.include_router(interviews.router)
app.include_router(applications.router)

# Create database tables on startup
@app.on_event("startup")
async def startup_event():
    try:
        logger.info("Creating database tables if they don't exist")
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
        
        # Verify database connection
        db = SessionLocal()
        try:
            db.execute("SELECT 1")
            logger.info("Database connection verified")
            
            # Create default admin user if needed
            admin_email = "admin@admin.com"
            admin_user = db.query(models.User).filter(models.User.email == admin_email).first()
            
            if not admin_user:
                logger.info("Creating default admin user")
                hashed_password = hashlib.sha256("admin123".encode()).hexdigest()
                
                admin_user = models.User(
                    email=admin_email,
                    name="Admin",
                    role=models.UserRole.admin,
                    status=models.UserStatus.actif,
                    password=hashed_password
                )
                db.add(admin_user)
                db.commit()
                logger.info("Default admin user created")
            else:
                logger.info("Default admin user already exists")
                
        except Exception as e:
            logger.error(f"Error during startup: {str(e)}")
        finally:
            db.close()
            
    except Exception as e:
        logger.error(f"Failed to initialize database: {str(e)}")

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Helper functions for password hashing
def get_password_hash(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return get_password_hash(plain_password) == hashed_password

# Authentication endpoint
@app.post("/api/auth/login/", response_model=schemas.Token)
def login(login_data: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == login_data.email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not verify_password(login_data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    user.last_login = datetime.now()
    db.commit()
    
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
    
    return {
        "access_token": f"user_{user.id}_{secrets.token_hex(16)}",
        "token_type": "bearer",
        "user": user_dict
    }

@app.get("/")
def read_root():
    return {"message": "Welcome to the Recruitment AI Platform API!", "status": "running"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "message": "API is running"}

# User endpoints
@app.get("/api/users/", response_model=List[schemas.User])
def read_users(
    searchTerm: Optional[str] = None,
    role: Optional[schemas.UserRole] = None,
    status: Optional[schemas.UserStatus] = None,
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    query = db.query(models.User)
    
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
    
    users = query.offset(skip).limit(limit).all()
    return users

@app.post("/api/users/", response_model=schemas.User, status_code=status.HTTP_201_CREATED)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    
    try:
        user_role = user.role if isinstance(user.role, models.UserRole) else models.UserRole(user.role)
        
        db_user = models.User(
            email=user.email, 
            name=user.name, 
            image=user.image,
            role=user_role,
            status=models.UserStatus.actif,
            password=hashed_password
        )
        db.add(db_user)
        db.flush()
        db.refresh(db_user)
        
        if db_user.role == models.UserRole.recruteur:
            recruiter_profile = models.RecruiterProfile(user_id=db_user.id)
            db.add(recruiter_profile)
        elif db_user.role == models.UserRole.candidat:
            candidate_profile = models.CandidateProfile(user_id=db_user.id)
            db.add(candidate_profile)
        
        db.commit()
        return db_user
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating user: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create user: {str(e)}")

# File upload endpoint
@app.post("/api/upload-file/", status_code=status.HTTP_201_CREATED)
async def upload_file(
    file: UploadFile = File(...),
    type: str = Form(...),
    candidate_id: int = Form(...),
    db: Session = Depends(get_db)
):
    allowed_types = [
        'application/pdf', 
        'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
    
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be PDF, DOC or DOCX"
        )
    
    try:
        url = await file_storage.store_file(file, type, candidate_id, db)
        file_type_display = "CV" if type == "cv" else "Lettre de motivation"
        
        return {
            "success": True,
            "url": url,
            "message": f"{file_type_display} téléchargé avec succès"
        }
    except Exception as e:
        logger.error(f"File upload error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload file: {str(e)}"
        )

# Get file endpoint
@app.get("/api/files/{file_uuid}")
async def get_file(file_uuid: str, db: Session = Depends(get_db)):
    db_file = file_storage.get_file_by_uuid(file_uuid, db)
    
    if not db_file:
        raise HTTPException(status_code=404, detail="File not found")
    
    return StreamingResponse(
        io.BytesIO(db_file.file_data),
        media_type=db_file.content_type,
        headers={"Content-Disposition": f"attachment; filename={db_file.filename}"}
    )

# Job endpoints
@app.get("/api/jobs/", response_model=List[schemas.Job])
def read_jobs(
    title: Optional[str] = None,
    company: Optional[str] = None,
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    query = db.query(models.Job)
    
    if title:
        query = query.filter(models.Job.title.ilike(f"%{title}%"))
    if company:
        query = query.filter(models.Job.company.ilike(f"%{company}%"))
    
    return query.offset(skip).limit(limit).all()

@app.post("/api/jobs/", response_model=schemas.Job, status_code=status.HTTP_201_CREATED)
def create_job(job: schemas.JobCreate, db: Session = Depends(get_db)):
    db_job = models.Job(**job.model_dump())
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job

@app.get("/api/jobs/{job_id}", response_model=schemas.Job)
def read_job(job_id: int, db: Session = Depends(get_db)):
    db_job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not db_job:
        raise HTTPException(status_code=404, detail="Job not found")
    return db_job

# Applications endpoints
@app.get("/api/applications/", response_model=List[schemas.JobApplication])
def read_applications(
    candidate_id: Optional[int] = None,
    job_id: Optional[int] = None,
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    query = db.query(models.JobApplication)
    
    if candidate_id:
        query = query.filter(models.JobApplication.candidate_id == candidate_id)
    if job_id:
        query = query.filter(models.JobApplication.job_id == job_id)
    
    applications = query.offset(skip).limit(limit).all()
    
    # Enrich with job info
    for app in applications:
        job = db.query(models.Job).filter(models.Job.id == app.job_id).first()
        if job:
            app.job_title = job.title
            app.company = job.company
    
    return applications

@app.post("/api/applications/", response_model=schemas.JobApplication, status_code=status.HTTP_201_CREATED)
def create_application(application: schemas.JobApplicationCreate, db: Session = Depends(get_db)):
    existing = db.query(models.JobApplication).filter(
        models.JobApplication.job_id == application.job_id,
        models.JobApplication.candidate_id == application.candidate_id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Application already exists")
    
    if not application.cv_url or not application.cv_url.startswith("/api/files/"):
        raise HTTPException(status_code=400, detail="Invalid CV URL")
    
    db_application = models.JobApplication(**application.model_dump())
    db.add(db_application)
    db.commit()
    db.refresh(db_application)
    return db_application

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)