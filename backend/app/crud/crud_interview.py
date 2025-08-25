from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
import uuid

from app.crud.base import CRUDBase
from app.models.interview import Interview
from app.schemas.interview import InterviewCreate, InterviewUpdate


class CRUDInterview(CRUDBase[Interview, InterviewCreate, InterviewUpdate]):
    def create_with_recruiter(
        self, db: Session, *, obj_in: InterviewCreate, recruiter_id: str
    ) -> Interview:
        obj_in_data = obj_in.dict()
        db_obj = Interview(
            id=str(uuid.uuid4()),
            **obj_in_data,
            recruiter_id=recruiter_id
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_multi_by_application(
        self, db: Session, *, application_id: str, skip: int = 0, limit: int = 100
    ) -> List[Interview]:
        return (
            db.query(self.model)
            .filter(Interview.application_id == application_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_multi_by_recruiter(
        self, db: Session, *, recruiter_id: str, skip: int = 0, limit: int = 100
    ) -> List[Interview]:
        return (
            db.query(self.model)
            .filter(Interview.recruiter_id == recruiter_id)
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def search(
        self, db: Session, *, filters: Dict[str, Any], skip: int = 0, limit: int = 100
    ) -> List[Interview]:
        query = db.query(self.model)
        
        # Apply filters
        if filters.get("application_id"):
            query = query.filter(Interview.application_id == filters["application_id"])
        
        if filters.get("recruiter_id"):
            query = query.filter(Interview.recruiter_id == filters["recruiter_id"])
        
        if filters.get("status"):
            query = query.filter(Interview.status == filters["status"])
        
        # Date range filters
        if filters.get("start_date"):
            query = query.filter(Interview.scheduled_date >= filters["start_date"])
        
        if filters.get("end_date"):
            query = query.filter(Interview.scheduled_date <= filters["end_date"])
        
        # Apply sorting
        if filters.get("sort_by"):
            sort_field = getattr(Interview, filters["sort_by"], Interview.scheduled_date)
            if filters.get("sort_order") == "desc":
                query = query.order_by(sort_field.desc())
            else:
                query = query.order_by(sort_field)
        else:
            # Default sort by scheduled_date asc
            query = query.order_by(Interview.scheduled_date.asc())
        
        return query.offset(skip).limit(limit).all()


interview = CRUDInterview(Interview)