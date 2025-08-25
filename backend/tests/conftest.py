import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.db.base import Base
from app.db.session import get_db
from main import app

# Test database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def test_db():
    # Create the test database and tables
    Base.metadata.create_all(bind=engine)
    
    # Create a test database session
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        # Drop the test database after the test
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(test_db):
    # Override the get_db dependency to use the test database
    def override_get_db():
        try:
            yield test_db
        finally:
            test_db.close()
    
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides = {}


@pytest.fixture(scope="function")
def test_user_token(client):
    # Create a test user and get a token
    from app.core.security import create_access_token
    from app.models.user import UserRole
    
    # Create a test token without actually creating a user in the database
    # This is useful for testing endpoints that require authentication
    access_token = create_access_token(
        subject="test@example.com",
        role=UserRole.admin
    )
    return access_token


@pytest.fixture(scope="function")
def test_admin_headers(test_user_token):
    return {"Authorization": f"Bearer {test_user_token}"}