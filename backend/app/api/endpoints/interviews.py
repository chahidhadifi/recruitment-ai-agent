from typing import Any, List, Optional
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app import crud
from app.api import deps
from app.schemas.interview import Interview, InterviewCreate, InterviewUpdate
from app.schemas.user import User

router = APIRouter()


@router.get("/", response_model=List[Interview])
def read_interviews(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    application_id: Optional[str] = Query(None, description="Filter by application ID"),
    recruiter_id: Optional[str] = Query(None, description="Filter by recruiter ID"),
    status: Optional[str] = Query(None, description="Filter by interview status"),
    start_date: Optional[datetime] = Query(None, description="Filter by start date"),
    end_date: Optional[datetime] = Query(None, description="Filter by end date"),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve interviews.
    """
    # Restrict access based on user role
    if crud.user.is_candidate(current_user):
        # Get applications for this candidate
        applications = crud.application.get_multi_by_candidate(
            db=db, candidate_id=current_user.id, skip=0, limit=1000
        )
        application_ids = [app.id for app in applications]
        if not application_ids:
            return []
        
        # Get interviews for these applications
        interviews = []
        for app_id in application_ids:
            app_interviews = crud.interview.get_multi_by_application(
                db=db, application_id=app_id, skip=skip, limit=limit
            )
            interviews.extend(app_interviews)
        return interviews[:limit]
    
    elif crud.user.is_recruiter(current_user):
        # Recruiters can only see their own interviews
        recruiter_id = current_user.id
    
    # Admin can see all interviews or filter as requested
    
    filters = {
        "application_id": application_id,
        "recruiter_id": recruiter_id,
        "status": status,
        "start_date": start_date,
        "end_date": end_date
    }
    # Remove None values
    filters = {k: v for k, v in filters.items() if v is not None}
    
    return crud.interview.search(db, filters=filters, skip=skip, limit=limit)


@router.post("/", response_model=Interview, status_code=status.HTTP_201_CREATED)
def create_interview(
    *,
    db: Session = Depends(deps.get_db),
    interview_in: InterviewCreate,
    current_user: User = Depends(deps.get_current_recruiter_user),
) -> Any:
    """
    Create new interview.
    """
    # Check if application exists
    application = crud.application.get(db=db, id=interview_in.application_id)
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # Check if recruiter has permission to create interview for this application
    job = crud.job.get(db=db, id=application.job_id)
    if job.recruiter_id != current_user.id and not crud.user.is_admin(current_user):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    interview = crud.interview.create_with_recruiter(
        db=db, obj_in=interview_in, recruiter_id=current_user.id
    )
    return interview


@router.get("/my-interviews", response_model=List[Interview])
def read_my_interviews(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve interviews for the current user.
    """
    if crud.user.is_recruiter(current_user):
        return crud.interview.get_multi_by_recruiter(
            db=db, recruiter_id=current_user.id, skip=skip, limit=limit
        )
    elif crud.user.is_candidate(current_user):
        # Get applications for this candidate
        applications = crud.application.get_multi_by_candidate(
            db=db, candidate_id=current_user.id, skip=0, limit=1000
        )
        application_ids = [app.id for app in applications]
        if not application_ids:
            return []
        
        # Get interviews for these applications
        interviews = []
        for app_id in application_ids:
            app_interviews = crud.interview.get_multi_by_application(
                db=db, application_id=app_id, skip=skip, limit=limit
            )
            interviews.extend(app_interviews)
        return interviews[:limit]
    else:
        # Admin can see all interviews
        return crud.interview.get_multi(db=db, skip=skip, limit=limit)


@router.get("/{interview_id}", response_model=Interview)
def read_interview(
    *,
    db: Session = Depends(deps.get_db),
    interview_id: str,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get interview by ID.
    """
    interview = crud.interview.get(db=db, id=interview_id)
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    
    # Check permissions
    if crud.user.is_candidate(current_user):
        application = crud.application.get(db=db, id=interview.application_id)
        if application.candidate_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not enough permissions")
    
    elif crud.user.is_recruiter(current_user) and interview.recruiter_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    return interview


@router.put("/{interview_id}", response_model=Interview)
def update_interview(
    *,
    db: Session = Depends(deps.get_db),
    interview_id: str,
    interview_in: InterviewUpdate,
    current_user: User = Depends(deps.get_current_recruiter_user),
) -> Any:
    """
    Update an interview.
    """
    interview = crud.interview.get(db=db, id=interview_id)
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    
    # Check permissions
    if interview.recruiter_id != current_user.id and not crud.user.is_admin(current_user):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    interview = crud.interview.update(db=db, db_obj=interview, obj_in=interview_in)
    return interview


@router.delete("/{interview_id}", response_model=Interview)
def delete_interview(
    *,
    db: Session = Depends(deps.get_db),
    interview_id: str,
    current_user: User = Depends(deps.get_current_recruiter_user),
) -> Any:
    """
    Delete an interview.
    """
    interview = crud.interview.get(db=db, id=interview_id)
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    
    # Check permissions
    if interview.recruiter_id != current_user.id and not crud.user.is_admin(current_user):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    interview = crud.interview.remove(db=db, id=interview_id)
    return interview