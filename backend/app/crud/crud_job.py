from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
import uuid

from app.crud.base import CRUDBase
from app.models.job import Job
from app.schemas.job import JobCreate, JobUpdate


class CRUDJob(CRUDBase[Job, JobCreate, JobUpdate]):
    def create_with_recruiter(
        self, db: Session, *, obj_in: JobCreate, recruiter_id: str
    ) -> Job:
        obj_in_data = obj_in.dict()
        
        # Convert string lists to actual lists if they're provided as strings
        for field in ["responsibilities", "requirements", "benefits"]:
            if field in obj_in_data and obj_in_data[field] and isinstance(obj_in_data[field], str):
                obj_in_data[field] = [item.strip() for item in obj_in_data[field].split("\n") if item.strip()]
        
        db_obj = Job(
            id=str(uuid.uuid4()),
            **obj_in_data,
            recruiter_id=recruiter_id
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_multi_by_recruiter(
        self, db: Session, *, recruiter_id: str, skip: int = 0, limit: int = 100
    ) -> List[Job]:
        return (
            db.query(self.model)
            .filter(Job.recruiter_id == recruiter_id)
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def search(
        self, db: Session, *, filters: Dict[str, Any], skip: int = 0, limit: int = 100
    ) -> List[Job]:
        query = db.query(self.model)
        
        # Apply filters
        if filters.get("search_term"):
            search_term = f"%{filters['search_term']}%"
            query = query.filter(
                (Job.title.ilike(search_term)) | 
                (Job.description.ilike(search_term)) | 
                (Job.company.ilike(search_term))
            )
        
        if filters.get("location"):
            query = query.filter(Job.location.ilike(f"%{filters['location']}%"))
        
        if filters.get("job_type"):
            query = query.filter(Job.type == filters["job_type"])
        
        if filters.get("company"):
            query = query.filter(Job.company.ilike(f"%{filters['company']}%"))
        
        # Apply sorting
        if filters.get("sort_by"):
            sort_field = getattr(Job, filters["sort_by"], Job.posted_date)
            if filters.get("sort_order") == "desc":
                query = query.order_by(sort_field.desc())
            else:
                query = query.order_by(sort_field)
        else:
            # Default sort by posted_date desc
            query = query.order_by(Job.posted_date.desc())
        
        return query.offset(skip).limit(limit).all()


job = CRUDJob(Job)