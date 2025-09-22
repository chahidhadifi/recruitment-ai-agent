from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
import os
import tempfile
import logging
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Google Drive folder IDs
CV_FOLDER_ID = "1Di4aVSZSOrAazQbl_LH5xe4rM4KuSN8-"
COVER_LETTER_FOLDER_ID = "1hVByntwNpRA0QTeI2jvwv_x4fz0YMXJr"

# Utiliser l'API Google Drive simulée pour le développement
# Les IDs de dossiers sont déjà configurés pour les dossiers spécifiés
SIMULATE_DRIVE_API = True

def get_drive_service():
    """
    Get an authorized Google Drive service instance.
    Uses Service Account credentials to authenticate with Google Drive API.
    """
    if SIMULATE_DRIVE_API:
        logger.info("Using simulated Google Drive API")
        return None
    
    # Définir les scopes nécessaires
    SCOPES = ['https://www.googleapis.com/auth/drive']
    
    # Chemin vers le fichier de service account credentials
    service_account_file = os.path.join(os.path.dirname(__file__), 'service-account.json')
    
    try:
        # Vérifier si le fichier de service account existe
        if not os.path.exists(service_account_file):
            logger.error(f"Service account file not found: {service_account_file}")
            raise FileNotFoundError(f"Service account file not found: {service_account_file}")
        
        # Créer les credentials à partir du fichier de service account
        credentials = service_account.Credentials.from_service_account_file(
            service_account_file, scopes=SCOPES)
        
        # Construire le service Drive
        service = build('drive', 'v3', credentials=credentials)
        logger.info("Successfully connected to Google Drive API using Service Account")
        return service
    except Exception as e:
        logger.error(f"Error connecting to Google Drive API: {e}")
        raise e

def upload_file_to_drive(file_content, file_name, file_type, folder_id):
    """
    Upload a file to Google Drive.
    
    Args:
        file_content: The file content as bytes
        file_name: The name to give the file in Google Drive
        file_type: The MIME type of the file
        folder_id: The ID of the folder to upload to
        
    Returns:
        The URL of the uploaded file
        
    Raises:
        ValueError: If storage quota is exceeded or other Google Drive API errors occur
    """
    if SIMULATE_DRIVE_API:
        logger.info(f"Simulating upload of {file_name} to Google Drive folder {folder_id}")
        # Return a simulated Google Drive URL
        file_id = "simulated_file_id_12345"
        return f"https://drive.google.com/file/d/{file_id}/view"
    
    # In a real implementation, you would use the Google Drive API
    service = get_drive_service()
    
    # Create a temporary file
    with tempfile.NamedTemporaryFile(delete=False) as temp_file:
        temp_file.write(file_content)
        temp_file_path = temp_file.name
    
    try:
        # Upload the file
        file_metadata = {
            'name': file_name,
            'parents': [folder_id]
        }
        
        media = MediaFileUpload(
            temp_file_path,
            mimetype=file_type,
            resumable=True
        )
        
        try:
            file = service.files().create(
                body=file_metadata,
                media_body=media,
                fields='id'
            ).execute()
            
            file_id = file.get('id')
            return f"https://drive.google.com/file/d/{file_id}/view"
        except Exception as e:
            error_message = str(e)
            
            # Service account specific errors
            if "permission" in error_message.lower() or "access" in error_message.lower():
                logger.error(f"Service account permission error: {error_message}")
                raise ValueError(
                    "Le compte de service n'a pas les permissions nécessaires pour accéder au dossier. "
                    "Assurez-vous que le compte de service a été partagé avec les dossiers Google Drive appropriés."
                )
            elif "storageQuotaExceeded" in error_message:
                logger.error(f"Google Drive storage quota exceeded: {error_message}")
                raise ValueError(
                    "Le quota de stockage Google Drive est dépassé. Veuillez contacter l'administrateur "
                    "pour augmenter le stockage ou nettoyer les fichiers existants."
                )
            elif "not found" in error_message.lower() or "notfound" in error_message.lower():
                logger.error(f"Folder not found error: {error_message}")
                raise ValueError(
                    f"Le dossier avec l'ID {folder_id} n'a pas été trouvé ou le compte de service "
                    "n'a pas accès à ce dossier. Vérifiez l'ID du dossier et les permissions."
                )
            else:
                logger.error(f"Error uploading file to Google Drive: {error_message}")
                raise ValueError(f"Échec du téléchargement du fichier vers Google Drive: {error_message}")
    
    finally:
        # Clean up the temporary file
        if os.path.exists(temp_file_path):
            os.unlink(temp_file_path)

def upload_cv(file_content, candidate_id, file_type="application/pdf"):
    """
    Upload a CV to Google Drive.
    
    Args:
        file_content: The file content as bytes
        candidate_id: The ID of the candidate
        file_type: The MIME type of the file (default: PDF)
        
    Returns:
        The URL of the uploaded CV
    """
    file_name = f"{candidate_id}_cv.pdf"
    return upload_file_to_drive(file_content, file_name, file_type, CV_FOLDER_ID)

def upload_cover_letter(file_content, candidate_id, file_type="application/pdf"):
    """
    Upload a cover letter to Google Drive.
    
    Args:
        file_content: The file content as bytes
        candidate_id: The ID of the candidate
        file_type: The MIME type of the file (default: PDF)
        
    Returns:
        The URL of the uploaded cover letter
    """
    file_name = f"{candidate_id}_cover_letter.pdf"
    return upload_file_to_drive(file_content, file_name, file_type, COVER_LETTER_FOLDER_ID)