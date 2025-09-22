from app.database import SessionLocal
from app.models import User
import hashlib

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def reset_admin_password():
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == 'admin@gmail.com').first()
        if user:
            hashed_password = hash_password('password123')
            user.password = hashed_password
            db.commit()
            print('Mot de passe de admin@gmail.com réinitialisé à: password123')
            print(f'Nouveau hash: {hashed_password}')
        else:
            print('Utilisateur admin non trouvé')
    except Exception as e:
        print(f'Erreur: {str(e)}')
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    reset_admin_password()