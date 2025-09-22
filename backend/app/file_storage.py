from sqlalchemy import Column, Integer, String, LargeBinary, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import Session
from fastapi import UploadFile, HTTPException, status
import os
import uuid
from datetime import datetime
import logging
from typing import Optional

from .database import Base

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class FileStorage(Base):
    """Model for storing files in the database"""
    __tablename__ = "file_storage"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    content_type = Column(String, nullable=False)
    file_data = Column(LargeBinary, nullable=False)  # Stockage binaire du fichier
    file_size = Column(Integer, nullable=False)
    file_uuid = Column(String, unique=True, index=True, nullable=False)
    candidate_id = Column(Integer, nullable=False)
    file_type = Column(String, nullable=False)  # 'cv' ou 'cover_letter'
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<FileStorage(id={self.id}, filename={self.filename}, file_type={self.file_type})>"

async def store_file(file: UploadFile, file_type: str, candidate_id: int, db: Session) -> str:
    """
    Store a file in the database and return a URL to access it.
    
    Args:
        file: The uploaded file
        file_type: Type of file ('cv' or 'cover_letter')
        candidate_id: ID of the candidate
        db: Database session
        
    Returns:
        URL to access the file
        
    Raises:
        HTTPException: If there's an error storing the file
    """
    try:
        # Validate file type
        if file_type not in ["cv", "cover_letter"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid file type. Must be 'cv' or 'cover_letter'"
            )
            
        # Read file content
        file_content = await file.read()
        file_size = len(file_content)
        
        # Generate a unique UUID for the file
        file_uuid = str(uuid.uuid4())
        
        # Create a new file storage record
        db_file = FileStorage(
            filename=file.filename,
            content_type=file.content_type,
            file_data=file_content,
            file_size=file_size,
            file_uuid=file_uuid,
            candidate_id=candidate_id,
            file_type=file_type
        )
        
        # Add to database
        db.add(db_file)
        db.commit()
        db.refresh(db_file)
        
        # Generate URL for accessing the file
        # This URL will be used by the frontend to retrieve the file
        file_url = f"/api/files/{file_uuid}"
        
        logger.info(f"File stored successfully: {file.filename}, UUID: {file_uuid}")
        return file_url
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error storing file: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to store file: {str(e)}"
        )

def get_file_by_uuid(file_uuid: str, db: Session) -> Optional[FileStorage]:
    """
    Retrieve a file from the database by its UUID.
    
    Args:
        file_uuid: UUID of the file
        db: Database session
        
    Returns:
        FileStorage object or None if not found
    """
    return db.query(FileStorage).filter(FileStorage.file_uuid == file_uuid).first()

def delete_file(file_uuid: str, db: Session) -> bool:
    """
    Delete a file from the database.
    
    Args:
        file_uuid: UUID of the file
        db: Database session
        
    Returns:
        True if file was deleted, False otherwise
    """
    db_file = get_file_by_uuid(file_uuid, db)
    if db_file:
        db.delete(db_file)
        db.commit()
        logger.info(f"File deleted: {db_file.filename}, UUID: {file_uuid}")
        return True
    return False