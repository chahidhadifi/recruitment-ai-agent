from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
import time
import logging
from sqlalchemy.exc import OperationalError
from sqlalchemy.sql import text
from urllib.parse import quote_plus

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Get database credentials from environment variables
DB_USER = os.getenv("POSTGRES_USER", "postgres")
DB_PASSWORD = os.getenv("POSTGRES_PASSWORD", "password")
DB_HOST = os.getenv("POSTGRES_HOST", "db")
DB_PORT = os.getenv("POSTGRES_PORT", "5432")
DB_NAME = os.getenv("POSTGRES_DB", "fastapi_db")

# Use PostgreSQL by default, fallback to SQLite for development
SQLALCHEMY_DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# Also check if DATABASE_URL is directly provided
if os.getenv("DATABASE_URL"):
    # Parse and encode the password in DATABASE_URL if provided
    db_url = os.getenv("DATABASE_URL")
    if '://' in db_url and '@' in db_url:
        prefix, suffix = db_url.split('@', 1)
        if ':' in prefix:
            auth_parts = prefix.split(':')
            if len(auth_parts) >= 3:
                user_part = auth_parts[1].split('//')[-1]
                password_part = auth_parts[2]
                encoded_password = quote_plus(password_part)
                prefix = f"{auth_parts[0]}://{user_part}:{encoded_password}"
        SQLALCHEMY_DATABASE_URL = f"{prefix}@{suffix}"
    else:
        SQLALCHEMY_DATABASE_URL = db_url
    
logger.info(f"Connecting to database at {DB_HOST}:{DB_PORT}/{DB_NAME} with user {DB_USER}")

# Log database connection details (without exposing full password)
db_url_parts = SQLALCHEMY_DATABASE_URL.split('@')
if len(db_url_parts) > 1:
    auth_parts = db_url_parts[0].split(':')
    if len(auth_parts) > 2:
        # Mask the password for logging
        masked_password = auth_parts[2][0] + '*****' if auth_parts[2] else ''
        masked_url = f"{auth_parts[0]}:{auth_parts[1]}:{masked_password}@{db_url_parts[1]}"
        logger.info(f"Database URL: {masked_url}")

# Create SQLAlchemy engine and session
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Function to initialize database (replaces Alembic migrations)
def init_db():
    from . import models
    
    logger.info("Initializing database tables...")
    try:
        # Create all tables
        models.Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
        
        # Verify database connection
        db = SessionLocal()
        try:
            db.execute(text("SELECT 1"))
            logger.info("Database connection verified")
        except Exception as e:
            logger.error(f"Error verifying database connection: {str(e)}")
            raise
        finally:
            db.close()
            
        logger.info("Database initialization completed successfully")
    except Exception as e:
        logger.error(f"Failed to initialize database: {str(e)}")
        raise

# Log additional connection details if not already logged
if len(db_url_parts) > 1 and '@' in SQLALCHEMY_DATABASE_URL:
    auth_parts = db_url_parts[0].split(':')
    if len(auth_parts) > 2:
        # Only show first character of password for security
        masked_password = auth_parts[2][0] + '*****' if auth_parts[2] else ''
        logger.info(f"Connecting to database with user: {auth_parts[1].split('//')[1]}, password: {masked_password}, host: {db_url_parts[1]}")
else:
    logger.info(f"Database URL format unexpected: {SQLALCHEMY_DATABASE_URL.split(':')[0]}")


# Create engine with retry logic
def get_engine(url, max_retries=3, retry_interval=2):
    retries = 0
    last_error = None
    
    logger.info(f"Attempting to connect to database with URL: {url}")
    
    while retries < max_retries:
        try:
            # Create engine with SQLAlchemy
            engine = create_engine(url)
            
            # Test connection
            connection = engine.connect()
            connection.execute(text("SELECT 1"))
            connection.close()
            
            logger.info("Database connection successful")
            return engine
                
        except Exception as e:
            last_error = e
            retries += 1
            logger.warning(f"Database connection attempt {retries} failed: {str(e)}")
            if retries < max_retries:
                logger.info(f"Retrying in {retry_interval} seconds...")
                time.sleep(retry_interval)
            else:
                logger.error(f"Failed to connect to database after {max_retries} attempts. Last error: {str(e)}")
                raise

# Create engine
engine = get_engine(SQLALCHEMY_DATABASE_URL)

# Database-specific configuration
with engine.connect() as connection:
    # For SQLite, enable foreign key support
    if "sqlite" in SQLALCHEMY_DATABASE_URL:
        connection.execute(text("PRAGMA foreign_keys = ON;"))
        logger.info("SQLite foreign key support enabled")
    # For PostgreSQL, no need for PRAGMA commands
    elif "postgresql" in SQLALCHEMY_DATABASE_URL:
        logger.info("PostgreSQL database - no PRAGMA commands needed")
        
    # Set session_replication_role for PostgreSQL (skip for SQLite)
    if "postgresql" in SQLALCHEMY_DATABASE_URL:
        try:
            connection.execute(text(f"ALTER DATABASE {DB_NAME} SET session_replication_role = 'replica';"))
            logger.info("Set session_replication_role to 'replica' at database level")
        except Exception as e:
            logger.warning(f"Could not set session_replication_role at database level: {str(e)}")
            logger.info("Will rely on session-level settings instead")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()