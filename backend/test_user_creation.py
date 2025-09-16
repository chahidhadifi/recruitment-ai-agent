from app.database import SessionLocal, engine
from app.models import User, CandidateProfile, UserRole, Base
import hashlib

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

# Hash password function
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

# Get database session
db = SessionLocal()

try:
    # Create a test user
    user = User(
        email='test_candidate_new@example.com',
        name='Test Candidate New',
        first_name='Test',
        last_name='Candidate New',
        password=hash_password('password123'),
        role=UserRole.candidat,
        cnie='AB123456',
        nationality='Marocaine',
        phone='0612345678',
        city='Casablanca',
        address='123 Rue Test'
    )
    
    # Add and commit the user
    db.add(user)
    db.commit()
    db.refresh(user)
    
    print(f'User created successfully with ID: {user.id}')
    
    # Create a candidate profile with all fields
    candidate_profile = CandidateProfile(
        user_id=user.id,
        skills=['Python', 'JavaScript', 'React'],
        preferred_positions=['Developer', 'Engineer'],
        biography='Test biography for candidate profile',
        cv_url='http://example.com/cv',
        cover_letter_url='http://example.com/cover'
    )
    
    # Add and commit the candidate profile
    db.add(candidate_profile)
    db.commit()
    db.refresh(candidate_profile)
    
    print(f'Candidate profile created successfully with ID: {candidate_profile.id}')
    
    # Verify the data was saved correctly
    db_user = db.query(User).filter(User.id == user.id).first()
    db_profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == user.id).first()
    
    print('\nUser data:')
    print(f'Name: {db_user.name}')
    print(f'Email: {db_user.email}')
    print(f'CNIE: {db_user.cnie}')
    print(f'Nationality: {db_user.nationality}')
    
    print('\nCandidate profile data:')
    print(f'Skills: {db_profile.skills}')
    print(f'Preferred positions: {db_profile.preferred_positions}')
    print(f'Biography: {db_profile.biography}')
    print(f'CV URL: {db_profile.cv_url}')
    print(f'Cover letter URL: {db_profile.cover_letter_url}')
    
    print('\nTest completed successfully!')
    
except Exception as e:
    print(f'Error: {str(e)}')
    db.rollback()
finally:
    db.close()