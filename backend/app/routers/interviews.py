from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
import httpx
import logging
import json

from .. import models
from ..database import get_db

router = APIRouter(prefix="/api/interviews", tags=["interviews"])
logger = logging.getLogger(__name__)

# ============ Schémas Pydantic ============

class QuestionData(BaseModel):
    question: str
    type: str
    ai_response: str

class GenerateInterviewRequest(BaseModel):
    candidate_id: str
    application_id: Optional[str] = None
    position: str
    job_description: Optional[str] = ""
    date: Optional[str] = None
    duration: Optional[str] = "45 minutes"

class CreateInterviewFromN8N(BaseModel):
    """Schéma pour créer un entretien depuis n8n"""
    candidate_id: int
    application_id: Optional[int] = None
    position: str
    date: str
    duration: str
    status: str
    questions: List[dict]

class GenerateInterviewResponse(BaseModel):
    success: bool
    interview_id: Optional[int] = None
    message: str
    questions: List[QuestionData] = []

# ============ Endpoints ============

@router.post("", response_model=dict)
async def create_interview_from_n8n(
    request: CreateInterviewFromN8N,
    db: Session = Depends(get_db)
):
    """
    Crée un entretien dans la base de données (appelé par n8n)
    """
    try:
        logger.info(f"📝 Création entretien pour candidat {request.candidate_id}")
        
        # Convertir la date string en datetime
        try:
            interview_date = datetime.fromisoformat(request.date.replace('Z', '+00:00'))
        except:
            interview_date = datetime.now()
        
        # Créer l'entretien
        new_interview = models.Interview(
            candidate_id=request.candidate_id,
            application_id=request.application_id,
            position=request.position,
            date=interview_date,
            duration=request.duration,
            status=models.InterviewStatus.scheduled,
            questions=request.questions,  # Déjà un dict/list Python
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        
        db.add(new_interview)
        db.commit()
        db.refresh(new_interview)
        
        logger.info(f"✅ Entretien {new_interview.id} créé avec {len(request.questions)} questions")
        
        return {
            "id": new_interview.id,
            "candidate_id": new_interview.candidate_id,
            "application_id": new_interview.application_id,
            "position": new_interview.position,
            "date": new_interview.date.isoformat(),
            "duration": new_interview.duration,
            "status": new_interview.status.value,
            "questions": request.questions,
            "created_at": new_interview.created_at.isoformat()
        }
        
    except Exception as e:
        db.rollback()
        logger.error(f"❌ Erreur création entretien: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de la création: {str(e)}"
        )

@router.post("/generate", response_model=GenerateInterviewResponse)
async def generate_interview(
    request: GenerateInterviewRequest,
    db: Session = Depends(get_db)
):
    """
    Génère un entretien avec des questions personnalisées via n8n
    """
    n8n_webhook_url = "http://host.docker.internal:5555/webhook/create-interview"
    
    try:
        logger.info(f"🎯 Génération entretien pour candidat {request.candidate_id}")
        
        # Préparer le payload pour n8n
        payload = [{
            "candidate_id": request.candidate_id,
            "application_id": request.application_id,
            "position": request.position,
            "job_description": request.job_description,
            "date": request.date or datetime.now().isoformat(),
            "duration": request.duration
        }]
        
        logger.info(f"📡 Appel n8n: {n8n_webhook_url}")
        
        # Appel à n8n avec timeout de 180 secondes
        async with httpx.AsyncClient(timeout=180.0) as client:
            response = await client.post(n8n_webhook_url, json=payload)
            
            logger.info(f"📨 Réponse n8n: {response.status_code}")
            
            if response.status_code != 200:
                error_text = response.text
                logger.error(f"❌ Erreur n8n: {error_text}")
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Erreur n8n: {error_text}"
                )
            
            # Traiter la réponse
            result = response.json()
            logger.info(f"✅ Réponse JSON reçue de n8n")
            
            # n8n retourne un array, prendre le premier élément
            interview_data = result[0] if isinstance(result, list) and len(result) > 0 else result
            
            # Vérifier si n8n a retourné une erreur
            if interview_data.get("error"):
                error_message = interview_data.get("message", "Erreur inconnue")
                logger.error(f"❌ Erreur workflow n8n: {error_message}")
                return GenerateInterviewResponse(
                    success=False,
                    message=f"Erreur lors de la génération: {error_message}",
                    questions=[]
                )
            
            # Extraire les questions
            questions_data = interview_data.get("questions", [])
            
            # Valider et filtrer les questions
            valid_questions = []
            for q in questions_data:
                if isinstance(q, dict) and all(key in q for key in ["question", "type", "ai_response"]):
                    valid_questions.append(QuestionData(**q))
                else:
                    logger.warning(f"⚠️ Question invalide ignorée: {q}")
            
            if not valid_questions:
                logger.error("❌ Aucune question valide générée")
                return GenerateInterviewResponse(
                    success=False,
                    message="Aucune question valide n'a été générée",
                    questions=[]
                )
            
            # Récupérer l'ID de l'entretien créé
            interview_id = interview_data.get("id")
            
            if not interview_id:
                logger.warning("⚠️ Aucun ID d'entretien retourné par n8n")
            
            logger.info(f"✅ {len(valid_questions)} questions générées pour l'entretien {interview_id}")
            
            return GenerateInterviewResponse(
                success=True,
                interview_id=interview_id,
                message=f"{len(valid_questions)} questions générées avec succès",
                questions=valid_questions
            )
            
    except httpx.TimeoutException:
        logger.error("❌ Timeout lors de l'appel n8n")
        raise HTTPException(
            status_code=504,
            detail="Le serveur n8n met trop de temps à répondre. Réessayez plus tard."
        )
    except httpx.RequestError as e:
        logger.error(f"❌ Erreur de connexion n8n: {str(e)}")
        raise HTTPException(
            status_code=503,
            detail=f"Impossible de se connecter à n8n: {str(e)}"
        )
    except Exception as e:
        logger.error(f"❌ Erreur inattendue: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de la génération: {str(e)}"
        )

