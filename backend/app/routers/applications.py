from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models
from ..database import get_db

from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI

router = APIRouter(prefix="/api/applications", tags=["applications"])

@router.get("/{application_id}")
def get_application_details(
    application_id: int,
    db: Session = Depends(get_db)
):
    """
    Récupérer les détails d'une candidature avec les infos du job
    """
    application = db.query(models.JobApplication).filter(
        models.JobApplication.id == application_id
    ).first()
    
    if not application:
        raise HTTPException(status_code=404, detail="Candidature non trouvée")
    
    # Récupérer le job associé
    job = db.query(models.Job).filter(
        models.Job.id == application.job_id
    ).first()
    
    # Récupérer le candidat
    candidate = db.query(models.CandidateProfile).filter(
        models.CandidateProfile.id == application.candidate_id
    ).first()
    
    user = None
    if candidate:
        user = db.query(models.User).filter(
            models.User.id == candidate.user_id
        ).first()
    
    return {
        "id": application.id,
        "job_id": application.job_id,
        "candidate_id": application.candidate_id,
        "candidate_name": user.name if user else "Candidat",
        "job_title": job.title if job else "Poste non spécifié",
        "job_description": job.description if job else "",
        "status": application.status,
        "applied_at": application.applied_at,
        "cv_url": application.cv_url
    }

@router.get("/candidate-info/{candidate_id}")
def get_candidate_info(
    candidate_id: int,
    db: Session = Depends(get_db)
):
    """
    Endpoint alternatif pour récupérer les infos d'un candidat.
    Récupère les informations détaillées d'un candidat, y compris le poste et la description depuis sa dernière candidature.
    """
    # Récupérer le profil du candidat
    candidate_profile = db.query(models.CandidateProfile).filter(
        models.CandidateProfile.id == candidate_id
    ).first()
    
    if not candidate_profile:
        raise HTTPException(status_code=404, detail="Candidat non trouvé")

    # Récupérer l'utilisateur associé pour le nom, l'email, etc.
    user = db.query(models.User).filter(
        models.User.id == candidate_profile.user_id
    ).first()

    # Récupérer la dernière candidature active du candidat
    latest_application = db.query(models.JobApplication).filter(
        models.JobApplication.candidate_id == candidate_id
    ).order_by(models.JobApplication.applied_at.desc()).first()
    
    job_data = {}
    if latest_application:
        job = db.query(models.Job).filter(
            models.Job.id == latest_application.job_id
        ).first()
        if job:
            job_data = {
                "position": job.title,
                "job_description": job.description
            }
    
    # Construction de la réponse
    return {
        "id": candidate_profile.id,
        "name": user.name if user else "Nom non disponible",
        "email": user.email if user else "Email non disponible",
        "position": job_data.get("position", "Non spécifié"),
        "job_description": job_data.get("job_description", "")
    }