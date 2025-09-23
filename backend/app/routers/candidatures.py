from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas
from ..database import get_db

router = APIRouter()

@router.get("/candidatures", response_model=List[schemas.Candidature])
def get_candidatures(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Candidature).offset(skip).limit(limit).all()

@router.get("/candidatures/{candidature_id}", response_model=schemas.Candidature)
def get_candidature(candidature_id: int, db: Session = Depends(get_db)):
    candidature = db.query(models.Candidature).filter(models.Candidature.id == candidature_id).first()
    if not candidature:
        raise HTTPException(status_code=404, detail="Candidature not found")
    return candidature

@router.put("/candidatures/{candidature_id}", response_model=schemas.Candidature)
def update_candidature(candidature_id: int, candidature: schemas.CandidatureUpdate, db: Session = Depends(get_db)):
    db_candidature = db.query(models.Candidature).filter(models.Candidature.id == candidature_id).first()
    if not db_candidature:
        raise HTTPException(status_code=404, detail="Candidature not found")
    for key, value in candidature.dict(exclude_unset=True).items():
        setattr(db_candidature, key, value)
    db.commit()
    db.refresh(db_candidature)
    return db_candidature