@router.get("/{interview_id}")
async def get_interview(interview_id: int, db: Session = Depends(get_db)):
    """
    Récupère un entretien par son ID
    """
    interview = db.query(models.Interview).filter(models.Interview.id == interview_id).first()
    
    if not interview:
        raise HTTPException(status_code=404, detail="Entretien non trouvé")
    
    # Parse questions JSON
    questions = []
    if interview.questions:
        try:
            questions = json.loads(interview.questions) if isinstance(interview.questions, str) else interview.questions
        except json.JSONDecodeError:
            logger.error(f"Erreur parsing questions pour entretien {interview_id}")
            questions = []
    
    return {
        "id": interview.id,
        "candidate_id": interview.candidate_id,
        "application_id": interview.application_id,
        "position": interview.position,
        "date": interview.date.isoformat() if interview.date else None,
        "duration": interview.duration,
        "status": interview.status,
        "score": interview.score,
        "questions": questions,
        "created_at": interview.created_at.isoformat() if interview.created_at else None
    }

@router.post("/{interview_id}/responses")
async def save_interview_responses(
    interview_id: int,
    responses_data: dict,
    db: Session = Depends(get_db)
):
    """
    Sauvegarde les réponses d'un candidat pour un entretien
    """
    interview = db.query(models.Interview).filter(models.Interview.id == interview_id).first()
    
    if not interview:
        raise HTTPException(status_code=404, detail="Entretien non trouvé")
    
    try:
        # Mettre à jour le statut de l'entretien
        interview.status = models.InterviewStatus.completed
        interview.updated_at = datetime.now()
        
        # Vous pouvez stocker les réponses dans un champ JSON si nécessaire
        # interview.responses = json.dumps(responses_data)
        
        db.commit()
        
        logger.info(f"✅ Réponses sauvegardées pour l'entretien {interview_id}")
        
        return {
            "success": True,
            "message": "Réponses sauvegardées avec succès",
            "interview_id": interview_id
        }
        
    except Exception as e:
        db.rollback()
        logger.error(f"❌ Erreur sauvegarde réponses: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de la sauvegarde: {str(e)}"
        )