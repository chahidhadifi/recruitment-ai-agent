from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
try:
    import PyJWT as jwt
except ImportError:
    import jwt
from datetime import datetime, timedelta
import os

from . import models
from .database import get_db

# Configuration OAuth2
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# Clé secrète pour JWT (doit correspondre à celle utilisée pour signer les tokens)
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secure-jwt-secret-key-for-production")
ALGORITHM = "HS256"

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_sub = payload.get("sub")
        if user_sub is None:
            raise credentials_exception
        try:
            user_id = int(user_sub)
        except (TypeError, ValueError):
            raise credentials_exception
    except Exception:
        # Catch any JWT decode related errors (e.g., expired, invalid signature)
        raise credentials_exception
        
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None:
        raise credentials_exception
        
    return user