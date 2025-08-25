from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app import crud
from app.api import deps
from app.schemas.application import Application, ApplicationCreate, ApplicationUpdate, ApplicationFilters
from app.schemas.user import User

router = APIRouter()


@router.get("/", response_model=List[Application])
def read_applications(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    job_id: Optional[str] = Query(None, description="Filter by job ID"),
    candidate_id: Optional[str] = Query(None, description="Filter by candidate ID"),
    status: Optional[str] = Query(None, description="Filter by application status"),
    sort_by: Optional[str] = Query(None, description="Sort field"),
    sort_order: Optional[str] = Query(None, description="Sort order (asc or desc)"),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve applications.
    """
    # Restrict access based on user role
    if crud.user.is_candidate(current_user):
        # Candidates can only see their own applications
        candidate_id = current_user.id
    elif crud.user.is_recruiter(current_user):
        # Recruiters can only see applications for their jobs
        if not job_id:
            # Get all applications for jobs posted by this recruiter
            recruiter_jobs = crud.job.get_multi_by_recruiter(
                db=db, recruiter_id=current_user.id, skip=0, limit=1000
            )
            job_ids = [job.id for job in recruiter_jobs]
            if not job_ids:
                return []
            
            applications = []
            for job_id in job_ids:
                job_applications = crud.application.get_multi_by_job(
                    db=db, job_id=job_id, skip=skip, limit=limit
                )
                applications.extend(job_applications)
            return applications[:limit]
    
    # Admin can see all applications or filter as requested
    
    filters = ApplicationFilters(
        job_id=job_id,
        candidate_id=candidate_id,
        status=status,
        sort_by=sort_by,
        sort_order=sort_order
    )
    return crud.application.search(db, filters=filters.dict(exclude_none=True), skip=skip, limit=limit)


@router.post("/", response_model=Application, status_code=status.HTTP_201_CREATED)
def create_application(
    *,
    db: Session = Depends(deps.get_db),
    application_in: ApplicationCreate,
    current_user: User = Depends(deps.get_current_candidate_user),
) -> Any:
    """
    Create new application.
    """
    # Check if job exists
    job = crud.job.get(db=db, id=application_in.job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Check if user already applied to this job
    existing_applications = crud.application.get_multi_by_job(
        db=db, job_id=application_in.job_id
    )
    for app in existing_applications:
        if app.candidate_id == current_user.id:
            raise HTTPException(
                status_code=400, 
                detail="You have already applied to this job"
            )
    
    application = crud.application.create_with_candidate(
        db=db, obj_in=application_in, candidate_id=current_user.id
    )
    return application


@router.get("/my-applications", response_model=List[Application])
def read_my_applications(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_candidate_user),
) -> Any:
    """
    Retrieve applications submitted by current candidate.
    """
    return crud.application.get_multi_by_candidate(
        db=db, candidate_id=current_user.id, skip=skip, limit=limit
    )


@router.get("/{application_id}", response_model=Application)
def read_application(
    *,
    db: Session = Depends(deps.get_db),
    application_id: str,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get application by ID.
    """
    application = crud.application.get(db=db, id=application_id)
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # Check permissions
    if crud.user.is_candidate(current_user) and application.candidate_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    if crud.user.is_recruiter(current_user):
        job = crud.job.get(db=db, id=application.job_id)
        if job.recruiter_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not enough permissions")
    
    return application


@router.put("/{application_id}", response_model=Application)
def update_application(
    *,
    db: Session = Depends(deps.get_db),
    application_id: str,
    application_in: ApplicationUpdate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update an application.
    """
    application = crud.application.get(db=db, id=application_id)
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # Check permissions
    if crud.user.is_candidate(current_user):
        if application.candidate_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not enough permissions")
        
        # Candidates can only update certain fields
        allowed_fields = ["cover_letter", "cv_url", "phone", "location"]
        update_data = application_in.dict(exclude_unset=True)
        for field in list(update_data.keys()):
            if field not in allowed_fields:
                del update_data[field]
        
        application_in = ApplicationUpdate(**update_data)
    
    elif crud.user.is_recruiter(current_user):
        job = crud.job.get(db=db, id=application.job_id)
        if job.recruiter_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not enough permissions")
        
        # Recruiters can only update certain fields
        allowed_fields = ["status", "notes"]
        update_data = application_in.dict(exclude_unset=True)
        for field in list(update_data.keys()):
            if field not in allowed_fields:
                del update_data[field]
        
        application_in = ApplicationUpdate(**update_data)
    
    application = crud.application.update(db=db, db_obj=application, obj_in=application_in)
    return application


@router.delete("/{application_id}", response_model=Application)
def delete_application(
    *,
    db: Session = Depends(deps.get_db),
    application_id: str,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Delete an application.
    """
    application = crud.application.get(db=db, id=application_id)
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # Check permissions
    if crud.user.is_candidate(current_user):
        if application.candidate_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not enough permissions")
    elif crud.user.is_recruiter(current_user):
        job = crud.job.get(db=db, id=application.job_id)
        if job.recruiter_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not enough permissions")
    
    application = crud.application.remove(db=db, id=application_id)
    return application