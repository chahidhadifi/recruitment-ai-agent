from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
import uuid

from app.crud.base import CRUDBase
from app.models.application import Application
from app.schemas.application import ApplicationCreate, ApplicationUpdate


class CRUDApplication(CRUDBase[Application, ApplicationCreate, ApplicationUpdate]):
    def create_with_candidate(
        self, db: Session, *, obj_in: ApplicationCreate, candidate_id: str
    ) -> Application:
        obj_in_data = obj_in.dict()
        db_obj = Application(
            id=str(uuid.uuid4()),
            **obj_in_data,
            candidate_id=candidate_id
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_multi_by_job(
        self, db: Session, *, job_id: str, skip: int = 0, limit: int = 100
    ) -> List[Application]:
        return (
            db.query(self.model)
            .filter(Application.job_id == job_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_multi_by_candidate(
        self, db: Session, *, candidate_id: str, skip: int = 0, limit: int = 100
    ) -> List[Application]:
        return (
            db.query(self.model)
            .filter(Application.candidate_id == candidate_id)
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def search(
        self, db: Session, *, filters: Dict[str, Any], skip: int = 0, limit: int = 100
    ) -> List[Application]:
        query = db.query(self.model)
        
        # Apply filters
        if filters.get("job_id"):
            query = query.filter(Application.job_id == filters["job_id"])
        
        if filters.get("candidate_id"):
            query = query.filter(Application.candidate_id == filters["candidate_id"])
        
        if filters.get("status"):
            query = query.filter(Application.status == filters["status"])
        
        # Apply sorting
        if filters.get("sort_by"):
            sort_field = getattr(Application, filters["sort_by"], Application.applied_at)
            if filters.get("sort_order") == "desc":
                query = query.order_by(sort_field.desc())
            else:
                query = query.order_by(sort_field)
        else:
            # Default sort by applied_at desc
            query = query.order_by(Application.applied_at.desc())
        
        return query.offset(skip).limit(limit).all()


application = CRUDApplication(Application)