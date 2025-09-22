from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas
from ..database import get_db

router = APIRouter()

@router.get("/interviews", response_model=List[schemas.Interview])
def get_interviews(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Interview).offset(skip).limit(limit).all()

@router.get("/interviews/{interview_id}", response_model=schemas.Interview)
def get_interview(interview_id: int, db: Session = Depends(get_db)):
    interview = db.query(models.Interview).filter(models.Interview.id == interview_id).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    return interview

@router.post("/interviews", response_model=schemas.Interview, status_code=status.HTTP_201_CREATED)
def create_interview(interview: schemas.InterviewCreate, db: Session = Depends(get_db)):
    db_interview = models.Interview(**interview.dict())
    db.add(db_interview)
    db.commit()
    db.refresh(db_interview)
    return db_interview

@router.put("/interviews/{interview_id}", response_model=schemas.Interview)
def update_interview(interview_id: int, interview: schemas.InterviewUpdate, db: Session = Depends(get_db)):
    db_interview = db.query(models.Interview).filter(models.Interview.id == interview_id).first()
    if not db_interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    for key, value in interview.dict(exclude_unset=True).items():
        setattr(db_interview, key, value)
    db.commit()
    db.refresh(db_interview)
    return db_interview

@router.delete("/interviews/{interview_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_interview(interview_id: int, db: Session = Depends(get_db)):
    db_interview = db.query(models.Interview).filter(models.Interview.id == interview_id).first()
    if not db_interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    db.delete(db_interview)
    db.commit()
    return None
