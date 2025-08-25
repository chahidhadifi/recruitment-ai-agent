from typing import Any, List, Optional, Dict

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app import crud
from app.api import deps
from app.schemas.job import Job, JobCreate, JobUpdate, JobFilters
from app.schemas.user import User

router = APIRouter()


@router.get("/", response_model=List[Job])
def read_jobs(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    search_term: Optional[str] = Query(None, description="Search in title, description, company"),
    location: Optional[str] = Query(None, description="Filter by location"),
    job_type: Optional[str] = Query(None, description="Filter by job type"),
    company: Optional[str] = Query(None, description="Filter by company"),
    sort_by: Optional[str] = Query(None, description="Sort field"),
    sort_order: Optional[str] = Query(None, description="Sort order (asc or desc)"),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve jobs.
    """
    filters = JobFilters(
        search_term=search_term,
        location=location,
        job_type=job_type,
        company=company,
        sort_by=sort_by,
        sort_order=sort_order
    )
    return crud.job.search(db, filters=filters.dict(exclude_none=True), skip=skip, limit=limit)


@router.post("/", response_model=Job, status_code=status.HTTP_201_CREATED)
def create_job(
    *,
    db: Session = Depends(deps.get_db),
    job_in: JobCreate,
    current_user: User = Depends(deps.get_current_recruiter_user),
) -> Any:
    """
    Create new job.
    """
    job = crud.job.create_with_recruiter(
        db=db, obj_in=job_in, recruiter_id=current_user.id
    )
    return job


@router.get("/my-jobs", response_model=List[Job])
def read_my_jobs(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_recruiter_user),
) -> Any:
    """
    Retrieve jobs posted by current recruiter.
    """
    return crud.job.get_multi_by_recruiter(
        db=db, recruiter_id=current_user.id, skip=skip, limit=limit
    )


@router.get("/{job_id}", response_model=Job)
def read_job(
    *,
    db: Session = Depends(deps.get_db),
    job_id: str,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get job by ID.
    """
    job = crud.job.get(db=db, id=job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@router.put("/{job_id}", response_model=Job)
def update_job(
    *,
    db: Session = Depends(deps.get_db),
    job_id: str,
    job_in: JobUpdate,
    current_user: User = Depends(deps.get_current_recruiter_user),
) -> Any:
    """
    Update a job.
    """
    job = crud.job.get(db=db, id=job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job.recruiter_id != current_user.id and not crud.user.is_admin(current_user):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    job = crud.job.update(db=db, db_obj=job, obj_in=job_in)
    return job


@router.delete("/{job_id}", response_model=Job)
def delete_job(
    *,
    db: Session = Depends(deps.get_db),
    job_id: str,
    current_user: User = Depends(deps.get_current_recruiter_user),
) -> Any:
    """
    Delete a job.
    """
    job = crud.job.get(db=db, id=job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job.recruiter_id != current_user.id and not crud.user.is_admin(current_user):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    job = crud.job.remove(db=db, id=job_id)
    return job