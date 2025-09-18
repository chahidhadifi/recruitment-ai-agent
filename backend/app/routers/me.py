from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional

from .. import models, schemas
from ..database import get_db
from ..dependencies import get_current_user

router = APIRouter()

@router.get("/me", response_model=schemas.UserWithDetails)
def read_current_user(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Récupère les informations de l'utilisateur connecté"""
    user_id = current_user.id
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    
    result = schemas.User.model_validate(db_user)
    user_dict = result.model_dump()
    
    # Ajouter les détails du profil en fonction du rôle
    if db_user.role == models.UserRole.recruteur:
        recruiter_profile = db.query(models.RecruiterProfile).filter(models.RecruiterProfile.user_id == user_id).first()
        if recruiter_profile:
            user_dict["recruiter_profile"] = schemas.RecruiterProfile.model_validate(recruiter_profile)
    
    elif db_user.role == models.UserRole.candidat:
        candidate_profile = db.query(models.CandidateProfile).filter(models.CandidateProfile.user_id == user_id).first()
        if candidate_profile:
            user_dict["candidate_profile"] = schemas.CandidateProfile.model_validate(candidate_profile)
            # Récupérer les candidatures du candidat
            applications = db.query(models.JobApplication).filter(models.JobApplication.candidate_id == candidate_profile.id).all()
            user_dict["applications"] = [schemas.JobApplication.model_validate(app) for app in applications]
    
    return schemas.UserWithDetails(**user_dict)

@router.put("/me", response_model=schemas.User)
def update_current_user(user_update: schemas.UserUpdate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Met à jour les informations de l'utilisateur connecté"""
    user_id = current_user.id
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    
    # Mettre à jour les champs de l'utilisateur
    update_data = user_update.model_dump(exclude_unset=True)
    
    # Champs qui ne peuvent pas être modifiés par l'utilisateur
    protected_fields = ["email", "password", "role", "status"]
    
    for key, value in update_data.items():
        if key not in protected_fields and hasattr(db_user, key):
            setattr(db_user, key, value)
    
    # Mettre à jour le profil si nécessaire (pour les candidats, mettre à jour dès que l'un des champs est fourni)
    if db_user.role == models.UserRole.candidat:
        candidate_profile = db.query(models.CandidateProfile).filter(models.CandidateProfile.user_id == user_id).first()
        if candidate_profile:
            if hasattr(user_update, "biography") and user_update.biography is not None:
                candidate_profile.biography = user_update.biography
            
            # Mettre à jour les compétences et postes préférés si fournis
            if hasattr(user_update, "skills") and user_update.skills is not None:
                candidate_profile.skills = user_update.skills
            
            if hasattr(user_update, "preferred_positions") and user_update.preferred_positions is not None:
                candidate_profile.preferred_positions = user_update.preferred_positions
            
            # Ajouter les champs pour CV et lettre de motivation
            if hasattr(user_update, "cv_url") and user_update.cv_url is not None:
                candidate_profile.cv_url = user_update.cv_url
                
            if hasattr(user_update, "cover_letter_url") and user_update.cover_letter_url is not None:
                candidate_profile.cover_letter_url = user_update.cover_letter_url
    
    elif db_user.role == models.UserRole.recruteur:
        recruiter_profile = db.query(models.RecruiterProfile).filter(models.RecruiterProfile.user_id == user_id).first()
        if recruiter_profile:
            if hasattr(user_update, "department") and user_update.department is not None:
                recruiter_profile.department = user_update.department
            
            if hasattr(user_update, "specialization") and user_update.specialization is not None:
                recruiter_profile.specialization = user_update.specialization
    
    db.commit()
    db.refresh(db_user)
    return db_user